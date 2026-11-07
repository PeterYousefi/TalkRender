import { describe, it, expect } from 'vitest';
import type { SceneTemplate, PromptTrigger, TemplateCategory } from '../templates';

describe('SceneTemplate & PromptTrigger Types', () => {
  it('should construct a valid PromptTrigger object', () => {
    const trigger: PromptTrigger = {
      id: 'trigger_gravity_well',
      voicePhrase: 'Add a gravity well in the center',
      description: 'Creates a heavy mass in the center attracting surrounding particles',
      toolName: 'create_physics_body',
      args: {
        id: 'center_well',
        x: 400,
        y: 300,
        shape: 'circle',
        radius: 30,
        mass: 100,
        isStatic: true,
      },
    };

    expect(trigger.id).toBe('trigger_gravity_well');
    expect(trigger.toolName).toBe('create_physics_body');
    expect(trigger.voicePhrase).toContain('gravity well');
  });

  it('should construct a comprehensive SceneTemplate object', () => {
    const category: TemplateCategory = 'physics';
    const template: SceneTemplate = {
      id: 'template_physics_playground',
      title: '2D Physics Playground',
      description: 'Interactive kinetic bodies with gravity and collisions',
      category,
      tags: ['physics', 'particles', 'kinetic'],
      badgeColor: '#10b981',
      initialCommands: [
        {
          type: 'SET_BACKGROUND',
          payload: { type: 'solid', color: '#090d16' },
        },
      ],
      voiceTriggers: [
        {
          id: 'trigger_spawn_balls',
          voicePhrase: 'Drop five bouncy balls',
          description: 'Spawns bouncy particles from top',
          toolName: 'create_physics_body',
          args: { count: 5, restitution: 0.9 },
        },
      ],
    };

    expect(template.category).toBe('physics');
    expect(template.initialCommands.length).toBe(1);
    expect(template.voiceTriggers.length).toBe(1);
    expect(template.tags).toContain('particles');
  });
});
