'use client';

import React, { useRef, useEffect } from 'react';
import type { RemoteTrack } from 'livekit-client';
import { VisemeIndicator } from './VisemeIndicator';
import { AudioVisualizer } from './AudioVisualizer';
import type { StandardViseme } from '@/types/avatar';

export interface AvatarVideoViewProps {
  track?: RemoteTrack | null;
  isSpeaking?: boolean;
  frequencyBins?: number[];
  dbfs?: number;
  viseme?: StandardViseme;
  jawOpen?: number;
  mouthWide?: number;
  className?: string;
}

export function AvatarVideoView({
  track = null,
  isSpeaking = false,
  frequencyBins = [],
  dbfs = -100,
  viseme = 'sil',
  jawOpen = 0,
  mouthWide = 0.5,
  className = '',
}: AvatarVideoViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !track) return;

    track.attach(videoEl);

    return () => {
      try {
        track.detach(videoEl);
      } catch {
        // Track already cleaned up
      }
    };
  }, [track]);

  return (
    <div
      data-testid="avatar-video-view"
      className={`relative flex flex-col items-center justify-center w-full h-full overflow-hidden rounded-xl bg-zinc-950/70 border border-white/[0.06] shadow-xl ${className}`}
    >
      {track ? (
        /* WebRTC Avatar Live Stream */
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            data-testid="avatar-webrtc-video"
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Subtle audio reactivity overlay ring around live video */}
          {isSpeaking && (
            <div className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)_inset] animate-pulse" />
          )}
        </div>
      ) : (
        /* Fallback Viseme & Synthetic Mesh Mode */
        <div
          data-testid="avatar-fallback-container"
          className="flex flex-col items-center justify-center gap-3 w-full h-full p-4"
        >
          <VisemeIndicator
            viseme={viseme}
            jawOpen={jawOpen}
            mouthWide={mouthWide}
            isSpeaking={isSpeaking}
          />
          <AudioVisualizer
            isSpeaking={isSpeaking}
            dbfs={dbfs}
            frequencyBins={frequencyBins}
            className="w-full max-w-[200px]"
          />
        </div>
      )}
    </div>
  );
}
