# API & Protocol Specification: TalkRender

This document provides the exhaustive specification for TalkRender's HTTP endpoints, WebSocket realtime messages, tool schemas, and sandboxed postMessage protocol.

---

## 1. HTTP Endpoints

### 1.1 Generate LiveKit Access Token
- **Path:** `/api/livekit/token`
- **Method:** `POST` / `GET`
- **Description:** Generates an authenticated JWT room access token granting permissions to subscribe to the remote avatar video and audio tracks.

#### Request Body (`POST`)
```json
{
  "roomName": "talkrender-room-alpha",
  "participantIdentity": "user_voice_client_01"
}
```

#### Query Parameters (`GET`)
- `room` (string, optional): Target room identifier (defaults to default room).
- `identity` (string, optional): Participant identity.

#### Success Response (`200 OK`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "wss://your-project.livekit.cloud"
}
```

#### Error Response (`400 Bad Request` / `500 Internal Error`)
```json
{
  "error": "Failed to generate LiveKit room token: Missing API credentials"
}
```

---

## 2. Boson AI Realtime WebSocket Protocol

- **Endpoint:** `wss://api.boson.ai/v1/realtime`
- **Protocol:** Bidirectional JSON-RPC streaming over WebSocket.

### 2.1 Session Initialization (`session.update`)
```json
{
  "type": "session.update",
  "session": {
    "modalities": ["audio", "text"],
    "voice": "higgs_natural_v1",
    "turn_detection": {
      "type": "server_vad",
      "threshold": 0.5,
      "prefix_padding_ms": 300,
      "silence_duration_ms": 500
    },
    "tools": [
      {
        "type": "function",
        "name": "draw_shape",
        "description": "Renders vector geometric shapes on the interactive canvas viewport.",
        "parameters": {
          "type": "object",
          "properties": {
            "shape": { "type": "string", "enum": ["circle", "rectangle", "star", "triangle", "polygon"] },
            "color": { "type": "string" },
            "radius": { "type": "number" },
            "width": { "type": "number" },
            "height": { "type": "number" },
            "x": { "type": "number" },
            "y": { "type": "number" }
          },
          "required": ["shape", "color"]
        }
      }
    ]
  }
}
```

### 2.2 Streaming Audio Delta (`response.audio.delta`)
```json
{
  "type": "response.audio.delta",
  "response_id": "resp_92381023",
  "item_id": "msg_01",
  "output_index": 0,
  "content_index": 0,
  "delta": "base64EncodedPcmAudioChunk=="
}
```

### 2.3 Function Call Yield (`response.function_call_arguments.done`)
```json
{
  "type": "response.function_call_arguments.done",
  "response_id": "resp_92381023",
  "call_id": "call_12345",
  "name": "draw_shape",
  "arguments": "{\"shape\":\"circle\",\"color\":\"#00ffff\",\"radius\":40,\"x\":200,\"y\":150}"
}
```

---

## 3. ComplexFuncBench Tool Calling Schemas

### 3.1 `draw_shape`
```typescript
{
  shape: 'circle' | 'rectangle' | 'star' | 'triangle' | 'polygon';
  color: string;
  radius?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  glow?: boolean;
}
```

### 3.2 `set_background`
```typescript
{
  mode: 'solid' | 'gradient' | 'grid';
  color?: string;
  gradientStops?: Array<{ color: string; offset: number }>;
}
```

### 3.3 `create_physics_body`
```typescript
{
  bodyType: 'circle' | 'box' | 'polygon';
  x: number;
  y: number;
  mass?: number;
  bounce?: number;
  friction?: number;
  color?: string;
}
```

### 3.4 `inject_script`
```typescript
{
  code: string;
  runtime?: 'canvas2d' | 'webgl' | 'dom';
  id?: string;
  isolated?: boolean;
}
```

---

## 4. Sandbox `postMessage` Protocol

| Message Type | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `HOST_INIT` | Host -> Guest | `{ version: string }` | Handshake initiation |
| `GUEST_READY` | Guest -> Host | `{ sessionId: string }` | Sandbox initialization ready ACK |
| `CANVAS_COMMAND` | Host -> Guest | `{ callId: string, action: CanvasCommandAction }` | Dispatches tool mutation |
| `COMMAND_ACK` | Guest -> Host | `{ callId: string, renderDurationMs: number, elementsCount: number }` | Command render acknowledgment |
| `PING` | Host -> Guest | `{ timestamp: number }` | Latency probe |
| `PONG` | Guest -> Host | `{ sentTimestamp: number }` | Latency response |
