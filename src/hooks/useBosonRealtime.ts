'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BosonRealtimeClient } from '@/lib/boson-client';
import type {
  HiggsRealtimeConfig,
  BosonSessionStatus,
} from '@/types/boson';

export interface UseBosonRealtimeOptions {
  url?: string;
  apiKey?: string;
  config?: HiggsRealtimeConfig;
  autoConnect?: boolean;
  onFunctionCall?: (call: { callId: string; name: string; arguments: string }) => void;
  onAudioDelta?: (delta: string) => void;
  onSpeechStart?: () => void;
  onSpeechStop?: () => void;
  onInterrupted?: () => void;
  onError?: (err: unknown) => void;
}

export function useBosonRealtime(options: UseBosonRealtimeOptions = {}) {
  const wsUrl = options.url || process.env.NEXT_PUBLIC_BOSON_WS_URL || 'wss://api.boson.ai/v1/realtime';
  const clientRef = useRef<BosonRealtimeClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = new BosonRealtimeClient({
      url: wsUrl,
      apiKey: options.apiKey,
      config: options.config,
    });
  }
  const client = clientRef.current;

  const [status, setStatus] = useState<BosonSessionStatus>(() => client.getStatus());
  const [lastSpeechTimestamp, setLastSpeechTimestamp] = useState<number>(0);

  const connect = useCallback(() => {
    client.connect();
  }, [client]);

  const disconnect = useCallback(() => {
    client.disconnect();
  }, [client]);

  const interrupt = useCallback(() => {
    return client.interrupt();
  }, [client]);

  const sendFunctionResult = useCallback(
    (callId: string, output: string) => {
      return client.sendFunctionResult(callId, output);
    },
    [client]
  );

  const appendAudioChunk = useCallback(
    (base64Pcm: string) => {
      return client.appendAudioBuffer(base64Pcm);
    },
    [client]
  );

  useEffect(() => {
    const unbindStatus = client.on('statusChange', (nextStatus) => {
      setStatus(nextStatus as BosonSessionStatus);
    });

    const unbindFunc = client.on('functionCall', (call) => {
      options.onFunctionCall?.(call as { callId: string; name: string; arguments: string });
    });

    const unbindAudio = client.on('audioDelta', (deltaMsg) => {
      const msg = deltaMsg as { delta: string };
      options.onAudioDelta?.(msg.delta);
    });

    const unbindSpeechStart = client.on('speechStarted', () => {
      setLastSpeechTimestamp(Date.now());
      options.onSpeechStart?.();
    });

    const unbindSpeechStop = client.on('speechStopped', () => {
      options.onSpeechStop?.();
    });

    const unbindInterrupted = client.on('interrupted', () => {
      options.onInterrupted?.();
    });

    const unbindError = client.on('error', (err) => {
      options.onError?.(err);
    });

    if (options.autoConnect) {
      client.connect();
    }

    return () => {
      unbindStatus();
      unbindFunc();
      unbindAudio();
      unbindSpeechStart();
      unbindSpeechStop();
      unbindInterrupted();
      unbindError();
    };
  }, [client, options]);

  return {
    status,
    isSpeaking: status === 'speaking',
    isListening: status === 'listening',
    lastSpeechTimestamp,
    connect,
    disconnect,
    interrupt,
    sendFunctionResult,
    appendAudioChunk,
    client,
  };
}
