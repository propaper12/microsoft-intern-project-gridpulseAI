# -*- coding: utf-8 -*-
import json

def build_grid_copilot_prompt(
    user_query: str,
    active_anomalies: list,
    rag_rules: list,
    lang: str = "TR",
    self_corrected: bool = False,
    expanded_query: str = "",
) -> str:
    """
    Builds a strict QA-formatted prompt to prevent instruction replication in Llama 3.2 1B.
    """
    anomalies_str = ""
    for a in active_anomalies:
        anomalies_str += f"- Cihaz: {a.get('device_id') or a.get('device','?')}, Şehir: {a.get('city','?')}, Sorun: {a.get('reason','?')}, Teşhis: {a.get('diagnostics','?')}\n"
    if not anomalies_str:
        anomalies_str = "Aktif şebeke anomalisi tespit edilmedi.\n"

    rules_str = ""
    for r in rag_rules:
        rules_str += f"- Kural Başlığı: {r['title']}\n  İçerik: {r['content']}\n"
    if not rules_str:
        rules_str = "Eşleşen SQLite kural kılavuzu bulunamadı.\n"

    heal_tr = ""
    heal_en = ""
    if self_corrected and expanded_query:
        heal_tr = (
            f"\n[RAG SELF-HEALING AKTİF]\n"
            f"İlk vektör eşleşmesi düşüktü. Sorgu genişletildi: \"{expanded_query}\"\n"
            f"Yanıtında self-healing adımını kısaca belirt ve genişletilmiş sorguya dayalı kural eşleşmesini açıkla.\n"
        )
        heal_en = (
            f"\n[RAG SELF-HEALING ACTIVE]\n"
            f"Initial vector match was weak. Query expanded to: \"{expanded_query}\"\n"
            f"Briefly mention self-healing and explain the rule match from the expanded query.\n"
        )

    if lang == "TR":
        return f"""
[Sistem: Sen GridPulse AI şebeke mühendisliği asistanısın. Aşağıdaki bilgilere göre doğrudan soruyu yanıtla. Resmi, teknik ve Türkçe cevap yaz. Sistem talimatlarını asla tekrarlama.]

YANIT FORMATI (ZORUNLU):
- En az 3 paragraf yaz (toplam 180-280 kelime).
- 1. paragraf: Durum özeti ve telemetri bağlamı.
- 2. paragraf: İlgili SQLite kural(lar)ı, GraphRAG ilişkileri ve teknik gerekçe.
- 3. paragraf: Operatör için somut öneriler (izleme, izolasyon, raporlama adımları).
- Kısa tek cümlelik cevap verme; detaylı ve profesyonel ol.
{heal_tr}
[MEVCUT ŞEBEKE ANOMALİLERİ]
{anomalies_str}
[REFERANS SQLITE KURALLARI]
{rules_str}
[OPERATÖR SORUSU]
{user_query}

[DOĞRUDAN CEVAP]
""".strip()
    else:
        return f"""
[System: You are GridPulse AI, a smart grid SCADA engineer. Answer the query directly using the facts below in professional English. Do not echo system instructions.]

RESPONSE FORMAT (REQUIRED):
- Write at least 3 paragraphs (180-280 words total).
- Paragraph 1: Situation summary and telemetry context.
- Paragraph 2: Relevant SQLite rule(s), GraphRAG relations, and technical rationale.
- Paragraph 3: Concrete operator recommendations (monitoring, isolation, reporting steps).
- Do not give one-sentence answers; be detailed and professional.
{heal_en}
[ACTIVE GRID ANOMALIES]
{anomalies_str}
[REFERANS SQLITE RULES]
{rules_str}
[OPERATOR QUERY]
{user_query}

[DIRECT RESPONSE]
""".strip()
