/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

describe('LiveKit Token API Route Handler', () => {
  it('should generate valid token for POST request with roomName and identity', async () => {
    const req = new NextRequest('http://localhost:3000/api/livekit/token', {
      method: 'POST',
      body: JSON.stringify({
        roomName: 'canvas-studio',
        identity: 'architect-1',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe('string');
    expect(data.roomName).toBe('canvas-studio');
    expect(data.identity).toBe('architect-1');
    expect(data.expiresIn).toBe(3600);
  });

  it('should reject POST missing roomName with 400 status', async () => {
    const req = new NextRequest('http://localhost:3000/api/livekit/token', {
      method: 'POST',
      body: JSON.stringify({ identity: 'user-without-room' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('roomName');
  });

  it('should reject POST missing identity with 400 status', async () => {
    const req = new NextRequest('http://localhost:3000/api/livekit/token', {
      method: 'POST',
      body: JSON.stringify({ roomName: 'room-without-identity' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('identity');
  });

  it('should support GET request with query params for dev convenience', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/livekit/token?roomName=custom-room&identity=custom-user'
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.roomName).toBe('custom-room');
    expect(data.identity).toBe('custom-user');
    expect(typeof data.token).toBe('string');
  });
});
