/**
 * Host-Side SandboxBridge postMessage Controller & Protocol Handshake
 */

import type {
  SandboxHostMessage,
  SandboxGuestMessage,
  SandboxHandshakeStatus,
  CanvasSnapshot,
} from '@/types/sandbox';
import type { CanvasCommandAction } from '@/types/canvas-commands';

export type SandboxEventHandler<T = any> = (data: T) => void;

export interface SandboxBridgeConfig {
  iframe: HTMLIFrameElement;
  targetOrigin?: string;
}

export class SandboxBridge {
  private iframe: HTMLIFrameElement;
  private targetOrigin: string;
  private status: SandboxHandshakeStatus = 'initializing';
  private listeners: Map<string, Set<SandboxEventHandler>> = new Map();
  private pendingAcks: Map<string, { resolve: (val: any) => void; reject: (err: any) => void; sentAt: number }> = new Map();
  private messageListener: ((ev: MessageEvent) => void) | null = null;

  constructor(config: SandboxBridgeConfig) {
    this.iframe = config.iframe;
    this.targetOrigin = config.targetOrigin || '*';
    this.setupListeners();
  }

  public getStatus(): SandboxHandshakeStatus {
    return this.status;
  }

  public on<T = any>(event: string, handler: SandboxEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as SandboxEventHandler);
    return () => {
      this.listeners.get(event)?.delete(handler as SandboxEventHandler);
    };
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`SandboxBridge event error [${event}]:`, err);
        }
      });
    }
  }

  public initHandshake(sessionId = `session_${Date.now()}`): void {
    this.status = 'handshaking';
    this.emit('handshaking', { sessionId });

    this.postMessage({
      type: 'HOST_INIT',
      payload: { sessionId },
    });
  }

  public sendCommand(callId: string, action: CanvasCommandAction): Promise<{ durationMs: number; elementsCount: number }> {
    return new Promise((resolve, reject) => {
      if (this.status !== 'ready') {
        // If not ready yet, still send but with short timeout fallback
      }

      this.pendingAcks.set(callId, {
        resolve,
        reject,
        sentAt: performance.now(),
      });

      this.postMessage({
        type: 'CANVAS_COMMAND',
        callId,
        action,
      });

      // 5s timeout on command execution
      setTimeout(() => {
        if (this.pendingAcks.has(callId)) {
          this.pendingAcks.delete(callId);
          reject(new Error(`Timeout awaiting ACK for command callId: ${callId}`));
        }
      }, 5000);
    });
  }

  public applyScriptDiff(scriptId: string, code: string, runtime: 'canvas2d' | 'webgl' | 'dom' = 'canvas2d'): void {
    this.postMessage({
      type: 'APPLY_SCRIPT_DIFF',
      scriptId,
      code,
      runtime,
    });
  }

  public restoreSnapshot(snapshot: CanvasSnapshot): void {
    this.postMessage({
      type: 'RESTORE_SNAPSHOT',
      snapshot,
    });
  }

  public requestSnapshot(): void {
    this.postMessage({
      type: 'REQUEST_SNAPSHOT',
      snapshotId: `snap_req_${Date.now()}`,
    });
  }

  public ping(): void {
    this.postMessage({
      type: 'PING',
      timestamp: Date.now(),
    });
  }

  public destroy(): void {
    if (this.messageListener && typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
    }
    this.pendingAcks.clear();
    this.status = 'terminated';
    this.emit('terminated', undefined);
  }

  private postMessage(message: SandboxHostMessage): void {
    if (!this.iframe.contentWindow) return;
    try {
      this.iframe.contentWindow.postMessage(message, this.targetOrigin);
    } catch (err) {
      console.error('Failed to postMessage to sandbox iframe:', err);
    }
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    this.messageListener = (event: MessageEvent) => {
      // Validate origin if restricted
      if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) {
        return;
      }

      const msg = event.data as SandboxGuestMessage;
      if (!msg || typeof msg !== 'object' || !msg.type) {
        return;
      }

      switch (msg.type) {
        case 'GUEST_READY':
          this.status = 'ready';
          this.emit('ready', msg);
          break;
        case 'COMMAND_ACK': {
          const pending = this.pendingAcks.get(msg.callId);
          if (pending) {
            this.pendingAcks.delete(msg.callId);
            pending.resolve({
              durationMs: msg.renderDurationMs,
              elementsCount: msg.elementsCount,
            });
          }
          this.emit('commandAck', msg);
          break;
        }
        case 'COMMAND_ERROR': {
          if (msg.callId && this.pendingAcks.has(msg.callId)) {
            const pending = this.pendingAcks.get(msg.callId);
            this.pendingAcks.delete(msg.callId);
            pending?.reject(new Error(msg.error));
          }
          this.emit('commandError', msg);
          break;
        }
        case 'SNAPSHOT_DATA':
          this.emit('snapshot', msg.snapshot);
          break;
        case 'FPS_UPDATE':
          this.emit('fps', msg);
          break;
        case 'PONG':
          this.emit('pong', {
            rttMs: Date.now() - msg.sentTimestamp,
          });
          break;
      }
    };

    window.addEventListener('message', this.messageListener);
  }
}
