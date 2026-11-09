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
  const mouthWidth = 20 + mouthWide * 28; // 20 to 48
  const mouthHeight = Math.max(3, jawOpen * 24); // 3 to 24
  const cx = 50;
  const cy = 56;

  return (
    <div
      data-testid="viseme-indicator"
      className={`relative flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-950/80 border border-white/[0.08] shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Executive Acoustic Orb & Resonance Aperture */}
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Ambient radial harmonic glow */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 blur-2xl ${
            isSpeaking
              ? 'bg-cyan-500/15 scale-110'
              : 'bg-white/[0.02] scale-95'
          }`}
        />

        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full text-zinc-400 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            <radialGradient id="acoustic-orb-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#09090b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#040405" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="aperture-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#00f3ff" />
            </linearGradient>
          </defs>

          {/* Outer Harmonic Resonance Ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="2 3"
            className={`transition-opacity duration-300 ${isSpeaking ? 'opacity-40 animate-[spin_40s_linear_infinite]' : 'opacity-15'}`}
          />

          {/* Acoustic Orb Base Sphere */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="url(#acoustic-orb-gradient)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            className="transition-all duration-300"
          />

          {/* Inner Acoustic Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke={isSpeaking ? 'rgba(0,243,255,0.25)' : 'rgba(255,255,255,0.06)'}
            strokeWidth="0.75"
            className="transition-all duration-200"
          />

          {/* Acoustic Optic Nodes */}
          <g data-testid="avatar-eyes">
            <ellipse
              cx="40"
              cy="42"
              rx="3"
              ry={isSpeaking ? '3' : '2'}
              fill={isSpeaking ? '#00f3ff' : '#71717a'}
              className="transition-all duration-150"
            />
            <ellipse
              cx="60"
              cy="42"
              rx="3"
              ry={isSpeaking ? '3' : '2'}
              fill={isSpeaking ? '#00f3ff' : '#71717a'}
              className="transition-all duration-150"
            />
          </g>

          {/* Dynamic Viseme Aperture */}
          <g data-testid="avatar-mouth">
            {jawOpen > 0.1 ? (
              <ellipse
                cx={cx}
                cy={cy}
                rx={mouthWidth / 2}
                ry={mouthHeight / 2}
                fill="#ff007f"
                stroke="#00f3ff"
                strokeWidth="1.5"
                className="transition-all duration-75 shadow-[0_0_12px_#ff007f]"
              />
            ) : (
              <line
                x1={cx - mouthWidth / 2}
                y1={cy}
                x2={cx + mouthWidth / 2}
                y2={cy}
                stroke="#00f3ff"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-all duration-75 opacity-90"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Refined Monospace Viseme Badge */}
      <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-[11px] font-mono tracking-wider shadow-sm">
        <span className="text-zinc-500 font-medium">VISEME:</span>
        <span
          data-testid="viseme-label"
          className={isSpeaking ? 'text-neon-magenta font-bold' : 'text-zinc-400 font-medium'}
        >
          {viseme.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
