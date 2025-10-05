/**
 * Demo Request Success Page
 * Purpose: Thank you page after successful demo request submission
 * Features:
 * - Confirmation message
 * - Calendar download (.ics file)
 * - Estimated response time
 * - Next steps guidance
 */

import { Suspense } from 'react';
import DemoSuccessContent from './DemoSuccessContent';

export default function DemoRequestSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">처리 중...</p>
          </div>
        </div>
      }
    >
      <DemoSuccessContent />
    </Suspense>
  );
}
