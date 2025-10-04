/**
 * Admin Image Upload - Presigned URL Generator
 *
 * Based on: FR-ADMIN-004 (공지사항 작성 - 이미지 업로드)
 * Architecture: Presigned URL pattern (server signs, client uploads directly to R2)
 * Security: JWT authentication, file validation, time-limited URLs
 *
 * Flow:
 * 1. Client requests presigned URL with filename/type
 * 2. Server validates auth + file metadata
 * 3. Server generates presigned PUT URL (5min expiry)
 * 4. Client uploads file directly to R2 using presigned URL
 * 5. Client receives public URL after upload
 *
 * Benefits:
 * - No file data through server (saves bandwidth + Workers CPU time)
 * - Secure (presigned URLs expire in 5 minutes)
 * - Fast (direct upload to R2)
 *
 * References:
 * - https://developers.cloudflare.com/r2/api/s3/presigned-urls/
 * - GLEC-Zero-Cost-Architecture.md (R2 Free Tier limits)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  createR2Client,
  R2_CONFIG,
  generateUniqueFilename,
  validateFile,
  getPublicUrl,
} from '@/lib/r2';

/**
 * Verify JWT token (same as other admin routes)
 */
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const validToken = process.env.ADMIN_JWT_SECRET || 'dev-secret-key-change-in-production';

  return token === validToken;
}

/**
 * POST /api/admin/upload/presigned-url
 *
 * Generate presigned URL for direct R2 upload
 *
 * Request body:
 * {
 *   filename: string;  // Original filename
 *   fileType: string;  // MIME type (e.g., "image/jpeg")
 *   fileSize: number;  // File size in bytes
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     uploadUrl: string;   // Presigned PUT URL (valid for 5 minutes)
 *     key: string;         // R2 object key (path + unique filename)
 *     publicUrl: string;   // Public URL after upload
 *     expiresIn: number;   // Seconds until URL expires (300)
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { filename, fileType, fileSize } = body;

    if (!filename || !fileType || typeof fileSize !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: filename, fileType, fileSize',
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate file metadata
    const validation = validateFile({
      name: filename,
      type: fileType,
      size: fileSize,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_VALIDATION_FAILED',
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    // 4. Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename);
    const key = `${R2_CONFIG.uploadPath}/${uniqueFilename}`;

    // 5. Create R2 client
    const r2Client = createR2Client();

    // 6. Generate presigned PUT URL
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      ContentType: fileType,
      // Optional: Add metadata
      Metadata: {
        'original-filename': filename,
        'uploaded-by': 'admin',
        'upload-timestamp': Date.now().toString(),
      },
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: R2_CONFIG.presignedUrlExpiry, // 5 minutes
    });

    // 7. Get public URL
    const publicUrl = getPublicUrl(key);

    console.log(`[Presigned URL Generated] key=${key}, expires in ${R2_CONFIG.presignedUrlExpiry}s`);

    return NextResponse.json(
      {
        success: true,
        data: {
          uploadUrl,
          key,
          publicUrl,
          expiresIn: R2_CONFIG.presignedUrlExpiry,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Presigned URL API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate presigned URL',
        },
      },
      { status: 500 }
    );
  }
}
