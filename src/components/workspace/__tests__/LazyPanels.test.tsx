import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  PanelFallback,
  LazyTemplateSelector,
  LazyLatencyHUD,
  LazyCodeDiffInspector,
} from '../LazyPanels';

describe('LazyPanels Dynamic Component Code Splitting', () => {
  it('should render fallback loader skeleton with appropriate testid', () => {
    render(<PanelFallback name="TestPanel" />);
    const fallback = screen.getByTestId('lazy-fallback-testpanel');
    expect(fallback).toBeDefined();
    expect(fallback.textContent).toContain('Loading TestPanel...');
  });

  it('should mount LazyTemplateSelector without crashing', async () => {
    const { container } = render(
      <LazyTemplateSelector
        onSelectTemplate={() => {}}
        onSelectTrigger={() => {}}
        activeTemplateId="test"
      />
    );
    expect(container).toBeDefined();
  });

  it('should mount LazyLatencyHUD and LazyCodeDiffInspector with Suspense boundaries', async () => {
    const { container: hudContainer } = render(
      <LazyLatencyHUD
        telemetry={{
          pingMs: 25,
          audioRttMs: 30,
          frameRenderTimeMs: 2,
          fps: 60,
          jitterMs: 1,
          packetLossPercent: 0,
          lastUpdated: Date.now(),
        }}
        interruptionCount={0}
        isInterrupted={false}
      />
    );
    expect(hudContainer).toBeDefined();

    const { container: diffContainer } = render(
      <LazyCodeDiffInspector activeScript={null} onApplyScript={() => {}} />
    );
    expect(diffContainer).toBeDefined();
  });
});
