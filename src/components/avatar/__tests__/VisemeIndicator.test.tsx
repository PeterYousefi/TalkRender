import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisemeIndicator } from '../VisemeIndicator';

describe('VisemeIndicator Component', () => {
  it('should render silent closed mouth by default', () => {
    render(<VisemeIndicator viseme="sil" jawOpen={0} isSpeaking={false} />);

    expect(screen.getByTestId('viseme-indicator')).toBeDefined();
    expect(screen.getByText('SIL')).toBeDefined();

    const mouthGroup = screen.getByTestId('avatar-mouth');
    const line = mouthGroup.querySelector('line');
    expect(line).not.toBeNull();
  });

  it('should render open mouth ellipse during active speech visemes', () => {
    render(<VisemeIndicator viseme="aa" jawOpen={0.8} mouthWide={0.9} isSpeaking={true} />);

    expect(screen.getByText('AA')).toBeDefined();
    const mouthGroup = screen.getByTestId('avatar-mouth');
    const ellipse = mouthGroup.querySelector('ellipse');
    expect(ellipse).not.toBeNull();
  });

  it('should highlight viseme label when speaking is active', () => {
    render(<VisemeIndicator viseme="SS" isSpeaking={true} />);

    const label = screen.getByTestId('viseme-label');
    expect(label.className).toContain('text-neon-magenta');
    expect(label.textContent).toBe('SS');
  });
});
