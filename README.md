# GridPulse.AI

> **Microsoft Internship Project** — Real-time AI-SCADA monitor for smart cable / transformer grids.

[![Vite](https://img.shields.io/badge/Vite-React-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Ollama](https://img.shields.io/badge/Ollama-llama3.2%3A1b-black?style=flat-square)](https://ollama.com)
[![License](https://img.shields.io/badge/License-Project-lightgrey?style=flat-square)](#license--authors)

**GridPulse.AI** is an enterprise-style **AI-SCADA (Co-SCADA)** control room: live IoT telemetry, explainable anomaly detection (SHAP), local **GraphRAG** over a SQLite knowledge base, autonomous autopilot, HTML ops reports, and a browser **Voice Agent** for hands-free copilot dialog.

*TR:* Yeraltı yüksek gerilim kablo / trafo telemetrisini izleyen, XAI (SHAP) ile anomali açıklayan, SQLite + GraphRAG ile yerel RAG kullanan ve **Sesli Agent** ile konuşmalı operatör asistanı sunan Microsoft staj projesi.

---

## Features

| Area | What you get |
| :--- | :--- |
| **Live telemetry** | Simulated IoT grid stream → Redpanda → Bytewax anomaly pipeline → ClickHouse |
| **Explainable AI** | SHAP-backed anomaly diagnostics in the dashboard |
| **Grid Copilot** | `/api/copilot` with SQLite vector search, GraphRAG triplets, grounded replies via **Ollama (`llama3.2:1b`)** |
| **Autonomous Autopilot** | Agent start/stop, thought logs, actions, optional e-mail / outbox reports |
| **SCADA UI** | AI Control Room, Dashboard, Anomalies, Copilot + RAG trace panels |
| **Voice Agent** | Browser Web Speech API: speak → auto-send to copilot → TTS reply → optional continuous dialog (**frontend-only**) |
| **Offline RAG** | Local SQLite vector KB + entity/relation GraphRAG (no cloud required for retrieval) |

---

## Architecture

```text
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│ IoT simulator   │────▶│ Redpanda     │────▶│ Bytewax + SHAP │
│ (grid stream)   │     │ (Kafka API)  │     │ anomaly engine │
└─────────────────┘     └──────────────┘     └───────┬────────┘
                                                     ▼
                                              ClickHouse OLAP
                                                     │
┌─────────────────┐     ┌──────────────┐     ┌───────▼────────┐
│ React + Vite    │◀───▶│ FastAPI      │◀───▶│ SQLite Vector  │
│ :5173           │ API │ :8000        │     │ + GraphRAG     │
│ Voice (STT/TTS) │     │ SSE / REST   │     └────────────────┘
└─────────────────┘     └──────┬───────┘
                               ▼
                         Ollama :11434
                         llama3.2:1b
```

| Layer | Role | Stack |
| :--- | :--- | :--- |
| **Frontend** | Control room UI, Copilot chat, Voice Agent | React 19, Vite 8, Recharts |
| **Backend** | REST + SSE, RAG, agent loop, reports | FastAPI, Uvicorn, Python |
| **Streaming** | Telemetry ingest & anomaly filter | Redpanda, Bytewax |
| **Storage** | Analytics + local knowledge | ClickHouse, SQLite (vectors/graph), Dragonfly |
| **LLM** | Local inference for Copilot / agent | Ollama `llama3.2:1b` |

More detail: [`docs/system_architecture.md`](docs/system_architecture.md) · API: [`docs/api_reference.md`](docs/api_reference.md)

---

## Screenshots

> Add PNGs under `docs/images/` and link them here when available.

| Screen | Placeholder |
| :--- | :--- |
| Landing / Control Room | `docs/images/control-room.png` |
| Grid Copilot + RAG Trace | `docs/images/copilot-rag.png` |
| Voice Agent mode | `docs/images/voice-agent.png` |
| Autopilot HUD | `docs/images/autopilot.png` |

---

## Quick start

### Prerequisites

- Python 3.10+ recommended  
- Node.js 18+  
- Docker Desktop (Redpanda, ClickHouse, Dragonfly)  
- [Ollama](https://ollama.com) with model: `ollama pull llama3.2:1b`  
- **Chrome / Edge** for Voice Agent (Web Speech API)

### 1. Infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
python backend/initialize_kb.py

# optional: copy env for SMTP reports
copy .env.example .env   # Windows
# cp .env.example .env   # Unix

uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
```

In other terminals (optional live pipeline):

```bash
python backend/iot_grid_stream.py
python backend/grid_anomaly_detector.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

- UI: **http://127.0.0.1:5173**  
- API: **http://127.0.0.1:8000**

**Windows note:** Prefer `127.0.0.1` over `localhost`. On many Windows setups `localhost` resolves to `::1` and can hit the wrong listener; the app defaults API base to `http://127.0.0.1:8000` (`frontend/src/utils/apiBase.js`). Vite also proxies `/api` → `127.0.0.1:8000`.

Override if needed:

```bash
# frontend/.env.local
VITE_API_BASE=http://127.0.0.1:8000
```

### 4. Production frontend build

```bash
cd frontend
npm run build
npm run preview
```

---

## Environment variables

Root `.env` (loaded by the backend; see `.env.example`):

| Variable | Purpose |
| :--- | :--- |
| `GRIDPULSE_OPS_EMAIL` | Ops recipient for reports |
| `SMTP_HOST` / `SMTP_PORT` | Mail server (default Gmail SMTP) |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials (use app password) |
| `SMTP_FROM` | From address |

Without SMTP, reports are still written under `logs/outbox/` (gitignored).

Frontend (optional):

| Variable | Purpose |
| :--- | :--- |
| `VITE_API_BASE` | API origin (default `http://127.0.0.1:8000`) |

**Do not commit** real `.env` secrets.

---

## How to use: Autopilot

1. Start backend (+ Ollama online).  
2. Open the app → **AI Control Room** / agent HUD.  
3. Start Autopilot (`POST /api/agent/start` via UI).  
4. Watch status, thought stream, actions, and optional report delivery.  
5. Stop when done (`/api/agent/stop`).

Autopilot drives the autonomous loop (`backend/autonomous_loop.py`) and integrates with report service when configured.

---

## How to use: Voice Agent (Sesli Agent)

Full guide: [`docs/voice_agent.md`](docs/voice_agent.md)

1. Open **Grid AI Copilot** (chat terminal).  
2. Click **Sesli Agent** / **Talk to Agent**.  
3. Allow microphone access. Listening starts automatically; or use the mic button.  
4. Speak a question → transcript is **auto-submitted** to `/api/copilot`.  
5. The reply is spoken with browser **TTS**.  
6. Leave **Sürekli diyalog / Continuous dialog** on for listen → ask → speak → listen loops.

Classic mode (agent off): mic fills the input; optional speaker button reads AI replies only.

Requires HTTPS or `localhost`/`127.0.0.1` and a Chromium-based browser.

---

## Tech stack

- **Frontend:** React 19, Vite 8, Axios, Recharts, Web Speech API (STT/TTS)  
- **Backend:** FastAPI, Uvicorn, ClickHouse Connect, kafka-python, Bytewax  
- **AI / RAG:** Ollama `llama3.2:1b`, SQLite vector store, GraphRAG, SHAP / scikit-learn  
- **Infra:** Docker Compose — Redpanda, ClickHouse, Dragonfly  

---

## Documentation

| Doc | Topic |
| :--- | :--- |
| [Voice Agent](docs/voice_agent.md) | Sesli Agent usage & browser notes |
| [System architecture](docs/system_architecture.md) | Pipelines & components |
| [API reference](docs/api_reference.md) | REST endpoints |
| [Installation & troubleshooting](docs/installation_and_troubleshooting.md) | Setup issues |
| [SQLite vector search](docs/sqlite_vector_search.md) | Local RAG |
| [GraphRAG evaluation](docs/graph_rag_evaluation.md) | Graph retrieval |
| [Anomaly / SHAP](docs/anomaly_detection_shap.md) | XAI |
| [Prompt engineering](docs/prompt_engineering_guide.md) | Copilot prompts |

---

## Demo script (jury / internship)

1. **Control Room** — Show service LEDs (ClickHouse, SQLite, Ollama) and Autopilot.  
2. **Copilot** — Ask e.g. *“Trafo 301 durum analizi yap”* and open the RAG trace (vector, cosine hits, GraphRAG).  
3. **Voice Agent** — Enable Sesli Agent, ask the same question by voice; show continuous dialog.  
4. **Anomalies / Dashboard** — Point to live metrics and SHAP explanation where available.  
5. **Report** — Trigger an ops report; show outbox or SMTP delivery.

---

## Repository

- GitHub: [propaper12/microsoft-intern-project-gridpulseAI](https://github.com/propaper12/microsoft-intern-project-gridpulseAI)

---

## License & authors

Internship / academic Microsoft project — **GridPulse.AI**.

- Author context: Ömer Can (repo: [propaper12](https://github.com/propaper12))  
- No formal `LICENSE` file in-repo; treat as educational source unless otherwise agreed with Microsoft / your university.

---

## TR — Kısa özet

1. `docker compose up -d`  
2. `pip install -r requirements.txt` → `python backend/initialize_kb.py` → `uvicorn backend.api:app --host 127.0.0.1 --port 8000`  
3. `cd frontend && npm install && npm run dev` → **http://127.0.0.1:5173**  
4. Copilot’ta **Sesli Agent** ile konuşmalı sorgu; Autopilot ile otonom izleme.
