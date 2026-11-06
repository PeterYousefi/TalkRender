import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarVideoView } from '../AvatarVideoView';
import type { RemoteTrack } from 'livekit-client';

describe('AvatarVideoView Component', () => {
  it('should render viseme fallback when track is null', () => {
    render(<AvatarVideoView track={null} isSpeaking={false} />);

    expect(screen.getByTestId('avatar-video-view')).toBeDefined();
    expect(screen.getByTestId('avatar-fallback-container')).toBeDefined();
    expect(screen.getByTestId('viseme-indicator')).toBeDefined();
    expect(screen.getByTestId('audio-visualizer')).toBeDefined();
  });

  it('should attach video element when LiveKit RemoteTrack is provided', () => {
    const attachMock = vi.fn();
    const detachMock = vi.fn();

    const mockTrack = {
      attach: attachMock,
      detach: detachMock,
    } as unknown as RemoteTrack;

    const { unmount } = render(
      <AvatarVideoView track={mockTrack} isSpeaking={true} />
    );

    const videoEl = screen.getByTestId('avatar-webrtc-video');
    expect(videoEl).toBeDefined();
    expect(attachMock).toHaveBeenCalledWith(videoEl);

    unmount();
    expect(detachMock).toHaveBeenCalledWith(videoEl);
  });
});
