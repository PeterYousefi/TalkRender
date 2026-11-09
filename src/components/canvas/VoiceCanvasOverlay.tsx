'use client';

import React from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

export interface VoiceCanvasOverlayProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  onToggleListening: () => void;
  onTriggerPrompt: (prompt: string) => void;
  className?: string;
}

const QUICK_PROMPTS = [
  { label: '🌟 Draw Neon Star', prompt: 'Draw a glowing cyan star' },
  { label: '🟣 Purple Circle', prompt: 'Draw a purple circle' },
  { label: '🟩 Green Box', prompt: 'Draw an emerald rectangle' },
  { label: '⚡ Matrix Rain', prompt: 'Start matrix rain' },
  { label: '🪐 Solar System', prompt: 'Show me the solar system' },
  { label: '⚽ Physics Bouncing', prompt: 'Enable gravity and bouncing balls' },
  { label: '🧹 Clear Stage', prompt: 'Clear canvas' },
];

export const VoiceCanvasOverlay: React.FC<VoiceCanvasOverlayProps> = ({
  isListening,
  isSpeaking,
  transcript,
  interimTranscript,
  onToggleListening,
  onTriggerPrompt,
  className = '',
}) => {
  const displaySpeech = interimTranscript || transcript;

  return (
    <div
      data-testid="voice-canvas-overlay"
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 ${className}`}
    >
      {/* Top Floating Speech Status Bar */}
      <div className="flex w-full items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 px-3 py-1.5 font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isListening
                ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'
                : isSpeaking
                ? 'bg-cyan-400 shadow-[0_0_10px_#00f3ff] animate-ping'
                : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
            }`}
          />
          <span className="font-semibold text-slate-200">
            {isListening
              ? '🎤 LISTENING TO VOICE...'
              : isSpeaking
              ? '🔊 COPILOT SPEAKING...'
              : '⚡ VOICE ENGINE READY'}
          </span>
        </div>

        {/* Big Mic Push-to-Talk Toggle */}
        <button
          type="button"
          data-testid="voice-hud-mic-btn"
          onClick={onToggleListening}
          className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xl backdrop-blur-md ${
            isListening
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span>STOP LISTENING</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>CLICK TO TALK TO CANVAS</span>
            </>
          )}
        </button>
      </div>

      {/* Center Live Speech Transcript Wave Banner */}
      {displaySpeech && (
        <div className="pointer-events-auto mx-auto my-auto max-w-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-2xl border border-cyan-400/50 bg-slate-950/90 p-4 text-center shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl">
            <div className="mb-1 flex items-center justify-center gap-2 text-xs font-mono font-bold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>VOICE TRANSCRIPT</span>
            </div>
            <p className="font-mono text-base font-semibold text-white drop-shadow-md">
              &ldquo;{displaySpeech}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Bottom Floating Quick-Voice Trigger Chips */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 pb-1">
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            data-testid={`quick-prompt-${item.label}`}
            onClick={() => onTriggerPrompt(item.prompt)}
            className="rounded-full border border-slate-700/80 bg-slate-900/85 px-3 py-1 font-mono text-xs text-slate-300 shadow-md backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-300 hover:scale-105"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
