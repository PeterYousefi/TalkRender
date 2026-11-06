'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SandboxBridge } from '@/lib/sandbox-bridge';
import type { LatencyTelemetry, TelemetrySummary } from '@/types/telemetry';

export interface UseTelemetryCollectorOptions {
  sandboxBridge?: SandboxBridge | null;
  pingIntervalMs?: number;
  enabled?: boolean;
}

export interface UseTelemetryCollectorReturn {
  telemetry: LatencyTelemetry;
  summary: TelemetrySummary;
  recordFrameTime: (durationMs: number) => void;
  recordPing: (rttMs: number) => void;
  recordAudioRtt: (rttMs: number) => void;
}

const DEFAULT_TELEMETRY: LatencyTelemetry = {
  pingMs: 35,
  audioRttMs: 65,
  frameRenderTimeMs: 4.0,
  fps: 60,
  jitterMs: 1.0,
  packetLossPercent: 0,
  lastUpdated: Date.now(),
};

export function useTelemetryCollector({
  sandboxBridge = null,
  pingIntervalMs = 2000,
  enabled = true,
}: UseTelemetryCollectorOptions = {}): UseTelemetryCollectorReturn {
  const [telemetry, setTelemetry] = useState<LatencyTelemetry>(DEFAULT_TELEMETRY);
  const pingsRef = useRef<number[]>([35]);
  const audioRttsRef = useRef<number[]>([65]);
  const fpsRef = useRef<number[]>([60]);

  const recordFrameTime = useCallback((durationMs: number) => {
    setTelemetry((prev) => ({
      ...prev,
      frameRenderTimeMs: Math.round(durationMs * 10) / 10,
      lastUpdated: Date.now(),
    }));
  }, []);

  const recordPing = useCallback((rttMs: number) => {
    pingsRef.current.push(rttMs);
    if (pingsRef.current.length > 20) pingsRef.current.shift();

    setTelemetry((prev) => ({
      ...prev,
      pingMs: Math.round(rttMs),
      lastUpdated: Date.now(),
    }));
  }, []);

  const recordAudioRtt = useCallback((rttMs: number) => {
    audioRttsRef.current.push(rttMs);
    if (audioRttsRef.current.length > 20) audioRttsRef.current.shift();

    setTelemetry((prev) => ({
      ...prev,
      audioRttMs: Math.round(rttMs),
      lastUpdated: Date.now(),
    }));
  }, []);

  // Listen to SandboxBridge telemetry updates
  useEffect(() => {
    if (!sandboxBridge || !enabled) return;

    const unsubFps = sandboxBridge.on<{ fps: number; frameDurationMs: number }>('fps', (data) => {
      fpsRef.current.push(data.fps);
      if (fpsRef.current.length > 20) fpsRef.current.shift();

      setTelemetry((prev) => ({
        ...prev,
        fps: data.fps,
        frameRenderTimeMs: Math.round(data.frameDurationMs * 10) / 10,
        lastUpdated: Date.now(),
      }));
    });

    const unsubPong = sandboxBridge.on<{ rttMs: number }>('pong', (data) => {
      recordPing(data.rttMs);
    });

    const interval = setInterval(() => {
      sandboxBridge.ping();
    }, pingIntervalMs);

    return () => {
      unsubFps();
      unsubPong();
      clearInterval(interval);
    };
  }, [sandboxBridge, enabled, pingIntervalMs, recordPing]);

  // Compute summary metrics
  const avgPing =
    pingsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, pingsRef.current.length);
  const avgAudioRtt =
    audioRttsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, audioRttsRef.current.length);
  const avgFps =
    fpsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, fpsRef.current.length);

  let status: 'optimal' | 'acceptable' | 'degraded' = 'optimal';
  if (telemetry.pingMs > 150 || telemetry.audioRttMs > 250 || telemetry.fps < 30) {
    status = 'degraded';
  } else if (telemetry.pingMs > 75 || telemetry.audioRttMs > 150 || telemetry.fps < 50) {
    status = 'acceptable';
  }

  const summary: TelemetrySummary = {
    avgPingMs: Math.round(avgPing),
    avgAudioRttMs: Math.round(avgAudioRtt),
    avgFps: Math.round(avgFps * 10) / 10,
    status,
  };

  return {
    telemetry,
    summary,
    recordFrameTime,
    recordPing,
    recordAudioRtt,
  };
}
