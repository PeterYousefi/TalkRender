import { describe, it, expect } from 'vitest';
import { calculateRMS, calculateDBFS, calculatePeak, normalizeFrequencies } from '@/lib/audio-analyzer';
import { ToolExecutionQueue } from '@/lib/tool-queue';
import { BargeInDetector } from '@/lib/barge-in-detector';

describe('High-Throughput Render Loop & Memory Pressure Resilience', () => {
  it('should process 500 consecutive 60fps audio and visual frames without degradation', () => {
    const frameBuffer = new Float32Array(512);
    const freqBuffer = new Uint8Array(256);

    const start = performance.now();

    for (let frame = 0; frame < 500; frame++) {
      // Simulate oscillating audio waveform
      const angle = (frame * Math.PI) / 30;
      frameBuffer[0] = Math.sin(angle) * 0.8;
      frameBuffer[1] = Math.cos(angle) * 0.8;
      freqBuffer[0] = Math.floor(Math.abs(Math.sin(angle)) * 255);

      const rms = calculateRMS(frameBuffer);
      const dbfs = calculateDBFS(rms);
      const peak = calculatePeak(frameBuffer);
      const bars = normalizeFrequencies(freqBuffer, 16);

      expect(typeof rms).toBe('number');
      expect(typeof dbfs).toBe('number');
      expect(typeof peak).toBe('number');
      expect(bars.length).toBe(16);
    }

    const elapsed = performance.now() - start;
    // 500 frames of math should execute in under 250ms on modern hardware
    expect(elapsed).toBeLessThan(250);
  });

  it('should handle high queue pressure and rapid clearing without memory leaks', () => {
    const queue = new ToolExecutionQueue();

    // Enqueue 100 tool calls rapidly
    for (let i = 0; i < 100; i++) {
      queue.enqueue('draw_shape', {
        shape: 'circle',
        color: '#ff0055',
        radius: 10 + (i % 20),
      });
    }

    const pendingBefore = queue.getPending();
    expect(pendingBefore.length).toBeGreaterThan(0);

    // Clear all pending queue items
    queue.clear();

    const pendingAfter = queue.getPending();
    expect(pendingAfter.length).toBe(0);
  });

  it('should process continuous microphone audio stream without detector state drift', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 90,
      silenceThresholdMs: 200,
    });

    let triggerCount = 0;
    detector.subscribe((e) => {
      if (e.type === 'barge_in_triggered') triggerCount++;
    });

    const mockBuffer = new Float32Array(256);
    for (let i = 0; i < mockBuffer.length; i++) {
      mockBuffer[i] = 0.001; // Ambient silence
    }

    // 200 silent chunks
    for (let chunk = 0; chunk < 200; chunk++) {
      detector.feedAudioBuffer(mockBuffer, 1000 + chunk * 20);
    }

    // State should remain calm with 0 false positive triggers
    expect(triggerCount).toBe(0);
    expect(detector.getState().isBargedIn).toBe(false);
  });
});
