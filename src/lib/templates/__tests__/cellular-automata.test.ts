import { describe, it, expect } from 'vitest';
import { cellularAutomataTemplate } from '../cellular-automata';

describe('Procedural Cellular Automata Scene Template', () => {
  it('should have correct simulation category and tags', () => {
    expect(cellularAutomataTemplate.id).toBe('cellular_automata');
    expect(cellularAutomataTemplate.category).toBe('simulation');
    expect(cellularAutomataTemplate.tags).toContain('game-of-life');
    expect(cellularAutomataTemplate.badgeColor).toBe('#8b5cf6');
  });

  it('should define framing border in initialCommands', () => {
    const commands = cellularAutomataTemplate.initialCommands;
    expect(commands.length).toBeGreaterThanOrEqual(2);

    const frame = commands.find(
      (c) => c.type === 'DRAW_SHAPE' && (c.payload as any).id === 'automata_frame'
    );
    expect(frame).toBeDefined();
    expect((frame?.payload as any).type).toBe('rectangle');
  });

  it('should define voice triggers for glider gun, randomization, and clear', () => {
    const triggers = cellularAutomataTemplate.voiceTriggers;
    expect(triggers.length).toBeGreaterThanOrEqual(3);

    const gliderTrigger = triggers.find((t) => t.id === 'trigger_spawn_glider_gun');
    expect(gliderTrigger).toBeDefined();
    expect(gliderTrigger?.toolName).toBe('inject_script');

    const randTrigger = triggers.find((t) => t.id === 'trigger_randomize_grid');
    expect(randTrigger).toBeDefined();
  });

  it('should implement Conway B3/S23 simulation step and pattern injector in customScript', () => {
    const script = cellularAutomataTemplate.customScript;
    expect(script).toBeDefined();
    expect(script?.code).toContain('COLS');
    expect(script?.code).toContain('window.__injectPattern');
    expect(script?.code).toContain('window.__randomizeCells');
    expect(script?.code).toContain('window.__clearCells');
  });
});
