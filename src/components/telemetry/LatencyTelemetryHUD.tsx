'use client';

import React, { useState } from 'react';
import { Activity, Cpu, Wifi, Clock, Zap, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import type { LatencyTelemetry } from '@/types/telemetry';

export interface LatencyTelemetryHUDProps {
  telemetry: LatencyTelemetry;
  interruptionCount?: number;
  isInterrupted?: boolean;
  className?: string;
  defaultExpanded?: boolean;
}

export const LatencyTelemetryHUD: React.FC<LatencyTelemetryHUDProps> = ({
  telemetry,
  interruptionCount = 0,
  isInterrupted = false,
  className = '',
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const getLatencyColor = (ms: number) => {
    if (ms <= 60) return 'text-emerald-400';
    if (ms <= 140) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-cyan-400';
    if (fps >= 30) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div
      data-testid="latency-telemetry-hud"
      className={`rounded-xl border border-slate-800 bg-slate-950/85 p-2 font-mono text-xs text-slate-200 backdrop-blur-md shadow-2xl transition-all ${className}`}
    >
      {/* Top Header Row / Collapsed Summary */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" title="Server Ping">
            <Wifi className={`h-3.5 w-3.5 ${getLatencyColor(telemetry.pingMs)}`} />
            <span data-testid="ping-metric" className={`font-semibold ${getLatencyColor(telemetry.pingMs)}`}>
              {telemetry.pingMs}ms
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="WebRTC Audio RTT">
            <Clock className={`h-3.5 w-3.5 ${getLatencyColor(telemetry.audioRttMs)}`} />
            <span data-testid="audio-rtt-metric" className="text-slate-300">
              {telemetry.audioRttMs}ms <span className="text-[10px] text-slate-500">RTT</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Canvas Frame Rate">
            <Activity className={`h-3.5 w-3.5 ${getFpsColor(telemetry.fps)}`} />
            <span data-testid="fps-metric" className={`font-semibold ${getFpsColor(telemetry.fps)}`}>
              {telemetry.fps} FPS
            </span>
          </div>

          {isInterrupted && (
            <div
              data-testid="barge-in-active-badge"
              className="flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 ring-1 ring-rose-500 animate-pulse"
            >
              <Zap className="h-3 w-3" />
              <span>BARGE-IN</span>
            </div>
          )}
        </div>

        <button
          type="button"
          data-testid="toggle-expand-btn"
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={expanded ? 'Collapse HUD' : 'Expand detailed telemetry'}
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded Metrics Panel */}
      {expanded && (
        <div
          data-testid="expanded-telemetry-details"
          className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2.5 sm:grid-cols-4"
        >
          {/* Frame Render Time */}
          <div className="flex flex-col rounded bg-slate-900/60 p-2 border border-slate-800/50">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Cpu className="h-3 w-3 text-cyan-400" /> Render Latency
            </span>
            <span data-testid="render-time-metric" className="text-sm font-semibold text-slate-200 mt-0.5">
              {telemetry.frameRenderTimeMs.toFixed(1)}ms
            </span>
          </div>

          {/* Network Jitter */}
          <div className="flex flex-col rounded bg-slate-900/60 p-2 border border-slate-800/50">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Activity className="h-3 w-3 text-emerald-400" /> Jitter
            </span>
            <span data-testid="jitter-metric" className="text-sm font-semibold text-slate-200 mt-0.5">
              {telemetry.jitterMs.toFixed(1)}ms
            </span>
          </div>

          {/* Packet Loss */}
          <div className="flex flex-col rounded bg-slate-900/60 p-2 border border-slate-800/50">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <ShieldAlert className="h-3 w-3 text-amber-400" /> Packet Loss
            </span>
            <span data-testid="packet-loss-metric" className="text-sm font-semibold text-slate-200 mt-0.5">
              {telemetry.packetLossPercent}%
            </span>
          </div>

          {/* Interruption Count */}
          <div className="flex flex-col rounded bg-slate-900/60 p-2 border border-slate-800/50">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
              <Zap className="h-3 w-3 text-violet-400" /> Interruptions
            </span>
            <span data-testid="interruption-count-metric" className="text-sm font-semibold text-slate-200 mt-0.5">
              {interruptionCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
