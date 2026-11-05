import { describe, it, expect } from 'vitest';
import { DrawShapeSchema, drawShapeTool } from '../draw-shape';

describe('draw_shape Tool Validator & Execution', () => {
  it('should validate valid circle shape with default attributes', () => {
    const input = {
      shape: 'circle',
      x: 150,
      y: 200,
      radius: 40,
    };

    const parsed = DrawShapeSchema.parse(input);
    expect(parsed.shape).toBe('circle');
    expect(parsed.x).toBe(150);
    expect(parsed.y).toBe(200);
    expect(parsed.radius).toBe(40);
    expect(parsed.color).toBe('#00f3ff');
    expect(parsed.fill).toBe(true);
    expect(parsed.opacity).toBe(1);
    expect(parsed.glow).toBe(false);
  });

  it('should validate rectangle with custom neon styling', () => {
    const input = {
      shape: 'rectangle',
      x: 50,
      y: 80,
      width: 300,
      height: 180,
      color: '#ff007f',
      glow: true,
      glowColor: '#ff007f',
      glowBlur: 20,
    };

    const parsed = DrawShapeSchema.parse(input);
    expect(parsed.width).toBe(300);
    expect(parsed.height).toBe(180);
    expect(parsed.color).toBe('#ff007f');
    expect(parsed.glow).toBe(true);
    expect(parsed.glowBlur).toBe(20);
  });

  it('should reject invalid shape type', () => {
    const input = {
      shape: 'triangle_unsupported',
      x: 10,
      y: 10,
    };

    const result = DrawShapeSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject negative coordinates or dimensions if constrained', () => {
    const input = {
      shape: 'circle',
      x: 100,
      y: 100,
      radius: -25,
    };

    const result = DrawShapeSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should execute drawShapeTool and return formatted payload', async () => {
    const valid = DrawShapeSchema.parse({
      shape: 'star',
      x: 250,
      y: 300,
      radius: 50,
      points: 5,
    });

    const output = (await drawShapeTool.execute(valid)) as {
      action: string;
      id: string;
      payload: typeof valid;
    };

    expect(output.action).toBe('DRAW_SHAPE');
    expect(output.id).toMatch(/^shape_\d+/);
    expect(output.payload.shape).toBe('star');
  });
});
