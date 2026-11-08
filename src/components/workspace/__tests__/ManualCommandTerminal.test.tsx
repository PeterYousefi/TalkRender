import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ManualCommandTerminal } from '../ManualCommandTerminal';

describe('ManualCommandTerminal Component', () => {
  it('should render terminal titlebar, initial greeting, and prompt form', () => {
    const onExecute = vi.fn();
    render(<ManualCommandTerminal onExecuteCommand={onExecute} />);

    expect(screen.getByTestId('manual-command-terminal')).toBeDefined();
    expect(screen.getByText('Command Terminal')).toBeDefined();
    expect(screen.getByTestId('terminal-input')).toBeDefined();
    expect(screen.getByText(/TalkRender Manual Directive Terminal/)).toBeDefined();
  });

  it('should submit user command and invoke onExecuteCommand', async () => {
    const onExecute = vi.fn().mockResolvedValue({ success: true, result: 'Shape spawned' });
    render(<ManualCommandTerminal onExecuteCommand={onExecute} />);

    const input = screen.getByTestId('terminal-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'draw_shape' } });
      fireEvent.submit(screen.getByTestId('manual-command-terminal').querySelector('form')!);
    });

    expect(onExecute).toHaveBeenCalledWith('draw_shape');
  });

  it('should display help text when help command is entered', () => {
    const onExecute = vi.fn();
    render(<ManualCommandTerminal onExecuteCommand={onExecute} />);

    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.submit(screen.getByTestId('manual-command-terminal').querySelector('form')!);

    expect(screen.getByText(/Available Directives:/)).toBeDefined();
    expect(onExecute).not.toHaveBeenCalled();
  });

  it('should clear messages when clear button is clicked', () => {
    const onExecute = vi.fn();
    render(<ManualCommandTerminal onExecuteCommand={onExecute} />);

    const clearBtn = screen.getByTestId('terminal-clear-btn');
    fireEvent.click(clearBtn);

    expect(screen.queryByText(/TalkRender Manual Directive Terminal/)).toBeNull();
  });

  it('should support arrow key history navigation', () => {
    const onExecute = vi.fn();
    render(<ManualCommandTerminal onExecuteCommand={onExecute} />);

    const input = screen.getByTestId('terminal-input') as HTMLInputElement;

    // Send first command
    fireEvent.change(input, { target: { value: 'first_command' } });
    fireEvent.submit(screen.getByTestId('manual-command-terminal').querySelector('form')!);

    // Press ArrowUp
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('first_command');
  });
});
