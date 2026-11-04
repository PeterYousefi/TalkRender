'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RemoteTrack } from 'livekit-client';
import { LiveKitConnectionManager } from '@/lib/livekit-manager';
import type { LiveKitRoomState, LiveKitTokenResponse } from '@/types/livekit';

export interface UseLiveKitRoomOptions {
  roomName?: string;
  identity?: string;
  autoConnect?: boolean;
  onAvatarTrack?: (track: RemoteTrack) => void;
  onError?: (err: Error) => void;
}

export function useLiveKitRoom(options: UseLiveKitRoomOptions = {}) {
  const managerRef = useRef<LiveKitConnectionManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new LiveKitConnectionManager();
  }
  const manager = managerRef.current;

  const [state, setState] = useState<LiveKitRoomState>(() => manager.getSnapshot());
  const [avatarTrack, setAvatarTrack] = useState<RemoteTrack | null>(() => manager.getAvatarTrack());

  const connect = useCallback(
    async (customRoomName?: string, customIdentity?: string) => {
      const room = customRoomName || options.roomName || 'talkrender-session';
      const user = customIdentity || options.identity || `user-${Math.random().toString(36).substring(2, 7)}`;

      try {
        setState((prev) => ({ ...prev, status: 'connecting', error: null }));

        const tokenRes = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: room, identity: user }),
        });

        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch token: ${tokenRes.status}`);
        }

        const tokenData: LiveKitTokenResponse = await tokenRes.json();
        await manager.connect(tokenData.url, tokenData.token);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({ ...prev, status: 'disconnected', error: error.message }));
        options.onError?.(error);
      }
    },
    [options]
  );

  const disconnect = useCallback(async () => {
    try {
      await manager.disconnect();
      setAvatarTrack(null);
    } catch (err: unknown) {
      console.error('Error disconnecting from LiveKit room:', err);
    }
  }, [manager]);

  const toggleMicrophone = useCallback(async () => {
    const nextState = !state.isAudioEnabled;
    await manager.setMicrophoneEnabled(nextState);
  }, [manager, state.isAudioEnabled]);

  const toggleCamera = useCallback(async () => {
    const nextState = !state.isVideoEnabled;
    await manager.setCameraEnabled(nextState);
  }, [manager, state.isVideoEnabled]);

  useEffect(() => {
    const unbindState = manager.on('stateChange', (updatedState: LiveKitRoomState) => {
      setState(updatedState);
    });

    const unbindAvatar = manager.on('avatarTrackReady', (track: RemoteTrack) => {
      setAvatarTrack(track);
      options.onAvatarTrack?.(track);
    });

    const unbindAvatarRemoved = manager.on('avatarTrackRemoved', () => {
      setAvatarTrack(null);
    });

    if (options.autoConnect) {
      connect();
    }

    return () => {
      unbindState();
      unbindAvatar();
      unbindAvatarRemoved();
    };
  }, [manager, options, connect]);

  return {
    state,
    avatarTrack,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    manager,
  };
}
