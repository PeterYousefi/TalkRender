import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBargeIn } from '../useBargeIn';
import type { BosonRealtimeClient } from '@/lib/boson-client';

describe('useBargeIn Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default uninterrupted state', () => {
    const { result } = renderHook(() => useBargeIn());

    expect(result.current.isInterrupted).toBe(false);
    expect(result.current.interruptionCount).toBe(0);
    expect(result.current.manager).toBeDefined();
  });

  it('should update state when manual interruption is triggered', () => {
    const mockBoson = {
      interrupt: vi.fn(),
    } as unknown as BosonRealtimeClient;

    const { result } = renderHook(() =>
      useBargeIn({
        bosonClient: mockBoson,
      })
    );

    expect(result.current.isInterrupted).toBe(false);

    act(() => {
      result.current.triggerManualInterrupt();
    });

    expect(result.current.isInterrupted).toBe(true);
    expect(result.current.interruptionCount).toBe(1);
    expect(mockBoson.interrupt).toHaveBeenCalled();
  });

  it('should forward multiple manual interruptions and increment counter', () => {
    const { result } = renderHook(() => useBargeIn());

    act(() => {
      result.current.triggerManualInterrupt();
    });
    expect(result.current.interruptionCount).toBe(1);

    act(() => {
      result.current.triggerManualInterrupt();
    });
    expect(result.current.interruptionCount).toBe(2);
  });
});
