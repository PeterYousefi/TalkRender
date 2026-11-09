'use client';

import React from 'react';
import { Trash2, Undo2, Camera, Grid, Activity } from 'lucide-react';

export interface CanvasToolbarProps {
  onClear?: () => void;
  onRollback?: () => void;
  onSnapshot?: () => void;
  onToggleGrid?: () => void;
  fps?: number;
  latencyMs?: number;
  elementsCount?: number;
  disabled?: boolean;
  className?: string;
}

export function CanvasToolbar({
  onClear,
  onRollback,
  onSnapshot,
  onToggleGrid,
  fps = 60,
  latencyMs = 0,
  elementsCount = 0,
  disabled = false,
  className = '',
}: CanvasToolbarProps) {
  return (
    <div
      data-testid="canvas-toolbar"
      className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl text-zinc-300 font-sans ${className}`}
    >
      {/* Telemetry Indicator */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/[0.08] text-[11px] font-mono text-zinc-400">
        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-zinc-300">{fps} FPS</span>
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-300">{latencyMs}ms</span>
        {elementsCount > 0 && (
          <>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400">{elementsCount} objs</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          data-testid="toolbar-rollback-btn"
          onClick={onRollback}
          disabled={disabled}
          title="Rollback Last Voice Command"
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 active:scale-95 disabled:opacity-30 transition-all"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          data-testid="toolbar-grid-btn"
          onClick={onToggleGrid}
          disabled={disabled}
          title="Toggle Canvas Grid"
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 active:scale-95 disabled:opacity-30 transition-all"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          data-testid="toolbar-snapshot-btn"
          onClick={onSnapshot}
          disabled={disabled}
          title="Capture Canvas Snapshot"
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 active:scale-95 disabled:opacity-30 transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          data-testid="toolbar-clear-btn"
          onClick={onClear}
          disabled={disabled}
          title="Clear Canvas Elements"
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 active:scale-95 disabled:opacity-30 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
