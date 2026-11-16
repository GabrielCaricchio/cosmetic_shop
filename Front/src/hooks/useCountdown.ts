import { useState, useEffect } from 'react';

export function useCountdown(initialSeconds: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    setRemainingSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = remainingSeconds <= 0;

  return { remainingSeconds, formatted, isExpired };
}
