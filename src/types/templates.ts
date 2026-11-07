/**
 * Scene Templates & Voice Prompt Library Type Definitions
 */

import type { CanvasCommandAction, CanvasToolName } from './canvas-commands';

export type TemplateCategory =
  | 'physics'
  | 'cyberpunk'
  | 'space'
  | 'generative'
  | 'simulation';

export interface PromptTrigger {
  id: string;
  voicePhrase: string;
  description: string;
  toolName: CanvasToolName;
  args: Record<string, unknown>;
}

export interface SceneTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  badgeColor?: string;
  initialCommands: CanvasCommandAction[];
  voiceTriggers: PromptTrigger[];
  customScript?: {
    id: string;
    code: string;
    runtime: 'canvas2d' | 'webgl' | 'dom';
  };
}

export interface TemplateFilterOptions {
  category?: TemplateCategory | 'all';
  searchQuery?: string;
  tag?: string;
}
