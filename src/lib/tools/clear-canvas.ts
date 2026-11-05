/**
 * clear_canvas tool specification and Zod validator
 */

import { z } from 'zod';
import type { ToolDefinition } from '@/types/canvas-commands';

export const ClearCanvasSchema = z.object({
  preserveBackground: z.boolean().default(true),
  clearType: z.enum(['all', 'shapes_only', 'physics_only']).default('all'),
  fadeDurationMs: z.number().nonnegative().default(0),
});

export type ClearCanvasInput = z.infer<typeof ClearCanvasSchema>;

export const clearCanvasTool: ToolDefinition<typeof ClearCanvasSchema> = {
  name: 'clear_canvas',
  description: 'Clears rendered objects, physics bodies, or entire canvas with optional state wipe and transition fade.',
  schema: ClearCanvasSchema,
  declaration: {
    type: 'function',
    name: 'clear_canvas',
    description: 'Clears rendered objects, physics bodies, or entire canvas with optional state wipe and transition fade.',
    parameters: {
      type: 'object',
      properties: {
        preserveBackground: {
          type: 'boolean',
          description: 'Keep the current background color/grid intact.',
        },
        clearType: {
          type: 'string',
          enum: ['all', 'shapes_only', 'physics_only'],
          description: 'Category of canvas elements to clear.',
        },
        fadeDurationMs: {
          type: 'number',
          description: 'Transition fade duration in milliseconds (0 for immediate).',
        },
      },
    },
  },
  execute: (input) => {
    return {
      action: 'CLEAR_CANVAS',
      clearedAt: Date.now(),
      payload: input,
    };
  },
};
