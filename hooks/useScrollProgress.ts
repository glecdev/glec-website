/**
 * useScrollProgress Hook
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-002)
 * Purpose: Track scroll progress for progress bar (throttled 100ms)
 */

import { useState, useEffect } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);

      // Throttle scroll events (100ms)
      timeoutId = setTimeout(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;

        const totalScroll = documentHeight - windowHeight;
        const currentProgress = (scrollTop / totalScroll) * 100;

        setProgress(Math.min(Math.max(currentProgress, 0), 100));
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return progress;
}
