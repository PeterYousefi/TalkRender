/**
 * set_background tool specification and Zod validator
 */

import { z } from 'zod';
import type { ToolDefinition } from '@/types/canvas-commands';

export const SetBackgroundSchema = z.object({
  mode: z.enum(['solid', 'gradient', 'grid', 'cyberpunk-mesh', 'transparent']).default('solid'),
  color: z.string().default('#0a0d14'),
  gradientColors: z.array(z.string()).min(2).optional(),
  gradientType: z.enum(['linear', 'radial']).default('linear'),
  gradientAngle: z.number().default(135),
  gridSize: z.number().positive().default(25),
  gridColor: z.string().default('rgba(0, 243, 255, 0.12)'),
  animate: z.boolean().default(false),
});

export type SetBackgroundInput = z.infer<typeof SetBackgroundSchema>;

export const setBackgroundTool: ToolDefinition<typeof SetBackgroundSchema> = {
  name: 'set_background',
  description: 'Sets canvas background with solid colors, linear/radial gradients, cyberpunk tech grids, or transparent overlays.',
  schema: SetBackgroundSchema,
  declaration: {
    type: 'function',
    name: 'set_background',
    description: 'Sets canvas background with solid colors, linear/radial gradients, cyberpunk tech grids, or transparent overlays.',
    parameters: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['solid', 'gradient', 'grid', 'cyberpunk-mesh', 'transparent'],
          description: 'Background styling mode.',
        },
        color: { type: 'string', description: 'Primary background color hex or CSS string.' },
        gradientColors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of color stops for gradient mode.',
        },
        gridSize: { type: 'number', description: 'Pixel size of grid cells.' },
        animate: { type: 'boolean', description: 'Whether to enable subtle background pulse animation.' },
      },
    },
  },
  execute: (input) => {
    return {
      action: 'SET_BACKGROUND',
      timestamp: Date.now(),
      payload: input,
    };
  },
};
