import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VoiceCanvasOverlay } from '../VoiceCanvasOverlay';

describe('VoiceCanvasOverlay Component', () => {
  it('should render status pill and mic button', () => {
    render(
      <VoiceCanvasOverlay
        isListening={false}
        isSpeaking={false}
        transcript=""
        interimTranscript=""
        onToggleListening={() => {}}
        onTriggerPrompt={() => {}}
      />
    );

    expect(screen.getByTestId('voice-canvas-overlay')).toBeDefined();
    expect(screen.getByTestId('voice-hud-mic-btn')).toBeDefined();
    expect(screen.getByText('Direct Canvas with Voice')).toBeDefined();
  });

  it('should show active listening state when isListening is true', () => {
    render(
      <VoiceCanvasOverlay
        isListening={true}
        isSpeaking={false}
        transcript=""
        interimTranscript=""
        onToggleListening={() => {}}
        onTriggerPrompt={() => {}}
      />
    );

    expect(screen.getByText('Stop Listening')).toBeDefined();
    expect(screen.getByText('Listening...')).toBeDefined();
  });

  it('should display transcript when provided', () => {
    render(
      <VoiceCanvasOverlay
        isListening={true}
        isSpeaking={false}
        transcript="Draw a glowing cyan circle"
        interimTranscript=""
        onToggleListening={() => {}}
        onTriggerPrompt={() => {}}
      />
    );

    expect(screen.getByText('Voice Directive')).toBeDefined();
    expect(screen.getByText(/Draw a glowing cyan circle/)).toBeDefined();
  });

  it('should invoke onTriggerPrompt when quick prompt chip is clicked', () => {
    const handlePrompt = vi.fn();
    render(
      <VoiceCanvasOverlay
        isListening={false}
        isSpeaking={false}
        transcript=""
        interimTranscript=""
        onToggleListening={() => {}}
        onTriggerPrompt={handlePrompt}
      />
    );

    const starBtn = screen.getByTestId('quick-prompt-Vector Star');
    fireEvent.click(starBtn);
    expect(handlePrompt).toHaveBeenCalledWith('Draw a glowing cyan star');
  });
});
