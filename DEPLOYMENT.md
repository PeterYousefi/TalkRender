# Production Deployment Guide: TalkRender

This guide outlines deployment options for TalkRender across **Vercel**, **Docker Containerization**, and **Kubernetes**, along with LiveKit Cloud WebRTC and Boson AI infrastructure configuration.

---

## 1. Environment Variables Matrix

The following environment variables are required across all production environments:

| Variable Name | Required | Target Environment | Description |
| :--- | :--- | :--- | :--- |
| `LIVEKIT_API_KEY` | **Yes** | Server | LiveKit Cloud API key for signing room JWT tokens |
| `LIVEKIT_API_SECRET` | **Yes** | Server | LiveKit Cloud API secret |
| `NEXT_PUBLIC_LIVEKIT_URL` | **Yes** | Client + Server | Public WebSocket WebRTC signaling URL (e.g. `wss://<project>.livekit.cloud`) |
| `BOSON_API_KEY` | **Yes** | Client / Proxy | Boson AI Higgs Realtime access credential |
| `NEXT_PUBLIC_BOSON_WS_URL`| **Yes** | Client | WebSocket URL for Boson Realtime endpoint (`wss://api.boson.ai/v1/realtime`) |
| `NEXT_PUBLIC_AUTO_ROLLBACK` | No | Client | Automatically revert mutations on user barge-in (default: `true`) |
| `NEXT_PUBLIC_DEFAULT_THEME`| No | Client | Default UI workspace theme (`cyberpunk` \| `dark` \| `slate`) |

---

## 2. Option A: Deployment to Vercel

TalkRender is built with Next.js 15 App Router and is fully optimized for Vercel:

1. Push your repository to GitHub: `https://github.com/PeterYousefi/TalkRender.git`
2. Import project in the [Vercel Dashboard](https://vercel.com/new).
3. Select framework preset **Next.js**.
4. In **Environment Variables**, add:
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `NEXT_PUBLIC_LIVEKIT_URL`
   - `BOSON_API_KEY`
   - `NEXT_PUBLIC_BOSON_WS_URL`
5. Click **Deploy**. Vercel will run `npm run build` with Turbopack optimization and deploy edge-optimized assets.

---

## 3. Option B: Multi-Stage Docker Container

TalkRender utilizes Next.js **standalone output** (`output: 'standalone'` in `next.config.mjs`) to produce a minimal, self-contained Docker container image (~120MB).

### 3.1 Build Docker Image
```bash
docker build -t talkrender:latest .
```

### 3.2 Run Container
```bash
docker run -d \
  --name talkrender \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  talkrender:latest
```

### 3.3 Verify Container Health
```bash
curl -I http://localhost:3000
```

---

## 4. Option C: Docker Compose

For local staging or self-hosted servers:

```bash
docker compose up -d
```

View real-time container logs:
```bash
docker compose logs -f talkrender
```

---

## 5. LiveKit Cloud Infrastructure & Firewall Requirements

If self-hosting LiveKit or operating behind strict enterprise firewalls, ensure the following ports are open for WebRTC media transport:

| Port | Protocol | Usage |
| :--- | :--- | :--- |
| `7880` | TCP | WebSocket signaling |
| `7881` | TCP | WebRTC TCP fallback |
| `7882` | UDP | WebRTC UDP media streams |
| `3478` | UDP | TURN relay server |
| `50000-60000` | UDP | ICE candidate audio/video track allocation |

---

## 6. Zero-Downtime Rollouts & Health Checks

- **Health Probing**: Point orchestrator liveness probes to `GET /` and readiness probes to `GET /api/livekit/token?room=probe`.
- **Graceful Termination**: Standalone Node process handles `SIGTERM` and `SIGINT` signals, closing active WebRTC peer connections and WebSocket sessions gracefully.
