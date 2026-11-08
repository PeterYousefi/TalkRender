import { describe, it, expect } from 'vitest';
import { RapidToolStressRunner } from '../stress-runner';

describe('50 Rapid Sequential Tool Calls Stress Test', () => {
  it('should process 50 consecutive tool calls without frame drop, queue stall, or data loss', async () => {
    const runner = new RapidToolStressRunner();
    const result = await runner.runStressTest(50);

    expect(result.totalDispatched).toBe(50);
    expect(result.totalCompleted).toBe(50);
    expect(result.totalFailed).toBe(0);
    expect(result.throughputPerSec).toBeGreaterThan(0);
    expect(result.averageLatencyMs).toBeLessThan(100);
  });

  it('should handle rapid bursts of 20 physics bodies without stalling queue', async () => {
    const runner = new RapidToolStressRunner();
    const result = await runner.runStressTest(20);

    expect(result.totalCompleted).toBe(20);
    expect(result.totalFailed).toBe(0);
  });
});
