/**
 * ScrollProgress Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-002)
 * Purpose: Display scroll progress bar on right side
 */

'use client';

import React from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
      aria-label="스크롤 진행도"
    >
      {/* Progress Track */}
      <div className="w-1 h-64 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress Bar */}
        <div
          className="w-full bg-primary-500 transition-all duration-300 ease-out"
          style={{ height: `${progress}%` }}
          role="progressbar"
          aria-label="페이지 스크롤 진행도"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Progress Percentage */}
      <div className="mt-2 text-xs text-gray-600 font-medium text-center">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
