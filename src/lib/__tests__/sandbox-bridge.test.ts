import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SandboxBridge } from '../sandbox-bridge';

describe('SandboxBridge postMessage Protocol & Security Handshake', () => {
  let mockIframe: HTMLIFrameElement;
  let mockContentWindow: { postMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockContentWindow = {
      postMessage: vi.fn(),
    };

    mockIframe = {
      contentWindow: mockContentWindow as unknown as Window,
    } as unknown as HTMLIFrameElement;
  });

  it('should initialize in initializing status', () => {
    const bridge = new SandboxBridge({ iframe: mockIframe });
    expect(bridge.getStatus()).toBe('initializing');
    bridge.destroy();
  });

  it('should post HOST_INIT message during handshake', () => {
    const bridge = new SandboxBridge({ iframe: mockIframe });
    bridge.initHandshake('session-test-01');

    expect(bridge.getStatus()).toBe('handshaking');
    expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: 'HOST_INIT',
        payload: { sessionId: 'session-test-01' },
      },
      '*'
    );
    bridge.destroy();
  });

  it('should transition to ready status when GUEST_READY message arrives', () => {
    const bridge = new SandboxBridge({ iframe: mockIframe });
    let readyFired = false;
    bridge.on('ready', () => {
      readyFired = true;
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'GUEST_READY',
          version: '1.0.0',
          viewport: { width: 800, height: 600 },
        },
        origin: window.location.origin,
      })
    );

    expect(bridge.getStatus()).toBe('ready');
    expect(readyFired).toBe(true);
    bridge.destroy();
  });

  it('should send CANVAS_COMMAND and resolve on COMMAND_ACK', async () => {
    const bridge = new SandboxBridge({ iframe: mockIframe });
    const commandPromise = bridge.sendCommand('call_draw_42', {
      type: 'DRAW_SHAPE',
      payload: { shape: 'circle', x: 50, y: 50 },
    });

    expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CANVAS_COMMAND',
        callId: 'call_draw_42',
      }),
      '*'
    );

    // Simulate Guest ACK
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'COMMAND_ACK',
          callId: 'call_draw_42',
          renderDurationMs: 4,
          elementsCount: 1,
        },
        origin: window.location.origin,
      })
    );

    const result = await commandPromise;
    expect(result.durationMs).toBe(4);
    expect(result.elementsCount).toBe(1);
    bridge.destroy();
  });

  it('should reject sendCommand on COMMAND_ERROR', async () => {
    const bridge = new SandboxBridge({ iframe: mockIframe });
    const commandPromise = bridge.sendCommand('call_draw_fail', {
      type: 'DRAW_SHAPE',
      payload: { shape: 'unknown' },
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'COMMAND_ERROR',
          callId: 'call_draw_fail',
          error: 'Unsupported shape rendering',
        },
        origin: window.location.origin,
      })
    );

    await expect(commandPromise).rejects.toThrow('Unsupported shape rendering');
    bridge.destroy();
  });

  it('should clean up listeners and set terminated status on destroy', () => {
    const bridge = new SandboxBridge({ iframe: mockIframe });
    bridge.destroy();
    expect(bridge.getStatus()).toBe('terminated');
  });
});
