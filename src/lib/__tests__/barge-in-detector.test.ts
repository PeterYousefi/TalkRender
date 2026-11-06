import { describe, it, expect, vi } from 'vitest';
import { BargeInDetector } from '../barge-in-detector';
import type { BargeInEvent } from '@/types/telemetry';

describe('BargeInDetector', () => {
  it('should ignore input when disabled', () => {
    const detector = new BargeInDetector({ enabled: false, energyThresholdDbfs: -35 });
    const onEvent = vi.fn();
    detector.subscribe(onEvent);

    detector.feedDbfs(-20, 1000);
    detector.feedDbfs(-20, 1200);

    expect(onEvent).not.toHaveBeenCalled();
    expect(detector.getState().isBargedIn).toBe(false);
  });

  it('should ignore transient audio spikes shorter than minSpeechDurationMs', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 100,
    });
    const onEvent = vi.fn();
    detector.subscribe(onEvent);

    // Initial spike
    detector.feedDbfs(-20, 1000);
    // Followed by silence after only 40ms (less than 100ms)
    detector.feedDbfs(-50, 1040);

    expect(onEvent).not.toHaveBeenCalled();
    expect(detector.getState().isBargedIn).toBe(false);
  });

  it('should trigger barge_in_triggered when speech is sustained >= minSpeechDurationMs', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 90,
      silenceThresholdMs: 300,
    });

    const events: BargeInEvent[] = [];
    detector.subscribe((e) => events.push(e));

    detector.feedDbfs(-25, 1000);
    expect(events.length).toBe(0);

    // After 95ms of speech >= -35 dBFS
    detector.feedDbfs(-22, 1095);

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('barge_in_triggered');
    expect(events[0].durationMs).toBe(95);
    expect(detector.getState().isBargedIn).toBe(true);
  });

  it('should emit speech_ended after silence exceeds silenceThresholdMs', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 90,
      silenceThresholdMs: 300,
    });

    const events: BargeInEvent[] = [];
    detector.subscribe((e) => events.push(e));

    // Start speech and trigger barge-in
    detector.feedDbfs(-25, 1000);
    detector.feedDbfs(-20, 1100);
    expect(events.length).toBe(1);

    // Silence starts at 1200
    detector.feedDbfs(-55, 1200);
    expect(events.length).toBe(1); // not yet 300ms silence

    // Silence hits 350ms at 1550
    detector.feedDbfs(-60, 1550);

    expect(events.length).toBe(2);
    expect(events[1].type).toBe('speech_ended');
    expect(events[1].durationMs).toBe(550); // 1550 - 1000
    expect(detector.getState().isBargedIn).toBe(false);
  });

  it('should accept raw audio Float32Array buffers and calculate energy', () => {
    const detector = new BargeInDetector({
      energyThresholdDbfs: -35,
      minSpeechDurationMs: 80,
    });

    const onEvent = vi.fn();
    detector.subscribe(onEvent);

    // Create a loud sine/pulse buffer
    const loudBuffer = new Float32Array(512).fill(0.3); // ~ -10 dBFS

    detector.feedAudioBuffer(loudBuffer, 2000);
    detector.feedAudioBuffer(loudBuffer, 2100);

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent.mock.calls[0][0].type).toBe('barge_in_triggered');
  });

  it('should unsubscribe listeners correctly', () => {
    const detector = new BargeInDetector({ minSpeechDurationMs: 50 });
    const onEvent = vi.fn();
    const unsub = detector.subscribe(onEvent);

    unsub();

    detector.feedDbfs(-10, 1000);
    detector.feedDbfs(-10, 1100);

    expect(onEvent).not.toHaveBeenCalled();
  });
});
