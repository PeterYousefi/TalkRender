/**
 * Asynchronous Tool Execution Queue & Optimistic Rollback Manager
 */

import { toolRegistry } from './tools/registry';
import type {
  CanvasToolName,
  ToolExecutionItem,
} from '@/types/canvas-commands';

export type ToolQueueEventHandler<T = any> = (data: T) => void;

export interface ToolQueueTelemetry {
  queuedCount: number;
  completedCount: number;
  failedCount: number;
  rolledBackCount: number;
  averageDurationMs: number;
}

export class ToolExecutionQueue {
  private queue: ToolExecutionItem[] = [];
  private history: ToolExecutionItem[] = [];
  private isProcessing = false;
  private listeners: Map<string, Set<ToolQueueEventHandler>> = new Map();

  public enqueue(
    name: CanvasToolName,
    args: Record<string, unknown> | string,
    callId?: string
  ): ToolExecutionItem {
    const item: ToolExecutionItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      callId: callId || `call_${Date.now()}`,
      name,
      args: typeof args === 'string' ? JSON.parse(args) : args,
      status: 'queued',
      queuedAt: Date.now(),
    };

    this.queue.push(item);
    this.emit('itemQueued', item);
    this.processNext();
    return item;
  }

  public getHistory(): ToolExecutionItem[] {
    return [...this.history];
  }

  public getPending(): ToolExecutionItem[] {
    return [...this.queue];
  }

  public getTelemetry(): ToolQueueTelemetry {
    const completed = this.history.filter((i) => i.status === 'completed');
    const totalDuration = completed.reduce((sum, i) => sum + (i.durationMs || 0), 0);

    return {
      queuedCount: this.queue.length,
      completedCount: completed.length,
      failedCount: this.history.filter((i) => i.status === 'failed').length,
      rolledBackCount: this.history.filter((i) => i.status === 'rolled_back').length,
      averageDurationMs: completed.length > 0 ? totalDuration / completed.length : 0,
    };
  }

  public on<T = any>(event: string, handler: ToolQueueEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as ToolQueueEventHandler);
    return () => {
      this.listeners.get(event)?.delete(handler as ToolQueueEventHandler);
    };
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`ToolExecutionQueue listener error [${event}]:`, err);
        }
      });
    }
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      if (this.queue.length === 0 && !this.isProcessing) {
        this.emit('queueDrained', undefined);
      }
      return;
    }

    this.isProcessing = true;
    const current = this.queue.shift()!;
    current.status = 'executing';
    current.executedAt = Date.now();
    this.emit('itemStarted', current);

    const startTime = performance.now();
    try {
      const execResult = await toolRegistry.validateAndExecute(
        current.name,
        current.args
      );

      current.durationMs = Math.round(performance.now() - startTime);

      if (execResult.success) {
        current.status = 'completed';
        current.result = execResult.result;
        current.rollbackPayload = {
          actionId: current.id,
          originalArgs: current.args,
        };
        this.history.push(current);
        this.emit('itemCompleted', current);
      } else {
        current.status = 'failed';
        current.error = execResult.error;
        this.history.push(current);
        this.emit('itemFailed', current);
      }
    } catch (err: unknown) {
      current.status = 'failed';
      current.error = err instanceof Error ? err.message : String(err);
      current.durationMs = Math.round(performance.now() - startTime);
      this.history.push(current);
      this.emit('itemFailed', current);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }

  public rollback(itemId: string): ToolExecutionItem | null {
    const target = this.history.find((i) => i.id === itemId);
    if (!target || target.status !== 'completed') {
      return null;
    }

    target.status = 'rolled_back';
    this.emit('itemRolledBack', target);
    return target;
  }

  public rollbackLast(): ToolExecutionItem | null {
    const lastCompleted = [...this.history]
      .reverse()
      .find((i) => i.status === 'completed');

    if (lastCompleted) {
      return this.rollback(lastCompleted.id);
    }
    return null;
  }

  public clear(): void {
    this.queue = [];
    this.emit('queueDrained', undefined);
  }
}
