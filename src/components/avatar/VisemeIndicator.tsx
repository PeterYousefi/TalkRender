'use client';

import React from 'react';
import type { StandardViseme } from '@/types/avatar';

export interface VisemeIndicatorProps {
  viseme?: StandardViseme;
  jawOpen?: number;
  mouthWide?: number;
  isSpeaking?: boolean;
  className?: string;
}

export function VisemeIndicator({
  viseme = 'sil',
  jawOpen = 0,
  mouthWide = 0.5,
  isSpeaking = false,
  className = '',
}: VisemeIndicatorProps) {
  // SVG mouth parameters based on viseme and jawOpen
  const mouthWidth = 24 + mouthWide * 32; // 24 to 56
  const mouthHeight = Math.max(4, jawOpen * 28); // 4 to 28
  const cx = 50;
  const cy = 68;

  return (
    <div
      data-testid="viseme-indicator"
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl bg-surface-900 border border-surface-700/80 shadow-inner ${className}`}
    >
      {/* Cybernetic Face Mesh SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-32 h-32 text-neon-cyan drop-shadow-[0_0_12px_rgba(0,243,255,0.4)]"
      >
        {/* Head outline / visor frame */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          className="opacity-40 animate-[spin_60s_linear_infinite]"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="#111726"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Eyes / Cybernetic Visor Optics */}
        <g data-testid="avatar-eyes">
          <ellipse
            cx="36"
            cy="42"
            rx="6"
            ry={isSpeaking ? '4' : '2'}
            fill="#00f3ff"
            className="transition-all duration-100"
          />
          <ellipse
            cx="64"
            cy="42"
            rx="6"
            ry={isSpeaking ? '4' : '2'}
            fill="#00f3ff"
            className="transition-all duration-100"
          />
        </g>

        {/* Dynamic Mouth / Viseme Morph */}
        <g data-testid="avatar-mouth">
          {jawOpen > 0.1 ? (
            <ellipse
              cx={cx}
              cy={cy}
              rx={mouthWidth / 2}
              ry={mouthHeight / 2}
              fill="#ff007f"
              stroke="#00f3ff"
              strokeWidth="2"
              className="transition-all duration-75 shadow-[0_0_10px_#ff007f]"
            />
          ) : (
            <line
              x1={cx - mouthWidth / 2}
              y1={cy}
              x2={cx + mouthWidth / 2}
              y2={cy}
              stroke="#00f3ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          )}
        </g>
      </svg>

      {/* Viseme Label Badge */}
      <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-800 border border-surface-600 text-[10px] font-mono tracking-wider">
        <span className="text-zinc-500">VISEME:</span>
        <span
          data-testid="viseme-label"
          className={isSpeaking ? 'text-neon-magenta font-bold' : 'text-zinc-400'}
        >
          {viseme.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
