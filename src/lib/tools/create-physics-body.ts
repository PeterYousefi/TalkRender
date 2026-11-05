/**
 * create_physics_body tool specification and Zod validator
 */

import { z } from 'zod';
import type { ToolDefinition } from '@/types/canvas-commands';

export const CreatePhysicsBodySchema = z.object({
  bodyType: z.enum(['circle', 'rectangle', 'particle_emitter']).default('circle'),
  x: z.number().default(200),
  y: z.number().default(100),
  radius: z.number().positive().default(20),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  mass: z.number().positive().default(1),
  velocityX: z.number().default(0),
  velocityY: z.number().default(0),
  restitution: z.number().min(0).max(1).default(0.8),
  friction: z.number().min(0).max(1).default(0.05),
  isStatic: z.boolean().default(false),
  gravityScale: z.number().default(1),
  color: z.string().default('#00ff66'),
  trail: z.boolean().default(true),
});

export type CreatePhysicsBodyInput = z.infer<typeof CreatePhysicsBodySchema>;

export const createPhysicsBodyTool: ToolDefinition<typeof CreatePhysicsBodySchema> = {
  name: 'create_physics_body',
  description: 'Spawns an interactive 2D physics body with velocity, gravity, collisions, and particle trails.',
  schema: CreatePhysicsBodySchema,
  declaration: {
    type: 'function',
    name: 'create_physics_body',
    description: 'Spawns an interactive 2D physics body with velocity, gravity, collisions, and particle trails.',
    parameters: {
      type: 'object',
      properties: {
        bodyType: {
          type: 'string',
          enum: ['circle', 'rectangle', 'particle_emitter'],
          description: 'Type of physics body to spawn.',
        },
        x: { type: 'number', description: 'Initial X coordinate (pixels).' },
        y: { type: 'number', description: 'Initial Y coordinate (pixels).' },
        radius: { type: 'number', description: 'Radius if circular body.' },
        mass: { type: 'number', description: 'Mass of the physics body in kg.' },
        velocityX: { type: 'number', description: 'Initial horizontal velocity.' },
        velocityY: { type: 'number', description: 'Initial vertical velocity.' },
        restitution: { type: 'number', description: 'Bounciness coefficient between 0 and 1.' },
        isStatic: { type: 'boolean', description: 'Whether the body is an unmovable obstacle.' },
        color: { type: 'string', description: 'Hex or CSS color string.' },
      },
    },
  },
  execute: (input) => {
    return {
      action: 'CREATE_PHYSICS_BODY',
      bodyId: `phys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      payload: input,
    };
  },
};
