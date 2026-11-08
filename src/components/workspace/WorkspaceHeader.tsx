'use client';

import React from 'react';
import { Mic, MicOff, Palette, Layers, Radio, Square, RotateCcw } from 'lucide-react';
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
  className?: string;
}

const THEMES: { id: WorkspaceTheme; label: string }[] = [
  { id: 'cyberpunk', label: 'Cyberpunk' },
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
  className = '',
}) => {
  return (
    <header
      data-testid="workspace-header"
      className={`flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-2.5 font-mono text-xs text-slate-200 backdrop-blur-md shadow-md ${className}`}
    >
      {/* Brand & Connection State */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
          <span className="text-sm font-black tracking-wider text-slate-100 uppercase">
            TalkRender
          </span>
          <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-800/60 hidden sm:inline-block">
            BOSON + LIVEKIT
          </span>
        </div>

        {/* Live Status Indicators */}
        <div className="hidden md:flex items-center gap-2 text-[10px]">
          <span
            data-testid="livekit-status-pill"
            className={`rounded px-1.5 py-0.5 font-bold uppercase ${
              liveKitState === 'connected'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
            }`}
          >
            RTC: {liveKitState}
          </span>

          <span
            data-testid="boson-status-pill"
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-bold uppercase ${
              bosonStatus === 'connected' || bosonStatus === 'speaking' || bosonStatus === 'listening'
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                : bosonStatus === 'interrupted'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 animate-pulse'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Radio className="h-2.5 w-2.5" />
            AI: {bosonStatus}
          </span>
        </div>
      </div>

      {/* Action Controls & Toggles */}
      <div className="flex items-center gap-2">
        {/* Template Library Button */}
        <button
          type="button"
          data-testid="open-templates-btn"
          onClick={onOpenTemplates}
          className="flex items-center gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-300 border border-slate-800 transition-colors"
          title="Browse interactive scene templates"
        >
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Optimistic Rollback Toggle */}
        <button
          type="button"
          data-testid="toggle-rollback-btn"
          onClick={onToggleAutoRollback}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs border transition-colors ${
            autoRollback
              ? 'bg-violet-950/60 text-violet-300 border-violet-800/60'
              : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
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
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            isMicMuted
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
          }`}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          <span>{isMicMuted ? 'Muted' : 'Mic On'}</span>
        </button>

        {/* Emergency Stop / Barge-in manual trigger */}
        {onEmergencyStop && (
          <button
            type="button"
            data-testid="emergency-stop-btn"
            onClick={onEmergencyStop}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-md"
            title="Emergency halt AI generation & flush buffers"
          >
            <Square className="h-3 w-3 fill-white" />
            <span className="hidden lg:inline">Stop</span>
          </button>
        )}

        {/* Theme Selector */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <Palette className="h-3.5 w-3.5 text-slate-500" />
          <div className="flex rounded-md bg-slate-900/90 p-0.5 border border-slate-800">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`theme-btn-${t.id}`}
                onClick={() => onThemeChange(t.id)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                  theme === t.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
