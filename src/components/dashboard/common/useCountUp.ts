import { useState, useEffect } from 'react';

/**
 * Hook to animate numeric values smoothly with prefers-reduced-motion check
 */
export function useCountUp(target: number, durationMs: number = 350): number {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(target);
      return;
    }

    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    let animationFrameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, durationMs]);

  return displayValue;
}
