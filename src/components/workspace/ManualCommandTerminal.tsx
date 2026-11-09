'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, HelpCircle, CornerDownLeft } from 'lucide-react';
import type { TerminalCommandItem } from '@/types/workspace';

export interface ManualCommandTerminalProps {
  onExecuteCommand: (
    cmd: string
  ) => Promise<{ success: boolean; result?: string; error?: string } | void> | { success: boolean; result?: string; error?: string } | void;
  className?: string;
  isMuted?: boolean;
}

const INITIAL_GREETING: TerminalCommandItem[] = [
  {
    id: 'msg_welcome',
    type: 'system',
    content: 'TalkRender Manual Directive Terminal v1.0 [Online]. Type a voice directive or "help" for syntax.',
    timestamp: Date.now(),
  },
];

export const ManualCommandTerminal: React.FC<ManualCommandTerminalProps> = ({
  onExecuteCommand,
  className = '',
  isMuted = false,
}) => {
  const [messages, setMessages] = useState<TerminalCommandItem[]>(INITIAL_GREETING);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Record user command in message stream
    const userMsg: TerminalCommandItem = {
      id: `msg_in_${Date.now()}`,
      type: 'input',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setInputVal('');

    // Built-in commands
    if (trimmed.toLowerCase() === 'clear') {
      setMessages([]);
      return;
    }

    if (trimmed.toLowerCase() === 'help') {
      const helpMsg: TerminalCommandItem = {
        id: `msg_out_${Date.now()}`,
        type: 'output',
        content: `Available Directives:
- [voice prompt] e.g. "Drop 5 bouncy particles"
- draw_shape {"type":"circle","x":400,"y":300,"radius":25}
- clear_canvas {"resetState":true}
- rollback (reverts last tool call)
- clear (clears terminal buffer)`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, helpMsg]);
      return;
    }

    try {
      const response = await onExecuteCommand(trimmed);
      if (response && typeof response === 'object') {
        const outMsg: TerminalCommandItem = {
          id: `msg_out_${Date.now()}`,
          type: response.success ? 'output' : 'error',
          content: response.success
            ? response.result || 'Command applied successfully.'
            : response.error || 'Execution failed.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, outMsg]);
      }
    } catch (err: unknown) {
      const errMsg: TerminalCommandItem = {
        id: `msg_err_${Date.now()}`,
        type: 'error',
        content: err instanceof Error ? err.message : String(err),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex + 1 < history.length) {
        const newIdx = historyIndex + 1;
        setHistoryIndex(newIdx);
        setInputVal(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInputVal(history[newIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div
      data-testid="manual-command-terminal"
      className={`flex flex-col rounded-xl border border-white/[0.08] bg-zinc-950/95 font-mono text-xs text-zinc-300 shadow-2xl overflow-hidden backdrop-blur-xl ${className}`}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/60 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-medium text-zinc-200">Command Terminal</span>
          {isMuted && (
            <span className="rounded-full bg-amber-950/60 px-2 py-0.5 text-[9px] font-medium text-amber-300 border border-amber-800/60">
              MIC MUTED - MANUAL OVERRIDE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="terminal-help-btn"
            onClick={() => {
              setInputVal('help');
              inputRef.current?.focus();
            }}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
            title="Help instructions"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            data-testid="terminal-clear-btn"
            onClick={() => setMessages([])}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition-all"
            title="Clear buffer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Log */}
      <div
        ref={scrollRef}
        data-testid="terminal-output-log"
        className="flex-1 space-y-1.5 overflow-y-auto p-3.5 min-h-[140px] max-h-[220px]"
      >
        {messages.map((m) => {
          let colorClass = 'text-zinc-300';
          let prefix = '';

          if (m.type === 'input') {
            colorClass = 'text-cyan-300 font-medium';
            prefix = '$ ';
          } else if (m.type === 'error') {
            colorClass = 'text-rose-400';
            prefix = '[ERR] ';
          } else if (m.type === 'system') {
            colorClass = 'text-zinc-500 italic';
          } else if (m.type === 'output') {
            colorClass = 'text-emerald-400 whitespace-pre-wrap';
          }

          return (
            <div key={m.id} className="leading-relaxed">
              <span suppressHydrationWarning className="text-[10px] text-zinc-600 mr-2">
                {mounted
                  ? new Date(m.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '--:--:--'}
              </span>
              <span className={colorClass}>
                {prefix}
                {m.content}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-white/[0.06] bg-zinc-900/40 px-3.5 py-2.5"
      >
        <span className="font-bold text-cyan-400">$</span>
        <input
          ref={inputRef}
          type="text"
          data-testid="terminal-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type voice directive or tool call, e.g. "Drop bouncy orbs"...'
          className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs"
        />
        <button
          type="submit"
          data-testid="terminal-submit-btn"
          disabled={!inputVal.trim()}
          className="rounded p-1 text-cyan-400 hover:bg-zinc-800 disabled:opacity-40 transition-all"
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};
