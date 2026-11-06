'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SandboxBridge } from '@/lib/sandbox-bridge';
import type { SandboxHandshakeStatus } from '@/types/sandbox';

export interface CanvasSandboxProps {
  onBridgeReady?: (bridge: SandboxBridge) => void;
  onFpsUpdate?: (fps: number, frameTimeMs: number) => void;
  className?: string;
}

export function CanvasSandbox({
  onBridgeReady,
  onFpsUpdate,
  className = '',
}: CanvasSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bridgeRef = useRef<SandboxBridge | null>(null);
  const [status, setStatus] = useState<SandboxHandshakeStatus>('initializing');
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    if (!iframeRef.current) return;

    const bridge = new SandboxBridge({
      iframe: iframeRef.current,
      targetOrigin: '*',
    });
    bridgeRef.current = bridge;

    const unbindReady = bridge.on('ready', () => {
      setStatus('ready');
      onBridgeReady?.(bridge);
    });

    const unbindFps = bridge.on('fps', (data: { fps: number; frameTimeMs: number }) => {
      setFps(data.fps);
      onFpsUpdate?.(data.fps, data.frameTimeMs);
    });

    const handleIframeLoad = () => {
      bridge.initHandshake();
    };

    const iframeEl = iframeRef.current;
    iframeEl.addEventListener('load', handleIframeLoad);

    return () => {
      iframeEl.removeEventListener('load', handleIframeLoad);
      unbindReady();
      unbindFps();
      bridge.destroy();
      bridgeRef.current = null;
    };
  }, [onBridgeReady, onFpsUpdate]);

  return (
    <div
      data-testid="canvas-sandbox-container"
      className={`relative w-full h-full overflow-hidden rounded-xl border border-surface-700 bg-surface-900 shadow-2xl ${className}`}
    >
      {/* Sandbox Status Bar Overlay */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div
          data-testid="sandbox-status-indicator"
          className={`h-2.5 w-2.5 rounded-full transition-colors ${
            status === 'ready'
              ? 'bg-neon-emerald animate-pulse shadow-[0_0_8px_#00ff66]'
              : status === 'handshaking'
                ? 'bg-neon-amber animate-ping'
                : 'bg-zinc-600'
          }`}
        />
        <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-400">
          {status === 'ready' ? `LIVE CANVAS (${fps} FPS)` : `SANDBOX: ${status}`}
        </span>
      </div>

      {/* Sandboxed Iframe */}
      <iframe
        ref={iframeRef}
        data-testid="canvas-sandbox-iframe"
        title="TalkRender Canvas Sandbox Viewport"
        src="/sandbox/canvas-runtime.html"
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0 block bg-transparent"
      />
    </div>
  );
}
