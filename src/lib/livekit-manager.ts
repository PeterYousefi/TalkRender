/**
 * LiveKit WebRTC Connection & Room Event Manager
 * Coordinates audio/video tracks, avatar video stream attachment, and telemetry.
 */

import {
  Room,
  RoomEvent,
  ConnectionState,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from 'livekit-client';
import type { LiveKitConnectionStatus, LiveKitRoomState } from '@/types/livekit';

export type LiveKitTrackCallback = (
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) => void;

export type LiveKitGenericHandler<T = any> = (arg: T) => void;

export class LiveKitConnectionManager {
  private room: Room;
  private currentStatus: LiveKitConnectionStatus = 'disconnected';
  private avatarTrack: RemoteTrack | null = null;
  private eventListeners: Map<string, Set<LiveKitGenericHandler>> = new Map();

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.setupRoomListeners();
  }

  public getRoom(): Room {
    return this.room;
  }

  public getStatus(): LiveKitConnectionStatus {
    return this.currentStatus;
  }

  public getAvatarTrack(): RemoteTrack | null {
    return this.avatarTrack;
  }

  public getSnapshot(): LiveKitRoomState {
    const isAudioOn = this.room.localParticipant?.isMicrophoneEnabled ?? false;
    const isVideoOn = this.room.localParticipant?.isCameraEnabled ?? false;

    return {
      status: this.currentStatus,
      roomName: this.room.name || null,
      numParticipants: this.room.numParticipants,
      isAudioEnabled: isAudioOn,
      isVideoEnabled: isVideoOn,
      hasActiveAvatarTrack: this.avatarTrack !== null,
      error: null,
    };
  }

  public on<T = any>(event: string, handler: LiveKitGenericHandler<T>): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler as LiveKitGenericHandler);
    return () => {
      this.eventListeners.get(event)?.delete(handler as LiveKitGenericHandler);
    };
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(args[0]);
        } catch (err) {
          console.error(`LiveKit manager listener error on [${event}]:`, err);
        }
      });
    }
  }

  private setupRoomListeners(): void {
    this.room.on(RoomEvent.Connected, () => {
      this.currentStatus = 'connected';
      this.emit('connected');
      this.emit('stateChange', this.getSnapshot());
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.currentStatus = 'disconnected';
      this.avatarTrack = null;
      this.emit('disconnected');
      this.emit('stateChange', this.getSnapshot());
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      this.currentStatus = 'reconnecting';
      this.emit('reconnecting');
      this.emit('stateChange', this.getSnapshot());
    });

    this.room.on(RoomEvent.Reconnected, () => {
      this.currentStatus = 'connected';
      this.emit('reconnected');
      this.emit('stateChange', this.getSnapshot());
    });

    this.room.on(
      RoomEvent.TrackSubscribed,
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        if (
          track.kind === Track.Kind.Video &&
          (participant.identity.toLowerCase().includes('avatar') ||
            participant.identity.toLowerCase().includes('higgs') ||
            participant.identity.toLowerCase().includes('boson'))
        ) {
          this.avatarTrack = track;
          this.emit('avatarTrackReady', track);
        }
        this.emit('trackSubscribed', { track, publication, participant });
        this.emit('stateChange', this.getSnapshot());
      }
    );

    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        if (this.avatarTrack === track) {
          this.avatarTrack = null;
          this.emit('avatarTrackRemoved');
        }
        this.emit('trackUnsubscribed', { track, publication, participant });
        this.emit('stateChange', this.getSnapshot());
      }
    );
  }

  public async connect(url: string, token: string): Promise<void> {
    this.currentStatus = 'connecting';
    this.emit('stateChange', this.getSnapshot());
    await this.room.connect(url, token);
  }

  public async disconnect(): Promise<void> {
    await this.room.disconnect();
    this.currentStatus = 'disconnected';
    this.avatarTrack = null;
    this.emit('stateChange', this.getSnapshot());
  }

  public async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (this.currentStatus !== 'connected' || this.room.state !== ConnectionState.Connected) {
      this.emit('stateChange', {
        ...this.getSnapshot(),
        isAudioEnabled: enabled,
      });
      return;
    }
    if (this.room.localParticipant) {
      try {
        await this.room.localParticipant.setMicrophoneEnabled(enabled);
        this.emit('stateChange', this.getSnapshot());
      } catch (err) {
        console.warn('Failed to set microphone state on LiveKit:', err);
      }
    }
  }

  public async setCameraEnabled(enabled: boolean): Promise<void> {
    if (this.currentStatus !== 'connected' || this.room.state !== ConnectionState.Connected) {
      this.emit('stateChange', {
        ...this.getSnapshot(),
        isVideoEnabled: enabled,
      });
      return;
    }
    if (this.room.localParticipant) {
      try {
        await this.room.localParticipant.setCameraEnabled(enabled);
        this.emit('stateChange', this.getSnapshot());
      } catch (err) {
        console.warn('Failed to set camera state on LiveKit:', err);
      }
    }
  }
}
