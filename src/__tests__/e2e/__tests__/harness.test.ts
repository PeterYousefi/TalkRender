import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { E2ETestHarness } from '../harness';

describe('E2ETestHarness', () => {
  let harness: E2ETestHarness;

  beforeEach(() => {
    harness = new E2ETestHarness();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize queue, sandbox bridge, and interruption manager', () => {
    expect(harness.toolQueue).toBeDefined();
    expect(harness.sandboxBridge).toBeDefined();
    expect(harness.interruptionManager).toBeDefined();
  });

  it('should simulate voice command execution and iframe ack dispatch', async () => {
    const item = await harness.simulateVoiceCommand('draw_shape', {
      type: 'circle',
      x: 100,
      y: 100,
      radius: 20,
    });

    expect(item).toBeDefined();
    const history = harness.toolQueue.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].name).toBe('draw_shape');
  });

  it('should simulate speech barge-in and update interruption state', () => {
    expect(harness.interruptionManager.getState().isInterrupted).toBe(false);

    harness.simulateBargeIn(-18);

    expect(harness.interruptionManager.getState().isInterrupted).toBe(true);
    expect(harness.interruptionManager.getState().interruptionCount).toBe(1);
  });
});
