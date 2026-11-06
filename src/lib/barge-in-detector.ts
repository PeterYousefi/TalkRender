/**
 * Low-Latency (<150ms) Client-Side Barge-In & Speech Burst Detector
 */

import { calculateRMS, calculateDBFS } from './audio-analyzer';
import type { BargeInConfig, BargeInEvent } from '@/types/telemetry';

export type BargeInListener = (event: BargeInEvent) => void;

export class BargeInDetector {
  private config: Required<BargeInConfig>;
  private listeners: Set<BargeInListener> = new Set();

  private speechStartTime: number | null = null;
  private isBargedIn = false;
  private silenceStartTime: number | null = null;
  private lastDbfs = -100;

  constructor(config: BargeInConfig = {}) {
    this.config = {
      energyThresholdDbfs: config.energyThresholdDbfs ?? -38,
      minSpeechDurationMs: config.minSpeechDurationMs ?? 90,
      silenceThresholdMs: config.silenceThresholdMs ?? 400,
      enabled: config.enabled ?? true,
    };
  }

  public subscribe(listener: BargeInListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public updateConfig(newConfig: Partial<BargeInConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  public feedDbfs(dbfs: number, now: number = Date.now()): void {
    if (!this.config.enabled) return;

    this.lastDbfs = dbfs;
    const isAboveThreshold = dbfs >= this.config.energyThresholdDbfs;

    if (isAboveThreshold) {
      this.silenceStartTime = null;

      if (this.speechStartTime === null) {
        this.speechStartTime = now;
      }

      const sustainedDuration = now - this.speechStartTime;

      if (!this.isBargedIn && sustainedDuration >= this.config.minSpeechDurationMs) {
        this.isBargedIn = true;
        this.emit({
          type: 'barge_in_triggered',
          timestamp: now,
          dbfs,
          durationMs: sustainedDuration,
        });
      }
    } else {
      // Below energy threshold
      if (this.isBargedIn) {
        if (this.silenceStartTime === null) {
          this.silenceStartTime = now;
        }

        const silenceDuration = now - this.silenceStartTime;
        if (silenceDuration >= this.config.silenceThresholdMs) {
          const totalDuration = this.speechStartTime ? now - this.speechStartTime : 0;
          this.isBargedIn = false;
          this.speechStartTime = null;
          this.silenceStartTime = null;

          this.emit({
            type: 'speech_ended',
            timestamp: now,
            dbfs,
            durationMs: totalDuration,
          });
        }
      } else {
        // Did not reach minSpeechDurationMs, treat as noise glitch and reset
        this.speechStartTime = null;
      }
    }
  }

  public feedAudioBuffer(data: Float32Array, now: number = Date.now()): void {
    const rms = calculateRMS(data);
    const dbfs = calculateDBFS(rms);
    this.feedDbfs(dbfs, now);
  }

  public reset(): void {
    this.speechStartTime = null;
    this.silenceStartTime = null;
    this.isBargedIn = false;
    this.lastDbfs = -100;
  }

  public getState(): {
    isBargedIn: boolean;
    currentSpeechDurationMs: number;
    lastDbfs: number;
    enabled: boolean;
  } {
    const now = Date.now();
    const duration = this.speechStartTime ? now - this.speechStartTime : 0;
    return {
      isBargedIn: this.isBargedIn,
      currentSpeechDurationMs: this.isBargedIn ? duration : 0,
      lastDbfs: this.lastDbfs,
      enabled: this.config.enabled,
    };
  }

  private emit(event: BargeInEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in BargeIn listener:', err);
      }
    }
  }
}
