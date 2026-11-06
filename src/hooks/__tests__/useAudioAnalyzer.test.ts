import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAudioAnalyzer } from '../useAudioAnalyzer';

describe('useAudioAnalyzer Hook', () => {
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockDisconnect = vi.fn();
    mockClose = vi.fn().mockResolvedValue(undefined);

    const mockAnalyser = {
      fftSize: 512,
      smoothingTimeConstant: 0.8,
      minDecibels: -90,
      maxDecibels: -10,
      getFloatTimeDomainData: vi.fn((arr: Float32Array) => {
        arr.fill(0.1);
      }),
      getByteFrequencyData: vi.fn((arr: Uint8Array) => {
        arr.fill(128);
      }),
    };

    const mockSource = {
      connect: vi.fn(),
      disconnect: mockDisconnect,
    };

    const MockAudioContext = vi.fn().mockImplementation(() => ({
      createAnalyser: () => mockAnalyser,
      createMediaStreamSource: () => mockSource,
      state: 'running',
      close: mockClose,
    }));

    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with default idle state when stream is null', () => {
    const { result } = renderHook(() => useAudioAnalyzer({ stream: null }));

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.frequencyData.rms).toBe(0);
    expect(result.current.frequencyData.isSpeaking).toBe(false);
    expect(result.current.viseme.viseme).toBe('sil');
  });

  it('should initialize with default state when enabled is false', () => {
    const fakeStream = {} as MediaStream;
    const { result } = renderHook(() =>
      useAudioAnalyzer({ stream: fakeStream, enabled: false })
    );

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.frequencyData.rms).toBe(0);
  });

  it('should activate analyzer and sample audio when stream is provided', () => {
    const fakeStream = {} as MediaStream;
    const { result } = renderHook(() =>
      useAudioAnalyzer({
        stream: fakeStream,
        enabled: true,
        sampleIntervalMs: 50,
      })
    );

    expect(result.current.isAnalyzing).toBe(true);

    // Advance timer to trigger interval sample
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.frequencyData.rms).toBeGreaterThan(0);
    expect(result.current.viseme.timestamp).toBeGreaterThan(0);
  });

  it('should clean up AudioContext and disconnect source node on unmount', () => {
    const fakeStream = {} as MediaStream;
    const { result, unmount } = renderHook(() =>
      useAudioAnalyzer({
        stream: fakeStream,
        enabled: true,
        sampleIntervalMs: 50,
      })
    );

    expect(result.current.isAnalyzing).toBe(true);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });
});
