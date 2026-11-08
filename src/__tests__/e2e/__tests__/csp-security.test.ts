import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SandboxBridge } from '@/lib/sandbox-bridge';
import { InjectScriptSchema } from '@/lib/tools/dom-manipulation';

describe('Sandbox CSP Security & Script Boundary Hardening', () => {
  it('should enforce strict Content-Security-Policy in canvas runtime HTML', () => {
    const htmlPath = path.resolve(process.cwd(), 'public/sandbox/canvas-runtime.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // Verify CSP meta tag exists
    expect(htmlContent).toContain('http-equiv="Content-Security-Policy"');

    // Extract CSP content specifically from Content-Security-Policy meta tag
    const cspMatch = htmlContent.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
    expect(cspMatch).not.toBeNull();
    const cspDirectives = cspMatch![1];

    // Ensure default-src restricts sources and does NOT allow wildcards
    expect(cspDirectives).toContain("default-src 'self'");
    expect(cspDirectives).not.toContain('default-src *');

    // Ensure external network script loading is forbidden
    expect(cspDirectives).not.toContain('https:');
    expect(cspDirectives).not.toContain('http:');
  });

  it('should reject unauthorized cross-origin postMessage events', () => {
    const mockIframe = {
      contentWindow: {
        postMessage: () => {},
      },
    } as unknown as HTMLIFrameElement;

    const bridge = new SandboxBridge({
      iframe: mockIframe,
      targetOrigin: 'https://talkrender.local',
    });

    let maliciousAckReceived = false;
    bridge.on('commandAck', () => {
      maliciousAckReceived = true;
    });

    // Simulate attacker posting message from untrusted external origin
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'COMMAND_ACK',
          callId: 'malicious_call_id',
          renderDurationMs: 1,
        },
        origin: 'https://attacker-domain.evil.com',
      })
    );

    // Bridge should reject or ignore the untrusted origin
    expect(maliciousAckReceived).toBe(false);
    bridge.destroy();
  });

  it('should validate script injection schema and reject empty or invalid payloads', () => {
    // Valid injection
    const validResult = InjectScriptSchema.safeParse({
      code: 'ctx.fillRect(0, 0, 100, 100);',
      runtime: 'canvas2d',
      isolated: true,
    });
    expect(validResult.success).toBe(true);

    // Empty script code injection rejected
    const invalidEmpty = InjectScriptSchema.safeParse({
      code: '',
      runtime: 'canvas2d',
    });
    expect(invalidEmpty.success).toBe(false);

    // Invalid runtime environment rejected
    const invalidRuntime = InjectScriptSchema.safeParse({
      code: 'console.log(1)',
      runtime: 'unknown_unsafe_runtime',
    });
    expect(invalidRuntime.success).toBe(false);
  });
});
