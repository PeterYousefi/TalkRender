import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkspaceHeader } from '../WorkspaceHeader';

describe('WorkspaceHeader Component', () => {
  it('should render brand title, RTC status, and AI status badges', () => {
    render(
      <WorkspaceHeader
        theme="cyberpunk"
        onThemeChange={vi.fn()}
        isMicMuted={false}
        onToggleMic={vi.fn()}
        liveKitState="connected"
        bosonStatus="listening"
        autoRollback={true}
        onToggleAutoRollback={vi.fn()}
        onOpenTemplates={vi.fn()}
      />
    );

    expect(screen.getByTestId('workspace-header')).toBeDefined();
    expect(screen.getByText('TalkRender')).toBeDefined();
    expect(screen.getByTestId('livekit-status-pill')).toBeDefined();
    expect(screen.getByTestId('boson-status-pill')).toBeDefined();
  });

  it('should trigger onToggleMic when microphone button is clicked', () => {
    const onToggleMic = vi.fn();
    render(
      <WorkspaceHeader
        theme="cyberpunk"
        onThemeChange={vi.fn()}
        isMicMuted={false}
        onToggleMic={onToggleMic}
        autoRollback={true}
        onToggleAutoRollback={vi.fn()}
        onOpenTemplates={vi.fn()}
      />
    );

    const micBtn = screen.getByTestId('header-mic-toggle-btn');
    fireEvent.click(micBtn);

    expect(onToggleMic).toHaveBeenCalledTimes(1);
  });

  it('should trigger onThemeChange when theme buttons are clicked', () => {
    const onThemeChange = vi.fn();
    render(
      <WorkspaceHeader
        theme="cyberpunk"
        onThemeChange={onThemeChange}
        isMicMuted={false}
        onToggleMic={vi.fn()}
        autoRollback={true}
        onToggleAutoRollback={vi.fn()}
        onOpenTemplates={vi.fn()}
      />
    );

    const darkBtn = screen.getByTestId('theme-btn-dark');
    fireEvent.click(darkBtn);

    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('should trigger onOpenTemplates and onEmergencyStop', () => {
    const onOpenTemplates = vi.fn();
    const onEmergencyStop = vi.fn();

    render(
      <WorkspaceHeader
        theme="cyberpunk"
        onThemeChange={vi.fn()}
        isMicMuted={false}
        onToggleMic={vi.fn()}
        autoRollback={true}
        onToggleAutoRollback={vi.fn()}
        onOpenTemplates={onOpenTemplates}
        onEmergencyStop={onEmergencyStop}
      />
    );

    fireEvent.click(screen.getByTestId('open-templates-btn'));
    expect(onOpenTemplates).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('emergency-stop-btn'));
    expect(onEmergencyStop).toHaveBeenCalledTimes(1);
  });
});
