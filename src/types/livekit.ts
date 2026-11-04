/**
 * LiveKit WebRTC Connection & Room Type Definitions
 */

export type LiveKitConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export interface LiveKitTokenRequest {
  roomName: string;
  identity: string;
  metadata?: Record<string, unknown>;
}

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
  identity: string;
  expiresIn?: number;
}

export interface LiveKitRoomConfig {
  url: string;
  token: string;
  adaptiveStream?: boolean;
  dynacast?: boolean;
  autoSubscribe?: boolean;
}

export interface LiveKitTrackMetadata {
  trackSid: string;
  kind: 'audio' | 'video';
  source: 'camera' | 'microphone' | 'screen_share' | 'unknown';
  isMuted: boolean;
  participantIdentity: string;
}

export interface LiveKitRoomState {
  status: LiveKitConnectionStatus;
  roomName: string | null;
  numParticipants: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  hasActiveAvatarTrack: boolean;
  error: string | null;
}
