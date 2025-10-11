/**
 * Library Card Component
 *
 * Purpose: Display library item information in a card format
 * Used in: /library page
 * Based on: GLEC-Design-System-Standards.md (Card component)
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

// ====================================================================
// Types
// ====================================================================

export interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  file_type: string; // e.g., "PDF", "XLSX", "ZIP"
  file_size_mb: number;
  download_type: 'EMAIL' | 'DIRECT';
  category: 'FRAMEWORK' | 'WHITEPAPER' | 'CASE_STUDY' | 'DATASHEET' | 'OTHER';
  tags: string | null;
  language: string; // "ko", "en"
  version: string | null;
  published_at: string;
  download_count: number;
  view_count: number;
}

interface LibraryCardProps {
  item: LibraryItem;
  onDownloadClick: (item: LibraryItem) => void;
}

// ====================================================================
// Component
// ====================================================================

export function LibraryCard({ item, onDownloadClick }: LibraryCardProps) {
  // Category labels (Korean)
  const categoryLabels: Record<LibraryItem['category'], string> = {
    FRAMEWORK: '프레임워크',
    WHITEPAPER: '백서',
    CASE_STUDY: '사례 연구',
    DATASHEET: '데이터시트',
    OTHER: '기타',
  };

  // Category colors
  const categoryColors: Record<LibraryItem['category'], string> = {
    FRAMEWORK: 'bg-primary-100 text-primary-700',
    WHITEPAPER: 'bg-blue-100 text-blue-700',
    CASE_STUDY: 'bg-green-100 text-green-700',
    DATASHEET: 'bg-yellow-100 text-yellow-700',
    OTHER: 'bg-gray-100 text-gray-700',
  };

  // Format file size
  const formatFileSize = (sizeMb: number): string => {
    if (sizeMb < 1) {
      return `${Math.round(sizeMb * 1024)} KB`;
    }
    return `${sizeMb.toFixed(1)} MB`;
  };

  // Format download count
  const formatDownloadCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format published date
  const formatPublishedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="
        bg-white rounded-lg border border-gray-200
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
        overflow-hidden
        flex flex-col
      "
    >
      {/* Header */}
      <div className="p-6 flex-grow">
        {/* Category Badge & File Type */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
              ${categoryColors[item.category]}
            `}
          >
            {categoryLabels[item.category]}
          </span>

          <span className="text-xs font-medium text-gray-500 uppercase">
            {item.file_type}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {item.title}
        </h3>

        {/* Version (if exists) */}
        {item.version && (
          <div className="text-sm text-gray-500 mb-3">
            버전 {item.version}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.split(',').map((tag, index) => (
              <span
                key={index}
                className="
                  inline-flex items-center px-2 py-1 rounded text-xs
                  bg-gray-100 text-gray-600
                "
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            {/* File Size */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{formatFileSize(item.file_size_mb)}</span>
            </div>

            {/* Download Count */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{formatDownloadCount(item.download_count)} 다운로드</span>
            </div>
          </div>

          {/* Language */}
          <span className="font-medium uppercase">{item.language}</span>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={() => onDownloadClick(item)}
        >
          {item.download_type === 'EMAIL' ? '다운로드 요청' : '지금 다운로드'}
        </Button>

        {/* Published Date */}
        <div className="text-xs text-gray-400 text-center mt-2">
          {formatPublishedDate(item.published_at)}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// Skeleton Loader
// ====================================================================

export function LibraryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-6">
        {/* Category Badge & File Type */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-10 bg-gray-200 rounded"></div>
        </div>

        {/* Title */}
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        {/* Meta Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>

        {/* Date */}
        <div className="h-3 w-32 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  );
}
