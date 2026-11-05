'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToolExecutionQueue, ToolQueueTelemetry } from '@/lib/tool-queue';
import type { CanvasToolName, ToolExecutionItem } from '@/types/canvas-commands';

export interface UseToolExecutionOptions {
  onToolCompleted?: (item: ToolExecutionItem) => void;
  onToolFailed?: (item: ToolExecutionItem) => void;
  onToolRolledBack?: (item: ToolExecutionItem) => void;
}

export function useToolExecution(options: UseToolExecutionOptions = {}) {
  const queueRef = useRef<ToolExecutionQueue | null>(null);
  if (!queueRef.current) {
    queueRef.current = new ToolExecutionQueue();
  }
  const queue = queueRef.current;

  const [history, setHistory] = useState<ToolExecutionItem[]>(() => queue.getHistory());
  const [pending, setPending] = useState<ToolExecutionItem[]>(() => queue.getPending());
  const [telemetry, setTelemetry] = useState<ToolQueueTelemetry>(() => queue.getTelemetry());
  const [latestItem, setLatestItem] = useState<ToolExecutionItem | null>(null);

  const refreshState = useCallback(() => {
    setHistory(queue.getHistory());
    setPending(queue.getPending());
    setTelemetry(queue.getTelemetry());
  }, [queue]);

  const dispatch = useCallback(
    (name: CanvasToolName, args: Record<string, unknown> | string, callId?: string) => {
      const item = queue.enqueue(name, args, callId);
      refreshState();
      return item;
    },
    [queue, refreshState]
  );

  const rollback = useCallback(
    (id: string) => {
      const item = queue.rollback(id);
      refreshState();
      return item;
    },
    [queue, refreshState]
  );

  const rollbackLast = useCallback(() => {
    const item = queue.rollbackLast();
    refreshState();
    return item;
  }, [queue, refreshState]);

  const clearQueue = useCallback(() => {
    queue.clear();
    refreshState();
  }, [queue, refreshState]);

  useEffect(() => {
    const unbindQueued = queue.on('itemQueued', () => {
      refreshState();
    });

    const unbindStarted = queue.on('itemStarted', (item: ToolExecutionItem) => {
      setLatestItem(item);
      refreshState();
    });

    const unbindCompleted = queue.on('itemCompleted', (item: ToolExecutionItem) => {
      setLatestItem(item);
      refreshState();
      options.onToolCompleted?.(item);
    });

    const unbindFailed = queue.on('itemFailed', (item: ToolExecutionItem) => {
      setLatestItem(item);
      refreshState();
      options.onToolFailed?.(item);
    });

    const unbindRolledBack = queue.on('itemRolledBack', (item: ToolExecutionItem) => {
      refreshState();
      options.onToolRolledBack?.(item);
    });

    return () => {
      unbindQueued();
      unbindStarted();
      unbindCompleted();
      unbindFailed();
      unbindRolledBack();
    };
  }, [queue, options, refreshState]);

  return {
    history,
    pending,
    telemetry,
    latestItem,
    dispatch,
    rollback,
    rollbackLast,
    clearQueue,
    queue,
  };
}
