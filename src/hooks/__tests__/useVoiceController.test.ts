import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVoiceController } from '../useVoiceController';

describe('useVoiceController Hook & Natural Language Parser', () => {
  it('should parse geometric shape drawing commands accurately', () => {
    const { result } = renderHook(() => useVoiceController());

    const circleCmd = result.current.parseVoiceCommand('please draw a glowing cyan circle');
    expect(circleCmd.matched).toBe(true);
    expect(circleCmd.toolName).toBe('draw_shape');
    expect(circleCmd.action?.type).toBe('DRAW_SHAPE');
    expect(circleCmd.action?.payload).toHaveProperty('shape', 'circle');
    expect(circleCmd.action?.payload).toHaveProperty('color', '#00f3ff');

    const starCmd = result.current.parseVoiceCommand('create a red star on canvas');
    expect(starCmd.matched).toBe(true);
    expect(starCmd.action?.payload).toHaveProperty('shape', 'star');
    expect(starCmd.action?.payload).toHaveProperty('color', '#ff0055');
  });

  it('should parse template trigger directives for matrix, physics, and solar system', () => {
    const { result } = renderHook(() => useVoiceController());

    const matrixCmd = result.current.parseVoiceCommand('start matrix rain');
    expect(matrixCmd.matched).toBe(true);
    expect(matrixCmd.templateId).toBe('cyberpunk_city');

    const physicsCmd = result.current.parseVoiceCommand('enable gravity and bouncing balls');
    expect(physicsCmd.matched).toBe(true);
    expect(physicsCmd.templateId).toBe('physics_playground');

    const solarCmd = result.current.parseVoiceCommand('show me the solar system planets');
    expect(solarCmd.matched).toBe(true);
    expect(solarCmd.templateId).toBe('solar_system');
  });

  it('should parse clear and rollback voice directives', () => {
    const { result } = renderHook(() => useVoiceController());

    const clearCmd = result.current.parseVoiceCommand('clear the canvas now');
    expect(clearCmd.matched).toBe(true);
    expect(clearCmd.toolName).toBe('clear_canvas');
    expect(clearCmd.action?.type).toBe('CLEAR_CANVAS');

    const rollbackCmd = result.current.parseVoiceCommand('undo last action');
    expect(rollbackCmd.matched).toBe(true);
    expect(rollbackCmd.toolName).toBe('rollback');
  });
});
