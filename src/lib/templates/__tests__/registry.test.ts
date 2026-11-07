import { describe, it, expect } from 'vitest';
import { TemplateRegistry } from '../registry';

describe('TemplateRegistry', () => {
  it('should register and return all 4 default scene templates', () => {
    const registry = new TemplateRegistry();
    const all = registry.getAllTemplates();

    expect(all.length).toBe(4);
    const ids = all.map((t) => t.id);
    expect(ids).toContain('physics_playground');
    expect(ids).toContain('cyberpunk_city');
    expect(ids).toContain('solar_system');
    expect(ids).toContain('cellular_automata');
  });

  it('should filter templates by category', () => {
    const registry = new TemplateRegistry();

    const physics = registry.filterTemplates({ category: 'physics' });
    expect(physics.length).toBe(1);
    expect(physics[0].id).toBe('physics_playground');

    const space = registry.filterTemplates({ category: 'space' });
    expect(space.length).toBe(1);
    expect(space[0].id).toBe('solar_system');
  });

  it('should search templates by keyword or tag', () => {
    const registry = new TemplateRegistry();

    const synthResults = registry.filterTemplates({ searchQuery: 'synthwave' });
    expect(synthResults.length).toBe(1);
    expect(synthResults[0].id).toBe('cyberpunk_city');

    const orbitResults = registry.filterTemplates({ tag: 'orbits' });
    expect(orbitResults.length).toBe(1);
    expect(orbitResults[0].id).toBe('solar_system');
  });

  it('should find matching voice triggers from spoken queries', () => {
    const registry = new TemplateRegistry();

    const trigger1 = registry.findMatchingVoiceTrigger('Could you drop a heavy steel crate in the middle please?');
    expect(trigger1).toBeDefined();
    expect(trigger1?.id).toBe('trigger_spawn_heavy_crate');

    const trigger2 = registry.findMatchingVoiceTrigger('trigger coronal mass ejection');
    expect(trigger2).toBeDefined();
    expect(trigger2?.id).toBe('trigger_solar_flare');
  });

  it('should generate complete initialization commands with script injection', () => {
    const registry = new TemplateRegistry();
    const commands = registry.generateInitializationCommands('solar_system');

    expect(commands.length).toBeGreaterThan(5);
    expect(commands[0].type).toBe('CLEAR_CANVAS');
    expect(commands[commands.length - 1].type).toBe('INJECT_SCRIPT');
  });
});
