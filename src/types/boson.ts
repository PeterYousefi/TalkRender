/**
 * Boson AI Higgs Realtime & Higgs Avatar Type Definitions
 */

export type BosonSessionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'speaking'
  | 'listening'
  | 'error'
  | 'interrupted';

export interface HiggsAvatarConfig {
  avatarId: string;
  resolution?: '720p' | '1080p';
  fps?: number;
  bitrate?: number;
  interactive?: boolean;
}

export interface HiggsTurnDetection {
  type: 'server_vad' | 'client_vad' | 'manual';
  threshold?: number;
  prefixPaddingMs?: number;
  silenceDurationMs?: number;
}

export interface HiggsRealtimeConfig {
  model?: string;
  modalities?: ('text' | 'audio')[];
  voice?: string;
  instructions?: string;
  temperature?: number;
  maxOutputTokens?: number;
  turnDetection?: HiggsTurnDetection;
  avatar?: HiggsAvatarConfig;
}

export type BosonRealtimeClientMessage =
  | { type: 'session.update'; session: HiggsRealtimeConfig }
  | { type: 'input_audio_buffer.append'; audio: string }
  | { type: 'input_audio_buffer.commit' }
  | { type: 'input_audio_buffer.clear' }
  | { type: 'conversation.item.create'; item: BosonConversationItem }
  | { type: 'conversation.item.truncate'; itemId: string; contentIndex: number; audioEndMs: number }
  | { type: 'response.create'; response?: Record<string, unknown> }
  | { type: 'response.cancel' };

export interface BosonConversationItem {
  id?: string;
  type: 'message' | 'function_call' | 'function_call_output';
  role?: 'user' | 'assistant' | 'system';
  content?: {
    type: 'input_text' | 'input_audio' | 'text' | 'audio';
    text?: string;
    audio?: string;
    transcript?: string;
  }[];
  callId?: string;
  name?: string;
  arguments?: string;
  output?: string;
}

export type BosonRealtimeServerMessage =
  | { type: 'session.created'; session: Record<string, unknown> }
  | { type: 'session.updated'; session: Record<string, unknown> }
  | { type: 'conversation.item.created'; item: BosonConversationItem }
  | { type: 'response.audio.delta'; responseId: string; itemId: string; outputIndex: number; contentIndex: number; delta: string }
  | { type: 'response.audio_transcript.delta'; responseId: string; itemId: string; outputIndex: number; contentIndex: number; delta: string }
  | { type: 'response.function_call_arguments.delta'; responseId: string; itemId: string; outputIndex: number; callId: string; delta: string }
  | { type: 'response.function_call_arguments.done'; responseId: string; itemId: string; outputIndex: number; callId: string; name: string; arguments: string }
  | { type: 'input_audio_buffer.speech_started'; audioStartMs: number; itemId: string }
  | { type: 'input_audio_buffer.speech_stopped'; audioEndMs: number; itemId: string }
  | { type: 'error'; error: { type: string; message: string; code?: string } };
