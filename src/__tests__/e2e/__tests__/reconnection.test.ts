import { describe, it, expect } from 'vitest';
import { ReconnectionSimulator } from '../reconnection-simulator';

describe('Network Degradation & Reconnection Resilience', () => {
  it('should transition through reconnecting state and recover connection', () => {
    const simulator = new ReconnectionSimulator();
    const result = simulator.simulateNetworkDropAndRecovery();

    expect(result.initialStatus).toBe('connected');
    expect(result.transientDropStatus).toBe('reconnecting');
    expect(result.recoveredStatus).toBe('connected');
    expect(result.reconnectAttempts).toBe(1);
  });

  it('should initialize Boson client and LiveKit manager with retry limits', () => {
    const simulator = new ReconnectionSimulator();
    const boson = simulator.getBosonClient();
    const livekit = simulator.getLiveKitManager();

    expect(boson.getStatus()).toBe('idle');
    expect(livekit.getSnapshot().status).toBe('disconnected');
  });
});
