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
  { id: 'star', label: 'Vector Star', prompt: 'Draw a glowing cyan star' },
  { id: 'circle', label: 'Circle Geometry', prompt: 'Draw a purple circle' },
  { id: 'box', label: 'Square Geometry', prompt: 'Draw an emerald rectangle' },
  { id: 'matrix', label: 'Matrix Stream', prompt: 'Start matrix rain' },
  { id: 'solar', label: 'Orbital System', prompt: 'Show me the solar system' },
  { id: 'physics', label: 'Physics Bodies', prompt: 'Enable gravity and bouncing balls' },
  { id: 'clear', label: 'Reset Canvas', prompt: 'Clear canvas' },
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
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-5 font-sans ${className}`}
    >
      {/* Top Floating Acoustic Status Bar */}
      <div className="flex w-full items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-zinc-950/70 px-3.5 py-1.5 text-xs text-zinc-300 shadow-xl backdrop-blur-xl">
          <span
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
                : isSpeaking
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                : 'bg-emerald-500/80'
            }`}
          />
          <span className="font-medium tracking-tight text-zinc-300">
            {isListening
              ? 'Listening...'
              : isSpeaking
              ? 'Assistant Speaking'
              : 'Voice Engine Active'}
          </span>
        </div>

        {/* Executive Voice Control Capsule */}
        <button
          type="button"
          data-testid="voice-hud-mic-btn"
          onClick={onToggleListening}
          className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-tight transition-all duration-200 shadow-xl backdrop-blur-xl ${
            isListening
              ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
              : 'bg-zinc-900/90 hover:bg-zinc-800/95 border border-white/[0.12] text-zinc-100 hover:border-white/[0.24] hover:shadow-2xl'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-3.5 w-3.5 text-rose-400" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5 text-zinc-300" />
              <span>Direct Canvas with Voice</span>
            </>
          )}
        </button>
      </div>

      {/* Center Live Speech Transcript Card */}
      {displaySpeech && (
        <div className="pointer-events-auto mx-auto my-auto max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-2xl border border-white/[0.1] bg-zinc-950/85 p-5 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Voice Directive</span>
            </div>
            <p className="text-lg font-medium tracking-tight text-white">
              &ldquo;{displaySpeech}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Bottom Minimalist Directive Chips */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 pb-1">
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`quick-prompt-${item.label}`}
            onClick={() => onTriggerPrompt(item.prompt)}
            className="rounded-full border border-white/[0.08] bg-zinc-900/70 px-3.5 py-1.5 text-xs font-medium text-zinc-300 shadow-md backdrop-blur-xl transition-all duration-150 hover:border-white/[0.22] hover:bg-zinc-800 hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
