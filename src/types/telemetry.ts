/**
 * Barge-In Interruption, Voice Activity & Real-Time Telemetry Interfaces
 */

export interface BargeInConfig {
  /**
   * Sound energy threshold in dBFS above which voice activity is counted (-100 to 0).
   * Default: -38 dBFS
   */
  energyThresholdDbfs?: number;

  /**
   * Consecutive duration of sustained speech energy in ms required to trigger barge-in (sub-150ms).
   * Default: 90 ms
   */
  minSpeechDurationMs?: number;

  /**
   * Consecutive duration of silence in ms required to mark end of speech burst.
   * Default: 400 ms
   */
  silenceThresholdMs?: number;

  /**
   * Whether barge-in interruption detection is actively armed.
   */
  enabled?: boolean;
}

export type BargeInEventType =
  | 'barge_in_triggered'
  | 'speech_ended'
  | 'playback_interrupted'
  | 'rollback_applied';

export interface BargeInEvent {
  type: BargeInEventType;
  timestamp: number;
  dbfs: number;
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface InterruptionState {
  isInterrupted: boolean;
  lastInterruptedAt: number | null;
  interruptionCount: number;
  rollbackPending: boolean;
}

export interface LatencyTelemetry {
  /**
   * Round-trip ping time to Boson Realtime server in milliseconds
   */
  pingMs: number;

  /**
   * WebRTC audio round-trip travel time in milliseconds
   */
  audioRttMs: number;

  /**
   * Sandboxed canvas frame render execution duration in milliseconds
   */
  frameRenderTimeMs: number;

  /**
   * Current frames per second of the interactive canvas
   */
  fps: number;

  /**
   * Audio network packet jitter in milliseconds
   */
  jitterMs: number;

  /**
   * Percentage of dropped WebRTC packets (0 - 100)
   */
  packetLossPercent: number;

  /**
   * Timestamp when telemetry was last sampled
   */
  lastUpdated: number;
}

export interface TelemetrySummary {
  avgPingMs: number;
  avgAudioRttMs: number;
  avgFps: number;
  status: 'optimal' | 'acceptable' | 'degraded';
}
