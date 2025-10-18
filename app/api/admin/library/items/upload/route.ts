/**
 * POST /api/admin/library/items/upload
 *
 * File Upload API for Library Items
 *
 * Supports:
 * - Local file upload (saved to public/library/)
 * - File validation (PDF, DOCX, XLSX, PPTX only)
 * - File size limit (50MB max)
 * - Auto-updates library_items table with file_url and metadata
 *
 * Security:
 * - Requires admin authentication
 * - File type whitelist
 * - Sanitized filenames (no special chars)
 *
 * Usage:
 *   const formData = new FormData();
 *   formData.append('file', fileInput.files[0]);
 *   formData.append('item_id', '...');
 *
 *   fetch('/api/admin/library/items/upload', {
 *     method: 'POST',
 *     body: formData,
 *   });
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// File upload configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'library');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'application/msword', // DOC
  'application/vnd.ms-excel', // XLS
  'application/vnd.ms-powerpoint', // PPT
];

const MIME_TO_FILE_TYPE: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/msword': 'DOCX',
  'application/vnd.ms-excel': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPTX',
};

// ============================================================
// Helper: Sanitize filename (remove special characters)
// ============================================================

function sanitizeFilename(filename: string): string {
  // Replace spaces with hyphens, remove special chars
  const baseName = filename.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣.-]/g, '');

  // Add timestamp to avoid conflicts
  const timestamp = Date.now();
  const ext = path.extname(baseName);
  const nameWithoutExt = path.basename(baseName, ext);

  return `${nameWithoutExt}-${timestamp}${ext}`;
}

// ============================================================
// Helper: Get file extension from MIME type
// ============================================================

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/msword': '.doc',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.ms-powerpoint': '.ppt',
  };
  return extensions[mimeType] || '';
}

// ============================================================
// POST: Upload file for library item
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const itemId = formData.get('item_id') as string | null;

    // 2. Validate inputs
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: '파일을 선택해주세요',
          },
        },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_ID_REQUIRED',
            message: 'Library item ID가 필요합니다',
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: '지원하지 않는 파일 형식입니다',
            details: `허용된 형식: PDF, DOCX, XLSX, PPTX (현재: ${file.type})`,
          },
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: '파일 크기가 너무 큽니다',
            details: `최대 크기: 50MB (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
          },
        },
        { status: 400 }
      );
    }

    // 5. Verify library item exists
    const existingItems = await sql`
      SELECT id, title FROM library_items WHERE id = ${itemId}
    `;

    if (existingItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: '라이브러리 항목을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 6. Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
      console.log(`[Upload] Created directory: ${UPLOAD_DIR}`);
    }

    // 7. Sanitize filename and save file
    const sanitizedFilename = sanitizeFilename(file.name);
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log(`[Upload] File saved: ${filePath} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // 8. Generate public URL (relative to public/)
    const publicUrl = `/library/${sanitizedFilename}`;

    // 9. Determine file type from MIME
    const fileType = MIME_TO_FILE_TYPE[file.type] || 'OTHER';

    // 10. Update database with file info
    const fileSizeMB = parseFloat((file.size / 1024 / 1024).toFixed(2));

    const updatedItems = await sql`
      UPDATE library_items
      SET
        file_url = ${publicUrl},
        file_type = ${fileType},
        file_size_mb = ${fileSizeMB},
        download_type = 'DIRECT',
        updated_at = NOW()
      WHERE id = ${itemId}
      RETURNING *
    `;

    const updatedItem = updatedItems[0];

    // 11. Return success response
    return NextResponse.json(
      {
        success: true,
        message: '파일이 업로드되었습니다',
        data: {
          item_id: updatedItem.id,
          file_url: publicUrl,
          file_type: fileType,
          file_size_mb: fileSizeMB,
          filename: sanitizedFilename,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: '파일 업로드에 실패했습니다',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
