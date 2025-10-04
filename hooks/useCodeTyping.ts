/**
 * useCodeTyping Hook
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-003)
 * Purpose: Typing animation for code blocks
 */

import { useState, useEffect } from 'react';

export function useCodeTyping(code: string, speed: number = 30, startTyping: boolean = false) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!startTyping) {
      setDisplayedCode('');
      setIsComplete(false);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < code.length) {
        setDisplayedCode(code.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [code, speed, startTyping]);

  return { displayedCode, isComplete };
}
