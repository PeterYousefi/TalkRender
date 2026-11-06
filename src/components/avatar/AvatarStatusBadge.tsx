import React from 'react';
import { Wifi, WifiOff, Activity, Mic, Radio } from 'lucide-react';
import type { AvatarConnectionQuality } from '@/types/avatar';

export interface AvatarStatusBadgeProps {
  quality?: AvatarConnectionQuality;
  latencyMs?: number;
  isSpeaking?: boolean;
  fps?: number;
  className?: string;
}

const QUALITY_CONFIG: Record<
  AvatarConnectionQuality,
  { label: string; dotClass: string; textClass: string; icon: React.ElementType }
> = {
  excellent: {
    label: 'HD Live',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    textClass: 'text-emerald-400',
    icon: Wifi,
  },
  good: {
    label: 'Stable',
    dotClass: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    textClass: 'text-cyan-400',
    icon: Wifi,
  },
  poor: {
    label: 'Degraded',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    textClass: 'text-amber-400',
    icon: Activity,
  },
  reconnecting: {
    label: 'Reconnecting',
    dotClass: 'bg-orange-500 animate-ping shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    textClass: 'text-orange-400 animate-pulse',
    icon: Radio,
  },
  offline: {
    label: 'Disconnected',
    dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    textClass: 'text-rose-400',
    icon: WifiOff,
  },
};

export const AvatarStatusBadge: React.FC<AvatarStatusBadgeProps> = ({
  quality = 'excellent',
  latencyMs,
  isSpeaking = false,
  fps,
  className = '',
}) => {
  const currentQuality = QUALITY_CONFIG[quality] || QUALITY_CONFIG.offline;
  const QualityIcon = currentQuality.icon;

  return (
    <div
      data-testid="avatar-status-badge"
      className={`inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-2.5 py-1 text-xs font-mono backdrop-blur-md transition-all ${className}`}
    >
      {/* Quality indicator */}
      <div className="flex items-center gap-1.5" title={`Connection Quality: ${quality}`}>
        <span
          data-testid="quality-dot"
          className={`h-2 w-2 rounded-full transition-colors ${currentQuality.dotClass}`}
        />
        <QualityIcon className={`h-3 w-3 ${currentQuality.textClass}`} />
        <span className={`font-semibold ${currentQuality.textClass}`}>
          {currentQuality.label}
        </span>
      </div>

      {/* Latency Pill */}
      {typeof latencyMs === 'number' && (
        <span
          data-testid="latency-pill"
          className={`text-[10px] ${
            latencyMs < 100
              ? 'text-emerald-400'
              : latencyMs < 250
              ? 'text-amber-400'
              : 'text-rose-400'
          }`}
        >
          {latencyMs}ms
        </span>
      )}

      {/* FPS Pill */}
      {typeof fps === 'number' && fps > 0 && (
        <span data-testid="fps-pill" className="text-[10px] text-slate-400">
          {fps}fps
        </span>
      )}

      {/* Active Speaking Indicator */}
      {isSpeaking && (
        <div
          data-testid="speaking-pill"
          className="flex items-center gap-1 rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-500/50 animate-pulse"
        >
          <Mic className="h-2.5 w-2.5" />
          <span>TALKING</span>
        </div>
      )}
    </div>
  );
};
