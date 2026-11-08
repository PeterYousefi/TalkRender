# 🎙️ TalkRender: Voice-Directed Autonomous Web Canvas

> **A production-ready, full-duplex voice-directed code canvas powered by Boson AI (Higgs Realtime + Higgs Avatar) and LiveKit WebRTC.**

[![CI Workflow](https://github.com/PeterYousefi/TalkRender/actions/workflows/ci.yml/badge.svg)](https://github.com/PeterYousefi/TalkRender/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-success.svg)](https://livekit.io/)
[![Boson AI](https://img.shields.io/badge/Boson_AI-Higgs_Realtime-purple.svg)](https://boson.ai/)
[![Tests](https://img.shields.io/badge/Vitest-200%2B%20Tests%20Passing-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Overview

**TalkRender** is an AI-powered creative coding workspace where users direct visual and interactive canvas simulations using real-time conversational voice. Built on Next.js 15, Boson AI Higgs Realtime WebSocket protocol, and LiveKit WebRTC video streaming, TalkRender bridges natural language intent directly to live DOM and Canvas mutations inside a secure, sandboxed runtime environment.

```
       ┌────────────────┐
       │   User Voice   │
       └───────┬────────┘
               │ (WebRTC Audio Stream)
               ▼
   ┌───────────────────────┐
   │ LiveKit Cloud Server  │
   └───────┬───────────────┘
           │
           │ (PCM Audio Ingest)
           ▼
   ┌───────────────────────┐           ┌────────────────────────────┐
   │ Boson Higgs Realtime  │ ────────> │   Higgs Avatar Streaming   │
   │  Speech-to-Speech LLM │           │ (WebRTC Remote Video Track)│
   └───────┬───────────────┘           └─────────────┬──────────────┘
           │                                         │
           │ (JSON Tool Calls via ComplexFuncBench)   │
           ▼                                         ▼
   ┌───────────────────────┐           ┌────────────────────────────┐
   │  Tool Execution Queue │           │ Avatar Video + Viseme HUD  │
   │  & Optimistic Rollback│           │    (Sub-150ms Barge-In)    │
   └───────┬───────────────┘           └────────────────────────────┘
           │
           │ (Validated PostMessage Protocol)
           ▼
   ┌─────────────────────────────────────────┐
   │ Secure Sandboxed Canvas Runtime (CSP)   │
   │ HTML5 / 2D Canvas / WebGL / Physics     │
   └─────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. ⚡ Full-Duplex Conversational AI & Viseme Avatar
- **Boson AI Higgs Realtime**: Low-latency bidirectional WebSocket connection with streaming audio-to-audio dialogue.
- **Higgs Avatar WebRTC Track**: Talking-head avatar video synced with real-time lip movement.
- **Viseme & Audio Analyzer**: Fast Fourier Transform (FFT) frequency spectrum tracker that drives mouth visemes (`sil`, `aa`, `oh`, `ee`, `ff`, `th`, `dd`, `ss`).

### 2. 🛑 Sub-150ms Speech Barge-In & State Rollback
- **Client-Side Speech Burst Detection**: Monitors audio input energy (-38 dBFS) with sub-150ms trigger latency.
- **Micro-Fade Audio Suppression**: Immediate 15ms gain ramp-down to silence remote audio upon speech detection.
- **Optimistic State Rollback**: Automatically rolls back partial or interrupted canvas mutations if user interrupts during generation.

### 3. 🛠️ ComplexFuncBench Tool Calling Registry
Strictly-typed Zod schemas with instant parameter validation:
- `draw_shape`: Render circles, rectangles, stars, triangles, and polygons with glow, fill, and stroke effects.
- `set_background`: Configure solid colors, radial/linear gradients, or particle grids.
- `create_physics_body`: Spawn rigid bodies (circle, box, polygon) with mass, bounce, friction, and gravity.
- `clear_canvas`: Clear the stage or preserve background styles.
- `inject_script`: Dynamically inject sandboxed JS animation scripts (2D Canvas, WebGL, DOM).
- `update_style`: Hot-reload CSS properties on the canvas viewport.

### 4. 🛡️ Isolated Sandbox & Strict CSP
- **Zero Host Leakage**: Runs in an isolated `iframe` with `sandbox="allow-scripts allow-same-origin"`.
- **Strict Content Security Policy**: Disallows external script loading or unauthorized origin communication.
- **Bidirectional Handshake**: Handshake validation (`HOST_INIT` / `GUEST_READY`) and command acknowledgments (`COMMAND_ACK`) with telemetry tracking.

### 5. 💻 Split-Screen Developer Workspace
- **Tri-Pane Layout**: Collapsible Avatar Co-Pilot (left), Live Interactive Canvas & Terminal (center), and Tabbed Inspector (right).
- **Manual Command Terminal**: Fallback directive CLI when muted (`help`, `clear`, `rollback`, quick prompts).
- **Tool & Code Inspector**: Live inspection of tool execution logs, expandable JSON payloads, and dynamic code diff editor.
- **Real-Time Telemetry HUD**: Monitors ping, WebRTC audio RTT, frame render time, FPS (60fps target), and jitter.

### 6. 🎨 Interactive Template Library
- **2D Physics Playground**: Gravity, collision dynamics, and bouncing balls.
- **Cyberpunk Neon City**: Glowing skyscrapers and dynamic matrix rain.
- **Interactive Solar System**: Orbital mechanics and glowing planets.
- **Procedural Cellular Automata**: Conway's Game of Life grid simulation.

---

## 🚀 Quick Start

### Prerequisites
- Node.js `20.x` or later
- npm `10.x` or later
- [LiveKit Cloud](https://cloud.livekit.io) account (API Key, API Secret, Server URL)
- [Boson AI](https://boson.ai) API credentials

### Installation

```bash
# 1. Clone repository
git clone https://github.com/PeterYousefi/TalkRender.git
cd TalkRender

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your credentials:

```ini
# LiveKit WebRTC Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Boson AI Realtime Configuration
BOSON_API_KEY=your_boson_api_key
NEXT_PUBLIC_BOSON_WS_URL=wss://api.boson.ai/v1/realtime

# Application Preferences
NEXT_PUBLIC_AUTO_ROLLBACK=true
NEXT_PUBLIC_DEFAULT_THEME=cyberpunk
```

### Development Server

Run the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

TalkRender features an exhaustive test suite with **over 200 unit, component, and E2E tests**:

```bash
# Run full Vitest suite
npm test

# Run tests in watch mode
npm run test:watch

# Run TypeScript typecheck
npm run typecheck

# Run Next.js linter
npm run lint

# Build standalone production bundle
npm run build
```

---

## 📦 Containerization & Deployment

Build and run using Docker:

```bash
# Build production Docker image
docker build -t talkrender:latest .

# Run container
docker run -p 3000:3000 --env-file .env.local talkrender:latest
```

---

## 📄 License

MIT © [TalkRender Architecture Team](https://github.com/PeterYousefi/TalkRender)
