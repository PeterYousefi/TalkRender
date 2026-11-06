/**
 * Real-Time Interruption & Optimistic Rollback Coordinator
 * Orchestrates barge-in detection, audio buffer flush, Boson cancellation, and canvas rollback.
 */

import { BargeInDetector } from './barge-in-detector';
import type { AudioBufferController } from './audio-buffer-controller';
import type { BosonRealtimeClient } from './boson-client';
import type { ToolExecutionQueue } from './tool-queue';
import type { SandboxBridge } from './sandbox-bridge';
import type {
  BargeInConfig,
  BargeInEvent,
  InterruptionState,
} from '@/types/telemetry';

export interface InterruptionManagerOptions {
  bargeInConfig?: BargeInConfig;
  bargeInDetector?: BargeInDetector;
  audioController?: AudioBufferController;
  bosonClient?: BosonRealtimeClient;
  toolQueue?: ToolExecutionQueue;
  sandboxBridge?: SandboxBridge;
  rollbackOnInterruption?: boolean;
}

export type InterruptionListener = (state: InterruptionState, event?: BargeInEvent) => void;

export class InterruptionManager {
  private detector: BargeInDetector;
  private audioController: AudioBufferController | null = null;
  private bosonClient: BosonRealtimeClient | null = null;
  private toolQueue: ToolExecutionQueue | null = null;
  private sandboxBridge: SandboxBridge | null = null;

  private rollbackOnInterruption: boolean;
  private state: InterruptionState = {
    isInterrupted: false,
    lastInterruptedAt: null,
    interruptionCount: 0,
    rollbackPending: false,
  };

  private listeners: Set<InterruptionListener> = new Set();
  private unsubDetector: (() => void) | null = null;

  constructor(options: InterruptionManagerOptions = {}) {
    this.detector = options.bargeInDetector || new BargeInDetector(options.bargeInConfig);
    this.audioController = options.audioController || null;
    this.bosonClient = options.bosonClient || null;
    this.toolQueue = options.toolQueue || null;
    this.sandboxBridge = options.sandboxBridge || null;
    this.rollbackOnInterruption = options.rollbackOnInterruption ?? true;

    this.setupListeners();
  }

  private setupListeners(): void {
    this.unsubDetector = this.detector.subscribe((event) => {
      if (event.type === 'barge_in_triggered') {
        this.handleInterruption(event);
      } else if (event.type === 'speech_ended') {
        this.handleSpeechEnded();
      }
    });
  }

  public setAudioController(controller: AudioBufferController | null): void {
    this.audioController = controller;
  }

  public setBosonClient(client: BosonRealtimeClient | null): void {
    this.bosonClient = client;
  }

  public setToolQueue(queue: ToolExecutionQueue | null): void {
    this.toolQueue = queue;
  }

  public setSandboxBridge(bridge: SandboxBridge | null): void {
    this.sandboxBridge = bridge;
  }

  public getState(): Readonly<InterruptionState> {
    return { ...this.state };
  }

  public subscribe(listener: InterruptionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Primary interruption handler triggered either by BargeInDetector or manual user interrupt.
   */
  public handleInterruption(sourceEvent?: BargeInEvent): void {
    const now = Date.now();
    this.state = {
      isInterrupted: true,
      lastInterruptedAt: now,
      interruptionCount: this.state.interruptionCount + 1,
      rollbackPending: this.rollbackOnInterruption,
    };

    // 1. Immediately cut off audio playback
    if (this.audioController) {
      this.audioController.interruptPlayback();
    }

    // 2. Cancel active Boson Realtime response
    if (this.bosonClient) {
      this.bosonClient.interrupt();
    }

    // 3. Rollback any half-applied tool actions and clear queued tools
    if (this.rollbackOnInterruption && this.toolQueue) {
      this.toolQueue.clear();
      const rolledBack = this.toolQueue.rollbackLast();
      if (rolledBack && this.sandboxBridge) {
        this.sandboxBridge
          .sendCommand(`rollback_${rolledBack.id}`, {
            type: 'ROLLBACK_ACTION',
            payload: { actionId: rolledBack.id },
          })
          .catch(() => {
            // ignore non-critical bridge ack failures during interruption
          });
      }
      this.state.rollbackPending = false;
    }

    const event: BargeInEvent = sourceEvent || {
      type: 'playback_interrupted',
      timestamp: now,
      dbfs: 0,
      durationMs: 0,
    };

    this.notify(event);
  }

  public handleSpeechEnded(): void {
    if (this.state.isInterrupted) {
      this.state = {
        ...this.state,
        isInterrupted: false,
      };
      this.notify();
    }
  }

  public triggerManualInterruption(): void {
    this.handleInterruption();
  }

  public feedDbfs(dbfs: number, timestamp?: number): void {
    this.detector.feedDbfs(dbfs, timestamp);
  }

  public feedAudioBuffer(data: Float32Array, timestamp?: number): void {
    this.detector.feedAudioBuffer(data, timestamp);
  }

  public dispose(): void {
    if (this.unsubDetector) {
      this.unsubDetector();
      this.unsubDetector = null;
    }
    this.listeners.clear();
  }

  private notify(event?: BargeInEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state, event);
      } catch (err) {
        console.error('InterruptionManager listener error:', err);
      }
    }
  }
}
