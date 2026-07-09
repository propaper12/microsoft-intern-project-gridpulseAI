# GridPulseAI ⚡
### Microsoft Internship Project - Real-Time AI-SCADA IoT Cable Grid Monitor

**GridPulseAI** is a futuristic, enterprise-grade AI-powered Co-SCADA (Supervisory Control and Data Acquisition) monitoring dashboard. It is designed to track underground high-voltage power cables, analyze soil thermal capacity, calculate solar-induced derating limits, perform real-time explainable cybersecurity anomaly detection (XAI SHAP), and implement an offline local RAG AI Copilot using SQLite vector storage and Microsoft Foundry Local standards.

---

## 🚀 Key Features

*   **🧠 Yapay Zeka Beyni & Kontrol Odası (AI Brain Control Room):** 
    *   A full-screen primary workspace tab that puts AI at the core of SCADA operations.
    *   **AI System Observability Context:** Displays real-time parameters (ClickHouse anomaly count, SQLite RAG rules count, weather load multipliers) that the AI automatically reads.
    *   **AI Autopilot Diagnostics:** Execute one-click full grid scans causing the AI to retrieve ClickHouse warnings, compare SQLite guidelines, and compile comprehensive diagnostic reports.
*   **🔍 RAG Akış Analizi (RAG Execution Path Inspector):**
    *   Click **"🔍 RAG Analiz Raporu"** under any AI chat reply to view a neon-styled step-by-step diagnostic modal.
    *   Inspect exactly: (1) The user query's 32-D vectorized representation, (2) The retrieved SQLite rules with Cosine Similarity scores, (3) Live ClickHouse telemetry anomalies, and (4) The final augmented system prompt.
*   **🧪 Vektör & Kosinüs Matematik Simülatörü (Vector Cosine Math Lab):**
    *   An interactive math playground in the Rules tab to prove vector space mechanics.
    *   **Text Vectorizer:** Input any word and view its L2-normalized 32-dimensional float array representation.
    *   **Live Cosine Similarity Tester:** Input two different sentences (e.g. *trafo* vs *transformer*) and compute their semantic similarity percentage with a live progress bar.
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
*   **📁 Offline Local RAG & Vector Search (SQLite & Microsoft Foundry Local):**
    *   **SQLite Vector Storage:** Stores smart grid rules, safety guidelines, and emergency protocols along with their computed embedding vectors in a local `grid_rules_kb.db`.
    *   **Local Semantic Search:** Performs cosine similarity calculations entirely offline in Python to retrieve relevant operating manuals.
    *   **Microsoft Foundry Local Integration:** Feeds retrieved context into an on-device local LLM (e.g. Phi-3.5) with graceful cloud fallbacks for fully offline, grounded Q&A.
*   **⚡ Remote SCADA Cyber Control Overrides:**
    *   Context-aware control operations (❄️ Activate Grid Cooling, 🔄 Balance Grid Phases, ⚡ Derate Current Limits) to mitigate active grid alarms.
*   **🟢 Glowing Service Health LEDs:**
    *   A futuristic status LED panel in the topbar indicating the live connection status (ONLINE/OFFLINE) of ClickHouse (CH), Redpanda (RP), SQLite RAG (RAG), and Gemini.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Data Stream Pipeline
        Sensors[📡 IoT Grid Sensors] -->|JSON Telemetry| Redpanda[✉️ Redpanda Kafka Broker]
        Redpanda -->|Stream Processing| Bytewax[🐝 Bytewax Dataflow Engine]
        Bytewax -->|ML Diagnostics| XAI[🧠 SHAP Anomaly Classifier]
        XAI -->|Aggregated Data| ClickHouse[(🗄️ ClickHouse DB)]
    end

    subgraph Offline Local RAG
        SQLite[(📁 SQLite Vector DB)] <-->|Cosine Vector Similarity| VectorStore[🔍 Vector Search Engine]
    end

    subgraph Service Layer
        ClickHouse -->|SQL Queries| FastAPI[⚡ FastAPI Server]
        VectorStore <-->|Local Context| FastAPI
        FastAPI -->|SSE / JSON API| React[⚛️ React Vite UI]
        React -->|Operator Chat Queries| FastAPI
        FastAPI -->|Offline LLM| LLM[🤖 Local LLM / Foundry Local]
    end
```

---

## ⚙️ Tech Stack

*   **Frontend:** React 18, Vite, Leaflet, Recharts.
*   **Backend:** FastAPI (Python), Uvicorn.
*   **Data Processing:** Bytewax (Stateful Python/Rust Engine).
*   **Message Broker:** Redpanda (Kafka compatible).
*   **Database:** ClickHouse (OLAP), SQLite (Vektör Bilgi Bankası), Dragonfly (Redis-compatible cache).
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

### Step 3: Populate local RAG Vektör Bilgi Bankası (SQLite)
Initialize the local SQLite database and populate it with smart grid safety rules and computed embeddings:
```bash
python src/initialize_kb.py
```

---

### Step 4: Run Background Services
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

### Step 5: Run Frontend Client
Navigate to the `frontend/` directory, install packages, and boot Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📖 Technical Documentation

Explore the comprehensive technical guides and manuals detailing the GridPulseAI architecture and AI models:

*   **🏗️ [System Architecture & Data Pipelines](docs/system_architecture.md):** Detailed overview of the real-time grid stream processing architecture, detailing Redpanda, Bytewax, ClickHouse, and React UI data pipelines.
*   **🧠 [AI Copilot & Prompt Engineering Guide](docs/prompt_engineering_guide.md):** Technical specifications of prompt role definitions, anti-hallucination guardrails, and structural system instruction formats.
*   **🔍 [SQLite Offline Vector Search](docs/sqlite_vector_search.md):** Documentation of the offline vector search mathematical backend, covering vocabulary-based frequency embeddings and Cosine Similarity matching algorithms.
*   **📈 [ML Anomaly Detection & SHAP Explanations](docs/anomaly_detection_shap.md):** Detailed guide on the machine learning pipeline, documenting XGBoost feature engineering and real-time Explainable AI (XAI) feature weights.
*   **🛠️ [Installation & Troubleshooting Guide](docs/installation_and_troubleshooting.md):** Step-by-step setup walkthrough, detailing python environments, Node.js packages, and Docker port conflict resolution procedures.
*   **🔌 [API Reference Manual](docs/api_reference.md):** Complete specifications of REST API endpoints, SSE streams, JSON payloads, and RAG copilot integration flows.

---

## 🛡️ Presentation Credentials & Notes
*   **🧠 Yapay Zeka Beyni (AI Control Room):** Select the `🧠 Yapay Zeka Beyni` tab from the left sidebar navigation. Ask questions in the large AI Terminal or click **"🤖 Tam Şebeke Analizi Tetikle"** to trigger a full system telemetry diagnostics run.
*   **🔍 RAG Akış Analizi (RAG Inspector):** Once the AI replies, click **"🔍 RAG Analiz Raporu"** under the bubble to show the jury the exact 32-D query vector and SQLite cosine matching scores.
*   **🧪 Vektör Matematik Simülatörü:** Select the `Rules` tab and use the right-hand **Vector Cosine Math Lab** panel to type words, inspect 32-D vectors, and calculate similarity between sentences in real-time.
*   **🟢 Service LEDs & Offline Mode:** The topbar LEDs dynamically check database connections. If Docker is offline, the React frontend falls back to simulated pipelines seamlessly to maintain a 100% stable presentation demo.
