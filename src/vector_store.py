import os
import sqlite3
import json
import math

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "grid_rules_kb.db")

# Vocabulary keywords for deterministic offline embeddings (must match initialize_kb.py)
VOCABULARY = [
    "load", "overload", "transformer", "critical", "voltage", "drop",
    "stability", "phase", "temperature", "overheat", "charger", "ev",
    "meter", "carbon", "intensity", "renewables"
]

def get_embedding(text):
    """Generates a normalized frequency vector based on vocabulary keywords."""
    text_lower = text.lower()
    vector = []
    for word in VOCABULARY:
        count = text_lower.count(word)
        vector.append(float(count))
    
    # L2 Normalization
    norm = math.sqrt(sum(v**2 for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    else:
        vector = [0.0] * len(VOCABULARY)
    return vector

def cosine_similarity(v1, v2):
    """Computes the cosine similarity between two vectors."""
    dot_product = sum(x * y for x, y in zip(v1, v2))
    norm_v1 = math.sqrt(sum(x**2 for x in v1))
    norm_v2 = math.sqrt(sum(y**2 for y in v2))
    
    if norm_v1 > 0 and norm_v2 > 0:
        return dot_product / (norm_v1 * norm_v2)
    return 0.0

def find_relevant_rules(query, top_k=2):
    """
    Searches the local SQLite database for the most relevant document chunks
    matching the query using cosine similarity on text embeddings.
    """
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}. Run initialize_kb.py first.")
        return []
        
    query_vector = get_embedding(query)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, content, embedding FROM documents")
    rows = cursor.fetchall()
    conn.close()
    
    scored_results = []
    for title, content, embedding_json in rows:
        try:
            doc_vector = json.loads(embedding_json)
            score = cosine_similarity(query_vector, doc_vector)
            scored_results.append({
                "title": title,
                "content": content,
                "score": score
            })
        except Exception as e:
            print(f"Error parsing embedding for {title}: {e}")
            
    # Sort by similarity score descending
    scored_results.sort(key=lambda x: x["score"], reverse=True)
    
    # Return top K results
    return [res for res in scored_results if res["score"] > 0][:top_k]

if __name__ == "__main__":
    print("Testing Vector Store Search...")
    sample_queries = [
        "What happens if Trafo 301 is overloaded?",
        "What is the safety temperature for EV chargers?",
        "Severe voltage drop limits"
    ]
    for q in sample_queries:
        print(f"\nQuery: '{q}'")
        results = find_relevant_rules(q, top_k=2)
        if not results:
            print("  No relevant rules found.")
        for r in results:
            print(f"  [{r['score']:.4f}] {r['title']}")
            print(f"    Content: {r['content']}")
