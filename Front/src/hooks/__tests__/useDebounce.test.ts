import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces value changes after specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'batom', delay: 300 },
      }
    );

    expect(result.current).toBe('batom');

    rerender({ value: 'batom vermelho', delay: 300 });
    expect(result.current).toBe('batom');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('batom vermelho');
  });
});
