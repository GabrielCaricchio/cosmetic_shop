import { useState, useEffect } from 'react';

export function useCountdown(target: number | string | Date) {
  const calculateInitialSeconds = (): number => {
    if (typeof target === 'number') {
      return Math.max(0, Math.floor(target));
    }
    const targetDate = typeof target === 'string' ? new Date(target).getTime() : target.getTime();
    const diff = Math.floor((targetDate - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateInitialSeconds);

  useEffect(() => {
    setRemainingSeconds(calculateInitialSeconds());

    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = remainingSeconds <= 0;

  return {
    remainingSeconds,
    formatted,
    isExpired,
  };
}

export default useCountdown;
