/**
 * Sandbox postMessage Protocol & Iframe Communication Types
 */

import type { CanvasCommandAction } from './canvas-commands';

export type SandboxHostMessageType =
  | 'HOST_INIT'
  | 'CANVAS_COMMAND'
  | 'APPLY_SCRIPT_DIFF'
  | 'REQUEST_SNAPSHOT'
  | 'RESTORE_SNAPSHOT'
  | 'PING';

export type SandboxGuestMessageType =
  | 'GUEST_READY'
  | 'COMMAND_ACK'
  | 'COMMAND_ERROR'
  | 'SNAPSHOT_DATA'
  | 'PONG'
  | 'FPS_UPDATE';

export type SandboxHandshakeStatus =
  | 'initializing'
  | 'handshaking'
  | 'ready'
  | 'error'
  | 'terminated';

export interface CanvasSnapshot {
  id: string;
  timestamp: number;
  background: Record<string, unknown>;
  shapes: Record<string, unknown>[];
  physicsBodies: Record<string, unknown>[];
  appliedStyles: Record<string, unknown>;
}

export type SandboxHostMessage =
  | {
      type: 'HOST_INIT';
      payload: { sessionId: string; theme?: string };
    }
  | {
      type: 'CANVAS_COMMAND';
      callId: string;
      action: CanvasCommandAction;
    }
  | {
      type: 'APPLY_SCRIPT_DIFF';
      scriptId: string;
      code: string;
      runtime?: 'canvas2d' | 'webgl' | 'dom';
    }
  | {
      type: 'REQUEST_SNAPSHOT';
      snapshotId: string;
    }
  | {
      type: 'RESTORE_SNAPSHOT';
      snapshot: CanvasSnapshot;
    }
  | {
      type: 'PING';
      timestamp: number;
    };

export type SandboxGuestMessage =
  | {
      type: 'GUEST_READY';
      version: string;
      viewport: { width: number; height: number };
    }
  | {
      type: 'COMMAND_ACK';
      callId: string;
      renderDurationMs: number;
      elementsCount: number;
    }
  | {
      type: 'COMMAND_ERROR';
      callId?: string;
      error: string;
    }
  | {
      type: 'SNAPSHOT_DATA';
      snapshot: CanvasSnapshot;
    }
  | {
      type: 'PONG';
      sentTimestamp: number;
      receivedTimestamp: number;
    }
  | {
      type: 'FPS_UPDATE';
      fps: number;
      frameTimeMs: number;
    };

export interface SandboxBridgeOptions {
  iframe: HTMLIFrameElement;
  targetOrigin?: string;
  onReady?: () => void;
  onAck?: (callId: string, durationMs: number) => void;
  onError?: (error: string, callId?: string) => void;
  onFpsUpdate?: (fps: number, frameTimeMs: number) => void;
}
