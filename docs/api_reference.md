# API Reference Manual 🔌

This document provides technical specifications for the FastAPI backend endpoints, payload schemas, and RAG integration protocols in GridPulseAI.

---

## ⚡ REST API Endpoints

### 1. GET `/api/rules`
Retrieves all smart grid rules and safety guidelines stored in the offline SQLite vector database.
*   **Request:** `GET http://localhost:8000/api/rules`
*   **Response Headers:** `Content-Type: application/json`
*   **Response Body:**
    ```json
    [
      {
        "id": 101,
        "title": "Rule 101: Transformer Overload Protocol",
        "content": "If a Transformer (such as TRAFO_301 or TRAFO_302) experiences a critical overload..."
      },
      ...
    ]
    ```

### 2. POST `/api/copilot`
Submits a query to the AI Copilot Chatbot. It executes a local SQLite vector similarity lookup, queries ClickHouse for active anomalies, compiles a structured prompt, and queries Gemini 2.5 Flash.
*   **Request:** `POST http://localhost:8000/api/copilot`
*   **Request Body:**
    ```json
    {
      "message": "Trafo 301 aşırı yükleme protokolü nedir?",
      "lang": "TR"
    }
    ```
*   **Response Body:**
    ```json
    {
      "reply": "Trafo 301 için aşırı yükleme protokolü, aktif yükün 500kW'ı aşması durumunda...",
      "engine": "Gemini 2.5 Flash (Cloud RAG)"
    }
    ```

### 3. POST `/api/control/cooling`
Triggers the remote SCADA override to activate coolant valves in a substation.
*   **Request:** `POST http://localhost:8000/api/control/cooling`
*   **Request Body:**
    ```json
    {
      "device": "TRAFO_302",
      "city": "Wimbledon"
    }
    ```
*   **Response Body:**
    ```json
    {
      "status": "success",
      "action": "COOLING_ACTIVATED",
      "timestamp": "2026-07-09T15:20:00Z"
    }
    ```

### 4. GET `/api/stream/events`
Exposes a Server-Sent Events (SSE) stream delivering real-time ClickHouse metrics and ML diagnostic outputs to the SCADA dashboard.
*   **Request:** `GET http://localhost:8000/api/stream/events`
*   **Response Headers:** `Content-Type: text/event-stream`

---

## 🧠 LLM Query Integration Architecture

1.  **Semantic Search:** User queries are vectorized in Python using a deterministic vocabulary embedding model.
2.  **Cosine Similarity:** The engine fetches pre-computed vectors from SQLite and calculates similarity:
    $$\text{Sim} = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\|_2 \|\mathbf{d}\|_2}$$
3.  **Prompt Augmentation:** The top 2 matching documents (score > 0) are formatted and enjected as system context.
4.  **Multi-Tier LLM Execution:**
    *   *Tier 1:* Google Gemini 2.5 Flash API (Cloud-based, primary).
    *   *Tier 2 (Fallback):* Hugging Face Inference API - Mistral-Zephyr-7B (Cloud-based).
    *   *Tier 3 (Local Fallback):* Static regular expression heuristics based on keyword matching.
