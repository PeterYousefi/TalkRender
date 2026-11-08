import { describe, it, expect } from 'vitest';
import { BargeInStressSimulator } from '../barge-in-stress';

describe('Concurrent Barge-In & State Rollback Stress Test', () => {
  it('should immediately clear pending tool queue, trigger rollback, and maintain post-interruption stability', async () => {
    const simulator = new BargeInStressSimulator();
    const result = await simulator.simulateConcurrentBargeIn();

    expect(result.initialQueueCount).toBeGreaterThan(0);
    expect(result.wasAudioSuppressed).toBe(true);
    expect(result.wasRollbackTriggered).toBe(true);
    expect(result.postInterruptionStability).toBe(true);
  });
});
