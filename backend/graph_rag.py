# -*- coding: utf-8 -*-
import sqlite3
import os
from backend.vector_store import DB_PATH

class GridKnowledgeGraph:
    """
    A lightweight, local Knowledge Graph (KG) querying SQLite tables dynamically.
    It resolves entity nodes and relationships to enable multi-hop local retrieval.
    """
    @property
    def nodes(self):
        """Dynamically fetch all node types and names from SQLite graph_nodes table."""
        node_map = {
            "substations": [],
            "devices": [],
            "alarms": [],
            "rules": []
        }
        if not os.path.exists(DB_PATH):
            return node_map
            
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT name, type FROM graph_nodes")
            rows = cursor.fetchall()
            conn.close()
            
            for name, n_type in rows:
                plural_type = n_type + "s" if not n_type.endswith("s") else n_type
                if plural_type in node_map:
                    node_map[plural_type].append(name)
        except Exception as e:
            print(f"Error reading graph nodes: {e}")
        return node_map

    def retrieve_local_subgraph(self, active_device, active_city, alarm_reason):
        """
        Performs dynamic SQL joins on graph_edges to extract 1-hop and 2-hop relationships
        matching the active telemetry parameters.
        """
        retrieved_entities = set(filter(None, [active_device, active_city, alarm_reason]))
        matched_triplets = []

        if not os.path.exists(DB_PATH):
            return {"entities": [], "triplets": []}

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Fetch all edges to run graph query matching
            cursor.execute("SELECT source, relation, target FROM graph_edges")
            edges = cursor.fetchall()
            conn.close()

            # Step 1: Find direct edges (1-hop)
            for src, rel, tgt in edges:
                if active_device and (src == active_device or tgt == active_device):
                    matched_triplets.append({"source": src, "relation": rel, "target": tgt})
                    retrieved_entities.add(src)
                    retrieved_entities.add(tgt)
                elif alarm_reason and (src == alarm_reason or tgt == alarm_reason):
                    matched_triplets.append({"source": src, "relation": rel, "target": tgt})
                    retrieved_entities.add(src)
                    retrieved_entities.add(tgt)
                elif active_city and (src == active_city or tgt == active_city):
                    matched_triplets.append({"source": src, "relation": rel, "target": tgt})
                    retrieved_entities.add(src)
                    retrieved_entities.add(tgt)

            # Step 2: Resolve device category safety connections (2-hop)
            device_type = None
            for src, rel, tgt in edges:
                if active_device and src == active_device and rel == "IS_A":
                    device_type = tgt
                    break

            if device_type:
                for src, rel, tgt in edges:
                    if (src.startswith("Rule") and tgt == device_type) or (src.startswith("Rule") and tgt == alarm_reason):
                        matched_triplets.append({"source": src, "relation": rel, "target": tgt})
                        retrieved_entities.add(src)
                        retrieved_entities.add(tgt)

        except Exception as e:
            print(f"Error querying local subgraph: {e}")

        # Remove duplicates
        unique_triplets = []
        seen = set()
        for t in matched_triplets:
            key = f"{t['source']}-{t['relation']}-{t['target']}"
            if key not in seen:
                seen.add(key)
                unique_triplets.append(t)

        return {
            "entities": list(retrieved_entities),
            "triplets": unique_triplets
        }

# Singleton instance
graph_store = GridKnowledgeGraph()
