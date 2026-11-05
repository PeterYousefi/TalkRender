/**
 * draw_shape tool specification and Zod validator
 */

import { z } from 'zod';
import type { ToolDefinition } from '@/types/canvas-commands';

export const DrawShapeSchema = z.object({
  shape: z.enum(['circle', 'rectangle', 'polygon', 'line', 'star', 'text']),
  x: z.number().default(100),
  y: z.number().default(100),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  radius: z.number().positive().optional(),
  points: z.number().int().min(3).max(12).optional(),
  text: z.string().optional(),
  fontSize: z.number().positive().default(24),
  fontFamily: z.string().default('sans-serif'),
  color: z.string().default('#00f3ff'),
  fill: z.boolean().default(true),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().nonnegative().default(2),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  glow: z.boolean().default(false),
  glowColor: z.string().optional(),
  glowBlur: z.number().nonnegative().default(10),
});

export type DrawShapeInput = z.infer<typeof DrawShapeSchema>;

export const drawShapeTool: ToolDefinition<typeof DrawShapeSchema> = {
  name: 'draw_shape',
  description: 'Draws a 2D geometric shape or text label on the canvas with customizable colors, sizing, and glow effects.',
  schema: DrawShapeSchema,
  declaration: {
    type: 'function',
    name: 'draw_shape',
    description: 'Draws a 2D geometric shape or text label on the canvas with customizable colors, sizing, and glow effects.',
    parameters: {
      type: 'object',
      properties: {
        shape: {
          type: 'string',
          enum: ['circle', 'rectangle', 'polygon', 'line', 'star', 'text'],
          description: 'Type of 2D shape to draw.',
        },
        x: { type: 'number', description: 'X coordinate on the canvas (pixels).' },
        y: { type: 'number', description: 'Y coordinate on the canvas (pixels).' },
        width: { type: 'number', description: 'Width of rectangle/bounding box.' },
        height: { type: 'number', description: 'Height of rectangle/bounding box.' },
        radius: { type: 'number', description: 'Radius for circle or star shape.' },
        color: { type: 'string', description: 'CSS color string (e.g. #00f3ff, cyan, rgba(...)).' },
        glow: { type: 'boolean', description: 'Whether to render a cyberpunk neon bloom.' },
        text: { type: 'string', description: 'Text content if shape is text.' },
      },
      required: ['shape', 'x', 'y'],
    },
  },
  execute: (input) => {
    return {
      action: 'DRAW_SHAPE',
      id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      renderedAt: Date.now(),
      payload: input,
    };
  },
};
