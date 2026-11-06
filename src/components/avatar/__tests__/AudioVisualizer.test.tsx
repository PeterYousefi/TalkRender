import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioVisualizer } from '../AudioVisualizer';

describe('AudioVisualizer Component', () => {
  it('should render 16 visualizer bars by default', () => {
    render(<AudioVisualizer />);

    const container = screen.getByTestId('audio-visualizer');
    expect(container).toBeDefined();

    for (let i = 0; i < 16; i++) {
      expect(screen.getByTestId(`visualizer-bar-${i}`)).toBeDefined();
    }
  });

  it('should display standby state and -INF decibels when silent', () => {
    render(<AudioVisualizer isSpeaking={false} dbfs={-100} />);

    expect(screen.getByText('STANDBY')).toBeDefined();
    expect(screen.getByText('-INF')).toBeDefined();
  });

  it('should display voice detected state and formatted decibels when active', () => {
    const bins = [0.8, 0.7, 0.5, 0.4, 0.9];
    render(<AudioVisualizer isSpeaking={true} dbfs={-18.4} frequencyBins={bins} />);

    expect(screen.getByText('VOICE DETECTED')).toBeDefined();
    expect(screen.getByText('-18 dB')).toBeDefined();

    const highBar = screen.getByTestId('visualizer-bar-0');
    expect(highBar.className).toContain('bg-neon-magenta');
  });
});
