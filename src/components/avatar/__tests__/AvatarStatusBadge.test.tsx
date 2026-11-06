import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AvatarStatusBadge } from '../AvatarStatusBadge';

describe('AvatarStatusBadge Component', () => {
  it('should render default excellent quality badge', () => {
    render(<AvatarStatusBadge quality="excellent" />);
    expect(screen.getByText('HD Live')).toBeDefined();
    expect(screen.getByTestId('quality-dot')).toBeDefined();
  });

  it('should render reconnecting status state correctly', () => {
    render(<AvatarStatusBadge quality="reconnecting" />);
    expect(screen.getByText('Reconnecting')).toBeDefined();
  });

  it('should render offline disconnected status', () => {
    render(<AvatarStatusBadge quality="offline" />);
    expect(screen.getByText('Disconnected')).toBeDefined();
  });

  it('should display latency pill when latency is provided', () => {
    render(<AvatarStatusBadge latencyMs={45} />);
    const pill = screen.getByTestId('latency-pill');
    expect(pill).toBeDefined();
    expect(pill.textContent).toContain('45ms');
    expect(pill.className).toContain('text-emerald-400');
  });

  it('should display talking badge when isSpeaking is true', () => {
    render(<AvatarStatusBadge isSpeaking={true} />);
    expect(screen.getByTestId('speaking-pill')).toBeDefined();
    expect(screen.getByText('TALKING')).toBeDefined();
  });

  it('should display fps pill when fps is provided', () => {
    render(<AvatarStatusBadge fps={60} />);
    const pill = screen.getByTestId('fps-pill');
    expect(pill).toBeDefined();
    expect(pill.textContent).toContain('60fps');
  });
});
