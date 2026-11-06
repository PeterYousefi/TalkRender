'use client';

import React from 'react';
import type { RemoteTrack } from 'livekit-client';
import { AvatarVideoView } from './AvatarVideoView';
import type { AvatarLayoutMode, StandardViseme } from '@/types/avatar';
import { Mic, MicOff, PictureInPicture, PanelLeft, Maximize2, Minimize2 } from 'lucide-react';

export interface AvatarContainerProps {
  layoutMode?: AvatarLayoutMode;
  onLayoutModeChange?: (mode: AvatarLayoutMode) => void;
  track?: RemoteTrack | null;
  isSpeaking?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  frequencyBins?: number[];
  dbfs?: number;
  viseme?: StandardViseme;
  jawOpen?: number;
  avatarName?: string;
  className?: string;
}

export function AvatarContainer({
  layoutMode = 'side-docked',
  onLayoutModeChange,
  track = null,
  isSpeaking = false,
  isMuted = false,
  onToggleMute,
  frequencyBins = [],
  dbfs = -100,
  viseme = 'sil',
  jawOpen = 0,
  avatarName = 'HIGGS CO-PILOT',
  className = '',
}: AvatarContainerProps) {
  if (layoutMode === 'hidden') {
    return null;
  }

  const isPip = layoutMode === 'pip';

  return (
    <div
      data-testid="avatar-container"
      data-layout-mode={layoutMode}
      className={`relative flex flex-col rounded-2xl bg-surface-900/95 backdrop-blur-xl border border-surface-700/80 shadow-2xl transition-all duration-300 ${
        isPip
          ? 'fixed bottom-6 right-6 w-80 h-72 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
          : 'w-full h-full'
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-surface-700/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div
            data-testid="avatar-online-dot"
            className={`w-2 h-2 rounded-full ${
              track
                ? 'bg-neon-emerald shadow-[0_0_8px_#00ff66]'
                : 'bg-neon-cyan shadow-[0_0_8px_#00f3ff]'
            }`}
          />
          <span className="font-semibold text-zinc-200 tracking-wider">
            {avatarName}
          </span>
        </div>

        {/* Layout Mode & Audio Control Actions */}
        <div className="flex items-center gap-1 text-zinc-400">
          <button
            type="button"
            data-testid="avatar-mute-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1 rounded hover:bg-surface-800 hover:text-zinc-200 transition-colors"
          >
            {isMuted ? (
              <MicOff className="w-3.5 h-3.5 text-neon-magenta" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            data-testid="avatar-toggle-pip-btn"
            onClick={() => onLayoutModeChange?.(isPip ? 'side-docked' : 'pip')}
            title={isPip ? 'Dock to Side' : 'Picture-in-Picture'}
            className="p-1 rounded hover:bg-surface-800 hover:text-neon-cyan transition-colors"
          >
            {isPip ? (
              <PanelLeft className="w-3.5 h-3.5" />
            ) : (
              <PictureInPicture className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            data-testid="avatar-toggle-fullscreen-btn"
            onClick={() => onLayoutModeChange?.(layoutMode === 'fullscreen' ? 'side-docked' : 'fullscreen')}
            title="Toggle View Mode"
            className="p-1 rounded hover:bg-surface-800 hover:text-neon-cyan transition-colors"
          >
            {layoutMode === 'fullscreen' ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Avatar Video View Body */}
      <div className="flex-1 w-full h-full p-2 min-h-0">
        <AvatarVideoView
          track={track}
          isSpeaking={isSpeaking}
          frequencyBins={frequencyBins}
          dbfs={dbfs}
          viseme={viseme}
          jawOpen={jawOpen}
          className="w-full h-full border-0 shadow-none bg-surface-950/70"
        />
      </div>
    </div>
  );
}
