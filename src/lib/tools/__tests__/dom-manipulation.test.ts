import { describe, it, expect } from 'vitest';
import { ClearCanvasSchema, clearCanvasTool } from '../clear-canvas';
import {
  InjectScriptSchema,
  injectScriptTool,
  UpdateStyleSchema,
  updateStyleTool,
} from '../dom-manipulation';

describe('clear_canvas, inject_script & update_style Tool Validators', () => {
  it('should validate default clear_canvas parameters', () => {
    const parsed = ClearCanvasSchema.parse({});
    expect(parsed.preserveBackground).toBe(true);
    expect(parsed.clearType).toBe('all');
    expect(parsed.fadeDurationMs).toBe(0);
  });

  it('should execute clearCanvasTool and produce action', async () => {
    const input = ClearCanvasSchema.parse({
      preserveBackground: false,
      clearType: 'shapes_only',
      fadeDurationMs: 250,
    });

    const output = (await clearCanvasTool.execute(input)) as {
      action: string;
      payload: typeof input;
    };

    expect(output.action).toBe('CLEAR_CANVAS');
    expect(output.payload.clearType).toBe('shapes_only');
  });

  it('should validate inject_script and reject empty code', () => {
    const valid = InjectScriptSchema.parse({
      code: 'ctx.fillStyle = "cyan"; ctx.fillRect(0,0,50,50);',
      runtime: 'canvas2d',
    });
    expect(valid.runtime).toBe('canvas2d');
    expect(valid.isolated).toBe(true);

    const invalid = InjectScriptSchema.safeParse({ code: '' });
    expect(invalid.success).toBe(false);
  });

  it('should execute injectScriptTool and return formatted payload', async () => {
    const input = InjectScriptSchema.parse({
      code: 'console.log("sandboxed runner initialized");',
      id: 'custom_anim_loop',
    });

    const output = (await injectScriptTool.execute(input)) as {
      action: string;
      scriptId: string;
      payload: typeof input;
    };

    expect(output.action).toBe('INJECT_SCRIPT');
    expect(output.scriptId).toBe('custom_anim_loop');
  });

  it('should validate update_style key-value records', () => {
    const input = {
      selector: '#canvas-viewport',
      styles: {
        filter: 'contrast(1.4) brightness(1.1)',
        transform: 'scale(1.02)',
        opacity: 0.95,
      },
      transitionMs: 500,
    };

    const parsed = UpdateStyleSchema.parse(input);
    expect(parsed.selector).toBe('#canvas-viewport');
    expect(parsed.styles.filter).toBe('contrast(1.4) brightness(1.1)');
    expect(parsed.transitionMs).toBe(500);
  });

  it('should execute updateStyleTool cleanly', async () => {
    const input = UpdateStyleSchema.parse({
      styles: { boxShadow: '0 0 20px cyan' },
    });

    const output = (await updateStyleTool.execute(input)) as {
      action: string;
      payload: typeof input;
    };

    expect(output.action).toBe('UPDATE_STYLE');
    expect(output.payload.styles.boxShadow).toBe('0 0 20px cyan');
  });
});
