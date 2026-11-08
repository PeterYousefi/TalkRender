import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspacePage from '../page';

describe('Workspace Page Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'mock-token', url: 'wss://mock.livekit' }),
    }));
  });

  it('should mount workspace root layout with header, avatar, canvas, and inspector', () => {
    render(<WorkspacePage />);

    expect(screen.getByTestId('workspace-root')).toBeDefined();
    expect(screen.getByTestId('workspace-header')).toBeDefined();
    expect(screen.getByTestId('left-avatar-panel')).toBeDefined();
    expect(screen.getByTestId('center-canvas-panel')).toBeDefined();
    expect(screen.getByTestId('right-inspector-panel')).toBeDefined();
    expect(screen.getByTestId('manual-command-terminal')).toBeDefined();
  });

  it('should switch inspector tabs when tab buttons are clicked', () => {
    render(<WorkspacePage />);

    // Default is Tools
    expect(screen.getByTestId('tool-execution-inspector')).toBeDefined();

    // Switch to Code
    fireEvent.click(screen.getByTestId('tab-code-btn'));
    expect(screen.getByTestId('code-diff-inspector')).toBeDefined();

    // Switch to Telemetry
    fireEvent.click(screen.getByTestId('tab-telemetry-btn'));
    expect(screen.getByTestId('latency-telemetry-hud')).toBeDefined();

    // Switch to Templates
    fireEvent.click(screen.getByTestId('tab-templates-btn'));
    expect(screen.getByTestId('template-selector')).toBeDefined();
  });

  it('should open and close the template selector modal from header button', () => {
    render(<WorkspacePage />);

    expect(screen.queryByTestId('template-modal-overlay')).toBeNull();

    // Click open templates in header
    fireEvent.click(screen.getByTestId('open-templates-btn'));
    expect(screen.getByTestId('template-modal-overlay')).toBeDefined();

    // Click close button
    fireEvent.click(screen.getByTestId('close-template-modal-btn'));
    expect(screen.queryByTestId('template-modal-overlay')).toBeNull();
  });
});
