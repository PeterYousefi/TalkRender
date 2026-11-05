/**
 * Unified Tool Registry & ComplexFuncBench Schema Exporter
 */

import type { CanvasToolName, ToolDefinition, BosonToolDeclaration } from '@/types/canvas-commands';
import { drawShapeTool } from './draw-shape';
import { setBackgroundTool } from './set-background';
import { createPhysicsBodyTool } from './create-physics-body';
import { clearCanvasTool } from './clear-canvas';
import { injectScriptTool, updateStyleTool } from './dom-manipulation';

export class ToolRegistry {
  private tools: Map<CanvasToolName, ToolDefinition> = new Map();

  constructor() {
    this.register(drawShapeTool as unknown as ToolDefinition);
    this.register(setBackgroundTool as unknown as ToolDefinition);
    this.register(createPhysicsBodyTool as unknown as ToolDefinition);
    this.register(clearCanvasTool as unknown as ToolDefinition);
    this.register(injectScriptTool as unknown as ToolDefinition);
    this.register(updateStyleTool as unknown as ToolDefinition);
  }

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): ToolDefinition | undefined {
    return this.tools.get(name as CanvasToolName);
  }

  public has(name: string): boolean {
    return this.tools.has(name as CanvasToolName);
  }

  public getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getDeclarations(): BosonToolDeclaration[] {
    return this.getAll().map((t) => t.declaration);
  }

  public async validateAndExecute(
    name: string,
    rawArgs: string | Record<string, unknown>,
    context?: Record<string, unknown>
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const tool = this.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Unknown canvas tool: "${name}"`,
      };
    }

    try {
      const parsedArgs =
        typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;

      const validated = tool.schema.parse(parsedArgs);
      const result = await tool.execute(validated, context);

      return {
        success: true,
        result,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Validation or execution failed for "${name}": ${errorMessage}`,
      };
    }
  }
}

export const toolRegistry = new ToolRegistry();
