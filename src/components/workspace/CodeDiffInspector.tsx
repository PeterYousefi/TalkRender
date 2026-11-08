'use client';

import React, { useState, useEffect } from 'react';
import { Code2, Copy, Check, Play, FileCode } from 'lucide-react';

export interface CodeDiffInspectorProps {
  activeScript?: {
    scriptId: string;
    code: string;
    runtime?: 'canvas2d' | 'webgl' | 'dom';
    timestamp?: number;
  } | null;
  onApplyScript?: (scriptId: string, code: string) => void;
  className?: string;
}

const DEFAULT_CODE = `// No dynamic scripts currently injected.
// Voice prompts like "Start matrix rain" will inject scripts here.`;

export const CodeDiffInspector: React.FC<CodeDiffInspectorProps> = ({
  activeScript,
  onApplyScript,
  className = '',
}) => {
  const [editableCode, setEditableCode] = useState(activeScript?.code || DEFAULT_CODE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeScript?.code) {
      setEditableCode(activeScript.code);
    }
  }, [activeScript?.code]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(editableCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const handleRun = () => {
    if (onApplyScript && activeScript) {
      onApplyScript(activeScript.scriptId, editableCode);
    }
  };

  const lines = editableCode.split('\n');

  return (
    <div
      data-testid="code-diff-inspector"
      className={`flex flex-col rounded-xl border border-slate-800 bg-slate-950/95 font-mono text-xs text-slate-200 overflow-hidden shadow-2xl ${className}`}
    >
      {/* Titlebar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-100">
            Runtime Script Inspector
          </span>
          {activeScript && (
            <span
              data-testid="script-id-badge"
              className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 font-semibold"
            >
              {activeScript.scriptId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeScript?.runtime && (
            <span
              data-testid="script-runtime-badge"
              className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-800/60"
            >
              {activeScript.runtime.toUpperCase()}
            </span>
          )}

          <button
            type="button"
            data-testid="copy-code-btn"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Copy script code"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onApplyScript && activeScript && (
            <button
              type="button"
              data-testid="apply-code-btn"
              onClick={handleRun}
              className="flex items-center gap-1 rounded bg-cyan-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-cyan-500 transition-colors"
              title="Apply hot-reload code diff"
            >
              <Play className="h-3 w-3 fill-white" />
              <span>Hot-Reload</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Line Numbers */}
      <div className="relative flex flex-1 overflow-auto max-h-[360px] bg-slate-950/80">
        {/* Line Numbers */}
        <div
          data-testid="line-numbers-column"
          className="select-none bg-slate-900/40 px-2.5 py-3 text-right text-[11px] text-slate-600 font-mono border-r border-slate-800/60"
        >
          {lines.map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code View / Textarea */}
        <div className="flex-1 p-3 font-mono text-[11px] leading-5">
          <textarea
            data-testid="code-editor-textarea"
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[180px] bg-transparent text-emerald-300 font-mono resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-900/40 px-3 py-1 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <FileCode className="h-3 w-3" />
          {lines.length} lines | JavaScript
        </span>
        <span>Sandbox CSP Strict Mode</span>
      </div>
    </div>
  );
};
