import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToolExecutionInspector } from '../ToolExecutionInspector';
import type { ToolExecutionItem } from '@/types/canvas-commands';

const mockItems: ToolExecutionItem[] = [
  {
    id: 'item_1',
    callId: 'call_1',
    name: 'draw_shape',
    args: { type: 'circle', radius: 25 },
    status: 'completed',
    queuedAt: 1000,
    durationMs: 4,
    result: { id: 'circle_1' },
  },
  {
    id: 'item_2',
    callId: 'call_2',
    name: 'set_background',
    args: { type: 'solid', color: '#111' },
    status: 'rolled_back',
    queuedAt: 1050,
    durationMs: 2,
  },
  {
    id: 'item_3',
    callId: 'call_3',
    name: 'create_physics_body',
    args: { id: 'ball' },
    status: 'failed',
    queuedAt: 1100,
    error: 'Physics body collided with invalid wall',
  },
];

describe('ToolExecutionInspector Component', () => {
  it('should render empty state message when no tool items exist', () => {
    render(<ToolExecutionInspector items={[]} />);
    expect(screen.getByText(/No tool actions recorded yet/)).toBeDefined();
  });

  it('should render tool names and status badges for executed items', () => {
    render(<ToolExecutionInspector items={mockItems} />);

    expect(screen.getByText('draw_shape')).toBeDefined();
    expect(screen.getByText('set_background')).toBeDefined();
    expect(screen.getByText('create_physics_body')).toBeDefined();

    expect(screen.getByTestId('status-completed')).toBeDefined();
    expect(screen.getByTestId('status-rolled_back')).toBeDefined();
    expect(screen.getByTestId('status-failed')).toBeDefined();
  });

  it('should toggle JSON details view when item header is clicked', () => {
    render(<ToolExecutionInspector items={mockItems} />);

    expect(screen.queryByTestId('tool-details-item_1')).toBeNull();

    const trigger = screen.getByText('draw_shape');
    fireEvent.click(trigger);

    const details = screen.getByTestId('tool-details-item_1');
    expect(details).toBeDefined();
    expect(details.textContent).toContain('Arguments Payload');
    expect(details.textContent).toContain('circle');
  });

  it('should trigger onRollbackItem when rollback button is clicked', () => {
    const onRollback = vi.fn();
    render(<ToolExecutionInspector items={mockItems} onRollbackItem={onRollback} />);

    const rollbackBtn = screen.getByTestId('rollback-btn-item_1');
    fireEvent.click(rollbackBtn);

    expect(onRollback).toHaveBeenCalledTimes(1);
    expect(onRollback).toHaveBeenCalledWith('item_1');
  });
});
