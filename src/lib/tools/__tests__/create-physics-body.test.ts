import { describe, it, expect } from 'vitest';
import { CreatePhysicsBodySchema, createPhysicsBodyTool } from '../create-physics-body';

describe('create_physics_body Tool Validator & Execution', () => {
  it('should validate default circle dynamic body', () => {
    const parsed = CreatePhysicsBodySchema.parse({});
    expect(parsed.bodyType).toBe('circle');
    expect(parsed.x).toBe(200);
    expect(parsed.y).toBe(100);
    expect(parsed.radius).toBe(20);
    expect(parsed.mass).toBe(1);
    expect(parsed.restitution).toBe(0.8);
    expect(parsed.isStatic).toBe(false);
    expect(parsed.trail).toBe(true);
  });

  it('should validate static platform rectangle', () => {
    const input = {
      bodyType: 'rectangle',
      x: 300,
      y: 550,
      width: 400,
      height: 30,
      isStatic: true,
      friction: 0.8,
      color: '#ffb700',
    };

    const parsed = CreatePhysicsBodySchema.parse(input);
    expect(parsed.bodyType).toBe('rectangle');
    expect(parsed.width).toBe(400);
    expect(parsed.height).toBe(30);
    expect(parsed.isStatic).toBe(true);
    expect(parsed.friction).toBe(0.8);
  });

  it('should reject restitution greater than 1.0', () => {
    const result = CreatePhysicsBodySchema.safeParse({ restitution: 1.5 });
    expect(result.success).toBe(false);
  });

  it('should reject negative mass', () => {
    const result = CreatePhysicsBodySchema.safeParse({ mass: -5 });
    expect(result.success).toBe(false);
  });

  it('should execute createPhysicsBodyTool and generate unique bodyId', async () => {
    const input = CreatePhysicsBodySchema.parse({
      bodyType: 'particle_emitter',
      x: 120,
      y: 120,
      velocityX: 50,
      velocityY: -80,
    });

    const output = (await createPhysicsBodyTool.execute(input)) as {
      action: string;
      bodyId: string;
      payload: typeof input;
    };

    expect(output.action).toBe('CREATE_PHYSICS_BODY');
    expect(output.bodyId).toMatch(/^phys_\d+/);
    expect(output.payload.velocityX).toBe(50);
  });
});
