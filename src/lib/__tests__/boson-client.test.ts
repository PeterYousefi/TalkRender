import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BosonRealtimeClient } from '../boson-client';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];
  url: string;
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  sentData: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  simulateOpen() {
    this.readyState = 1; // OPEN
    if (this.onopen) this.onopen();
  }

  simulateMessage(data: Record<string, unknown>) {
    if (this.onmessage) this.onmessage({ data: JSON.stringify(data) });
  }

  simulateClose(code = 1000, reason = 'Normal closure') {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ code, reason });
  }

  simulateError(error: unknown) {
    if (this.onerror) this.onerror(error);
  }

  send(data: string) {
    this.sentData.push(data);
  }

  close() {
    this.simulateClose();
  }
}

describe('BosonRealtimeClient', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with idle status', () => {
    const client = new BosonRealtimeClient({ url: 'wss://api.boson.ai/v1/realtime' });
    expect(client.getStatus()).toBe('idle');
  });

  it('should append API key parameter to WebSocket URL when provided', () => {
    const client = new BosonRealtimeClient({
      url: 'wss://api.boson.ai/v1/realtime',
      apiKey: 'test-secret-key-123',
    });

    client.connect();
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe(
      'wss://api.boson.ai/v1/realtime?api_key=test-secret-key-123'
    );
  });

  it('should transition to connected status upon socket open', () => {
    const client = new BosonRealtimeClient({ url: 'wss://api.boson.ai/v1/realtime' });
    const statusHistory: string[] = [];
    client.on('statusChange', (s) => statusHistory.push(s as string));

    client.connect();
    expect(client.getStatus()).toBe('connecting');

    const wsInstance = MockWebSocket.instances[0];
    wsInstance.simulateOpen();

    expect(client.getStatus()).toBe('connected');
    expect(statusHistory).toContain('connecting');
    expect(statusHistory).toContain('connected');
  });

  it('should dispatch incoming speech and function call events', () => {
    const client = new BosonRealtimeClient({ url: 'wss://api.boson.ai/v1/realtime' });
    client.connect();
    const wsInstance = MockWebSocket.instances[0];
    wsInstance.simulateOpen();

    let receivedFunctionCall: unknown = null;
    let receivedSpeechStart = false;

    client.on('functionCall', (call) => {
      receivedFunctionCall = call;
    });
    client.on('speechStarted', () => {
      receivedSpeechStart = true;
    });

    wsInstance.simulateMessage({
      type: 'input_audio_buffer.speech_started',
      audioStartMs: 50,
      itemId: 'user-speech-1',
    });
    expect(receivedSpeechStart).toBe(true);
    expect(client.getStatus()).toBe('listening');

    wsInstance.simulateMessage({
      type: 'response.function_call_arguments.done',
      responseId: 'resp_1',
      itemId: 'item_1',
      outputIndex: 0,
      callId: 'call_draw_1',
      name: 'draw_shape',
      arguments: JSON.stringify({ shape: 'circle', radius: 25 }),
    });

    expect(receivedFunctionCall).toEqual({
      callId: 'call_draw_1',
      name: 'draw_shape',
      arguments: JSON.stringify({ shape: 'circle', radius: 25 }),
    });
  });

  it('should execute barge-in interruption cleanly', () => {
    const client = new BosonRealtimeClient({ url: 'wss://api.boson.ai/v1/realtime' });
    client.connect();
    const wsInstance = MockWebSocket.instances[0];
    wsInstance.simulateOpen();

    let interruptedEventFired = false;
    client.on('interrupted', () => {
      interruptedEventFired = true;
    });

    const result = client.interrupt();
    expect(result).toBe(true);
    expect(interruptedEventFired).toBe(true);
    expect(client.getStatus()).toBe('interrupted');

    const messages = wsInstance.sentData.map((d) => JSON.parse(d));
    expect(messages).toEqual([
      { type: 'input_audio_buffer.clear' },
      { type: 'response.cancel' },
    ]);
  });

  it('should allow clean disconnection without automatic reconnection', () => {
    const client = new BosonRealtimeClient({ url: 'wss://api.boson.ai/v1/realtime' });
    client.connect();
    const wsInstance = MockWebSocket.instances[0];
    wsInstance.simulateOpen();

    client.disconnect();
    expect(client.getStatus()).toBe('idle');
    expect(client.getReconnectAttempts()).toBe(0);
  });
});
