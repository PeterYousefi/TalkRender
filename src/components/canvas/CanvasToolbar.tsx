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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/90 backdrop-blur-md border border-surface-600/60 shadow-lg text-zinc-300 ${className}`}
    >
      {/* Telemetry Indicator */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-surface-600/50 text-xs font-mono">
        <Activity className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
        <span className="text-zinc-400">{fps} FPS</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400">{latencyMs}ms</span>
        {elementsCount > 0 && (
          <>
            <span className="text-zinc-600">|</span>
            <span className="text-neon-emerald">{elementsCount} objs</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <button
        type="button"
        data-testid="toolbar-rollback-btn"
        onClick={onRollback}
        disabled={disabled}
        title="Rollback Last Voice Command"
        className="p-1.5 rounded hover:bg-surface-700 active:scale-95 disabled:opacity-40 transition-all text-zinc-300 hover:text-neon-cyan"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        data-testid="toolbar-grid-btn"
        onClick={onToggleGrid}
        disabled={disabled}
        title="Toggle Cyberpunk Mesh Grid"
        className="p-1.5 rounded hover:bg-surface-700 active:scale-95 disabled:opacity-40 transition-all text-zinc-300 hover:text-neon-cyan"
      >
        <Grid className="w-4 h-4" />
      </button>

      <button
        type="button"
        data-testid="toolbar-snapshot-btn"
        onClick={onSnapshot}
        disabled={disabled}
        title="Capture Canvas Snapshot"
        className="p-1.5 rounded hover:bg-surface-700 active:scale-95 disabled:opacity-40 transition-all text-zinc-300 hover:text-neon-cyan"
      >
        <Camera className="w-4 h-4" />
      </button>

      <button
        type="button"
        data-testid="toolbar-clear-btn"
        onClick={onClear}
        disabled={disabled}
        title="Clear Canvas Elements"
        className="p-1.5 rounded hover:bg-surface-700 active:scale-95 disabled:opacity-40 transition-all text-zinc-300 hover:text-neon-magenta"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
