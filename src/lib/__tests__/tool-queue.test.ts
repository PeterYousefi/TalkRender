import { describe, it, expect } from 'vitest';
import { ToolExecutionQueue } from '../tool-queue';

describe('ToolExecutionQueue & Optimistic Rollback Manager', () => {
  it('should enqueue and execute valid tool commands', async () => {
    const queue = new ToolExecutionQueue();
    let completedItem: unknown = null;

    queue.on('itemCompleted', (item) => {
      completedItem = item;
    });

    queue.enqueue('draw_shape', {
      shape: 'circle',
      x: 50,
      y: 50,
      radius: 20,
    });

    // Wait microtask tick for async queue processing
    await new Promise((r) => setTimeout(r, 50));

    expect(completedItem).not.toBeNull();
    const history = queue.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].status).toBe('completed');
    expect(history[0].result).toBeDefined();
  });

  it('should auto-parse JSON string arguments', async () => {
    const queue = new ToolExecutionQueue();
    queue.enqueue(
      'set_background',
      JSON.stringify({ mode: 'solid', color: '#111726' })
    );

    await new Promise((r) => setTimeout(r, 50));

    const history = queue.getHistory();
    expect(history[0].status).toBe('completed');
    expect(history[0].args.color).toBe('#111726');
  });

  it('should mark item as failed when validation fails', async () => {
    const queue = new ToolExecutionQueue();
    let failedItem: unknown = null;

    queue.on('itemFailed', (item) => {
      failedItem = item;
    });

    queue.enqueue('draw_shape', {
      shape: 'unsupported_shape_type',
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(failedItem).not.toBeNull();
    const history = queue.getHistory();
    expect(history[0].status).toBe('failed');
    expect(history[0].error).toContain('Validation or execution failed');
  });

  it('should execute optimistic rollback on completed items', async () => {
    const queue = new ToolExecutionQueue();
    let rolledBackFired = false;

    queue.on('itemRolledBack', () => {
      rolledBackFired = true;
    });

    queue.enqueue('create_physics_body', {
      bodyType: 'circle',
      x: 100,
      y: 100,
      radius: 15,
    });

    await new Promise((r) => setTimeout(r, 50));

    const rolledBack = queue.rollbackLast();
    expect(rolledBack).not.toBeNull();
    expect(rolledBack?.status).toBe('rolled_back');
    expect(rolledBackFired).toBe(true);

    const telemetry = queue.getTelemetry();
    expect(telemetry.rolledBackCount).toBe(1);
  });

  it('should compute queue telemetry metrics accurately', async () => {
    const queue = new ToolExecutionQueue();

    queue.enqueue('clear_canvas', { clearType: 'all' });
    queue.enqueue('draw_shape', { shape: 'invalid' });

    await new Promise((r) => setTimeout(r, 80));

    const telemetry = queue.getTelemetry();
    expect(telemetry.completedCount).toBe(1);
    expect(telemetry.failedCount).toBe(1);
    expect(telemetry.queuedCount).toBe(0);
    expect(telemetry.averageDurationMs).toBeGreaterThanOrEqual(0);
  });
});
