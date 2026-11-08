/**
 * End-to-End Test Harness & WebRTC / WebSocket Simulation Environment
 * Simulates complete full-duplex TalkRender stack: LiveKit, Boson AI, and Sandbox Iframe.
 */

import { ToolExecutionQueue } from '@/lib/tool-queue';
import { SandboxBridge } from '@/lib/sandbox-bridge';
import { InterruptionManager } from '@/lib/interruption-manager';
import type { CanvasCommandAction } from '@/types/canvas-commands';

export class E2ETestHarness {
  public toolQueue: ToolExecutionQueue;
  public sandboxBridge: SandboxBridge;
  public interruptionManager: InterruptionManager;
  public mockIframe: HTMLIFrameElement;
  public mockWs: WebSocket;

  private messageLog: Array<{ source: string; data: unknown; timestamp: number }> = [];

  constructor() {
    this.toolQueue = new ToolExecutionQueue();

    // Setup mock iframe
    this.mockIframe = {
      contentWindow: {
        postMessage: (message: unknown) => {
          this.messageLog.push({ source: 'host_to_iframe', data: message, timestamp: Date.now() });
          this.handleIframeReceive(message);
        },
      },
    } as unknown as HTMLIFrameElement;

    this.sandboxBridge = new SandboxBridge({
      iframe: this.mockIframe,
      targetOrigin: '*',
    });

    // Setup mock WebSocket
    this.mockWs = {
      readyState: 1, // OPEN
      send: (data: string) => {
        this.messageLog.push({ source: 'client_to_ws', data: JSON.parse(data), timestamp: Date.now() });
      },
      close: () => {},
    } as unknown as WebSocket;

    this.interruptionManager = new InterruptionManager({
      toolQueue: this.toolQueue,
      sandboxBridge: this.sandboxBridge,
      rollbackOnInterruption: true,
    });
  }

  private handleIframeReceive(rawMsg: unknown): void {
    if (typeof rawMsg !== 'object' || rawMsg === null) return;
    const msg = rawMsg as { type?: string; callId?: string; action?: CanvasCommandAction };

    if (msg.type === 'HOST_INIT') {
      // Simulate guest ready
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'GUEST_READY', sessionId: 'sess_e2e_1' },
          origin: window.location.origin,
        })
      );
    } else if (msg.type === 'CANVAS_COMMAND' && msg.callId) {
      // Simulate sandbox command ack
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'COMMAND_ACK',
              callId: msg.callId,
              renderDurationMs: 2.5,
              elementsCount: 1,
            },
            origin: window.location.origin,
          })
        );
      }, 5);
    } else if (msg.type === 'PING') {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'PONG', sentTimestamp: Date.now() - 10 },
          origin: window.location.origin,
        })
      );
    }
  }

  public simulateVoiceCommand(name: string, args: Record<string, unknown>, callId = `call_${Date.now()}`): Promise<unknown> {
    const item = this.toolQueue.enqueue(name as any, args, callId);
    return this.sandboxBridge.sendCommand(callId, {
      type: name === 'clear_canvas' ? 'CLEAR_CANVAS' : 'DRAW_SHAPE',
      payload: args,
    }).then(() => item);
  }

  public simulateBargeIn(dbfs = -20): void {
    this.interruptionManager.feedDbfs(dbfs, 1000);
    this.interruptionManager.feedDbfs(dbfs, 1100);
  }

  public getMessageLog() {
    return [...this.messageLog];
  }
}
