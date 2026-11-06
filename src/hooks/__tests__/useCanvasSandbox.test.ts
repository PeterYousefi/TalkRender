import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasSandbox } from '../useCanvasSandbox';
import type { SandboxBridge } from '@/lib/sandbox-bridge';

describe('useCanvasSandbox React Hook', () => {
  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useCanvasSandbox());

    expect(result.current.isReady).toBe(false);
    expect(result.current.bridge).toBeNull();
    expect(result.current.fps).toBe(60);
    expect(result.current.latencyMs).toBe(0);
  });

  it('should handle bridge ready attachment and forward callbacks', () => {
    const onReadyMock = vi.fn();
    const { result } = renderHook(() => useCanvasSandbox({ onReady: onReadyMock }));

    const mockBridge = {
      on: vi.fn(),
      sendCommand: vi.fn().mockResolvedValue({ durationMs: 8, elementsCount: 3 }),
      applyScriptDiff: vi.fn(),
      restoreSnapshot: vi.fn(),
    } as unknown as SandboxBridge;

    act(() => {
      result.current.handleBridgeReady(mockBridge);
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.bridge).toBe(mockBridge);
    expect(onReadyMock).toHaveBeenCalledWith(mockBridge);
  });

  it('should forward executeCommand to active bridge', async () => {
    const { result } = renderHook(() => useCanvasSandbox());

    const sendCommandMock = vi.fn().mockResolvedValue({ durationMs: 12, elementsCount: 5 });
    const mockBridge = {
      on: vi.fn(),
      sendCommand: sendCommandMock,
      applyScriptDiff: vi.fn(),
      restoreSnapshot: vi.fn(),
    } as unknown as SandboxBridge;

    act(() => {
      result.current.handleBridgeReady(mockBridge);
    });

    let execResult: unknown = null;
    await act(async () => {
      execResult = await result.current.executeCommand({
        type: 'DRAW_SHAPE',
        payload: { shape: 'circle' },
      });
    });

    expect(sendCommandMock).toHaveBeenCalledTimes(1);
    expect(execResult).toEqual({ durationMs: 12, elementsCount: 5 });
    expect(result.current.lastAckDurationMs).toBe(12);
  });

  it('should forward clearCanvas command', async () => {
    const { result } = renderHook(() => useCanvasSandbox());

    const sendCommandMock = vi.fn().mockResolvedValue({ durationMs: 2, elementsCount: 0 });
    const mockBridge = {
      on: vi.fn(),
      sendCommand: sendCommandMock,
      applyScriptDiff: vi.fn(),
      restoreSnapshot: vi.fn(),
    } as unknown as SandboxBridge;

    act(() => {
      result.current.handleBridgeReady(mockBridge);
    });

    await act(async () => {
      await result.current.clearCanvas('shapes_only', true);
    });

    expect(sendCommandMock).toHaveBeenCalledWith(
      expect.stringMatching(/^cmd_/),
      {
        type: 'CLEAR_CANVAS',
        payload: { clearType: 'shapes_only', preserveBackground: true },
      }
    );
  });
});
