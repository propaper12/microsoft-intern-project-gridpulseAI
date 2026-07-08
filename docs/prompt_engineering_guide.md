# AI Copilot: Prompt Engineering & Context Grounding 🧠

This document details the structure, logic, and design constraints of the system prompts used by the GridPulseAI Copilot assistant.

---

## 🛠️ Prompt Builder Architecture

Rather than using a raw string in the API endpoint, GridPulseAI uses a decoupled, structured prompt engineering module: **`src/prompt_builder.py`**. 

This module constructs prompts using a modular, schema-first design divided into five key functional sections:

### 1. `[SYSTEM RULES & ROLE]`
Defines the AI's professional persona, domain expertise, and operational boundaries:
*   **Role:** Senior SCADA & Power Grid Analytics Engineer.
*   **Context:** Assisting operators with high-voltage cable grids, substation diagnostics, and cooling/override parameters.

### 2. `[INSTRUCTION & TASK]`
Outlines the operational expectations and tasks:
*   Reason step-by-step internally using Chain-of-Thought (CoT) to ensure logic validation, but hide the reasoning from the final user response to keep it clean.
*   Analyze live anomalies fetched from ClickHouse and operating rules fetched from the SQLite RAG vector base.
*   Clearly cite the rule numbers (e.g. *Rule 101*, *Rule 103*) utilized in the response.

### 3. `[CONSTRAINTS & GUARDRAILS]`
Enforces runtime behavior and prevents hallucination:
*   **Anti-Hallucination:** Strictly limit answers to the provided data. If the answer cannot be found in the active anomalies or SQLite guidelines, reply with: *"Bu sorguyu yanıtlamak için yeterli işletim kılavuzu veya telemetri verisine sahip değilim."*
*   **Safety Thresholds:** Block any advice suggesting operators exceed critical grid limits (e.g., loading transformers > 500kW or chargers > 90°C).
*   **Conciseness:** Keep responses technical, professional, and limited to a maximum of 2-3 sentences.
*   **Language Constraint:** Dynamically switches languages (TR or EN) based on the user's active UI setting.

### 4. `[INPUT DATA]`
Injects runtime variables in structured JSON layout for precise parser readability:
```json
{
  "user_query": "Trafo 301 limitleri nelerdir?",
  "active_anomalies_clickhouse": [
    {
      "device": "TRAFO_301",
      "city": "London",
      "reason": "CRITICAL_OVERLOAD",
      "stability_score": 38.5,
      "diagnostics": "Load is 520kW (Limit 500kW)"
    }
  ],
  "reference_rules_sqlite_rag": [
    {
      "title": "Rule 101: Transformer Overload Protocol",
      "content": "If a Transformer experiences a critical overload where the active load exceeds 500kW..."
    }
  ]
}
```

---

## ⚡ Context Grounding (RAG) Flow

1.  **User Input:** Operator types a question or clicks a **Quick Query** button.
2.  **SQLite Search:** The query is vectorized and checked against local rules using Cosine Similarity in `src/vector_store.py`.
3.  **ClickHouse Diagnostics:** The API queries ClickHouse for active grid anomalies.
4.  **Prompt Compilation:** `src/prompt_builder.py` combines these sources into a structured markdown prompt.
5.  **LLM Execution:** The prompt is sent to the Hugging Face Inference API (`Zephyr-7B-Beta`) to generate a grounded, source-cited response.
