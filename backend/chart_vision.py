"""
GridPulse — SCADA grafik yorumlama (vision simülasyonu)
Agent, üretilen grafikleri okuyup operatör dilinde yorumlar.
"""
from datetime import datetime
from typing import Optional

CHART_READINGS_TR = {
    "load": "Yük eğrisi incelendi: tüketim trendi yükseliyor, trafo kapasite sınırına yaklaşıyor. Rule 101 eşiği izlenmeli.",
    "voltage": "Voltaj grafiği okundu: faz geriliminde dalgalanma tespit edildi. Rule 102 limitleri kontrol edilmeli.",
    "temperature": "Sıcaklık grafiği analiz edildi: termal eğri kritik eşiğe yakın. Soğutma sistemi doğrulanmalı.",
    "power_factor": "Güç faktörü grafiği: cos φ değerleri nominal bandda, reaktif yük dengeli görünüyor.",
    "timeline": "Zaman çizelgesi: 24 saatlik uyumluluk trendi stabil, kısa süreli sapmalar gözlemlendi.",
    "compliance_pie": "Uyumluluk dağılımı: voltaj ve termal uyarılar toplamın %75'ini oluşturuyor.",
    "region_bar": "Bölgesel tüketim grafiği: Westminster bölgesi yük konsantrasyonu yüksek.",
    "radar": "Stabilite radarı: 5 boyutlu şebeke sağlığı dengeli, siber skor dikkat gerektiriyor.",
    "scatter": "Anomali dağılımı: olay yoğunluğu normal bandın üst sınırında.",
    "frequency": "Frekans çizgisi: 50.02 Hz nominal, faz açısı sapması minimal.",
    "leakage": "Kaçak kayıp grafiği: teknik kayıp oranı %1.8 — kabul edilebilir.",
    "thd": "THD harmonik grafiği: bozulma oranı %3.2 — EV şarj istasyonları izlenmeli.",
}

CHART_READINGS_EN = {
    "load": "Load curve read: consumption trend rising, approaching transformer capacity. Monitor Rule 101 threshold.",
    "voltage": "Voltage chart analyzed: phase voltage fluctuation detected. Check Rule 102 limits.",
    "temperature": "Temperature chart read: thermal curve near critical threshold. Verify cooling systems.",
    "power_factor": "Power factor chart: cos φ values in nominal band, reactive load appears balanced.",
    "timeline": "Timeline chart: 24h compliance trend stable with brief deviations.",
    "compliance_pie": "Compliance pie: voltage and thermal alerts account for 75% of total.",
    "region_bar": "Regional consumption: Westminster shows high load concentration.",
    "radar": "Stability radar: 5-dimension grid health balanced, cyber score needs attention.",
    "scatter": "Anomaly scatter: event density at upper normal band limit.",
    "frequency": "Frequency line: 50.02 Hz nominal, minimal phase angle deviation.",
    "leakage": "Leakage chart: technical loss rate 1.8% — acceptable.",
    "thd": "THD harmonic chart: distortion at 3.2% — monitor EV charging stations.",
}


def analyze_chart_action(action: dict, lang: str = "TR") -> dict:
    """Tek bir spawn edilmiş grafik için AI yorumu üret"""
    chart_type = action.get("chart_type") or "timeline"
    device = action.get("device_id", "UNKNOWN")
    severity = action.get("severity", "LOW")
    rule = action.get("rule", "")
    readings = CHART_READINGS_TR if lang.upper() == "TR" else CHART_READINGS_EN
    base = readings.get(chart_type, readings.get("timeline", ""))

    severity_note = ""
    if severity in ("CRITICAL", "HIGH"):
        severity_note = (
            f" [{severity}] Kritik seviye — operatör müdahalesi önerilir."
            if lang.upper() == "TR"
            else f" [{severity}] Critical level — operator intervention recommended."
        )

    interpretation = f"{device}: {base}{severity_note}"
    if rule:
        interpretation += f" ({rule})"

    return {
        "id": f"{device}-{chart_type}-{datetime.utcnow().strftime('%H%M%S')}",
        "slot_id": action.get("slot_id") or f"{device}:{chart_type}",
        "device_id": device,
        "chart_type": chart_type,
        "severity": severity,
        "rule": rule,
        "interpretation": interpretation,
        "widget_title": action.get("widget_title", chart_type),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def analyze_all_charts(actions: list, lang: str = "TR") -> list:
    charts = [a for a in actions if a.get("action") == "SPAWN_CHART"]
    return [analyze_chart_action(c, lang) for c in charts[-12:]]
