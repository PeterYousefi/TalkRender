import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBosonRealtime } from '../useBosonRealtime';

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
  onclose: ((ev: unknown) => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  sentData: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) this.onopen();
  }

  simulateMessage(data: Record<string, unknown>) {
    if (this.onmessage) this.onmessage({ data: JSON.stringify(data) });
  }

  send(data: string) {
    this.sentData.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000, reason: 'Closed' });
  }
}

describe('useBosonRealtime Hook', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  it('should initialize in idle status', () => {
    const { result } = renderHook(() => useBosonRealtime());
    expect(result.current.status).toBe('idle');
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isListening).toBe(false);
  });

  it('should update status when connection opens', () => {
    const { result } = renderHook(() => useBosonRealtime());

    act(() => {
      result.current.connect();
    });

    const wsInstance = MockWebSocket.instances[0];
    act(() => {
      wsInstance.simulateOpen();
    });

    expect(result.current.status).toBe('connected');
  });

  it('should dispatch interruption call', () => {
    const onInterruptedMock = vi.fn();
    const { result } = renderHook(() =>
      useBosonRealtime({ onInterrupted: onInterruptedMock })
    );

    act(() => {
      result.current.connect();
    });

    const wsInstance = MockWebSocket.instances[0];
    act(() => {
      wsInstance.simulateOpen();
    });

    act(() => {
      result.current.interrupt();
    });

    expect(result.current.status).toBe('interrupted');
    expect(onInterruptedMock).toHaveBeenCalledTimes(1);
    expect(wsInstance.sentData).toHaveLength(2);
  });

  it('should send function result payload', () => {
    const { result } = renderHook(() => useBosonRealtime());

    act(() => {
      result.current.connect();
    });

    const wsInstance = MockWebSocket.instances[0];
    act(() => {
      wsInstance.simulateOpen();
    });

    act(() => {
      result.current.sendFunctionResult('call-123', '{"status":"ok"}');
    });

    expect(wsInstance.sentData).toHaveLength(1);
    const sent = JSON.parse(wsInstance.sentData[0]);
    expect(sent.type).toBe('conversation.item.create');
    expect(sent.item.callId).toBe('call-123');
  });
});
