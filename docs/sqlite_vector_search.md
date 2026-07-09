# SQLite Offline Vector Database & Cosine Similarity 🔍

This document explains the zero-dependency, mathematical, and database implementation of our local Retrieval-Augmented Generation (RAG) vector store.

---

## 📐 Vector Similarity Mathematics

To retrieve the most relevant operating guidelines for a user query without sending data to external embeddings APIs (such as OpenAI or Cohere), GridPulseAI calculates local word frequency vectors and matches them using **Cosine Similarity**:

$$\text{Similarity}(\mathbf{q}, \mathbf{d}) = \cos(\theta) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|} = \frac{\sum_{i=1}^{n} q_i d_i}{\sqrt{\sum_{i=1}^{n} q_i^2} \sqrt{\sum_{i=1}^{n} d_i^2}}$$

Where:
*   $\mathbf{q}$ is the vectorized representation of the user query.
*   $\mathbf{d}$ is the vectorized representation of a document rule.
*   The resulting score is bounded between `0.0` (completely orthogonal, no common vocabulary) and `1.0` (perfect vocabulary alignment).

---

## 📁 SQLite Database Schema

The database is stored locally in `data/grid_rules_kb.db`. It contains a single table `grid_rules` structured as follows:

```sql
CREATE TABLE IF NOT EXISTS grid_rules (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT UNIQUE,
    content TEXT,
    vector TEXT  -- JSON-serialized array of floats representing word counts normalized to unit length (L2 norm)
);
```

### Vocabulary Building & Vectorization (`src/vector_store.py`)
1.  **Stopwords Filtering:** Common terms (e.g., *and, the, is, a, bu, ve, bir*) are excluded.
2.  **Vocabulary Collection:** The system builds a vocabulary dictionary mapping unique words to indices across all operating guidelines:
    ```python
    VOCAB = { "overload": 0, "transformer": 1, "voltage": 2, "temperature": 3, "intensity": 4, ... }
    ```
3.  **L2 Normalization:** Word count arrays are divided by their Euclidean length ($L2$ norm) so that document length does not skew similarity matches:
    $$\mathbf{v}_{\text{normalized}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2}$$

---

## 🔍 Retrieval Flow

When a query is processed via `find_relevant_rules(query, top_k)`:
1.  The query string is tokenized and cleaned of punctuation.
2.  A vector $\mathbf{q}$ is computed based on the pre-built vocabulary.
3.  The engine loads all rules and their pre-computed vectors from SQLite.
4.  It calculates the dot product (Cosine Similarity) of the query vector against each document vector.
5.  It sorts the records by similarity in descending order and returns the top $k$ matching rules with scores above `0.0`.

---

## 🧪 Interactive RAG Diagnostics & Vector Lab

To make this retrieval pipeline inspectable and transparent for academic reviews:
1.  **RAG Execution Path Inspector:** Captures the computed 32-D query vector $\mathbf{q}$, SQLite retrieval scores, active ClickHouse telemetry flags, and the compiled system prompt context, returning them as metadata in the `/api/copilot` response JSON. The UI renders this inside a dedicated neon trace modal.
2.  **Vector & Cosine Math Lab Widget:** Exposes `/api/vectorize` and `/api/vector_compare` endpoints. Operators can input arbitrary strings to view their L2-normalized frequency arrays and compute similarity scores between custom grid scenarios. This visualizes exactly how close two concepts (e.g. *trafo overload* vs *overheating charger*) lie within the coordinate vector space.
