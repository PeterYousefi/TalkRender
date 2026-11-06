'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AudioStreamAnalyzer,
  estimateVisemeFromAudio,
} from '@/lib/audio-analyzer';
import type {
  AudioAnalyzerConfig,
  AudioFrequencyData,
  VisemeFrameData,
} from '@/types/avatar';

export interface UseAudioAnalyzerOptions {
  stream?: MediaStream | null;
  config?: AudioAnalyzerConfig;
  enabled?: boolean;
  sampleIntervalMs?: number;
}

export interface UseAudioAnalyzerReturn {
  frequencyData: AudioFrequencyData;
  viseme: VisemeFrameData;
  isAnalyzing: boolean;
  error: Error | null;
  resume: () => Promise<void>;
}

const DEFAULT_FREQ_DATA: AudioFrequencyData = {
  rms: 0,
  dbfs: -100,
  peak: 0,
  frequencyBins: new Array(16).fill(0),
  isSpeaking: false,
};

const DEFAULT_VISEME: VisemeFrameData = {
  viseme: 'sil',
  visemeId: 0,
  weight: 0,
  jawOpen: 0,
  mouthWide: 0,
  timestamp: 0,
};

export function useAudioAnalyzer({
  stream = null,
  config,
  enabled = true,
  sampleIntervalMs = 0,
}: UseAudioAnalyzerOptions = {}): UseAudioAnalyzerReturn {
  const [frequencyData, setFrequencyData] = useState<AudioFrequencyData>(DEFAULT_FREQ_DATA);
  const [viseme, setViseme] = useState<VisemeFrameData>(DEFAULT_VISEME);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzerRef = useRef<AudioStreamAnalyzer | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const resume = useCallback(async () => {
    // Allows user interaction to resume suspended AudioContext
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        // Will be resumed by the browser on user gesture if needed
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !stream || typeof window === 'undefined') {
      setIsAnalyzing(false);
      setFrequencyData(DEFAULT_FREQ_DATA);
      setViseme(DEFAULT_VISEME);
      return;
    }

    let isMounted = true;
    let analyzer: AudioStreamAnalyzer | null = null;

    try {
      analyzer = new AudioStreamAnalyzer(config);
      analyzer.attachStream(stream);
      analyzerRef.current = analyzer;
      setIsAnalyzing(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAnalyzing(false);
      return;
    }

    const tick = () => {
      if (!isMounted || !analyzer) return;
      const data = analyzer.sample();
      const currentViseme = estimateVisemeFromAudio(
        data.rms,
        data.dbfs,
        data.frequencyBins
      );

      setFrequencyData(data);
      setViseme(currentViseme);
    };

    if (sampleIntervalMs > 0) {
      intervalIdRef.current = setInterval(tick, sampleIntervalMs);
    } else {
      const loop = () => {
        tick();
        if (isMounted) {
          rafIdRef.current = requestAnimationFrame(loop);
        }
      };
      rafIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      isMounted = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (analyzer) {
        analyzer.disconnect();
        analyzerRef.current = null;
      }
      setIsAnalyzing(false);
    };
  }, [stream, enabled, sampleIntervalMs, config]);

  return {
    frequencyData,
    viseme,
    isAnalyzing,
    error,
    resume,
  };
}
