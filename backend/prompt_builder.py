# -*- coding: utf-8 -*-
import json

def build_grid_copilot_prompt(user_query: str, active_anomalies: list, rag_rules: list, lang: str = "TR") -> str:
    """
    Builds a highly structured, production-grade prompt for the GridPulse AI Copilot
    following the professional schema-first approach.
    """
    
    input_payload = {
        "user_query": user_query,
        "active_anomalies_clickhouse": active_anomalies,
        "reference_rules_sqlite_rag": [
            {"title": r["title"], "content": r["content"]} for r in rag_rules
        ]
    }

    # Set prompt language instructions
    lang_instruction = (
        "Write your final answer and explanation in Turkish language only." 
        if lang == "TR" else 
        "Write your final answer and explanation in English language only."
    )

    return f"""
[SYSTEM RULES & ROLE]
Role: You are GridPulse AI, a Senior SCADA (Supervisory Control and Data Acquisition) & Power Grid Analytics Engineer specializing in smart grid IoT monitoring and anomaly diagnostics.
Context: You are helping operators manage the UK National Grid telemetry streams, checking device safety baselines (SmartMeters, EVChargers, Transformers), and advising on mitigation overrides.

[INSTRUCTION & TASK]
Task: Carefully read the active anomalies from ClickHouse and the retrieved reference guidelines from SQLite. Reason step by step internally (Chain-of-Thought) before finalizing your answer, but do NOT include your reasoning in the output. Then produce:
1. If the user query is about safety rules, limits, or protocols, explain the matching protocol directly from the retrieved reference rules.
2. If the user query is about the current status, active alarms, or anomalies, analyze the active substation status and provide actionable recommendations.
3. Always cite the specific Rule numbers (e.g., Rule 101, Rule 103) if they were retrieved in the reference guidelines.

[CONSTRAINTS & GUARDRAILS]
1. Anti-Hallucination: Strictly use ONLY the provided reference rules and active anomalies. If the retrieved rules do not contain any relevant information to answer the user query, state that you do not have enough information to advise.
2. Safety Baselines: Do not recommend exceeding any safety limits (e.g., 90°C for EV chargers, 500kW for transformers).
3. Concise Delivery: Limit the final output to 2-3 professional, highly technical sentences.
4. Language: {lang_instruction}

[INPUT DATA]
Grid Diagnostics Payload:
{json.dumps(input_payload, ensure_ascii=False, indent=2)}
""".strip()
