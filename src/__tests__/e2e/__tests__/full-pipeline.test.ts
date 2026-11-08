import { describe, it, expect } from 'vitest';
import { FullPipelineRunner } from '../full-pipeline';

describe('Full-Pipeline E2E Integration (Voice -> Avatar -> Sandbox)', () => {
  it('should successfully execute the full pipeline from connection to canvas mutation and barge-in', async () => {
    const runner = new FullPipelineRunner();
    const result = await runner.runFullPipelineScenario();

    expect(result.completed).toBe(true);
    expect(result.toolCallsExecuted).toBe(2);
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);

    const stages = result.steps.map((s) => s.stage);
    expect(stages).toContain('connection');
    expect(stages).toContain('audio_stream');
    expect(stages).toContain('voice_command');
    expect(stages).toContain('tool_call');
    expect(stages).toContain('canvas_render');
    expect(stages).toContain('interruption');

    // Verify all steps succeeded
    for (const step of result.steps) {
      expect(step.success).toBe(true);
    }

    // Verify messages reached the mock sandbox iframe
    const messageLog = runner.getHarness().getMessageLog();
    const iframeMessages = messageLog.filter((m) => m.source === 'host_to_iframe');
    expect(iframeMessages.length).toBeGreaterThan(0);
  });
});
