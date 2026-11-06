import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarContainer } from '../AvatarContainer';

describe('AvatarContainer Component', () => {
  it('should render avatar container with custom name and docked layout', () => {
    render(<AvatarContainer avatarName="CYBER COPILOT" layoutMode="side-docked" />);

    const container = screen.getByTestId('avatar-container');
    expect(container).toBeDefined();
    expect(container.getAttribute('data-layout-mode')).toBe('side-docked');
    expect(screen.getByText('CYBER COPILOT')).toBeDefined();
  });

  it('should render null when layoutMode is hidden', () => {
    const { container } = render(<AvatarContainer layoutMode="hidden" />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply floating pip styling when layoutMode is pip', () => {
    render(<AvatarContainer layoutMode="pip" />);

    const container = screen.getByTestId('avatar-container');
    expect(container.className).toContain('fixed');
    expect(container.className).toContain('bottom-6');
    expect(container.className).toContain('right-6');
  });

  it('should toggle layout mode when pip button is clicked', () => {
    const onLayoutChange = vi.fn();
    render(<AvatarContainer layoutMode="side-docked" onLayoutModeChange={onLayoutChange} />);

    fireEvent.click(screen.getByTestId('avatar-toggle-pip-btn'));
    expect(onLayoutChange).toHaveBeenCalledWith('pip');
  });

  it('should trigger onToggleMute callback when mute button is clicked', () => {
    const onToggleMute = vi.fn();
    render(<AvatarContainer isMuted={false} onToggleMute={onToggleMute} />);

    fireEvent.click(screen.getByTestId('avatar-mute-btn'));
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });
});
