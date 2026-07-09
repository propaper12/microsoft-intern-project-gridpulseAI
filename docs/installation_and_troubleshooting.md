# Installation & Troubleshooting Guide 🛠️

This document provides step-by-step setup instructions and remedies for common deployment issues in the GridPulseAI ecosystem.

---

## ⚙️ Standard Installation Sequence

### 1. Prerequisite Installations
*   **Python:** Ensure Python 3.9+ is installed. verify with `python --version`.
*   **Node.js:** Ensure Node.js v16+ is installed. verify with `node --version`.
*   **Docker:** Run Docker Desktop and make sure the docker engine is active.

### 2. Infrastructure Setup (Docker Compose)
From the root directory, launch ClickHouse, Redpanda, and Dragonfly containers:
```bash
docker compose up -d
```
Verify containers are running:
```bash
docker ps
```
Should list: `clickhouse`, `redpanda`, `dragonfly`, and `redpanda-console`.

### 3. Backend Setup
1.  Navigate to root directory.
2.  Create virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate environment:
    *   **Windows:** `venv\Scripts\activate`
    *   **Mac/Linux:** `source venv/bin/activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Populate SQLite Vector Knowledge Base:
    ```bash
    python src/initialize_kb.py
    ```

### 4. Frontend Setup
1.  Navigate to `frontend/` directory.
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Boot dev server:
    ```bash
    npm run dev
    ```

---

## 🚨 Troubleshooting Common Issues

### 1. Port 8080 or 8000 Already Allocated (Docker Bind Error)
**Symptom:** Docker container fails to start, throwing `port is already allocated` or `failed programming external connectivity`.
*   **Reason:** Another web app, proxy, or server is utilizing ports `8080` (Redpanda Console) or `8000` (FastAPI).
*   **Fix:** Stop conflicting containers or processes. In powershell:
    ```powershell
    # Stop other active project docker containers
    docker stop $(docker ps -q)
    # Rerun compose
    docker compose up -d
    ```

### 2. SQLite RAG returns empty replies or local fallback
**Symptom:** Asking the AI Copilot general rules returns empty references or defaults to offline grid stats.
*   **Reason:** The SQLite vector knowledge base is empty or outdated.
*   **Fix:** Re-populate the database:
    ```bash
    python src/initialize_kb.py
    ```
    Then restart the FastAPI server so the Uvicorn process reads the fresh SQLite database.

### 3. ClickHouse or Redpanda Connection Failures
**Symptom:** Anomaly detector logs (`task.log`) show `Connection refused` or `No brokers available`.
*   **Reason:** Python processes started before Docker containers were fully initialized.
*   **Fix:** Wait 10 seconds for Docker services to warm up, then restart the stream processor and detector scripts:
    ```bash
    python src/iot_grid_stream.py
    python src/grid_anomaly_detector.py
    ```
