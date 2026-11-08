'use client';

import React, { useState } from 'react';
import { Wrench, CheckCircle2, AlertTriangle, RotateCcw, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import type { ToolExecutionItem } from '@/types/canvas-commands';
import type { ToolQueueTelemetry } from '@/lib/tool-queue';

export interface ToolExecutionInspectorProps {
  items: ToolExecutionItem[];
  telemetry?: ToolQueueTelemetry;
  onRollbackItem?: (id: string) => void;
  className?: string;
}

export const ToolExecutionInspector: React.FC<ToolExecutionInspectorProps> = ({
  items,
  telemetry,
  onRollbackItem,
  className = '',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusBadge = (status: ToolExecutionItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span
            data-testid="status-completed"
            className="flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40"
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            COMPLETED
          </span>
        );
      case 'executing':
        return (
          <span
            data-testid="status-executing"
            className="flex items-center gap-1 rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/50 animate-pulse"
          >
            <Clock className="h-2.5 w-2.5" />
            EXECUTING
          </span>
        );
      case 'failed':
        return (
          <span
            data-testid="status-failed"
            className="flex items-center gap-1 rounded bg-rose-950/80 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/40"
          >
            <AlertTriangle className="h-2.5 w-2.5" />
            FAILED
          </span>
        );
      case 'rolled_back':
        return (
          <span
            data-testid="status-rolled_back"
            className="flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            ROLLED BACK
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            QUEUED
          </span>
        );
    }
  };

  return (
    <div
      data-testid="tool-execution-inspector"
      className={`flex flex-col rounded-xl border border-slate-800 bg-slate-950/90 font-mono text-xs text-slate-200 overflow-hidden shadow-2xl ${className}`}
    >
      {/* Titlebar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-100">
            Tool Call Inspector
          </span>
        </div>

        {/* Telemetry pill */}
        {telemetry && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>
              Total: <strong className="text-slate-200">{telemetry.completedCount}</strong>
            </span>
            {telemetry.rolledBackCount > 0 && (
              <span className="text-amber-400">
                Rolled back: <strong>{telemetry.rolledBackCount}</strong>
              </span>
            )}
            <span>
              Avg: <strong className="text-cyan-400">{Math.round(telemetry.averageDurationMs)}ms</strong>
            </span>
          </div>
        )}
      </div>

      {/* Tool Call Log Items */}
      <div
        data-testid="tool-items-list"
        className="flex-1 divide-y divide-slate-800/60 overflow-y-auto max-h-[360px]"
      >
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            No tool actions recorded yet. Voice commands will appear here in real-time.
          </div>
        ) : (
          [...items].reverse().map((item) => {
            const isExpanded = expandedIds.has(item.id);

            return (
              <div
                key={item.id}
                data-testid={`tool-item-${item.id}`}
                className="p-2.5 transition-colors hover:bg-slate-900/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-center gap-2 text-left font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span className="text-cyan-400">{item.name}</span>
                    {typeof item.durationMs === 'number' && (
                      <span className="text-[10px] text-slate-500">
                        ({item.durationMs}ms)
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}

                    {item.status === 'completed' && onRollbackItem && (
                      <button
                        type="button"
                        data-testid={`rollback-btn-${item.id}`}
                        onClick={() => onRollbackItem(item.id)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                        title="Rollback this tool call"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details JSON Payload */}
                {isExpanded && (
                  <div
                    data-testid={`tool-details-${item.id}`}
                    className="mt-2 rounded bg-slate-900/80 p-2 text-[11px] border border-slate-800/80"
                  >
                    <div className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                      Arguments Payload:
                    </div>
                    <pre className="overflow-x-auto text-slate-300 whitespace-pre-wrap font-mono">
                      {JSON.stringify(item.args, null, 2)}
                    </pre>

                    {item.result !== undefined && (
                      <>
                        <div className="mt-2 mb-1 text-[10px] font-bold uppercase text-emerald-500">
                          Execution Result:
                        </div>
                        <pre className="overflow-x-auto text-emerald-300 whitespace-pre-wrap font-mono">
                          {JSON.stringify(item.result, null, 2)}
                        </pre>
                      </>
                    )}

                    {item.error && (
                      <>
                        <div className="mt-2 mb-1 text-[10px] font-bold uppercase text-rose-500">
                          Execution Error:
                        </div>
                        <pre className="overflow-x-auto text-rose-400 whitespace-pre-wrap font-mono">
                          {item.error}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
