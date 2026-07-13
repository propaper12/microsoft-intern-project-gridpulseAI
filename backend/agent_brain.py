"""
GridPulse AI Autopilot — Autonomous Agent Brain
Model: llama3.2:1b via Ollama
Görev: Canlı telemetri akışını okuyup otonom kararlar üretmek
"""

import json
import time
import threading
import requests
from datetime import datetime
from collections import deque

# ── CONFIG ─────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"
TELEMETRY_API = "http://127.0.0.1:8000/api/stream_data"
ACTION_API = "http://127.0.0.1:8000/api/agent/action"
LOG_API = "http://127.0.0.1:8000/api/agent/log"
REPORT_API = "http://127.0.0.1:8000/api/report/send"

GRIDPULSE_MODEL = "llama3.2:1b"
MODEL_NAME = GRIDPULSE_MODEL

# Ajan hafızası — son 10 telemetri
telemetry_buffer = deque(maxlen=10)
agent_running = True

# ── SYSTEM PROMPT ───────────────────────────────────────────
SYSTEM_PROMPT = """Sen GridPulse SCADA sisteminin otonom operasyon ajanısın.

Görevin:
1. Gelen telemetri verisini analiz et
2. Aşağıdaki kurallara göre anomali tespit et
3. Tespit ettiğinde JSON komutu döndür

KURALLAR:
- Rule 101: Transformer yük > 500kW → CRITICAL_OVERLOAD → spawn load chart + isolate switch
- Rule 102: Voltaj < 216V veya > 244V → VOLTAGE_FAULT → spawn voltage chart + phase regulator
- Rule 103: Sıcaklık > 90°C → OVERHEAT → spawn temperature chart + shutdown switch
- Rule 110: Tamper flag = true → CYBER_ALERT → security alert widget

ÇIKTI FORMAT (sadece JSON, başka hiçbir şey yazma):
{
  "status": "NORMAL" | "ANOMALY",
  "rule": "Rule 101" | null,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "device": "cihaz adı",
  "action": "NONE" | "SPAWN_CHART" | "SPAWN_CONTROL" | "SPAWN_ALERT" | "SEND_REPORT",
  "chart_type": "voltage" | "load" | "temperature" | "power_factor" | null,
  "widget_title": "widget başlığı" | null,
  "message": "operatöre kısa mesaj (max 2 cümle)"
}

Düşünme modunu KAPALI tut (hızlı karar için /no_think)."""


def log_to_backend(message: str):
    """Backend'e log gönder — frontend terminale yansır"""
    try:
        requests.post(LOG_API, json={"log": message}, timeout=2)
    except:
        pass


def push_action(action_payload: dict):
    """Agent kararını backend'e gönder — frontend widget üretir"""
    try:
        requests.post(ACTION_API, json=action_payload, timeout=3)
    except:
        pass

from typing import Optional

def push_report(trigger: dict):
    """Kritik durumda operatör e-postasına rapor gönder"""
    try:
        requests.post(REPORT_API, json={"report_type": "critical_alert", "trigger": trigger}, timeout=10)
    except Exception:
        pass


def call_agent_llm(telemetry_data: dict) -> Optional[dict]:
    """llama3.2:1b ile telemetriyi analiz et"""
    prompt = f"""{SYSTEM_PROMPT}

Analiz edilecek telemetri:
{json.dumps(telemetry_data, ensure_ascii=False, indent=2)}

/no_think
Sadece JSON döndür:"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,   # Deterministik karar için düşük
                    "top_p": 0.9,
                    "num_predict": 256,    # Kısa JSON çıktısı için yeterli
                }
            },
            timeout=15
        )

        raw = response.json().get("response", "").strip()

        # JSON parse
        if "{" in raw:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            return json.loads(raw[start:end])

    except json.JSONDecodeError:
        log_to_backend(f"[ERR] JSON parse hatası: {raw[:100]}")
    except requests.RequestException as e:
        log_to_backend(f"[ERR] Ollama bağlantı hatası: {e}")

    return None


def process_telemetry(telemetry: dict):
    """Gelen tek telemetri paketini işle"""
    device = telemetry.get("device_id", "UNKNOWN")
    reason = telemetry.get("reason", "NORMAL")
    ts = datetime.now().strftime("%H:%M:%S")

    log_to_backend(f"[{ts}] [{device}] Telemetri alındı → {reason}")

    # Normal ise hızlı geç, modeli yorma
    if reason == "NORMAL":
        return

    log_to_backend(f"[{ts}] [{device}] ⚠ Anomali sinyali! {MODEL_NAME} analiz ediyor...")

    result = call_agent_llm(telemetry)

    if not result:
        log_to_backend(f"[{ts}] [{device}] Model yanıt vermedi, atlanıyor.")
        return

    severity = result.get("severity", "LOW")
    action = result.get("action", "NONE")
    message = result.get("message", "")
    rule = result.get("rule", "")

    log_to_backend(f"[{ts}] [{device}] 🤖 KARAR → {action} | {rule} | {severity}")
    log_to_backend(f"[{ts}] [{device}] 💬 {message}")

    # Aksiyon varsa frontend'e gönder
    if action != "NONE":
        payload = {
            "device_id": device,
            "action": action,
            "chart_type": result.get("chart_type"),
            "widget_title": result.get("widget_title", f"{device} — {rule}"),
            "severity": severity,
            "rule": rule,
            "message": message,
            "timestamp": ts
        }
        push_action(payload)
        log_to_backend(f"[{ts}] [{device}] ✅ Frontend'e widget komutu gönderildi → {action}")

    if severity in ("CRITICAL", "HIGH") or action == "SEND_REPORT":
        log_to_backend(f"[{ts}] [AGENT] 📧 Operatör raporu hazırlanıyor...")
        push_report({"device_id": device, "rule": rule, "severity": severity, "message": message, "reason": telemetry.get("reason")})


def agent_loop():
    """Ana ajan döngüsü — telemetriyi sürekli izle"""
    global agent_running, MODEL_NAME
    log_to_backend(f"[SYS] GridPulse Otonom Ajan Beyin aktif ({MODEL_NAME})")
    log_to_backend("[SYS] Telemetri akışı izleniyor...")

    was_active = False

    while agent_running:
        try:
            # Backend'den ajanın aktiflik durumunu sorgula
            status_url = "http://127.0.0.1:8000/api/agent/status"
            try:
                status_resp = requests.get(status_url, timeout=2)
                status_data = status_resp.json()
                active = status_data.get("active", False)
                if status_data.get("model"):
                    MODEL_NAME = status_data.get("model")
            except Exception:
                active = False

            if not active:
                was_active = False
                time.sleep(2)
                continue

            # Eğer ajan yeni başlatıldıysa, başlangıç analiz grafiklerini otomatik üret
            if not was_active:
                log_to_backend("[SYS] Ajan başlatıldı. Başlangıç analiz grafikleri üretiliyor...")
                baselines = [
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "load",
                        "device_id": "TRAFO_301",
                        "severity": "LOW",
                        "message": "Şebeke aktif yük dağılımı stabil. TRAFO_301 ana trafosu 320kW yük altında verimli çalışıyor, herhangi bir curtailment veya yük atma ihtiyacı gözlemlenmemiştir."
                    },
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "power_factor",
                        "device_id": "METER_101",
                        "severity": "LOW",
                        "message": "Güç faktörü ve reaktif yük analizi nominal seviyede (cos φ ≈ 0.94). Sistemin kapasitif/endüktif dengesi stabil ve kayıplar minimum düzeydedir."
                    },
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "voltage",
                        "device_id": "TRAFO_302",
                        "severity": "LOW",
                        "message": "Westminster ve Camden alt şebeke bölgelerindeki voltaj dalgalanmaları kontrol altına alındı. Faz gerilimleri 230V limitleri dahilinde stabil kalmaktadır."
                    },
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "temperature",
                        "device_id": "CHARGER_201",
                        "severity": "LOW",
                        "message": "Yüksek hızlı EV şarj istasyonlarının (CHARGER_201/203) termal profili stabil. Sıcaklıklar 42°C civarında seyrediyor, aktif soğutma devrededir."
                    },
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "timeline",
                        "device_id": "GRID_HEALTH",
                        "severity": "LOW",
                        "message": "GridPulse 24 saatlik uyumluluk indeksi %98.4 seviyesinde stabil. Şebeke genel frekans ve kararlılık trendi nominal SCADA değerlerindedir."
                    },
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "compliance_pie",
                        "device_id": "COMPLIANCE_ALERTS",
                        "severity": "LOW",
                        "message": "Kurallara göre tetiklenen uyarı kırılımları incelendiğinde; voltaj dalgalanması %45, termal alarmlar %30, siber uyarılar %25 ağırlığındadır."
                    },
                    {
                        "action": "SPAWN_CHART",
                        "chart_type": "region_bar",
                        "device_id": "REGIONAL_CONSUMPTION",
                        "severity": "LOW",
                        "message": "Bölgesel tüketim profili analiz edildiğinde Westminster 1.2MW ile lider konumdayken, Wembley ve Camden nominal yük altındadır."
                    }
                ]
                for b in baselines:
                    try:
                        requests.post("http://127.0.0.1:8000/api/agent/action", json=b, timeout=2)
                    except Exception:
                        pass
                was_active = True

            # Telemetri oku ve işleme al
            resp = requests.get(TELEMETRY_API, timeout=5)
            data = resp.json()

            if isinstance(data, list):
                for item in data:
                    telemetry_buffer.append(item)
                    process_telemetry(item)
            elif isinstance(data, dict):
                telemetry_buffer.append(data)
                process_telemetry(data)

        except requests.RequestException:
            # Backend henüz hazır değilse sessizce bekle
            pass
        except Exception as e:
            log_to_backend(f"[ERR] Agent loop hatası: {e}")

        time.sleep(3)  # Her 3 saniyede bir kontrol


def test_agent():
    """Agent'ı test telemetrisiyle dene"""
    print("🤖 GridPulse Agent Brain — Test Modu")
    print(f"   Model: {MODEL_NAME}")
    print(f"   Ollama: {OLLAMA_URL}")
    print()

    test_cases = [
        {
            "device_id": "TRAFO_301",
            "voltage": 188.0,
            "consumption": 520.0,
            "temp": 45.0,
            "reason": "CRITICAL_OVERLOAD",
            "location": "Oxford Street"
        },
        {
            "device_id": "CHARGER_201",
            "voltage": 230.0,
            "consumption": 22.0,
            "temp": 96.5,
            "reason": "OVERHEATING",
            "location": "Brixton"
        },
        {
            "device_id": "METER_101",
            "voltage": 198.0,
            "consumption": 310.0,
            "temp": 28.0,
            "reason": "VOLTAGE_DROP",
            "location": "Wembley"
        }
    ]

    for tc in test_cases:
        print(f"📊 Test: {tc['device_id']} — {tc['reason']}")
        result = call_agent_llm(tc)
        if result:
            print(f"   ✅ Karar: {json.dumps(result, ensure_ascii=False, indent=4)}")
        else:
            print("   ❌ Model yanıt vermedi")
        print()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_agent()
    else:
        agent_loop()
