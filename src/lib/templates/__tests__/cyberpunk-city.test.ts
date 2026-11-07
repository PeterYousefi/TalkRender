import { describe, it, expect } from 'vitest';
import { cyberpunkCityTemplate } from '../cyberpunk-city';

describe('Cyberpunk Neon City Scene Template', () => {
  it('should have correct cyberpunk metadata and tags', () => {
    expect(cyberpunkCityTemplate.id).toBe('cyberpunk_city');
    expect(cyberpunkCityTemplate.category).toBe('cyberpunk');
    expect(cyberpunkCityTemplate.tags).toContain('synthwave');
    expect(cyberpunkCityTemplate.tags).toContain('cityscape');
    expect(cyberpunkCityTemplate.badgeColor).toBe('#ec4899');
  });

  it('should define synthwave sun and skyscraper silhouettes in initialCommands', () => {
    const commands = cyberpunkCityTemplate.initialCommands;
    expect(commands.length).toBeGreaterThanOrEqual(5);

    const sun = commands.find(
      (c) => c.type === 'DRAW_SHAPE' && (c.payload as any).id === 'synthwave_sun'
    );
    expect(sun).toBeDefined();
    expect((sun?.payload as any).type).toBe('circle');

    const towers = commands.filter(
      (c) => c.type === 'DRAW_SHAPE' && (c.payload as any).id?.startsWith('tower_')
    );
    expect(towers.length).toBeGreaterThanOrEqual(4);
  });

  it('should offer voice triggers for hovercar, billboard, and matrix rain', () => {
    const triggers = cyberpunkCityTemplate.voiceTriggers;
    expect(triggers.length).toBeGreaterThanOrEqual(3);

    const hovercar = triggers.find((t) => t.id === 'trigger_spawn_hovercar');
    expect(hovercar).toBeDefined();
    expect(hovercar?.toolName).toBe('draw_shape');

    const rain = triggers.find((t) => t.id === 'trigger_turn_on_rain');
    expect(rain).toBeDefined();
    expect(rain?.toolName).toBe('inject_script');
  });

  it('should include custom script with perspective grid and rain animation', () => {
    const script = cyberpunkCityTemplate.customScript;
    expect(script).toBeDefined();
    expect(script?.code).toContain('horizon');
    expect(script?.code).toContain('rainDrops');
  });
});
