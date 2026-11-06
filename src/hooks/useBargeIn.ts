'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { InterruptionManager } from '@/lib/interruption-manager';
import { useAudioAnalyzer } from './useAudioAnalyzer';
import type { AudioBufferController } from '@/lib/audio-buffer-controller';
import type { BosonRealtimeClient } from '@/lib/boson-client';
import type { ToolExecutionQueue } from '@/lib/tool-queue';
import type { SandboxBridge } from '@/lib/sandbox-bridge';
import type { BargeInConfig, InterruptionState } from '@/types/telemetry';

export interface UseBargeInOptions {
  micStream?: MediaStream | null;
  audioController?: AudioBufferController | null;
  bosonClient?: BosonRealtimeClient | null;
  toolQueue?: ToolExecutionQueue | null;
  sandboxBridge?: SandboxBridge | null;
  config?: BargeInConfig;
  enabled?: boolean;
  rollbackOnInterruption?: boolean;
}

export interface UseBargeInReturn {
  interruptionState: InterruptionState;
  isInterrupted: boolean;
  interruptionCount: number;
  triggerManualInterrupt: () => void;
  manager: InterruptionManager | null;
}

const DEFAULT_STATE: InterruptionState = {
  isInterrupted: false,
  lastInterruptedAt: null,
  interruptionCount: 0,
  rollbackPending: false,
};

export function useBargeIn({
  micStream = null,
  audioController = null,
  bosonClient = null,
  toolQueue = null,
  sandboxBridge = null,
  config,
  enabled = true,
  rollbackOnInterruption = true,
}: UseBargeInOptions = {}): UseBargeInReturn {
  const [interruptionState, setInterruptionState] = useState<InterruptionState>(DEFAULT_STATE);
  const managerRef = useRef<InterruptionManager | null>(null);

  // Lazy instantiate InterruptionManager
  if (!managerRef.current) {
    managerRef.current = new InterruptionManager({
      bargeInConfig: config,
      audioController: audioController || undefined,
      bosonClient: bosonClient || undefined,
      toolQueue: toolQueue || undefined,
      sandboxBridge: sandboxBridge || undefined,
      rollbackOnInterruption,
    });
  }

  // Update reactive manager dependencies
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setAudioController(audioController);
      managerRef.current.setBosonClient(bosonClient);
      managerRef.current.setToolQueue(toolQueue);
      managerRef.current.setSandboxBridge(sandboxBridge);
    }
  }, [audioController, bosonClient, toolQueue, sandboxBridge]);

  // Subscribe to interruption manager events
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    const unsub = manager.subscribe((state) => {
      setInterruptionState(state);
    });

    return () => {
      unsub();
    };
  }, []);

  // Monitor mic stream using useAudioAnalyzer and feed dBFS to detector
  const { frequencyData } = useAudioAnalyzer({
    stream: micStream,
    enabled: enabled && !!micStream,
    sampleIntervalMs: 25, // 40Hz sampling for sub-150ms VAD
  });

  useEffect(() => {
    if (enabled && micStream && managerRef.current && frequencyData.dbfs > -100) {
      managerRef.current.feedDbfs(frequencyData.dbfs);
    }
  }, [frequencyData.dbfs, enabled, micStream]);

  const triggerManualInterrupt = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.triggerManualInterruption();
    }
  }, []);

  return {
    interruptionState,
    isInterrupted: interruptionState.isInterrupted,
    interruptionCount: interruptionState.interruptionCount,
    triggerManualInterrupt,
    manager: managerRef.current,
  };
}
