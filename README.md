# GridPulseAI ⚡
### Microsoft Internship Project - Real-Time AI-SCADA IoT Cable Grid Monitor

**GridPulseAI** is a füturistic, enterprise-grade AI-powered Co-SCADA (Supervisory Control and Data Acquisition) monitoring dashboard. It is designed to track underground high-voltage power cables, analyze soil thermal capacity, calculate solar-induced derating limits, and perform real-time explainable cybersecurity anomaly detection (XAI SHAP).

---

## 🚀 Key Features

*   **🗺️ Geographic SCADA Map (Google Maps Integration):** 
    *   Leverages high-speed Google Maps Roadmap CDN layers to load instantly.
    *   Interactive **SVG Cable Routes** (Polylines) across 9 key locations in London, changing color dynamically based on real-time cable thermal stress.
*   **📡 Stateful Big Data Stream Pipeline:**
    *   **Redpanda (Kafka):** High-throughput event ingestion broker.
    *   **Bytewax (Rust-powered):** Stateful stream processing engine grouping and filtering raw sensor telemetries.
    *   **ClickHouse OLAP Database:** Columnar database for high-performance sub-millisecond telemetry analytics.
*   **🧠 Explainable AI (XAI SHAP) & Diagnostics:**
    *   Neural threat detection identifying voltage anomalies, physical overload, and overheating alerts.
    *   Real-time **SHAP feature importance bars** displaying the AI's exact trigger factors (Load, Temp, Voltage Delta).
*   **⚡ Remote SCADA Cyber Control Overrides:**
    *   Context-aware control operations (❄️ Activate Grid Cooling, 🔄 Balance Grid Phases, ⚡ Derate Current Limits) to mitigate active grid alarms.
*   **🔊 Latency-Free Synthetic Warning Alarms:**
    *   Browser-native Web Audio API synthesizer generating warning chimes dynamically without static media assets.
*   **🔌 Graceful Standalone Fallback:**
    *   Automatically detects if Docker/ClickHouse/Redpanda are offline and seamlessly transitions to client-side simulated data streams, ensuring the dashboard never crashes during live presentations.

---

## 🏗️ System Architecture

```mermaid
graph LR
    Sensors[📡 IoT Grid Sensors] -->|JSON Telemetry| Redpanda[✉️ Redpanda Kafka Broker]
    Redpanda -->|Stream Processing| Bytewax[🐝 Bytewax Dataflow Engine]
    Bytewax -->|ML Diagnostics| XAI[🧠 SHAP Anomaly Classifier]
    XAI -->|Aggregated Data| ClickHouse[(🗄️ ClickHouse DB)]
    ClickHouse -->|Queries / Analytics| FastAPI[⚡ FastAPI Server]
    FastAPI -->|SSE Stream / JSON APIs| React[⚛️ React Vite UI]
    React -->|Mitigation Signals| SCADA[⚡ Remote SCADA Controllers]
```

---

## ⚙️ Tech Stack

*   **Frontend:** React 18, Vite, Leaflet (Map Tiles via Google Maps CDN), Recharts.
*   **Backend:** FastAPI (Python), Uvicorn.
*   **Data Processing:** Bytewax (Stateful Python/Rust Engine).
*   **Message Broker:** Redpanda (Kafka compatible).
*   **Database:** ClickHouse (OLAP), SQLite (fallback metadata), Dragonfly (Redis-compatible cache).
*   **AI/ML:** scikit-learn, SHAP explainers.

---

## 🛠️ Setup & Execution Guide

### Prerequisites
Make sure you have the following installed on your machine:
*   [Python 3.9+](https://www.python.org/downloads/)
*   [Node.js (v16+)](https://nodejs.org/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

### Step 1: Start Docker Infrastructure
Spin up Redpanda, ClickHouse, and Dragonfly databases in background containers:
```bash
docker compose up -d
```
Once started, the management interfaces will be available:
*   **Redpanda Console:** [http://localhost:8080](http://localhost:8080)
*   **ClickHouse Play HTTP Client:** [http://localhost:8123/play](http://localhost:8123/play)

---

### Step 2: Set Up Backend Virtual Environment
Navigate to the root directory and install dependencies:
```bash
# Create venv
python -m venv venv

# Activate venv (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 3: Run Background Services
Activate your virtual environment and start each script in a separate terminal:
1.  **FastAPI REST/SSE Server:**
    ```bash
    uvicorn src.api:app --reload --port 8000
    ```
2.  **IoT Grid Telemetry Producer:**
    ```bash
    python src/iot_grid_stream.py
    ```
3.  **Real-Time ML Anomaly Detector:**
    ```bash
    python src/grid_anomaly_detector.py
    ```

---

### Step 4: Run Frontend Client
Navigate to the `frontend/` directory, install packages, and boot Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛡️ Presentation Credentials & Notes
*   **AI Copilot (RAG):** Type grid questions into the chat bubble at the bottom right. The LLM uses RAG on ClickHouse's telemetry table to answer directly.
*   **Offline Mode:** If Docker is not running, the frontend automatically falls back to an offline simulated stream. You can still present the entire project without any databases running!
