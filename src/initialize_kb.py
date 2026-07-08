import os
import sqlite3
import json
import math

# Target DB Path
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "grid_rules_kb.db")

# Vocabulary keywords for deterministic offline embeddings (Bilingual support)
VOCABULARY = [
    "load", "yük", "yükleme",
    "overload", "aşırı yük",
    "transformer", "trafo",
    "critical", "kritik",
    "voltage", "voltaj",
    "drop", "düşüş", "düşüşü",
    "stability", "kararlılık", "stabil",
    "phase", "faz",
    "temperature", "sıcaklık", "sıcak",
    "overheat", "ısınma", "aşırı ısınma",
    "charger", "şarj", "şarjı",
    "ev", "elektrikli",
    "meter", "sayaç",
    "carbon", "karbon",
    "intensity", "yoğunluk", "yoğunluğu",
    "renewables", "yenilenebilir", "yeşil"
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

def initialize_database():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop table if exists to overwrite
    cursor.execute("DROP TABLE IF EXISTS documents")
    
    # Create Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            embedding TEXT
        )
    """)
    
    # Smart Grid Operating Manual Chunks
    rules = [
        {
            "title": "Rule 101: Transformer Overload Protocol",
            "content": "If a Transformer (such as TRAFO_301 or TRAFO_302) experiences a critical overload where the active load exceeds 500kW, the operator must trigger remote load shedding or isolate the device immediately to prevent grid cascade failures."
        },
        {
            "title": "Rule 102: SmartMeter Voltage Range and Phase Balance",
            "content": "SmartMeter voltage phases must be maintained within the standard range of 216V to 244V. If the voltage drops below 200V, it indicates a severe voltage drop. The operator should check the local phase balance and distribute load."
        },
        {
            "title": "Rule 103: EV Charger Thermal Protection Limit",
            "content": "EV Charger units (such as CHARGER_201 or CHARGER_202) must operate below a safety threshold of 90°C. If temperature readings exceed 90°C, it triggers a critical overheating warning. The recommended action is to remotely shut down the EV Charger unit."
        },
        {
            "title": "Rule 104: Carbon Intensity & Green Routing",
            "content": "When UK Grid carbon intensity index is high, grid operators should prioritize drawing power from renewable sources like wind, solar, and hydro, and encourage electric vehicle chargers to schedule charging during off-peak hours."
        },
        {
            "title": "Rule 105: General Grid Diagnostics and Maintenance",
            "content": "For general diagnostics, verify that phase balance is active and voltage health is within normal limits. Any sustained alarm status over 5 minutes requires sending a field dispatch order."
        }
    ]
    
    for rule in rules:
        vector = get_embedding(rule["content"])
        cursor.execute(
            "INSERT INTO documents (title, content, embedding) VALUES (?, ?, ?)",
            (rule["title"], rule["content"], json.dumps(vector))
        )
        
    conn.commit()
    print(f"SQLite Knowledge Base successfully initialized with {len(rules)} rules.")
    print(f"Database saved to: {DB_PATH}")
    conn.close()

if __name__ == "__main__":
    initialize_database()
