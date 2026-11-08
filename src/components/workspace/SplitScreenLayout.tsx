'use client';

import React, { useState } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { WorkspacePanelVisibility } from '@/types/workspace';

export interface SplitScreenLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  terminalPanel?: React.ReactNode;
  rightPanel: React.ReactNode;
  initialPanels?: Partial<WorkspacePanelVisibility>;
  onPanelVisibilityChange?: (panels: WorkspacePanelVisibility) => void;
  className?: string;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  leftPanel,
  centerPanel,
  terminalPanel,
  rightPanel,
  initialPanels,
  onPanelVisibilityChange,
  className = '',
}) => {
  const [panels, setPanels] = useState<WorkspacePanelVisibility>({
    avatarPanel: initialPanels?.avatarPanel ?? true,
    canvasPanel: initialPanels?.canvasPanel ?? true,
    inspectorPanel: initialPanels?.inspectorPanel ?? true,
    terminalPanel: initialPanels?.terminalPanel ?? true,
  });

  const togglePanel = (key: keyof WorkspacePanelVisibility) => {
    setPanels((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      onPanelVisibilityChange?.(next);
      return next;
    });
  };

  return (
    <div
      data-testid="split-screen-layout"
      className={`relative flex h-full w-full flex-1 overflow-hidden bg-slate-950 ${className}`}
    >
      {/* Left Avatar Co-Pilot Panel */}
      {panels.avatarPanel ? (
        <aside
          data-testid="left-avatar-panel"
          className="relative flex w-80 shrink-0 flex-col border-r border-slate-800 bg-slate-950/80 p-3 overflow-y-auto"
        >
          <div className="absolute right-2 top-2 z-10">
            <button
              type="button"
              data-testid="collapse-left-panel-btn"
              onClick={() => togglePanel('avatarPanel')}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Collapse Co-Pilot Panel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          {leftPanel}
        </aside>
      ) : (
        <div className="flex h-full w-10 shrink-0 flex-col items-center border-r border-slate-800 bg-slate-950 py-3">
          <button
            type="button"
            data-testid="expand-left-panel-btn"
            onClick={() => togglePanel('avatarPanel')}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
            title="Expand Co-Pilot Panel"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <span className="mt-8 -rotate-90 whitespace-nowrap text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">
            CO-PILOT
          </span>
        </div>
      )}

      {/* Center Interactive Canvas Panel */}
      <main
        data-testid="center-canvas-panel"
        className="relative flex flex-1 flex-col overflow-hidden bg-slate-900/40"
      >
        <div className="relative flex-1 overflow-hidden flex flex-col">
          {centerPanel}
        </div>

        {/* Bottom Terminal Drawer */}
        {terminalPanel && (
          <div className="border-t border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between px-3 py-1 bg-slate-900/60 border-b border-slate-800/60">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Terminal Drawer
              </span>
              <button
                type="button"
                data-testid="toggle-terminal-drawer-btn"
                onClick={() => togglePanel('terminalPanel')}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {panels.terminalPanel ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {panels.terminalPanel && (
              <div data-testid="terminal-drawer-content" className="p-2">
                {terminalPanel}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Inspector & Telemetry Panel */}
      {panels.inspectorPanel ? (
        <aside
          data-testid="right-inspector-panel"
          className="relative flex w-96 shrink-0 flex-col border-l border-slate-800 bg-slate-950/80 p-3 overflow-y-auto"
        >
          <div className="absolute left-2 top-2 z-10">
            <button
              type="button"
              data-testid="collapse-right-panel-btn"
              onClick={() => togglePanel('inspectorPanel')}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Collapse Inspector Panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
          {rightPanel}
        </aside>
      ) : (
        <div className="flex h-full w-10 shrink-0 flex-col items-center border-l border-slate-800 bg-slate-950 py-3">
          <button
            type="button"
            data-testid="expand-right-panel-btn"
            onClick={() => togglePanel('inspectorPanel')}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
            title="Expand Inspector Panel"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
          <span className="mt-8 -rotate-90 whitespace-nowrap text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">
            INSPECTOR
          </span>
        </div>
      )}
    </div>
  );
};
