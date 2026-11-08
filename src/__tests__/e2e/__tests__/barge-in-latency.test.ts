import { describe, it, expect } from 'vitest';
import { BargeInDetector } from '@/lib/barge-in-detector';
import type { BargeInEvent } from '@/types/telemetry';

describe('Barge-In Sub-150ms Latency & Audio Yield Benchmark', () => {
  it('should detect speech burst and trigger interruption within sub-150ms threshold', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 80, // Target 80ms detection window (< 150ms)
    });

    const events: BargeInEvent[] = [];
    detector.subscribe((e) => events.push(e));

    const startTime = 1000;
    // Frame 1: onset of speech (t = 1000ms)
    detector.feedDbfs(-20, startTime);
    expect(events.length).toBe(0);

    // Frame 2: speech continues (t = 1040ms)
    detector.feedDbfs(-18, startTime + 40);
    expect(events.length).toBe(0);

    // Frame 3: speech reaches 80ms (t = 1080ms)
    detector.feedDbfs(-15, startTime + 80);
    expect(events.length).toBe(1);

    const triggerEvent = events[0];
    expect(triggerEvent.type).toBe('barge_in_triggered');
    expect(triggerEvent.durationMs).toBe(80);
    expect(triggerEvent.durationMs).toBeLessThan(150); // Hard requirement: sub-150ms
  });

  it('should execute 50 rapid speech bursts and maintain p99 reaction time under 150ms', () => {
    const latencies: number[] = [];

    for (let cycle = 0; cycle < 50; cycle++) {
      let triggeredLatency = -1;
      const detector = new BargeInDetector({
        energyThresholdDbfs: -30,
        minSpeechDurationMs: 70, // 70ms detection
      });

      const cycleBaseTime = 10000 + cycle * 500;
      detector.subscribe((e) => {
        if (e.type === 'barge_in_triggered') {
          triggeredLatency = e.timestamp - cycleBaseTime;
        }
      });

      // Stream 20ms audio frame packets
      for (let offset = 0; offset <= 140; offset += 20) {
        detector.feedDbfs(-15, cycleBaseTime + offset);
        if (triggeredLatency !== -1) break;
      }

      expect(triggeredLatency).toBeGreaterThan(0);
      latencies.push(triggeredLatency);
    }

    expect(latencies.length).toBe(50);

    // Compute metrics
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[latencies.length - 1];

    expect(p50).toBeLessThanOrEqual(100);
    expect(p95).toBeLessThanOrEqual(120);
    expect(p99).toBeLessThan(150);
  });

  it('should filter out transient noise glitches shorter than minSpeechDuration without triggering', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 90,
    });

    const events: BargeInEvent[] = [];
    detector.subscribe((e) => events.push(e));

    // Transient mic pop: 30ms only
    detector.feedDbfs(-10, 1000);
    detector.feedDbfs(-10, 1030);
    // Returns to background noise
    detector.feedDbfs(-50, 1040);

    expect(events.length).toBe(0);
    expect(detector.getState().isBargedIn).toBe(false);
  });
});
