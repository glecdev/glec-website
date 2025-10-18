/**
 * File Upload Component for Library Items
 *
 * Supports:
 * - Local file upload (drag & drop or click to browse)
 * - File type validation (PDF, DOCX, XLSX, PPTX)
 * - File size validation (max 50MB)
 * - Upload progress indicator
 * - Preview after successful upload
 *
 * Security:
 * - Requires admin authentication (Bearer token from session)
 * - File type whitelist enforcement
 * - File size limit enforcement
 *
 * Usage:
 *   <FileUpload
 *     itemId="uuid-of-library-item"
 *     onUploadSuccess={(fileData) => console.log('Uploaded:', fileData)}
 *     onUploadError={(error) => console.error('Upload failed:', error)}
 *   />
 */

'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

// ====================================================================
// Types
// ====================================================================

export interface UploadedFileData {
  item_id: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
  filename: string;
}

interface FileUploadProps {
  itemId: string; // Library item UUID
  onUploadSuccess: (data: UploadedFileData) => void;
  onUploadError: (error: string) => void;
  currentFileUrl?: string; // Optional: show existing file info
}

// ====================================================================
// Constants
// ====================================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx'];

// ====================================================================
// Component
// ====================================================================

export function FileUpload({ itemId, onUploadSuccess, onUploadError, currentFileUrl }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ====================================================================
  // File Validation
  // ====================================================================

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다 (허용: ${ALLOWED_EXTENSIONS.join(', ')})`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다 (최대: 50MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    return { valid: true };
  };

  // ====================================================================
  // Upload Handler
  // ====================================================================

  const handleUpload = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      onUploadError(validation.error!);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('item_id', itemId);

      // Simulate progress (real progress would require XHR or server-sent events)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      const response = await fetch('/api/admin/library/items/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Upload failed');
      }

      // Success
      setUploadedFile(result.data);
      onUploadSuccess(result.data);

      // Reset after 2 seconds
      setTimeout(() => {
        setProgress(0);
      }, 2000);
    } catch (err: any) {
      onUploadError(err.message || 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // ====================================================================
  // Event Handlers
  // ====================================================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="space-y-4">
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Upload Area */}
      {!uploadedFile && !currentFileUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={!uploading ? handleBrowseClick : undefined}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {isDragging ? (
              <span className="font-semibold text-primary-600">파일을 여기에 놓으세요</span>
            ) : (
              <>
                <span className="font-semibold text-primary-600">클릭하여 파일 선택</span>
                <span className="text-gray-500"> 또는 드래그 앤 드롭</span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500">PDF, DOCX, XLSX, PPTX (최대 50MB)</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">업로드 중...</span>
            <span className="text-gray-900 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded File Info */}
      {uploadedFile && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-green-800">업로드 완료</span>
              </div>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-medium">파일명:</span> {uploadedFile.filename}
                </div>
                <div>
                  <span className="font-medium">형식:</span> {uploadedFile.file_type}
                </div>
                <div>
                  <span className="font-medium">크기:</span> {uploadedFile.file_size_mb} MB
                </div>
                <div>
                  <span className="font-medium">URL:</span>{' '}
                  <a href={uploadedFile.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {uploadedFile.file_url}
                  </a>
                </div>
              </div>
            </div>
            <button type="button" onClick={handleRemove} className="text-gray-400 hover:text-gray-600 ml-4">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Current File (if exists) */}
      {currentFileUrl && !uploadedFile && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-2">현재 파일</div>
              <div className="text-sm text-gray-600">
                <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {currentFileUrl}
                </a>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={handleBrowseClick} disabled={uploading}>
              파일 교체
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
