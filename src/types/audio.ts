/**
 * Audio Stream & Real-time Telemetry Type Definitions
 */

export interface AudioTelemetry {
  rms: number;
  dbfs: number;
  peak: number;
  isSpeaking: boolean;
  roundTripTimeMs: number;
  audioBufferLatencyMs: number;
  frameRenderTimeMs?: number;
}

export interface BargeInEvent {
  detectedAt: number;
  energyThreshold: number;
  speechDurationMs: number;
  interruptedResponseId?: string;
  interruptedItemIds: string[];
}

export interface AudioBufferFrame {
  data: Float32Array | Int16Array;
  sampleRate: number;
  channels: number;
  timestamp: number;
}

export interface VisemeFrame {
  timestamp: number;
  visemeId: number;
  blendShapes: Record<string, number>;
}
