/**
 * Concurrent Barge-In & State Rollback Stress Simulator
 * Verifies race conditions between live tool queue execution and high-frequency user speech interruptions.
 */

import { E2ETestHarness } from './harness';

export interface BargeInRaceResult {
  initialQueueCount: number;
  clearedPendingCount: number;
  wasAudioSuppressed: boolean;
  wasRollbackTriggered: boolean;
  postInterruptionStability: boolean;
}

export class BargeInStressSimulator {
  private harness: E2ETestHarness;

  constructor() {
    this.harness = new E2ETestHarness();
  }

  public async simulateConcurrentBargeIn(): Promise<BargeInRaceResult> {
    // 1. Enqueue multiple tool calls rapidly
    for (let i = 0; i < 10; i++) {
      this.harness.toolQueue.enqueue(
        'draw_shape',
        {
          shape: 'circle',
          x: 100 + i * 20,
          y: 100,
          radius: 15,
          color: '#06b6d4',
        },
        `concurrent_call_${i}`
      );
    }

    const initialPending = this.harness.toolQueue.getPending().length;

    // 2. Mid-flight user barge-in burst (-18 dBFS)
    this.harness.simulateBargeIn(-18);

    const isInterrupted = this.harness.interruptionManager.getState().isInterrupted;
    const remainingPending = this.harness.toolQueue.getPending().length;

    // 3. Verify optimistic rollback occurred
    const history = this.harness.toolQueue.getHistory();
    const hasRolledBack = history.some((item) => item.status === 'rolled_back');

    // 4. Test recovery: speech ends, new tool can be enqueued and executed
    this.harness.interruptionManager.feedDbfs(-60, 1500);
    this.harness.interruptionManager.feedDbfs(-60, 2000);

    const recoveryItem = this.harness.toolQueue.enqueue('draw_shape', {
      shape: 'rectangle',
      x: 300,
      y: 300,
      width: 50,
      height: 50,
      color: '#10b981',
    });

    // Let queue finish recovery item
    await new Promise((r) => setTimeout(r, 20));

    return {
      initialQueueCount: initialPending,
      clearedPendingCount: Math.max(0, initialPending - remainingPending),
      wasAudioSuppressed: isInterrupted,
      wasRollbackTriggered: hasRolledBack,
      postInterruptionStability: recoveryItem.status === 'completed',
    };
  }
}
