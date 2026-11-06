import { describe, it, expect } from 'vitest';
import type {
  BargeInConfig,
  BargeInEvent,
  InterruptionState,
  LatencyTelemetry,
  TelemetrySummary,
} from '../telemetry';

describe('Barge-in & Telemetry Type Definitions', () => {
  it('should allow valid BargeInConfig object construction', () => {
    const config: BargeInConfig = {
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 100,
      silenceThresholdMs: 300,
      enabled: true,
    };

    expect(config.energyThresholdDbfs).toBe(-35);
    expect(config.minSpeechDurationMs).toBe(100);
    expect(config.enabled).toBe(true);
  });

  it('should construct valid BargeInEvent and InterruptionState', () => {
    const event: BargeInEvent = {
      type: 'barge_in_triggered',
      timestamp: 1700000000000,
      dbfs: -22.5,
      durationMs: 110,
    };

    const state: InterruptionState = {
      isInterrupted: true,
      lastInterruptedAt: event.timestamp,
      interruptionCount: 1,
      rollbackPending: true,
    };

    expect(event.type).toBe('barge_in_triggered');
    expect(state.isInterrupted).toBe(true);
    expect(state.rollbackPending).toBe(true);
  });

  it('should validate complete LatencyTelemetry and TelemetrySummary structure', () => {
    const telemetry: LatencyTelemetry = {
      pingMs: 42,
      audioRttMs: 88,
      frameRenderTimeMs: 4.2,
      fps: 60,
      jitterMs: 1.5,
      packetLossPercent: 0,
      lastUpdated: Date.now(),
    };

    const summary: TelemetrySummary = {
      avgPingMs: 40,
      avgAudioRttMs: 85,
      avgFps: 59.8,
      status: 'optimal',
    };

    expect(telemetry.fps).toBe(60);
    expect(summary.status).toBe('optimal');
  });
});
