/**
 * useImageUpload Hook
 *
 * Based on: FR-ADMIN-004 (공지사항 이미지 업로드)
 * Pattern: Presigned URL upload with progress tracking
 *
 * Features:
 * - Request presigned URL from server
 * - Upload file directly to R2
 * - Track upload progress
 * - Error handling
 * - Loading states
 *
 * Usage:
 * ```tsx
 * const { uploadImage, isUploading, progress, error } = useImageUpload();
 *
 * const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (!file) return;
 *
 *   const result = await uploadImage(file);
 *   if (result) {
 *     console.log('Uploaded:', result.publicUrl);
 *   }
 * };
 * ```
 */

import { useState } from 'react';

interface PresignedUrlResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    key: string;
    publicUrl: string;
    expiresIn: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface UploadResult {
  publicUrl: string;
  key: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload image to Cloudflare R2
   *
   * Steps:
   * 1. Request presigned URL from server
   * 2. Upload file directly to R2 using presigned URL
   * 3. Return public URL
   */
  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Step 1: Request presigned URL
      setProgress(10);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const presignedResponse = await fetch('/api/admin/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const presignedData: PresignedUrlResponse = await presignedResponse.json();

      if (!presignedResponse.ok || !presignedData.success || !presignedData.data) {
        throw new Error(
          presignedData.error?.message || 'Presigned URL 생성에 실패했습니다.'
        );
      }

      const { uploadUrl, publicUrl, key } = presignedData.data;

      // Step 2: Upload file directly to R2
      setProgress(30);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          // Progress: 30% (presigned) -> 100% (upload complete)
          const uploadProgress = 30 + Math.round((e.loaded / e.total) * 70);
          setProgress(uploadProgress);
        }
      });

      // Promise wrapper for XMLHttpRequest
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`업로드 실패: HTTP ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('네트워크 오류로 업로드에 실패했습니다.'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('업로드가 취소되었습니다.'));
        });
      });

      // Send PUT request to R2 presigned URL
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      await uploadPromise;

      // Step 3: Upload complete
      setProgress(100);

      console.log(`[Image Upload] Success: ${publicUrl}`);

      return {
        publicUrl,
        key,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Image Upload] Error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Reset error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    clearError,
  };
}
