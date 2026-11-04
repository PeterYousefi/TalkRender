import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveKitRoom } from '../useLiveKitRoom';

// Mock global fetch for token endpoint
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('useLiveKitRoom Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'mock-jwt-token',
        url: 'wss://demo.livekit.cloud',
        roomName: 'test-room',
        identity: 'test-user',
        expiresIn: 3600,
      }),
    });
  });

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useLiveKitRoom({ roomName: 'test-room' }));

    expect(result.current.state.status).toBe('disconnected');
    expect(result.current.avatarTrack).toBeNull();
  });

  it('should handle successful connection flow', async () => {
    const { result } = renderHook(() => useLiveKitRoom({ roomName: 'test-room' }));

    // Mock manager connect
    vi.spyOn(result.current.manager, 'connect').mockImplementation(async () => {});

    await act(async () => {
      await result.current.connect();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/livekit/token', expect.any(Object));
  });

  it('should handle disconnect cleanly', async () => {
    const { result } = renderHook(() => useLiveKitRoom({ roomName: 'test-room' }));
    const disconnectSpy = vi.spyOn(result.current.manager, 'disconnect').mockImplementation(async () => {});

    await act(async () => {
      await result.current.disconnect();
    });

    expect(disconnectSpy).toHaveBeenCalled();
    expect(result.current.avatarTrack).toBeNull();
  });

  it('should handle token fetch errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Token generation service unavailable' }),
    });

    let caughtError: Error | null = null;
    const { result } = renderHook(() =>
      useLiveKitRoom({
        roomName: 'error-room',
        onError: (err) => {
          caughtError = err;
        },
      })
    );

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.state.status).toBe('disconnected');
    expect(caughtError).not.toBeNull();
    expect((caughtError as Error | null)?.message).toContain('Token generation service unavailable');
  });
});
