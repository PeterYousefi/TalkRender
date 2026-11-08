/**
 * High-Throughput Rapid Sequential Tool Stress Test Runner
 * Dispatches 50+ rapid concurrent and sequential tool calls to verify queue stability and zero drop rate.
 */

import { ToolExecutionQueue } from '@/lib/tool-queue';
import type { CanvasToolName } from '@/types/canvas-commands';

export interface StressTestResult {
  totalDispatched: number;
  totalCompleted: number;
  totalFailed: number;
  elapsedMs: number;
  averageLatencyMs: number;
  throughputPerSec: number;
}

export class RapidToolStressRunner {
  private queue: ToolExecutionQueue;

  constructor(queue?: ToolExecutionQueue) {
    this.queue = queue || new ToolExecutionQueue();
  }

  public async runStressTest(count = 50): Promise<StressTestResult> {
    const startTime = performance.now();
    const toolTypes: CanvasToolName[] = [
      'draw_shape',
      'set_background',
      'create_physics_body',
      'update_style',
    ];

    for (let i = 0; i < count; i++) {
      const toolName = toolTypes[i % toolTypes.length];
      const args: Record<string, unknown> = {
        id: `stress_obj_${i}`,
        type: i % 2 === 0 ? 'circle' : 'rectangle',
        x: (i * 15) % 800,
        y: (i * 12) % 600,
        radius: 10 + (i % 20),
        width: 30,
        height: 30,
        color: '#06b6d4',
      };

      this.queue.enqueue(toolName, args, `stress_call_${i}`);
    }

    // Await queue drainage
    await new Promise<void>((resolve) => {
      const checkDrain = () => {
        const telemetry = this.queue.getTelemetry();
        if (telemetry.queuedCount === 0 && telemetry.completedCount + telemetry.failedCount >= count) {
          resolve();
        } else {
          setTimeout(checkDrain, 10);
        }
      };
      checkDrain();
    });

    const elapsedMs = Math.max(1, performance.now() - startTime);
    const telemetry = this.queue.getTelemetry();

    return {
      totalDispatched: count,
      totalCompleted: telemetry.completedCount,
      totalFailed: telemetry.failedCount,
      elapsedMs: Math.round(elapsedMs * 10) / 10,
      averageLatencyMs: Math.round(telemetry.averageDurationMs * 10) / 10,
      throughputPerSec: Math.round((count / (elapsedMs / 1000)) * 10) / 10,
    };
  }
}
