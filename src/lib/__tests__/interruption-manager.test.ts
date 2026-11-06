import { describe, it, expect, vi } from 'vitest';
import { InterruptionManager } from '../interruption-manager';
import { BargeInDetector } from '../barge-in-detector';
import type { AudioBufferController } from '../audio-buffer-controller';
import type { BosonRealtimeClient } from '../boson-client';
import type { ToolExecutionQueue } from '../tool-queue';
import type { SandboxBridge } from '../sandbox-bridge';
import type { ToolExecutionItem } from '@/types/canvas-commands';

describe('InterruptionManager', () => {
  it('should coordinate audio cutoff, boson interrupt, and tool rollback on barge-in', () => {
    const detector = new BargeInDetector({ minSpeechDurationMs: 50 });

    const mockAudioController = {
      interruptPlayback: vi.fn(),
    } as unknown as AudioBufferController;

    const mockBosonClient = {
      interrupt: vi.fn(),
    } as unknown as BosonRealtimeClient;

    const mockRolledBackItem: ToolExecutionItem = {
      id: 'item_123',
      callId: 'call_123',
      name: 'draw_shape',
      args: {},
      status: 'rolled_back',
      queuedAt: 1000,
    };

    const mockToolQueue = {
      clear: vi.fn(),
      rollbackLast: vi.fn().mockReturnValue(mockRolledBackItem),
    } as unknown as ToolExecutionQueue;

    const mockSandboxBridge = {
      sendCommand: vi.fn().mockResolvedValue({ durationMs: 1, elementsCount: 0 }),
    } as unknown as SandboxBridge;

    const manager = new InterruptionManager({
      bargeInDetector: detector,
      audioController: mockAudioController,
      bosonClient: mockBosonClient,
      toolQueue: mockToolQueue,
      sandboxBridge: mockSandboxBridge,
      rollbackOnInterruption: true,
    });

    const listener = vi.fn();
    manager.subscribe(listener);

    // Feed speech to trigger barge-in
    detector.feedDbfs(-20, 1000);
    detector.feedDbfs(-20, 1060);

    // Verify audio suppression
    expect(mockAudioController.interruptPlayback).toHaveBeenCalledTimes(1);

    // Verify Boson cancellation
    expect(mockBosonClient.interrupt).toHaveBeenCalledTimes(1);

    // Verify queue clear and rollback
    expect(mockToolQueue.clear).toHaveBeenCalledTimes(1);
    expect(mockToolQueue.rollbackLast).toHaveBeenCalledTimes(1);

    // Verify bridge message
    expect(mockSandboxBridge.sendCommand).toHaveBeenCalledWith(
      'rollback_item_123',
      {
        type: 'ROLLBACK_ACTION',
        payload: { actionId: 'item_123' },
      }
    );

    // Verify state & notification
    expect(manager.getState().isInterrupted).toBe(true);
    expect(manager.getState().interruptionCount).toBe(1);
    expect(listener).toHaveBeenCalled();
  });

  it('should reset isInterrupted on speech_ended event', () => {
    const detector = new BargeInDetector({ minSpeechDurationMs: 50, silenceThresholdMs: 200 });
    const manager = new InterruptionManager({ bargeInDetector: detector });

    detector.feedDbfs(-20, 1000);
    detector.feedDbfs(-20, 1060);
    expect(manager.getState().isInterrupted).toBe(true);

    // Sustained silence
    detector.feedDbfs(-60, 1100);
    detector.feedDbfs(-60, 1350);

    expect(manager.getState().isInterrupted).toBe(false);
  });

  it('should allow triggering manual interruption', () => {
    const mockBosonClient = {
      interrupt: vi.fn(),
    } as unknown as BosonRealtimeClient;

    const manager = new InterruptionManager({ bosonClient: mockBosonClient });
    manager.triggerManualInterruption();

    expect(manager.getState().isInterrupted).toBe(true);
    expect(mockBosonClient.interrupt).toHaveBeenCalled();
  });
});
