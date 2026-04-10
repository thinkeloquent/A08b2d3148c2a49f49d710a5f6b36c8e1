import { useState, useEffect } from 'react';

/** Animated counter that increments from 0 to `target` over `duration` ms. Only runs when `active` is true. */
export function useCounter(target: number, duration = 900, active = false): number {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) {
      setVal(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const id = setInterval(() => {
      current += step;
      if (current >= target) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(current);
      }
    }, 16);
    return () => clearInterval(id);
  }, [target, duration, active]);

  return val;
}
