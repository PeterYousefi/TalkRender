import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolExecution } from '../useToolExecution';

describe('useToolExecution React Hook', () => {
  it('should initialize with empty queue and zero telemetry', () => {
    const { result } = renderHook(() => useToolExecution());

    expect(result.current.history).toHaveLength(0);
    expect(result.current.pending).toHaveLength(0);
    expect(result.current.telemetry.queuedCount).toBe(0);
    expect(result.current.telemetry.completedCount).toBe(0);
  });

  it('should dispatch tool, update queue, and trigger onToolCompleted callback', async () => {
    const onCompletedMock = vi.fn();
    const { result } = renderHook(() =>
      useToolExecution({ onToolCompleted: onCompletedMock })
    );

    act(() => {
      result.current.dispatch('draw_shape', {
        shape: 'rectangle',
        x: 10,
        y: 10,
        width: 100,
        height: 50,
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    expect(onCompletedMock).toHaveBeenCalledTimes(1);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].status).toBe('completed');
    expect(result.current.telemetry.completedCount).toBe(1);
  });

  it('should support optimistic rollback from hook', async () => {
    const onRolledBackMock = vi.fn();
    const { result } = renderHook(() =>
      useToolExecution({ onToolRolledBack: onRolledBackMock })
    );

    act(() => {
      result.current.dispatch('set_background', {
        mode: 'solid',
        color: '#000000',
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    act(() => {
      result.current.rollbackLast();
    });

    expect(onRolledBackMock).toHaveBeenCalledTimes(1);
    expect(result.current.history[0].status).toBe('rolled_back');
    expect(result.current.telemetry.rolledBackCount).toBe(1);
  });
});
