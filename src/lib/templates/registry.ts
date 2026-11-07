/**
 * Scene Template & Prompt Trigger Registry
 * Indexes pre-built scenes, manages search/filter, and generates initial command payloads.
 */

import { physicsPlaygroundTemplate } from './physics-playground';
import { cyberpunkCityTemplate } from './cyberpunk-city';
import { solarSystemTemplate } from './solar-system';
import { cellularAutomataTemplate } from './cellular-automata';
import type {
  SceneTemplate,
  TemplateFilterOptions,
  PromptTrigger,
} from '@/types/templates';
import type { CanvasCommandAction } from '@/types/canvas-commands';

export class TemplateRegistry {
  private templates: Map<string, SceneTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    const defaults = [
      physicsPlaygroundTemplate,
      cyberpunkCityTemplate,
      solarSystemTemplate,
      cellularAutomataTemplate,
    ];

    defaults.forEach((t) => this.registerTemplate(t));
  }

  public registerTemplate(template: SceneTemplate): void {
    this.templates.set(template.id, template);
  }

  public getTemplateById(id: string): SceneTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): SceneTemplate[] {
    return Array.from(this.templates.values());
  }

  public filterTemplates(options: TemplateFilterOptions = {}): SceneTemplate[] {
    let result = this.getAllTemplates();

    if (options.category && options.category !== 'all') {
      result = result.filter((t) => t.category === options.category);
    }

    if (options.tag) {
      const tagLower = options.tag.toLowerCase();
      result = result.filter((t) => t.tags.some((tag) => tag.toLowerCase() === tagLower));
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const query = options.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          t.voiceTriggers.some((v) => v.voicePhrase.toLowerCase().includes(query))
      );
    }

    return result;
  }

  public getAllVoiceTriggers(): PromptTrigger[] {
    const triggers: PromptTrigger[] = [];
    this.templates.forEach((template) => {
      triggers.push(...template.voiceTriggers);
    });
    return triggers;
  }

  public findMatchingVoiceTrigger(spokenPhrase: string): PromptTrigger | undefined {
    const normalized = spokenPhrase.toLowerCase().trim();
    const allTriggers = this.getAllVoiceTriggers();

    // Exact or substring match
    return allTriggers.find((t) => {
      const triggerNorm = t.voicePhrase.toLowerCase();
      return (
        normalized.includes(triggerNorm) ||
        triggerNorm.includes(normalized) ||
        t.description.toLowerCase().includes(normalized)
      );
    });
  }

  public generateInitializationCommands(templateId: string): CanvasCommandAction[] {
    const template = this.getTemplateById(templateId);
    if (!template) return [];

    const commands: CanvasCommandAction[] = [
      // First clear canvas and reset state
      {
        type: 'CLEAR_CANVAS',
        payload: { resetState: true },
      },
      ...template.initialCommands,
    ];

    if (template.customScript) {
      commands.push({
        type: 'INJECT_SCRIPT',
        payload: {
          scriptId: template.customScript.id,
          code: template.customScript.code,
        },
      });
    }

    return commands;
  }
}

export const templateRegistry = new TemplateRegistry();
