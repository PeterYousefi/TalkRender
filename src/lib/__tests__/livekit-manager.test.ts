import { describe, it, expect, beforeEach } from 'vitest';
import { LiveKitConnectionManager } from '../livekit-manager';
import { RoomEvent, Track, RemoteTrack, RemoteTrackPublication, RemoteParticipant } from 'livekit-client';

describe('LiveKitConnectionManager', () => {
  let manager: LiveKitConnectionManager;

  beforeEach(() => {
    manager = new LiveKitConnectionManager();
  });

  it('should initialize with disconnected status and empty avatar track', () => {
    expect(manager.getStatus()).toBe('disconnected');
    expect(manager.getAvatarTrack()).toBeNull();
    const snapshot = manager.getSnapshot();
    expect(snapshot.status).toBe('disconnected');
    expect(snapshot.hasActiveAvatarTrack).toBe(false);
  });

  it('should update status when room triggers connected event', () => {
    const room = manager.getRoom();
    let stateFired = false;
    manager.on('connected', () => {
      stateFired = true;
    });

    // Simulate connected event
    room.emit(RoomEvent.Connected);

    expect(manager.getStatus()).toBe('connected');
    expect(stateFired).toBe(true);
    expect(manager.getSnapshot().status).toBe('connected');
  });

  it('should detect and store avatar video track on TrackSubscribed event', () => {
    const room = manager.getRoom();
    let detectedAvatar: unknown = null;

    manager.on('avatarTrackReady', (track: unknown) => {
      detectedAvatar = track;
    });

    const mockVideoTrack = {
      kind: Track.Kind.Video,
      sid: 'track-avatar-video-1',
    } as unknown as RemoteTrack;

    const mockPublication = {
      trackSid: 'track-avatar-video-1',
    } as unknown as RemoteTrackPublication;

    const mockAvatarParticipant = {
      identity: 'higgs-avatar-copilot',
    } as unknown as RemoteParticipant;

    room.emit(
      RoomEvent.TrackSubscribed,
      mockVideoTrack,
      mockPublication,
      mockAvatarParticipant
    );

    expect(manager.getAvatarTrack()).toBe(mockVideoTrack);
    expect(detectedAvatar).toBe(mockVideoTrack);
    expect(manager.getSnapshot().hasActiveAvatarTrack).toBe(true);
  });

  it('should clear avatar track when unsubscribed', () => {
    const room = manager.getRoom();
    const mockVideoTrack = {
      kind: Track.Kind.Video,
      sid: 'track-avatar-video-1',
    } as unknown as RemoteTrack;
    const mockPublication = { trackSid: 'track-avatar-video-1' } as unknown as RemoteTrackPublication;
    const mockAvatarParticipant = { identity: 'boson-avatar-host' } as unknown as RemoteParticipant;

    room.emit(
      RoomEvent.TrackSubscribed,
      mockVideoTrack,
      mockPublication,
      mockAvatarParticipant
    );
    expect(manager.getAvatarTrack()).not.toBeNull();

    let avatarRemovedFired = false;
    manager.on('avatarTrackRemoved', () => {
      avatarRemovedFired = true;
    });

    room.emit(
      RoomEvent.TrackUnsubscribed,
      mockVideoTrack,
      mockPublication,
      mockAvatarParticipant
    );

    expect(manager.getAvatarTrack()).toBeNull();
    expect(avatarRemovedFired).toBe(true);
    expect(manager.getSnapshot().hasActiveAvatarTrack).toBe(false);
  });
});
