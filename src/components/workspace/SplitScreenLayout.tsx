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
      className={`relative flex h-full w-full flex-1 overflow-hidden bg-zinc-950 font-sans ${className}`}
    >
      {/* Left Avatar Co-Pilot Panel */}
      {panels.avatarPanel ? (
        <aside
          data-testid="left-avatar-panel"
          className="relative flex w-80 shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/80 p-3.5 overflow-y-auto backdrop-blur-xl"
        >
          <div className="absolute right-3 top-3 z-10">
            <button
              type="button"
              data-testid="collapse-left-panel-btn"
              onClick={() => togglePanel('avatarPanel')}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/80 hover:text-white transition-all"
              title="Collapse Co-Pilot Panel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          {leftPanel}
        </aside>
      ) : (
        <div className="flex h-full w-10 shrink-0 flex-col items-center border-r border-white/[0.06] bg-zinc-950/90 py-3 backdrop-blur-xl">
          <button
            type="button"
            data-testid="expand-left-panel-btn"
            onClick={() => togglePanel('avatarPanel')}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/80 hover:text-cyan-400 transition-all"
            title="Expand Co-Pilot Panel"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <span className="mt-8 -rotate-90 whitespace-nowrap text-[10px] font-semibold tracking-widest text-zinc-500 uppercase font-mono">
            CO-PILOT
          </span>
        </div>
      )}

      {/* Center Interactive Canvas Panel */}
      <main
        data-testid="center-canvas-panel"
        className="relative flex flex-1 flex-col overflow-hidden bg-zinc-900/10"
      >
        <div className="relative flex-1 overflow-hidden flex flex-col">
          {centerPanel}
        </div>

        {/* Bottom Terminal Drawer */}
        {terminalPanel && (
          <div className="border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-950/70 border-b border-white/[0.04]">
              <span className="text-[10px] font-mono font-medium tracking-wider text-zinc-400 uppercase">
                Terminal Output
              </span>
              <button
                type="button"
                data-testid="toggle-terminal-drawer-btn"
                onClick={() => togglePanel('terminalPanel')}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
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
          className="relative flex w-96 shrink-0 flex-col border-l border-white/[0.06] bg-zinc-950/80 p-3.5 overflow-y-auto backdrop-blur-xl"
        >
          <div className="absolute left-3 top-3 z-10">
            <button
              type="button"
              data-testid="collapse-right-panel-btn"
              onClick={() => togglePanel('inspectorPanel')}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/80 hover:text-white transition-all"
              title="Collapse Inspector Panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
          {rightPanel}
        </aside>
      ) : (
        <div className="flex h-full w-10 shrink-0 flex-col items-center border-l border-white/[0.06] bg-zinc-950/90 py-3 backdrop-blur-xl">
          <button
            type="button"
            data-testid="expand-right-panel-btn"
            onClick={() => togglePanel('inspectorPanel')}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/80 hover:text-cyan-400 transition-all"
            title="Expand Inspector Panel"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
          <span className="mt-8 -rotate-90 whitespace-nowrap text-[10px] font-semibold tracking-widest text-zinc-500 uppercase font-mono">
            INSPECTOR
          </span>
        </div>
      )}
    </div>
  );
};
