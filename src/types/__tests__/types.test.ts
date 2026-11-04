import { describe, it, expect } from 'vitest';
import type { HiggsRealtimeConfig, BosonRealtimeServerMessage } from '../boson';
import type { LiveKitRoomConfig, LiveKitTokenRequest } from '../livekit';
import type { AudioTelemetry, BargeInEvent } from '../audio';

describe('Type Integrity & Schema Contracts', () => {
  it('should construct valid HiggsRealtimeConfig object', () => {
    const config: HiggsRealtimeConfig = {
      model: 'higgs-realtime-v1',
      modalities: ['audio', 'text'],
      voice: 'cyber-pilot-1',
      turnDetection: {
        type: 'server_vad',
        threshold: 0.5,
        silenceDurationMs: 400,
      },
      avatar: {
        avatarId: 'higgs-avatar-cyber-copilot',
        resolution: '720p',
        fps: 30,
      },
    };

    expect(config.model).toBe('higgs-realtime-v1');
    expect(config.modalities).toContain('audio');
    expect(config.avatar?.resolution).toBe('720p');
  });

  it('should validate BosonRealtimeServerMessage variants', () => {
    const speechEvent: BosonRealtimeServerMessage = {
      type: 'input_audio_buffer.speech_started',
      audioStartMs: 120,
      itemId: 'msg_01',
    };

    expect(speechEvent.type).toBe('input_audio_buffer.speech_started');
    if (speechEvent.type === 'input_audio_buffer.speech_started') {
      expect(speechEvent.audioStartMs).toBe(120);
    }
  });

  it('should validate LiveKit configuration structures', () => {
    const tokenReq: LiveKitTokenRequest = {
      roomName: 'test-canvas-room',
      identity: 'developer-user-1',
      metadata: { role: 'director' },
    };

    const roomConfig: LiveKitRoomConfig = {
      url: 'wss://demo.livekit.cloud',
      token: 'jwt-mock-token',
      adaptiveStream: true,
      dynacast: true,
    };

    expect(tokenReq.roomName).toBe('test-canvas-room');
    expect(roomConfig.adaptiveStream).toBe(true);
  });

  it('should validate AudioTelemetry and BargeIn structures', () => {
    const telemetry: AudioTelemetry = {
      rms: 0.42,
      dbfs: -18.5,
      peak: 0.88,
      isSpeaking: true,
      roundTripTimeMs: 45,
      audioBufferLatencyMs: 12,
    };

    const bargeIn: BargeInEvent = {
      detectedAt: Date.now(),
      energyThreshold: 0.35,
      speechDurationMs: 150,
      interruptedItemIds: ['item-42'],
    };

    expect(telemetry.isSpeaking).toBe(true);
    expect(bargeIn.interruptedItemIds).toHaveLength(1);
  });
});
