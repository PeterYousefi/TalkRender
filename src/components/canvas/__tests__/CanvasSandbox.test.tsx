import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CanvasSandbox } from '../CanvasSandbox';

describe('CanvasSandbox Component', () => {
  it('should render sandbox container and iframe with strict sandbox attribute', () => {
    render(<CanvasSandbox />);

    const container = screen.getByTestId('canvas-sandbox-container');
    expect(container).toBeDefined();

    const iframe = screen.getByTestId('canvas-sandbox-iframe') as HTMLIFrameElement;
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('src')).toBe('/sandbox/canvas-runtime.html');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
  });

  it('should render status indicator showing initial state', () => {
    render(<CanvasSandbox />);

    const indicator = screen.getByTestId('sandbox-status-indicator');
    expect(indicator).toBeDefined();
    expect(screen.getByText(/SANDBOX: INITIALIZING/i)).toBeDefined();
  });

  it('should invoke onBridgeReady callback upon GUEST_READY message event', () => {
    const onBridgeReadyMock = vi.fn();
    render(<CanvasSandbox onBridgeReady={onBridgeReadyMock} />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'GUEST_READY',
            version: '1.0.0',
            viewport: { width: 1024, height: 768 },
          },
          origin: window.location.origin,
        })
      );
    });

    expect(onBridgeReadyMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/LIVE CANVAS/i)).toBeDefined();
  });
});
