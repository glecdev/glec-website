/**
 * useCounterAnimation Hook
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-004)
 * Purpose: Counter animation with easing (0 → target in 2 seconds)
 */

import { useState, useEffect } from 'react';

export function useCounterAnimation(
  end: number,
  duration: number = 2000,
  startAnimation: boolean = false
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function: decelerating to zero velocity
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentCount);

      if (progress >= 1) {
        setCount(end);
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration, startAnimation]);

  return count;
}
