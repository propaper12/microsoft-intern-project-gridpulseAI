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
    
    # Drop tables if exist to overwrite
    cursor.execute("DROP TABLE IF EXISTS documents")
    cursor.execute("DROP TABLE IF EXISTS graph_nodes")
    cursor.execute("DROP TABLE IF EXISTS graph_edges")
    
    # Create Documents Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            embedding TEXT
        )
    """)

    # Create GraphNodes Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS graph_nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            type TEXT
        )
    """)

    # Create GraphEdges Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS graph_edges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            relation TEXT,
            target TEXT
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
        },
        {
            "title": "Rule 106: Cyber Security & SCADA Intrusion Prevention",
            "content": "If anomalous remote command packets or unauthorized external IP addresses attempt connection to SCADA controllers, the system must temporarily lock out write overrides, trigger a security alarm, and write a forensic log."
        },
        {
            "title": "Rule 107: Frequency Out of Bounds Protocol",
            "content": "Grid frequency must be maintained at a nominal 50Hz. If frequency drops below 49.5Hz or rises above 50.5Hz, operators should initiate immediate primary response reserves, deploying battery energy storage systems (BESS) within 500ms."
        },
        {
            "title": "Rule 108: Renewable Energy Curtailment",
            "content": "In periods of low load demand and high solar/wind generation, if the substation battery storage SOC (State of Charge) is 100%, operators must curtail renewable injection to prevent transformer voltage swells."
        },
        {
            "title": "Rule 109: Substation Battery Backup Systems",
            "content": "Substation auxiliary control systems must have battery backup systems capable of providing 8 hours of continuous backup power. Monthly discharge testing should verify cells hold >80% capacity."
        },
        {
            "title": "Rule 110: Smart Meter Cyber Tampering",
            "content": "If a SmartMeter fails to transmit telemetry for 3 consecutive hours or shows suspicious high variance in load reports, flag it for physical tamper-switch inspections and security check."
        }
    ]
    
    for rule in rules:
        vector = get_embedding(rule["content"])
        cursor.execute(
            "INSERT INTO documents (title, content, embedding) VALUES (?, ?, ?)",
            (rule["title"], rule["content"], json.dumps(vector))
        )

    # Seed GraphRAG Nodes
    nodes = [
        # Substations
        ("Wembley", "substation"), ("Wimbledon", "substation"), ("Stratford", "substation"),
        ("Chelsea", "substation"), ("Camden", "substation"), ("Greenwich", "substation"),
        ("Westminster", "substation"), ("Brixton", "substation"), ("Hackney", "substation"),
        # Devices
        ("TRAFO_301", "device"), ("TRAFO_302", "device"), ("TRAFO_303", "device"),
        ("CHARGER_201", "device"), ("CHARGER_202", "device"), ("CHARGER_203", "device"),
        ("METER_101", "device"), ("METER_102", "device"), ("METER_103", "device"),
        # Alarms / Failure Modes
        ("CRITICAL_OVERLOAD", "alarm"), ("OVERHEATING", "alarm"), ("VOLTAGE_DROP", "alarm"),
        # Rules
        ("Rule 101", "rule"), ("Rule 102", "rule"), ("Rule 103", "rule"),
        ("Rule 104", "rule"), ("Rule 110", "rule")
    ]

    for name, node_type in nodes:
        cursor.execute("INSERT OR IGNORE INTO graph_nodes (name, type) VALUES (?, ?)", (name, node_type))

    # Seed GraphRAG Edges (Relationships)
    edges = [
        # Location mappings (Devices to Substations)
        ("TRAFO_301", "IS_LOCATED_IN", "Wembley"),
        ("TRAFO_302", "IS_LOCATED_IN", "Wimbledon"),
        ("TRAFO_303", "IS_LOCATED_IN", "Stratford"),
        ("CHARGER_201", "IS_LOCATED_IN", "Greenwich"),
        ("CHARGER_202", "IS_LOCATED_IN", "Brixton"),
        ("CHARGER_203", "IS_LOCATED_IN", "Hackney"),
        ("METER_101", "IS_LOCATED_IN", "Westminster"),
        ("METER_102", "IS_LOCATED_IN", "Chelsea"),
        ("METER_103", "IS_LOCATED_IN", "Camden"),

        # Mitigation mappings (Rules to Alarms/Failure Modes)
        ("Rule 101", "MITIGATES", "CRITICAL_OVERLOAD"),
        ("Rule 102", "MITIGATES", "VOLTAGE_DROP"),
        ("Rule 103", "MITIGATES", "OVERHEATING"),
        ("Rule 104", "REGULATES", "EVCharger"),
        ("Rule 110", "PROTECTS", "SmartMeter"),

        # Device Type mappings (Group devices by class)
        ("TRAFO_301", "IS_A", "Transformer"),
        ("TRAFO_302", "IS_A", "Transformer"),
        ("TRAFO_303", "IS_A", "Transformer"),
        ("CHARGER_201", "IS_A", "EVCharger"),
        ("CHARGER_202", "IS_A", "EVCharger"),
        ("CHARGER_203", "IS_A", "EVCharger"),
        ("METER_101", "IS_A", "SmartMeter"),
        ("METER_102", "IS_A", "SmartMeter"),
        ("METER_103", "IS_A", "SmartMeter"),
    ]

    for source, relation, target in edges:
        cursor.execute("INSERT INTO graph_edges (source, relation, target) VALUES (?, ?, ?)", (source, relation, target))
        
    conn.commit()
    print(f"SQLite Knowledge Base successfully initialized with {len(rules)} rules.")
    print(f"Knowledge Graph successfully seeded with {len(nodes)} nodes and {len(edges)} relationships.")
    print(f"Database saved to: {DB_PATH}")
    conn.close()

if __name__ == "__main__":
    initialize_database()
