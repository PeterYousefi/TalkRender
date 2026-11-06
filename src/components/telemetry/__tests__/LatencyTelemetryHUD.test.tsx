import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LatencyTelemetryHUD } from '../LatencyTelemetryHUD';
import type { LatencyTelemetry } from '@/types/telemetry';

const mockTelemetry: LatencyTelemetry = {
  pingMs: 45,
  audioRttMs: 82,
  frameRenderTimeMs: 3.4,
  fps: 60,
  jitterMs: 1.2,
  packetLossPercent: 0,
  lastUpdated: Date.now(),
};

describe('LatencyTelemetryHUD Component', () => {
  it('should render primary summary metrics in collapsed state', () => {
    render(<LatencyTelemetryHUD telemetry={mockTelemetry} />);

    const ping = screen.getByTestId('ping-metric');
    expect(ping).toBeDefined();
    expect(ping.textContent).toContain('45ms');

    const audioRtt = screen.getByTestId('audio-rtt-metric');
    expect(audioRtt).toBeDefined();
    expect(audioRtt.textContent).toContain('82ms');

    const fps = screen.getByTestId('fps-metric');
    expect(fps).toBeDefined();
    expect(fps.textContent).toContain('60 FPS');

    expect(screen.queryByTestId('expanded-telemetry-details')).toBeNull();
  });

  it('should display barge-in active badge when isInterrupted is true', () => {
    render(<LatencyTelemetryHUD telemetry={mockTelemetry} isInterrupted={true} />);

    const badge = screen.getByTestId('barge-in-active-badge');
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('BARGE-IN');
  });

  it('should toggle expanded view and render render latency, jitter, and packet loss', () => {
    render(<LatencyTelemetryHUD telemetry={mockTelemetry} interruptionCount={3} />);

    const toggleBtn = screen.getByTestId('toggle-expand-btn');
    fireEvent.click(toggleBtn);

    const details = screen.getByTestId('expanded-telemetry-details');
    expect(details).toBeDefined();

    const renderTime = screen.getByTestId('render-time-metric');
    expect(renderTime.textContent).toContain('3.4ms');

    const jitter = screen.getByTestId('jitter-metric');
    expect(jitter.textContent).toContain('1.2ms');

    const loss = screen.getByTestId('packet-loss-metric');
    expect(loss.textContent).toContain('0%');

    const interruptions = screen.getByTestId('interruption-count-metric');
    expect(interruptions.textContent).toContain('3');
  });
});
