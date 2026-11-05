/**
 * Canvas Commands & ComplexFuncBench Tool Calling Schema Types
 */

import { z } from 'zod';

export type CanvasToolName =
  | 'draw_shape'
  | 'set_background'
  | 'create_physics_body'
  | 'clear_canvas'
  | 'inject_script'
  | 'update_style';

export type ToolExecutionStatus =
  | 'queued'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface ToolExecutionItem<T = Record<string, unknown>> {
  id: string;
  callId: string;
  name: CanvasToolName;
  args: T;
  status: ToolExecutionStatus;
  queuedAt: number;
  executedAt?: number;
  durationMs?: number;
  result?: unknown;
  error?: string;
  rollbackPayload?: unknown;
}

export interface JsonSchemaProperty {
  type: string;
  description?: string;
  enum?: string[] | number[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  default?: unknown;
}

export interface BosonToolDeclaration {
  type: 'function';
  name: CanvasToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
}

export interface ToolDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  name: CanvasToolName;
  description: string;
  schema: TSchema;
  declaration: BosonToolDeclaration;
  execute: (args: z.infer<TSchema>, context?: Record<string, unknown>) => Promise<unknown> | unknown;
}

export type CanvasCommandAction =
  | { type: 'DRAW_SHAPE'; payload: unknown }
  | { type: 'SET_BACKGROUND'; payload: unknown }
  | { type: 'CREATE_PHYSICS_BODY'; payload: unknown }
  | { type: 'CLEAR_CANVAS'; payload: unknown }
  | { type: 'INJECT_SCRIPT'; payload: unknown }
  | { type: 'UPDATE_STYLE'; payload: unknown }
  | { type: 'ROLLBACK_ACTION'; payload: { actionId: string } };

export interface CanvasSandboxMessage {
  source: 'talkrender-host';
  action: CanvasCommandAction;
  callId: string;
  timestamp: number;
}
