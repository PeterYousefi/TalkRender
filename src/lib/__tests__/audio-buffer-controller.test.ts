import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioBufferController } from '../audio-buffer-controller';

describe('AudioBufferController', () => {
  let mockGainNode: {
    gain: {
      value: number;
      setValueAtTime: ReturnType<typeof vi.fn>;
      cancelScheduledValues: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  let mockSourceNode: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  let mockAudioCtx: {
    currentTime: number;
    state: string;
    createGain: ReturnType<typeof vi.fn>;
    createMediaElementSource: ReturnType<typeof vi.fn>;
    destination: Record<string, unknown>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockGainNode = {
      gain: {
        value: 1.0,
        setValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockSourceNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockAudioCtx = {
      currentTime: 10,
      state: 'running',
      createGain: vi.fn(() => mockGainNode),
      createMediaElementSource: vi.fn(() => mockSourceNode),
      destination: {},
      close: vi.fn().mockResolvedValue(undefined),
    };

    const MockAudioContext = vi.fn().mockImplementation(() => mockAudioCtx);
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize and attach HTMLAudioElement to Web Audio graph', () => {
    const controller = new AudioBufferController();
    const mockAudioEl = {
      muted: false,
      pause: vi.fn(),
      volume: 1,
    } as unknown as HTMLAudioElement;

    controller.attachAudioElement(mockAudioEl);

    expect(mockAudioCtx.createGain).toHaveBeenCalled();
    expect(mockAudioCtx.createMediaElementSource).toHaveBeenCalledWith(mockAudioEl);
    expect(mockSourceNode.connect).toHaveBeenCalledWith(mockGainNode);
  });

  it('should immediately suppress audio playback upon interruption', () => {
    const controller = new AudioBufferController({ fadeDurationMs: 15 });
    const mockAudioEl = {
      muted: false,
      pause: vi.fn(),
      volume: 1,
    } as unknown as HTMLAudioElement;

    controller.attachAudioElement(mockAudioEl);
    controller.interruptPlayback();

    expect(controller.isPlaybackSuppressed()).toBe(true);
    expect(mockAudioEl.muted).toBe(true);
    expect(mockAudioEl.pause).toHaveBeenCalled();
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 10 + 0.015);
  });

  it('should resume playback when interruption concludes', () => {
    const controller = new AudioBufferController();
    const mockAudioEl = {
      muted: true,
      pause: vi.fn(),
      volume: 1,
    } as unknown as HTMLAudioElement;

    controller.attachAudioElement(mockAudioEl);
    controller.interruptPlayback();
    expect(controller.isPlaybackSuppressed()).toBe(true);

    controller.resumePlayback();
    expect(controller.isPlaybackSuppressed()).toBe(false);
    expect(mockAudioEl.muted).toBe(false);
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1.0, expect.any(Number));
  });

  it('should update volume correctly', () => {
    const controller = new AudioBufferController();
    const mockAudioEl = {
      muted: false,
      pause: vi.fn(),
      volume: 1,
    } as unknown as HTMLAudioElement;

    controller.attachAudioElement(mockAudioEl);
    controller.setVolume(0.5);

    expect(mockAudioEl.volume).toBe(0.5);
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 10);
  });

  it('should cleanly disconnect graph on dispose', () => {
    const controller = new AudioBufferController();
    const mockAudioEl = {
      muted: false,
      pause: vi.fn(),
      volume: 1,
    } as unknown as HTMLAudioElement;

    controller.attachAudioElement(mockAudioEl);
    controller.dispose();

    expect(mockSourceNode.disconnect).toHaveBeenCalled();
    expect(mockGainNode.disconnect).toHaveBeenCalled();
    expect(mockAudioCtx.close).toHaveBeenCalled();
  });
});
