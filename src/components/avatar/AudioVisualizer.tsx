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
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg bg-surface-900/80 backdrop-blur border border-surface-700/60 ${className}`}
    >
      {/* Bars container */}
      <div className="flex items-end justify-center gap-1 h-10 w-full px-2">
        {bars.map((val, idx) => {
          const heightPercent = Math.max(10, Math.min(100, Math.round(val * 100)));
          const isHigh = val > 0.6;
          return (
            <div
              key={idx}
              data-testid={`visualizer-bar-${idx}`}
              style={{ height: `${heightPercent}%` }}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isSpeaking
                  ? isHigh
                    ? 'bg-neon-magenta shadow-[0_0_8px_#ff007f]'
                    : 'bg-neon-cyan shadow-[0_0_6px_#00f3ff]'
                  : 'bg-zinc-700/60'
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
                ? 'bg-neon-emerald shadow-[0_0_6px_#00ff66] animate-pulse'
                : 'bg-zinc-600'
            }`}
          />
          <span>{isSpeaking ? 'VOICE DETECTED' : 'STANDBY'}</span>
        </div>
        <span data-testid="dbfs-readout">{dbfs > -100 ? `${dbfs.toFixed(0)} dB` : '-INF'}</span>
      </div>
    </div>
  );
}
