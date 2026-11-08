import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplitScreenLayout } from '../SplitScreenLayout';

describe('SplitScreenLayout Component', () => {
  it('should render all three panels and terminal drawer by default', () => {
    render(
      <SplitScreenLayout
        leftPanel={<div data-testid="test-avatar">Avatar View</div>}
        centerPanel={<div data-testid="test-canvas">Canvas Sandbox</div>}
        terminalPanel={<div data-testid="test-terminal">Terminal</div>}
        rightPanel={<div data-testid="test-inspector">Inspector View</div>}
      />
    );

    expect(screen.getByTestId('split-screen-layout')).toBeDefined();
    expect(screen.getByTestId('left-avatar-panel')).toBeDefined();
    expect(screen.getByTestId('center-canvas-panel')).toBeDefined();
    expect(screen.getByTestId('right-inspector-panel')).toBeDefined();
    expect(screen.getByTestId('terminal-drawer-content')).toBeDefined();
  });

  it('should collapse and re-expand left co-pilot panel', () => {
    const onVisibilityChange = vi.fn();
    render(
      <SplitScreenLayout
        leftPanel={<div>Avatar</div>}
        centerPanel={<div>Canvas</div>}
        rightPanel={<div>Inspector</div>}
        onPanelVisibilityChange={onVisibilityChange}
      />
    );

    // Click collapse left panel button
    const collapseBtn = screen.getByTestId('collapse-left-panel-btn');
    fireEvent.click(collapseBtn);

    expect(screen.queryByTestId('left-avatar-panel')).toBeNull();
    expect(screen.getByTestId('expand-left-panel-btn')).toBeDefined();
    expect(onVisibilityChange).toHaveBeenCalledWith(
      expect.objectContaining({ avatarPanel: false })
    );

    // Click expand left panel button
    fireEvent.click(screen.getByTestId('expand-left-panel-btn'));
    expect(screen.getByTestId('left-avatar-panel')).toBeDefined();
  });

  it('should collapse and re-expand right inspector panel', () => {
    render(
      <SplitScreenLayout
        leftPanel={<div>Avatar</div>}
        centerPanel={<div>Canvas</div>}
        rightPanel={<div>Inspector</div>}
      />
    );

    const collapseRight = screen.getByTestId('collapse-right-panel-btn');
    fireEvent.click(collapseRight);

    expect(screen.queryByTestId('right-inspector-panel')).toBeNull();
    expect(screen.getByTestId('expand-right-panel-btn')).toBeDefined();

    fireEvent.click(screen.getByTestId('expand-right-panel-btn'));
    expect(screen.getByTestId('right-inspector-panel')).toBeDefined();
  });

  it('should toggle terminal drawer content visibility', () => {
    render(
      <SplitScreenLayout
        leftPanel={<div>Avatar</div>}
        centerPanel={<div>Canvas</div>}
        terminalPanel={<div>Terminal Content</div>}
        rightPanel={<div>Inspector</div>}
      />
    );

    expect(screen.getByTestId('terminal-drawer-content')).toBeDefined();

    const toggleTerminalBtn = screen.getByTestId('toggle-terminal-drawer-btn');
    fireEvent.click(toggleTerminalBtn);

    expect(screen.queryByTestId('terminal-drawer-content')).toBeNull();
  });
});
