/**
 * Boson Higgs Avatar UI Layout, Viseme Blendshapes & Audio Visualizer Types
 */

import type { RemoteTrack } from 'livekit-client';

export type AvatarLayoutMode =
  | 'side-docked'
  | 'pip'
  | 'floating'
  | 'fullscreen'
  | 'hidden';

export type AvatarConnectionQuality =
  | 'excellent'
  | 'good'
  | 'poor'
  | 'reconnecting'
  | 'offline';

export type StandardViseme =
  | 'sil'
  | 'PP'
  | 'FF'
  | 'TH'
  | 'DD'
  | 'kk'
  | 'CH'
  | 'SS'
  | 'nn'
  | 'RR'
  | 'aa'
  | 'E'
  | 'I'
  | 'O'
  | 'U';

export interface VisemeFrameData {
  viseme: StandardViseme;
  visemeId: number;
  weight: number; // 0.0 to 1.0
  jawOpen: number;
  mouthWide: number;
  timestamp: number;
}

export interface AvatarViewState {
  layoutMode: AvatarLayoutMode;
  track: RemoteTrack | null;
  isSpeaking: boolean;
  volume: number; // 0 to 100
  quality: AvatarConnectionQuality;
  isMuted: boolean;
  currentViseme: StandardViseme;
}

export interface AudioFrequencyData {
  rms: number;
  dbfs: number;
  peak: number;
  frequencyBins: number[]; // normalized 0.0 - 1.0 array
  isSpeaking: boolean;
}

export interface AudioAnalyzerConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  speechThresholdDbfs?: number;
}
