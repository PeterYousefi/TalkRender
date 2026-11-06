/**
 * Real-time Audio Stream Analyzer & Viseme Estimation Helper
 */

import type {
  AudioFrequencyData,
  AudioAnalyzerConfig,
  StandardViseme,
  VisemeFrameData,
} from '@/types/avatar';

export function calculateRMS(timeDomainData: Float32Array): number {
  if (!timeDomainData || timeDomainData.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    sumSquares += timeDomainData[i] * timeDomainData[i];
  }
  return Math.sqrt(sumSquares / timeDomainData.length);
}

export function calculateDBFS(rms: number): number {
  if (rms <= 0.00001) return -100;
  const db = 20 * Math.log10(rms);
  return Math.max(-100, Math.min(0, Math.round(db * 10) / 10));
}

export function calculatePeak(timeDomainData: Float32Array): number {
  if (!timeDomainData || timeDomainData.length === 0) return 0;
  let peak = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const abs = Math.abs(timeDomainData[i]);
    if (abs > peak) peak = abs;
  }
  return Math.min(1, peak);
}

export function normalizeFrequencies(
  frequencyData: Uint8Array,
  barCount = 16
): number[] {
  if (!frequencyData || frequencyData.length === 0) {
    return new Array(barCount).fill(0);
  }

  const result: number[] = [];
  const binSize = Math.floor(frequencyData.length / barCount);

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    const start = i * binSize;
    const end = Math.min(start + binSize, frequencyData.length);
    const count = end - start;

    for (let j = start; j < end; j++) {
      sum += frequencyData[j];
    }

    const avg = count > 0 ? sum / count : 0;
    result.push(Math.round((avg / 255) * 100) / 100);
  }

  return result;
}

export function estimateVisemeFromAudio(
  rms: number,
  dbfs: number,
  frequencyBins: number[]
): VisemeFrameData {
  if (dbfs < -45 || rms < 0.02) {
    return {
      viseme: 'sil',
      visemeId: 0,
      weight: 0,
      jawOpen: 0,
      mouthWide: 0,
      timestamp: Date.now(),
    };
  }

  // Energy distribution across low, mid, high spectrum
  const lowEnergy = (frequencyBins[0] || 0) + (frequencyBins[1] || 0) + (frequencyBins[2] || 0);
  const midEnergy = (frequencyBins[3] || 0) + (frequencyBins[4] || 0) + (frequencyBins[5] || 0);
  const highEnergy = (frequencyBins[6] || 0) + (frequencyBins[7] || 0) + (frequencyBins[8] || 0);

  let viseme: StandardViseme = 'aa';
  let visemeId = 11;
  let jawOpen = Math.min(1, rms * 3.5);
  let mouthWide = 0.5;

  if (highEnergy > midEnergy && highEnergy > lowEnergy) {
    viseme = 'SS';
    visemeId = 7;
    jawOpen = Math.min(0.4, rms * 1.5);
    mouthWide = 0.8;
  } else if (lowEnergy > midEnergy * 1.5) {
    viseme = 'O';
    visemeId = 14;
    jawOpen = Math.min(0.8, rms * 2.5);
    mouthWide = 0.2;
  } else if (midEnergy > lowEnergy) {
    viseme = 'E';
    visemeId = 12;
    jawOpen = Math.min(0.6, rms * 2);
    mouthWide = 0.9;
  }

  return {
    viseme,
    visemeId,
    weight: Math.min(1, rms * 2),
    jawOpen,
    mouthWide,
    timestamp: Date.now(),
  };
}

export class AudioStreamAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private timeDomainBuffer: Float32Array<ArrayBuffer>;
  private frequencyBuffer: Uint8Array<ArrayBuffer>;
  private config: Required<AudioAnalyzerConfig>;

  constructor(config: AudioAnalyzerConfig = {}) {
    this.config = {
      fftSize: config.fftSize || 512,
      smoothingTimeConstant: config.smoothingTimeConstant ?? 0.8,
      minDecibels: config.minDecibels || -90,
      maxDecibels: config.maxDecibels || -10,
      speechThresholdDbfs: config.speechThresholdDbfs || -42,
    };

    const floatBuffer = new ArrayBuffer(this.config.fftSize * 4);
    const byteBuffer = new ArrayBuffer(this.config.fftSize / 2);
    this.timeDomainBuffer = new Float32Array(floatBuffer);
    this.frequencyBuffer = new Uint8Array(byteBuffer);
  }

  public attachStream(stream: MediaStream): void {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = this.config.fftSize;
    this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
    this.analyser.minDecibels = this.config.minDecibels;
    this.analyser.maxDecibels = this.config.maxDecibels;

    this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyser);
  }

  public sample(): AudioFrequencyData {
    if (!this.analyser) {
      return {
        rms: 0,
        dbfs: -100,
        peak: 0,
        frequencyBins: new Array(16).fill(0),
        isSpeaking: false,
      };
    }

    this.analyser.getFloatTimeDomainData(this.timeDomainBuffer);
    this.analyser.getByteFrequencyData(this.frequencyBuffer);

    const rms = calculateRMS(this.timeDomainBuffer);
    const dbfs = calculateDBFS(rms);
    const peak = calculatePeak(this.timeDomainBuffer);
    const frequencyBins = normalizeFrequencies(this.frequencyBuffer, 16);
    const isSpeaking = dbfs > this.config.speechThresholdDbfs;

    return {
      rms,
      dbfs,
      peak,
      frequencyBins,
      isSpeaking,
    };
  }

  public disconnect(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}
