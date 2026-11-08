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
      let args: Record<string, unknown>;

      switch (toolName) {
        case 'draw_shape':
          args = {
            shape: 'circle',
            x: (i * 15) % 800,
            y: (i * 12) % 600,
            radius: 10 + (i % 20),
            color: '#06b6d4',
          };
          break;
        case 'create_physics_body':
          args = {
            bodyType: 'circle',
            x: (i * 14) % 800,
            y: (i * 10) % 500,
            radius: 12,
            mass: 1.0,
            restitution: 0.8,
          };
          break;
        case 'set_background':
          args = {
            mode: 'solid',
            color: '#090d16',
          };
          break;
        case 'update_style':
          args = {
            selector: 'canvas',
            styles: { opacity: '0.95' },
          };
          break;
        default:
          args = { shape: 'circle' };
          break;
      }

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
