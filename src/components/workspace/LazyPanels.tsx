'use client';

import React, { lazy, Suspense } from 'react';
import type { TemplateSelectorProps } from '@/components/templates/TemplateSelector';
import type { LatencyTelemetryHUDProps } from '@/components/telemetry/LatencyTelemetryHUD';
import type { CodeDiffInspectorProps } from '@/components/workspace/CodeDiffInspector';

const RawTemplateSelector = lazy(() =>
  import('@/components/templates/TemplateSelector').then((m) => ({ default: m.TemplateSelector }))
);

const RawLatencyHUD = lazy(() =>
  import('@/components/telemetry/LatencyTelemetryHUD').then((m) => ({ default: m.LatencyTelemetryHUD }))
);

const RawCodeDiffInspector = lazy(() =>
  import('@/components/workspace/CodeDiffInspector').then((m) => ({ default: m.CodeDiffInspector }))
);

export function PanelFallback({ name }: { name: string }) {
  return (
    <div
      data-testid={`lazy-fallback-${name.toLowerCase()}`}
      className="flex h-48 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs font-mono text-cyan-400/60 animate-pulse"
    >
      Loading {name}...
    </div>
  );
}

export function LazyTemplateSelector(props: TemplateSelectorProps) {
  return (
    <Suspense fallback={<PanelFallback name="TemplateSelector" />}>
      <RawTemplateSelector {...props} />
    </Suspense>
  );
}

export function LazyLatencyHUD(props: LatencyTelemetryHUDProps) {
  return (
    <Suspense fallback={<PanelFallback name="LatencyHUD" />}>
      <RawLatencyHUD {...props} />
    </Suspense>
  );
}

export function LazyCodeDiffInspector(props: CodeDiffInspectorProps) {
  return (
    <Suspense fallback={<PanelFallback name="CodeDiffInspector" />}>
      <RawCodeDiffInspector {...props} />
    </Suspense>
  );
}
