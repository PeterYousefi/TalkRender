'use client';

import { useState, useCallback, useRef } from 'react';
import type { SandboxBridge } from '@/lib/sandbox-bridge';
import type { CanvasCommandAction } from '@/types/canvas-commands';
import type { CanvasSnapshot } from '@/types/sandbox';

export interface UseCanvasSandboxOptions {
  onReady?: (bridge: SandboxBridge) => void;
  onError?: (error: string) => void;
}

export function useCanvasSandbox(options: UseCanvasSandboxOptions = {}) {
  const [bridge, setBridge] = useState<SandboxBridge | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [lastAckDurationMs, setLastAckDurationMs] = useState<number>(0);

  const bridgeRef = useRef<SandboxBridge | null>(null);

  const handleBridgeReady = useCallback(
    (readyBridge: SandboxBridge) => {
      bridgeRef.current = readyBridge;
      setBridge(readyBridge);
      setIsReady(true);

      readyBridge.on('fps', (data: { fps: number }) => {
        setFps(data.fps);
      });

      readyBridge.on('pong', (data: { rttMs: number }) => {
        setLatencyMs(data.rttMs);
      });

      readyBridge.on('commandError', (err: { error: string }) => {
        options.onError?.(err.error);
      });

      options.onReady?.(readyBridge);
    },
    [options]
  );

  const executeCommand = useCallback(
    async (action: CanvasCommandAction) => {
      const activeBridge = bridgeRef.current;
      if (!activeBridge) {
        throw new Error('SandboxBridge is not attached or ready.');
      }
      const callId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const res = await activeBridge.sendCommand(callId, action);
      setLastAckDurationMs(res.durationMs);
      return res;
    },
    []
  );

  const injectCode = useCallback(
    (code: string, runtime: 'canvas2d' | 'webgl' | 'dom' = 'canvas2d') => {
      const activeBridge = bridgeRef.current;
      if (!activeBridge) return;
      const scriptId = `script_${Date.now()}`;
      activeBridge.applyScriptDiff(scriptId, code, runtime);
    },
    []
  );

  const restore = useCallback((snapshot: CanvasSnapshot) => {
    const activeBridge = bridgeRef.current;
    if (!activeBridge) return;
    activeBridge.restoreSnapshot(snapshot);
  }, []);

  const clearCanvas = useCallback(
    (clearType: 'all' | 'shapes_only' | 'physics_only' = 'all', preserveBackground = true) => {
      return executeCommand({
        type: 'CLEAR_CANVAS',
        payload: { clearType, preserveBackground },
      });
    },
    [executeCommand]
  );

  return {
    bridge,
    isReady,
    fps,
    latencyMs,
    lastAckDurationMs,
    handleBridgeReady,
    executeCommand,
    injectCode,
    restore,
    clearCanvas,
  };
}
