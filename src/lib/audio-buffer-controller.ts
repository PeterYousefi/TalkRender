/**
 * Zero-Latency Audio Buffer Interruption & Gain Controller
 * Handles immediate audio playback suppression during user barge-in events.
 */

export interface AudioBufferControllerOptions {
  fadeDurationMs?: number; // micro-fade to prevent speaker popping/clicking
}

export class AudioBufferController {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  private isInterrupted = false;
  private targetVolume = 1.0;
  private fadeDurationMs: number;

  constructor(options: AudioBufferControllerOptions = {}) {
    this.fadeDurationMs = options.fadeDurationMs ?? 15;
  }

  public attachAudioElement(audio: HTMLAudioElement): void {
    this.audioElement = audio;

    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.targetVolume, this.audioCtx.currentTime);

        this.mediaSourceNode = this.audioCtx.createMediaElementSource(audio);
        this.mediaSourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
      } catch {
        // Fallback to direct HTMLAudioElement volume manipulation if AudioContext is blocked
      }
    }
  }

  /**
   * Immediately suppress playback upon user speech barge-in.
   * Micro-fades gain to 0 in <=15ms and pauses playback buffer.
   */
  public interruptPlayback(): void {
    this.isInterrupted = true;

    if (this.gainNode && this.audioCtx && this.audioCtx.state === 'running') {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + this.fadeDurationMs / 1000);
    }

    if (this.audioElement) {
      this.audioElement.muted = true;
      try {
        this.audioElement.pause();
      } catch {
        // Audio element pause might throw if not playing
      }
    }
  }

  /**
   * Resume playback when barge-in turn has concluded.
   */
  public resumePlayback(): void {
    this.isInterrupted = false;

    if (this.audioElement) {
      this.audioElement.muted = false;
    }

    if (this.gainNode && this.audioCtx && this.audioCtx.state === 'running') {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(
        this.targetVolume,
        now + this.fadeDurationMs / 1000
      );
    }
  }

  public setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (!this.isInterrupted) {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setValueAtTime(this.targetVolume, this.audioCtx.currentTime);
      }
      if (this.audioElement) {
        this.audioElement.volume = this.targetVolume;
      }
    }
  }

  public isPlaybackSuppressed(): boolean {
    return this.isInterrupted;
  }

  public dispose(): void {
    this.interruptPlayback();
    if (this.mediaSourceNode) {
      try {
        this.mediaSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.mediaSourceNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.audioElement = null;
  }
}
