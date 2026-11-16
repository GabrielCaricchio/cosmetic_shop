import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from '../useCountdown';

describe('useCountdown hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down each second correctly', () => {
    const { result } = renderHook(() => useCountdown(60));
    expect(result.current.formatted).toBe('01:00');
    expect(result.current.isExpired).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(55);
    expect(result.current.formatted).toBe('00:55');
  });
});
