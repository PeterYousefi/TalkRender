import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import type { LiveKitTokenResponse } from '@/types/livekit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomName, identity, metadata } = body;

    if (!roomName || typeof roomName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "roomName" parameter' },
        { status: 400 }
      );
    }

    if (!identity || typeof identity !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "identity" parameter' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
    const livekitUrl = process.env.LIVEKIT_URL || 'ws://127.0.0.1:7880';

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: '1h',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    const responsePayload: LiveKitTokenResponse = {
      token,
      url: livekitUrl,
      roomName,
      identity,
      expiresIn: 3600,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomName = searchParams.get('roomName') || 'talk-render-default';
  const identity = searchParams.get('identity') || `user-${Math.random().toString(36).substring(2, 8)}`;

  const fakeReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ roomName, identity }),
    headers: { 'Content-Type': 'application/json' },
  });

  return POST(fakeReq);
}
