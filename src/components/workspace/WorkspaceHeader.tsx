'use client';

import React from 'react';
import { Mic, MicOff, Palette, Layers, Radio, Square, RotateCcw, LayoutTemplate } from 'lucide-react';
import type { WorkspaceTheme } from '@/types/workspace';
import type { BosonSessionStatus } from '@/types/boson';
import type { LiveKitConnectionStatus } from '@/types/livekit';

export interface WorkspaceHeaderProps {
  theme: WorkspaceTheme;
  onThemeChange: (theme: WorkspaceTheme) => void;
  isMicMuted: boolean;
  onToggleMic: () => void;
  liveKitState?: LiveKitConnectionStatus;
  bosonStatus?: BosonSessionStatus;
  autoRollback: boolean;
  onToggleAutoRollback: () => void;
  onOpenTemplates: () => void;
  onEmergencyStop?: () => void;
  viewMode?: 'studio' | 'inspector';
  onToggleViewMode?: () => void;
  className?: string;
}

const THEMES: { id: WorkspaceTheme; label: string }[] = [
  { id: 'cyberpunk', label: 'Obsidian' },
  { id: 'dark', label: 'Dark' },
  { id: 'slate', label: 'Slate' },
];

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  theme,
  onThemeChange,
  isMicMuted,
  onToggleMic,
  liveKitState = 'connected',
  bosonStatus = 'idle',
  autoRollback,
  onToggleAutoRollback,
  onOpenTemplates,
  onEmergencyStop,
  viewMode = 'studio',
  onToggleViewMode,
  className = '',
}) => {
  return (
    <header
      data-testid="workspace-header"
      className={`flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/85 px-4 py-2.5 font-sans text-xs text-zinc-200 backdrop-blur-xl shadow-lg ${className}`}
    >
      {/* Brand & Connection State */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-sm font-semibold tracking-tight text-white">
            TalkRender
          </span>
          <span className="rounded-full bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-400 hidden sm:inline-block">
            Voice Canvas
          </span>
        </div>

        {/* Quiet Live Status Badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px]">
          <span
            data-testid="livekit-status-pill"
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
              liveKitState === 'connected'
                ? 'bg-zinc-900/90 text-zinc-300 border border-white/[0.08]'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                liveKitState === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            RTC: {liveKitState}
          </span>

          <span
            data-testid="boson-status-pill"
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
              bosonStatus === 'connected' || bosonStatus === 'speaking' || bosonStatus === 'listening'
                ? 'bg-zinc-900/90 text-zinc-300 border border-white/[0.08]'
                : bosonStatus === 'interrupted'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 animate-pulse'
                : 'bg-zinc-900/60 text-zinc-400 border border-white/[0.06]'
            }`}
          >
            <Radio className="h-3 w-3 text-cyan-400" />
            AI: {bosonStatus}
          </span>
        </div>
      </div>

      {/* Action Controls & Toggles */}
      <div className="flex items-center gap-2">
        {/* Studio / Inspector Segmented Toggle */}
        {onToggleViewMode && (
          <button
            type="button"
            data-testid="toggle-view-mode-btn"
            onClick={onToggleViewMode}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
              viewMode === 'studio'
                ? 'bg-zinc-800 text-white border-white/[0.16] shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 border-white/[0.06] hover:text-zinc-200'
            }`}
            title="Switch between Canvas Studio and Developer Inspector"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {viewMode === 'studio' ? 'Studio Mode' : 'Inspector'}
            </span>
          </button>
        )}

        {/* Template Library Button */}
        <button
          type="button"
          data-testid="open-templates-btn"
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/[0.08] transition-all"
          title="Browse interactive scene templates"
        >
          <Layers className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Optimistic Rollback Toggle */}
        <button
          type="button"
          data-testid="toggle-rollback-btn"
          onClick={onToggleAutoRollback}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
            autoRollback
              ? 'bg-zinc-900 text-zinc-200 border-white/[0.12]'
              : 'bg-zinc-900/50 text-zinc-500 border-white/[0.06] hover:text-zinc-300'
          }`}
          title="Auto-rollback last tool call if interrupted"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden md:inline">Auto-Rollback</span>
        </button>

        {/* Microphone Mute Button */}
        <button
          type="button"
          data-testid="header-mic-toggle-btn"
          onClick={onToggleMic}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isMicMuted
              ? 'bg-zinc-900 text-zinc-400 border border-white/[0.08] hover:text-zinc-200'
              : 'bg-zinc-900 text-zinc-100 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
          }`}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? (
            <MicOff className="h-3.5 w-3.5 text-rose-400" />
          ) : (
            <Mic className="h-3.5 w-3.5 text-emerald-400" />
          )}
          <span>{isMicMuted ? 'Muted' : 'Mic Active'}</span>
        </button>

        {/* Emergency Stop Button */}
        {onEmergencyStop && (
          <button
            type="button"
            data-testid="emergency-stop-btn"
            onClick={onEmergencyStop}
            className="flex items-center gap-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 px-2.5 py-1.5 text-xs font-medium text-rose-200 border border-rose-800/60 transition-all shadow-sm"
            title="Emergency halt AI generation & flush buffers"
          >
            <Square className="h-3 w-3 fill-rose-300 text-rose-300" />
            <span className="hidden lg:inline">Stop</span>
          </button>
        )}

        {/* Theme Selector */}
        <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-2.5">
          <Palette className="h-3.5 w-3.5 text-zinc-500" />
          <div className="flex rounded-lg bg-zinc-900/90 p-0.5 border border-white/[0.06]">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`theme-btn-${t.id}`}
                onClick={() => onThemeChange(t.id)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                  theme === t.id
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
