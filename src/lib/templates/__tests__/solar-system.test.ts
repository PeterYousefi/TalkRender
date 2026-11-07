import { describe, it, expect } from 'vitest';
import { solarSystemTemplate } from '../solar-system';

describe('Interactive Solar System Scene Template', () => {
  it('should have correct space category and tags', () => {
    expect(solarSystemTemplate.id).toBe('solar_system');
    expect(solarSystemTemplate.category).toBe('space');
    expect(solarSystemTemplate.tags).toContain('astronomy');
    expect(solarSystemTemplate.tags).toContain('orbits');
    expect(solarSystemTemplate.badgeColor).toBe('#f59e0b');
  });

  it('should define central sun, orbit rings, and planets in initialCommands', () => {
    const commands = solarSystemTemplate.initialCommands;
    expect(commands.length).toBeGreaterThanOrEqual(6);

    const sun = commands.find(
      (c) => c.type === 'DRAW_SHAPE' && (c.payload as any).id === 'central_sun'
    );
    expect(sun).toBeDefined();

    const orbits = commands.filter(
      (c) => c.type === 'DRAW_SHAPE' && (c.payload as any).id?.startsWith('orbit_')
    );
    expect(orbits.length).toBeGreaterThanOrEqual(4);

    const earth = commands.find(
      (c) => c.type === 'DRAW_SHAPE' && (c.payload as any).id === 'planet_earth'
    );
    expect(earth).toBeDefined();
  });

  it('should define voice triggers for comets, flares, and asteroid belts', () => {
    const triggers = solarSystemTemplate.voiceTriggers;
    expect(triggers.length).toBeGreaterThanOrEqual(3);

    const flare = triggers.find((t) => t.id === 'trigger_solar_flare');
    expect(flare).toBeDefined();
    expect(flare?.toolName).toBe('update_style');

    const comet = triggers.find((t) => t.id === 'trigger_spawn_comet');
    expect(comet).toBeDefined();
  });

  it('should include custom script calculating orbits and moon dynamics', () => {
    const script = solarSystemTemplate.customScript;
    expect(script).toBeDefined();
    expect(script?.code).toContain('earthX');
    expect(script?.code).toContain('moonX');
    expect(script?.code).toContain('marsX');
  });
});
