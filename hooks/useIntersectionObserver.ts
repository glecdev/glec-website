/**
 * useIntersectionObserver Hook
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-002)
 * Purpose: Detect when element enters viewport (70% threshold)
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.7,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, hasIntersected]);

  return {
    elementRef,
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
  };
}
