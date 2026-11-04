/**
 * Boson AI Realtime WebSocket Client Wrapper
 * Handles full-duplex speech-to-speech, tool calls, and barge-in interruptions.
 */

import type {
  HiggsRealtimeConfig,
  BosonRealtimeClientMessage,
  BosonRealtimeServerMessage,
  BosonSessionStatus,
} from '@/types/boson';

export type BosonEventHandler<T = any> = (data: T) => void;

export interface BosonClientOptions {
  url: string;
  apiKey?: string;
  config?: HiggsRealtimeConfig;
  maxReconnectAttempts?: number;
  initialReconnectDelayMs?: number;
}

export class BosonRealtimeClient {
  private ws: WebSocket | null = null;
  private options: BosonClientOptions;
  private status: BosonSessionStatus = 'idle';
  private reconnectAttempts = 0;
  private isExplicitDisconnect = false;
  private listeners: Map<string, Set<BosonEventHandler<any>>> = new Map();

  constructor(options: BosonClientOptions) {
    this.options = {
      maxReconnectAttempts: 5,
      initialReconnectDelayMs: 500,
      ...options,
    };
  }

  public getStatus(): BosonSessionStatus {
    return this.status;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public on<T = any>(event: string, handler: BosonEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as BosonEventHandler<any>);
    return () => this.off(event, handler as BosonEventHandler<any>);
  }

  public off<T = any>(event: string, handler: BosonEventHandler<T>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as BosonEventHandler<any>);
    }
  }

  private emit<T = any>(event: string, data: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`Error in BosonClient event listener [${event}]:`, err);
        }
      });
    }
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isExplicitDisconnect = false;
    this.setStatus('connecting');

    try {
      let finalUrl = this.options.url;
      if (this.options.apiKey && !finalUrl.includes('api_key=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}api_key=${encodeURIComponent(this.options.apiKey)}`;
      }

      this.ws = new WebSocket(finalUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.emit('connected', undefined);

        if (this.options.config) {
          this.updateSession(this.options.config);
        }
      };

      this.ws.onclose = (event) => {
        this.ws = null;
        if (this.isExplicitDisconnect) {
          this.setStatus('idle');
          this.emit('disconnected', { code: event.code, reason: event.reason });
        } else {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        this.setStatus('error');
        this.emit('error', err);
      };

      this.ws.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };
    } catch (err) {
      this.setStatus('error');
      this.emit('error', err);
    }
  }

  public disconnect(): void {
    this.isExplicitDisconnect = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('idle');
  }

  public send(message: BosonRealtimeClientMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    this.ws.send(JSON.stringify(message));
    return true;
  }

  public updateSession(config: HiggsRealtimeConfig): boolean {
    return this.send({
      type: 'session.update',
      session: config,
    });
  }

  public appendAudioBuffer(base64Pcm16Chunk: string): boolean {
    return this.send({
      type: 'input_audio_buffer.append',
      audio: base64Pcm16Chunk,
    });
  }

  public interrupt(): boolean {
    this.setStatus('interrupted');
    const clearResult = this.send({ type: 'input_audio_buffer.clear' });
    const cancelResult = this.send({ type: 'response.cancel' });
    this.emit('interrupted', { timestamp: Date.now() });
    return clearResult && cancelResult;
  }

  public sendFunctionResult(callId: string, output: string): boolean {
    return this.send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        callId,
        output,
      },
    });
  }

  private handleReconnect(): void {
    const maxAttempts = this.options.maxReconnectAttempts || 5;
    if (this.reconnectAttempts >= maxAttempts) {
      this.setStatus('error');
      this.emit('max_reconnect_exceeded', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    const delay = (this.options.initialReconnectDelayMs || 500) * Math.pow(2, this.reconnectAttempts - 1);
    this.setStatus('connecting');
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delayMs: delay });

    setTimeout(() => {
      if (!this.isExplicitDisconnect) {
        this.connect();
      }
    }, delay);
  }

  private handleIncomingMessage(raw: unknown): void {
    try {
      if (typeof raw !== 'string') return;
      const parsed = JSON.parse(raw) as BosonRealtimeServerMessage;
      this.emit('message', parsed);

      switch (parsed.type) {
        case 'response.audio.delta':
          this.setStatus('speaking');
          this.emit('audioDelta', parsed);
          break;
        case 'response.function_call_arguments.done':
          this.emit('functionCall', {
            callId: parsed.callId,
            name: parsed.name,
            arguments: parsed.arguments,
          });
          break;
        case 'input_audio_buffer.speech_started':
          this.setStatus('listening');
          this.emit('speechStarted', parsed);
          break;
        case 'input_audio_buffer.speech_stopped':
          this.emit('speechStopped', parsed);
          break;
        case 'error':
          this.setStatus('error');
          this.emit('error', parsed.error);
          break;
      }
    } catch (err) {
      console.error('Failed to parse Boson realtime message:', err);
    }
  }

  private setStatus(status: BosonSessionStatus): void {
    this.status = status;
    this.emit('statusChange', status);
  }
}
