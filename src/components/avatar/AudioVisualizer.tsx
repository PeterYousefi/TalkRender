'use client';

import React from 'react';

export interface AudioVisualizerProps {
  frequencyBins?: number[];
  isSpeaking?: boolean;
  dbfs?: number;
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({
  frequencyBins = [],
  isSpeaking = false,
  dbfs = -100,
  barCount = 16,
  className = '',
}: AudioVisualizerProps) {
  // Ensure we always have `barCount` items to render
  const bars = React.useMemo(() => {
    if (frequencyBins.length >= barCount) {
      return frequencyBins.slice(0, barCount);
    }
    const filled = [...frequencyBins];
    while (filled.length < barCount) {
      filled.push(0);
    }
    return filled;
  }, [frequencyBins, barCount]);

  return (
    <div
      data-testid="audio-visualizer"
      className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-950/70 backdrop-blur-xl border border-white/[0.06] shadow-lg ${className}`}
    >
      {/* Bars container */}
      <div className="flex items-end justify-center gap-1.5 h-10 w-full px-2">
        {bars.map((val, idx) => {
          const heightPercent = Math.max(10, Math.min(100, Math.round(val * 100)));
          const isHigh = val > 0.6;
          return (
            <div
              key={idx}
              data-testid={`visualizer-bar-${idx}`}
              style={{ height: `${heightPercent}%` }}
              className={`w-1 rounded-full transition-all duration-75 ${
                isSpeaking
                  ? isHigh
                    ? 'bg-neon-magenta shadow-[0_0_8px_#ff007f]'
                    : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]'
                  : 'bg-zinc-800'
              }`}
            />
          );
        })}
      </div>

      {/* Meter readout */}
      <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div
            data-testid="speaking-indicator"
            className={`w-1.5 h-1.5 rounded-full ${
              isSpeaking
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse'
                : 'bg-zinc-700'
            }`}
          />
          <span className="tracking-wider">{isSpeaking ? 'VOICE DETECTED' : 'STANDBY'}</span>
        </div>
        <span data-testid="dbfs-readout" className="text-zinc-500 font-mono">
          {dbfs > -100 ? `${dbfs.toFixed(0)} dB` : '-INF'}
        </span>
      </div>
    </div>
  );
}
