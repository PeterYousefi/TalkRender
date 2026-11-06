import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTelemetryCollector } from '../useTelemetryCollector';
import type { SandboxBridge } from '@/lib/sandbox-bridge';

describe('useTelemetryCollector Hook', () => {
  it('should initialize with default telemetry structure and status', () => {
    const { result } = renderHook(() => useTelemetryCollector());

    expect(result.current.telemetry).toBeDefined();
    expect(result.current.telemetry.fps).toBe(60);
    expect(result.current.summary.status).toBe('optimal');
  });

  it('should record frame execution time accurately', () => {
    const { result } = renderHook(() => useTelemetryCollector());

    act(() => {
      result.current.recordFrameTime(8.45);
    });

    expect(result.current.telemetry.frameRenderTimeMs).toBe(8.5);
  });

  it('should record ping and update summary calculations', () => {
    const { result } = renderHook(() => useTelemetryCollector());

    act(() => {
      result.current.recordPing(90);
    });

    expect(result.current.telemetry.pingMs).toBe(90);
    expect(result.current.summary.avgPingMs).toBeGreaterThan(0);
  });

  it('should bind to sandboxBridge fps and pong events', () => {
    const handlers: Record<string, (data: any) => void> = {};
    const mockBridge = {
      on: vi.fn((event: string, handler: (data: any) => void) => {
        handlers[event] = handler;
        return () => delete handlers[event];
      }),
      ping: vi.fn(),
    } as unknown as SandboxBridge;

    const { result } = renderHook(() =>
      useTelemetryCollector({
        sandboxBridge: mockBridge,
        enabled: true,
      })
    );

    expect(mockBridge.on).toHaveBeenCalledWith('fps', expect.any(Function));
    expect(mockBridge.on).toHaveBeenCalledWith('pong', expect.any(Function));

    // Simulate fps event from sandbox
    act(() => {
      handlers['fps']({ fps: 58, frameDurationMs: 5.2 });
    });

    expect(result.current.telemetry.fps).toBe(58);
    expect(result.current.telemetry.frameRenderTimeMs).toBe(5.2);
  });
});
