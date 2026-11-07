import { describe, it, expect } from 'vitest';
import { physicsPlaygroundTemplate } from '../physics-playground';

describe('Physics Playground Scene Template', () => {
  it('should have correct metadata and category', () => {
    expect(physicsPlaygroundTemplate.id).toBe('physics_playground');
    expect(physicsPlaygroundTemplate.category).toBe('physics');
    expect(physicsPlaygroundTemplate.tags).toContain('gravity');
    expect(physicsPlaygroundTemplate.badgeColor).toBe('#10b981');
  });

  it('should contain ground boundaries and bouncing orbs in initial commands', () => {
    const commands = physicsPlaygroundTemplate.initialCommands;
    expect(commands.length).toBeGreaterThanOrEqual(4);

    const bgCmd = commands.find((c) => c.type === 'SET_BACKGROUND');
    expect(bgCmd).toBeDefined();

    const floorCmd = commands.find(
      (c) => c.type === 'CREATE_PHYSICS_BODY' && (c.payload as any).id === 'floor_boundary'
    );
    expect(floorCmd).toBeDefined();
    expect((floorCmd?.payload as any).isStatic).toBe(true);
  });

  it('should define voice triggers for spawning crates and clearing particles', () => {
    const triggers = physicsPlaygroundTemplate.voiceTriggers;
    expect(triggers.length).toBeGreaterThanOrEqual(3);

    const crateTrigger = triggers.find((t) => t.id === 'trigger_spawn_heavy_crate');
    expect(crateTrigger).toBeDefined();
    expect(crateTrigger?.toolName).toBe('create_physics_body');
    expect((crateTrigger?.args as any).mass).toBe(10);

    const clearTrigger = triggers.find((t) => t.id === 'trigger_clear_particles');
    expect(clearTrigger).toBeDefined();
    expect(clearTrigger?.toolName).toBe('clear_canvas');
  });

  it('should include custom script for kinetic trails', () => {
    expect(physicsPlaygroundTemplate.customScript).toBeDefined();
    expect(physicsPlaygroundTemplate.customScript?.runtime).toBe('canvas2d');
    expect(physicsPlaygroundTemplate.customScript?.code).toContain('window.onPhysicsTick');
  });
});
