/**
 * useTypingAnimation Hook
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-001)
 * Speed: 50ms per character
 *
 * Fixed: Hydration mismatch - show full text on SSR, animate on client
 */

import { useState, useEffect } from 'react';

export function useTypingAnimation(text: string, speed: number = 50) {
  // Start with full text for SSR (prevents hydration mismatch)
  const [displayedText, setDisplayedText] = useState(text);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Only animate on client-side (after hydration)
    setHasStarted(true);
    setDisplayedText('');
    setIsComplete(false);

    // Small delay to ensure smooth hydration
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, 100); // 100ms delay after hydration

    return () => clearTimeout(startDelay);
  }, [text, speed]);

  return { displayedText, isComplete, hasStarted };
}
