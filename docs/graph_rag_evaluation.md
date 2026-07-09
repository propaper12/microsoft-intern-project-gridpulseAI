# Knowledge GraphRAG & RAG Evaluation Guide

This guide details the implementation of our production-grade **Knowledge GraphRAG (KG-RAG)** search engine and **OpenAI Cookbook-inspired Evaluation Metrics** implemented in GridPulseAI.

---

## 1. Knowledge Graph Architecture (GraphRAG)

Rather than treating documents as disconnected chunks of text, GridPulseAI organizes the substation rules, devices, failure modes, and locations into a **Knowledge Graph**. This allows the AI Copilot to navigate relationships and execute **multi-hop query reasoning**.

### SQLite Schema
We store graph nodes and relationships directly in `grid_rules_kb.db`:

```sql
CREATE TABLE graph_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    type TEXT -- 'substation', 'device', 'alarm', 'rule'
);

CREATE TABLE graph_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT,
    relation TEXT, -- 'IS_LOCATED_IN', 'MITIGATES', 'IS_A', 'PROTECTS'
    target TEXT
);
```

### Multi-Hop Retrieval (Local Search)
When a query is processed, the retriever performs relational lookups:
1. **1-Hop Retrieval:** Finds direct links matching the query elements (e.g., matching a device ID `TRAFO_301` to its substation `Wembley`).
2. **2-Hop Retrieval:** Follows category and type relationships (e.g., determining that `TRAFO_301` is a `Transformer`, and resolving that `Rule 101` regulates `Transformer` overloads).
3. **Triplet Output:** Formats these connections as directional triplets:
   `([Entity_A]) --[RELATION]--> ([Entity_B])`
   These triplets are injected into the LLM system prompt to ensure relational consistency.

---

## 2. Self-Healing & Query Expansion

To prevent retrieval failures caused by vocabulary mismatches (e.g., a user querying *"heat"* when the rules only mention *"temperature"*), we implement a **Self-Healing retrieval loop**:

1. **Similarity Validation:** If the highest cosine similarity score for retrieved SQLite rules is `< 0.35` (35%), the system flags the retrieval as weak.
2. **Semantic Query Expansion:** The query terms are expanded with synonyms and related concepts:
   * *"trafo"* or *"substation"* $\rightarrow$ expanded to include *"transformer"*, *"overload"*, *"load"*.
   * *"ısınma"* or *"sıcaklık"* $\rightarrow$ expanded to include *"temperature"*, *"overheat"*, *"overheating"*.
3. **Re-retrieval:** The system executes a secondary search with the expanded terms to fetch the correct documents.

---

## 3. RAG Triad Evaluation: Groundedness Score

Inspired by the **OpenAI Cookbook** best practices, we measure LLM response truthfulness using a lexical overlap Groundedness score to verify that the LLM is not fabricating facts (hallucinating).

### Formula
We calculate Groundedness by checking the percentage of key alphanumeric words (length $\ge 3$) in the LLM response that exist in the retrieved context:

\[\text{Overlap \%} = \frac{|\text{Clean Reply Words} \cap \text{Clean Context Words}|}{|\text{Clean Reply Words}|} \times 100\]

The final score is normalized using a production baseline formula:

\[\text{Groundedness} = \min(100.0, 75.0 + (\text{Overlap \%} \times 0.25))\]

* **Score $\ge$ 90% (Green Glow):** Indicates the answer is strongly grounded in the retrieved database facts.
* **Score < 90% (Yellow Glow):** Indicates potential auxiliary wording or a less-grounded response.
