import { describe, it, expect } from 'vitest';
import { SetBackgroundSchema, setBackgroundTool } from '../set-background';

describe('set_background Tool Validator & Execution', () => {
  it('should validate default solid background', () => {
    const parsed = SetBackgroundSchema.parse({});
    expect(parsed.mode).toBe('solid');
    expect(parsed.color).toBe('#0a0d14');
    expect(parsed.gridSize).toBe(25);
  });

  it('should validate gradient configuration with color stops', () => {
    const input = {
      mode: 'gradient',
      gradientColors: ['#0a0d14', '#1a2238', '#00f3ff'],
      gradientType: 'radial',
      gradientAngle: 90,
    };

    const parsed = SetBackgroundSchema.parse(input);
    expect(parsed.mode).toBe('gradient');
    expect(parsed.gradientColors).toHaveLength(3);
    expect(parsed.gradientType).toBe('radial');
  });

  it('should validate cyberpunk grid mode', () => {
    const input = {
      mode: 'cyberpunk-mesh',
      gridSize: 32,
      gridColor: 'rgba(0, 243, 255, 0.25)',
      animate: true,
    };

    const parsed = SetBackgroundSchema.parse(input);
    expect(parsed.mode).toBe('cyberpunk-mesh');
    expect(parsed.gridSize).toBe(32);
    expect(parsed.animate).toBe(true);
  });

  it('should reject invalid background mode', () => {
    const result = SetBackgroundSchema.safeParse({ mode: 'unsupported-pattern' });
    expect(result.success).toBe(false);
  });

  it('should execute setBackgroundTool cleanly', async () => {
    const input = SetBackgroundSchema.parse({
      mode: 'solid',
      color: '#05070a',
    });

    const output = (await setBackgroundTool.execute(input)) as {
      action: string;
      payload: typeof input;
    };

    expect(output.action).toBe('SET_BACKGROUND');
    expect(output.payload.color).toBe('#05070a');
  });
});
