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
      className={`relative flex flex-col rounded-2xl bg-zinc-950/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl transition-all duration-300 font-sans ${
        isPip
          ? 'fixed bottom-6 right-6 w-80 h-72 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
          : 'w-full h-full'
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] text-xs">
        <div className="flex items-center gap-2.5">
          <div
            data-testid="avatar-online-dot"
            className={`w-2 h-2 rounded-full transition-colors ${
              track
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
            }`}
          />
          <span className="font-medium tracking-tight text-zinc-200">
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent hover:border-white/[0.06] transition-all"
          >
            {isMuted ? (
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            data-testid="avatar-toggle-pip-btn"
            onClick={() => onLayoutModeChange?.(isPip ? 'side-docked' : 'pip')}
            title={isPip ? 'Dock to Side' : 'Picture-in-Picture'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent hover:border-white/[0.06] transition-all"
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent hover:border-white/[0.06] transition-all"
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
      <div className="flex-1 w-full h-full p-2.5 min-h-0">
        <AvatarVideoView
          track={track}
          isSpeaking={isSpeaking}
          frequencyBins={frequencyBins}
          dbfs={dbfs}
          viseme={viseme}
          jawOpen={jawOpen}
          className="w-full h-full border-0 shadow-none bg-zinc-950/60"
        />
      </div>
    </div>
  );
}
