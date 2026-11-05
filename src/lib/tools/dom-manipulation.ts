/**
 * inject_script and update_style tool specifications and Zod validators
 */

import { z } from 'zod';
import type { ToolDefinition } from '@/types/canvas-commands';

export const InjectScriptSchema = z.object({
  code: z.string().min(1),
  runtime: z.enum(['canvas2d', 'webgl', 'dom']).default('canvas2d'),
  id: z.string().optional(),
  isolated: z.boolean().default(true),
});

export type InjectScriptInput = z.infer<typeof InjectScriptSchema>;

export const injectScriptTool: ToolDefinition<typeof InjectScriptSchema> = {
  name: 'inject_script',
  description: 'Dynamically executes sandboxed JavaScript/Canvas animation or rendering logic inside the isolated canvas runtime.',
  schema: InjectScriptSchema,
  declaration: {
    type: 'function',
    name: 'inject_script',
    description: 'Dynamically executes sandboxed JavaScript/Canvas animation or rendering logic inside the isolated canvas runtime.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Raw JavaScript snippet to execute in sandbox.' },
        runtime: {
          type: 'string',
          enum: ['canvas2d', 'webgl', 'dom'],
          description: 'Target rendering context.',
        },
        id: { type: 'string', description: 'Unique tag for tracking or updating this script.' },
      },
      required: ['code'],
    },
  },
  execute: (input) => {
    return {
      action: 'INJECT_SCRIPT',
      scriptId: input.id || `script_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      injectedAt: Date.now(),
      payload: input,
    };
  },
};

export const UpdateStyleSchema = z.object({
  selector: z.string().default('canvas'),
  styles: z.record(z.string(), z.union([z.string(), z.number()])),
  transitionMs: z.number().nonnegative().default(300),
});

export type UpdateStyleInput = z.infer<typeof UpdateStyleSchema>;

export const updateStyleTool: ToolDefinition<typeof UpdateStyleSchema> = {
  name: 'update_style',
  description: 'Applies CSS filters, transforms, and style properties to canvas or DOM elements with animated transitions.',
  schema: UpdateStyleSchema,
  declaration: {
    type: 'function',
    name: 'update_style',
    description: 'Applies CSS filters, transforms, and style properties to canvas or DOM elements with animated transitions.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector targeting the element.' },
        styles: {
          type: 'object',
          description: 'Key-value map of CSS rules (e.g. filter, transform, opacity).',
        },
        transitionMs: { type: 'number', description: 'CSS transition duration in milliseconds.' },
      },
      required: ['styles'],
    },
  },
  execute: (input) => {
    return {
      action: 'UPDATE_STYLE',
      updatedAt: Date.now(),
      payload: input,
    };
  },
};
