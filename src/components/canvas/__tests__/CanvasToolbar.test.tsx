import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasToolbar } from '../CanvasToolbar';

describe('CanvasToolbar Component', () => {
  it('should render telemetry information correctly', () => {
    render(
      <CanvasToolbar fps={58} latencyMs={14} elementsCount={7} />
    );

    expect(screen.getByText(/58 FPS/i)).toBeDefined();
    expect(screen.getByText(/14ms/i)).toBeDefined();
    expect(screen.getByText(/7 objs/i)).toBeDefined();
  });

  it('should trigger action callbacks on button clicks', () => {
    const onRollback = vi.fn();
    const onClear = vi.fn();
    const onSnapshot = vi.fn();
    const onToggleGrid = vi.fn();

    render(
      <CanvasToolbar
        onRollback={onRollback}
        onClear={onClear}
        onSnapshot={onSnapshot}
        onToggleGrid={onToggleGrid}
      />
    );

    fireEvent.click(screen.getByTestId('toolbar-rollback-btn'));
    expect(onRollback).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('toolbar-clear-btn'));
    expect(onClear).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('toolbar-snapshot-btn'));
    expect(onSnapshot).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('toolbar-grid-btn'));
    expect(onToggleGrid).toHaveBeenCalledTimes(1);
  });

  it('should disable action buttons when disabled prop is true', () => {
    const onClear = vi.fn();
    render(<CanvasToolbar disabled={true} onClear={onClear} />);

    const clearBtn = screen.getByTestId('toolbar-clear-btn');
    expect(clearBtn.hasAttribute('disabled')).toBe(true);

    fireEvent.click(clearBtn);
    expect(onClear).not.toHaveBeenCalled();
  });
});
