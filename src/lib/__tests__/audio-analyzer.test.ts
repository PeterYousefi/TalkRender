import { describe, it, expect } from 'vitest';
import {
  calculateRMS,
  calculateDBFS,
  calculatePeak,
  normalizeFrequencies,
  estimateVisemeFromAudio,
  AudioStreamAnalyzer,
} from '../audio-analyzer';

describe('Audio Analyzer Math & Viseme Estimation', () => {
  it('should calculate accurate RMS for silence and constant signals', () => {
    expect(calculateRMS(new Float32Array([]))).toBe(0);

    const silence = new Float32Array([0, 0, 0, 0]);
    expect(calculateRMS(silence)).toBe(0);

    const halfSignal = new Float32Array([0.5, 0.5, -0.5, -0.5]);
    expect(calculateRMS(halfSignal)).toBeCloseTo(0.5, 5);
  });

  it('should calculate accurate dBFS values and clamp silence to -100', () => {
    expect(calculateDBFS(0)).toBe(-100);
    expect(calculateDBFS(0.000001)).toBe(-100);

    // Full scale 1.0 = 0 dBFS
    expect(calculateDBFS(1.0)).toBe(0);

    // Half scale 0.5 ~= -6.02 dBFS
    expect(calculateDBFS(0.5)).toBeCloseTo(-6.0, 1);
  });

  it('should calculate peak absolute amplitudes', () => {
    const signal = new Float32Array([0.1, -0.85, 0.4, -0.2]);
    expect(calculatePeak(signal)).toBeCloseTo(0.85, 5);
  });

  it('should normalize byte frequency spectrum into fixed number of visualizer bars', () => {
    const rawFrequencies = new Uint8Array(32);
    rawFrequencies.fill(128); // ~0.5 normalized

    const bars = normalizeFrequencies(rawFrequencies, 8);
    expect(bars).toHaveLength(8);
    expect(bars[0]).toBeCloseTo(0.5, 1);
    expect(bars[7]).toBeCloseTo(0.5, 1);
  });

  it('should classify visemes accurately based on frequency energy', () => {
    // Silence -> sil
    const silViseme = estimateVisemeFromAudio(0, -60, [0, 0, 0, 0, 0, 0, 0, 0]);
    expect(silViseme.viseme).toBe('sil');
    expect(silViseme.jawOpen).toBe(0);

    // High frequency emphasis -> SS
    const sibilant = estimateVisemeFromAudio(0.4, -12, [0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.9, 0.9]);
    expect(sibilant.viseme).toBe('SS');

    // Low frequency emphasis -> O
    const oSound = estimateVisemeFromAudio(0.5, -10, [0.9, 0.9, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1]);
    expect(oSound.viseme).toBe('O');
  });

  it('should provide safe default sample when stream is not connected', () => {
    const analyzer = new AudioStreamAnalyzer();
    const sample = analyzer.sample();

    expect(sample.rms).toBe(0);
    expect(sample.dbfs).toBe(-100);
    expect(sample.isSpeaking).toBe(false);
    expect(sample.frequencyBins).toHaveLength(16);
  });
});
