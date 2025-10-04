/**
 * Cloudflare R2 Client Configuration
 *
 * Based on: GLEC-Zero-Cost-Architecture.md (R2 Free Tier)
 * Architecture: Presigned URL pattern for secure uploads
 * Security: API tokens never exposed to client
 *
 * R2 Free Tier Limits:
 * - Storage: 10GB/month
 * - Class A (Write): 10,000,000/month
 * - Class B (Read): 1,000,000/month
 * - Egress: Unlimited (free via Cloudflare CDN)
 *
 * References:
 * - https://developers.cloudflare.com/r2/api/s3/presigned-urls/
 * - https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs
 */

import { S3Client } from '@aws-sdk/client-s3';

/**
 * Get R2 endpoint URL based on account ID
 *
 * Cloudflare R2 uses S3-compatible API with custom endpoint
 */
function getR2Endpoint(): string {
  const accountId = process.env.R2_ACCOUNT_ID;

  if (!accountId) {
    throw new Error(
      'R2_ACCOUNT_ID environment variable is not set. ' +
        'Get your Account ID from: https://dash.cloudflare.com/ → R2 → Overview'
    );
  }

  // R2 endpoint format: https://{account_id}.r2.cloudflarestorage.com
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

/**
 * Validate required R2 environment variables
 */
function validateR2Config() {
  const required = {
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missing.join(', ')}\n\n` +
        'Setup guide:\n' +
        '1. Create R2 bucket: https://dash.cloudflare.com/ → R2 → Create bucket\n' +
        '2. Generate API token: R2 → Manage R2 API Tokens → Create API Token\n' +
        '3. Add to .env.local:\n' +
        '   R2_ACCOUNT_ID=your_account_id\n' +
        '   R2_ACCESS_KEY_ID=your_access_key\n' +
        '   R2_SECRET_ACCESS_KEY=your_secret_key\n' +
        '   R2_BUCKET_NAME=glec-uploads\n' +
        '   R2_PUBLIC_URL=https://uploads.glec.io'
    );
  }
}

/**
 * Initialize S3Client for Cloudflare R2
 *
 * Uses AWS SDK v3 with R2-specific endpoint configuration
 */
export function createR2Client(): S3Client {
  // Validate config on initialization
  validateR2Config();

  return new S3Client({
    region: 'auto', // R2 uses 'auto' region
    endpoint: getR2Endpoint(),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // Required for R2 compatibility
    forcePathStyle: true,
  });
}

/**
 * R2 Configuration Constants
 *
 * Based on FR-ADMIN-004 requirements and security best practices
 */
export const R2_CONFIG = {
  bucketName: process.env.R2_BUCKET_NAME || 'glec-uploads',
  publicUrl: process.env.R2_PUBLIC_URL || 'https://uploads.glec.io',

  // File upload restrictions (FR-ADMIN-004)
  maxFileSize: 10 * 1024 * 1024, // 10MB (reasonable for images)
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ],

  // Presigned URL security
  presignedUrlExpiry: 60 * 5, // 5 minutes (minimum secure duration)
  presignedUrlMaxExpiry: 60 * 60 * 24 * 7, // 7 days (Cloudflare max)

  // Path structure
  uploadPath: 'notices', // Organize by content type
} as const;

/**
 * Generate unique filename with timestamp and random suffix
 *
 * Pattern: {timestamp}-{random}.{extension}
 * Example: 1704067200000-a1b2c3d4.jpg
 *
 * Prevents:
 * - Filename collisions
 * - Path traversal attacks
 * - Unicode/special char issues
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';

  // Sanitize extension (only alphanumeric)
  const sanitizedExt = extension.replace(/[^a-z0-9]/g, '');

  return `${timestamp}-${random}.${sanitizedExt}`;
}

/**
 * Validate file before upload
 *
 * Checks:
 * - File size within limit
 * - MIME type allowed
 * - Extension matches MIME type
 */
export function validateFile(file: {
  size: number;
  type: string;
  name: string;
}): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > R2_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `파일 크기가 ${R2_CONFIG.maxFileSize / 1024 / 1024}MB를 초과합니다.`,
    };
  }

  // Check MIME type
  if (!R2_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다. (지원: JPEG, PNG, WebP, GIF, SVG)`,
    };
  }

  // Basic extension validation
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'image/svg+xml': ['svg'],
  };

  const validExtensions = mimeToExt[file.type] || [];
  if (extension && !validExtensions.includes(extension)) {
    return {
      valid: false,
      error: '파일 확장자가 MIME 타입과 일치하지 않습니다.',
    };
  }

  return { valid: true };
}

/**
 * Get full public URL for uploaded file
 *
 * @param key - R2 object key (path + filename)
 * @returns Full public URL
 */
export function getPublicUrl(key: string): string {
  const baseUrl = R2_CONFIG.publicUrl.replace(/\/$/, ''); // Remove trailing slash
  return `${baseUrl}/${key}`;
}
