/** RAG odaklı örnek sorgular — farklı stiller ve self-healing senaryoları */
export const CHAT_QUICK_PROMPTS = [
  { tr: "TRAFO_301 yük durumunu analiz et", en: "Analyze TRAFO_301 load status", label: "⚡ Yük", style: "diagnostic" },
  { tr: "Şebeke kararlılık endeksi nedir?", en: "What is the grid stability index?", label: "◉ Stabilite", style: "kpi" },
  { tr: "Aktif kritik anomalileri listele", en: "List active critical anomalies", label: "⚠ Tarama", style: "scan" },
  { tr: "EV şarj ünitesi termal limit protokolü", en: "EV charger thermal limit protocol", label: "🌡 Termal", style: "rule" },
  { tr: "trafo asiri yuklenme esigi", en: "transformer overload threshold limit", label: "🔧 Self-Heal", style: "selfheal" },
  { tr: "voltaj dususu faz dengesi kurali", en: "voltage drop phase balance rule", label: "〰 Voltaj", style: "rule" },
];

export const RAG_SCENARIO_PROMPTS = [
  { tr: "Rule 101 — Trafo aşırı yüklenme protokolü nedir?", en: "Rule 101 — What is transformer overload protocol?", label: "Rule 101 · Yük", category: "rule" },
  { tr: "Rule 102 — Voltaj düşüşü ve faz dengesi limitleri", en: "Rule 102 — Voltage drop and phase balance limits", label: "Rule 102 · Voltaj", category: "rule" },
  { tr: "Rule 103 — EV şarj cihazı termal koruma eşiği", en: "Rule 103 — EV charger thermal protection threshold", label: "Rule 103 · Isı", category: "rule" },
  { tr: "Rule 110 — Sayaç kurcalama ve siber saldırı protokolü", en: "Rule 110 — Meter tampering and cyber attack protocol", label: "Rule 110 · Siber", category: "security" },
  { tr: "Şebekedeki tüm aktif arızaları tarayıp önceliklendir", en: "Scan and prioritize all active grid faults", label: "Tam Tarama", category: "scan" },
  { tr: "ClickHouse telemetrisine göre Westminster bölgesi durumu", en: "Westminster region status from ClickHouse telemetry", label: "📡 Telemetri", category: "telemetry" },
  { tr: "Harmonik bozulma THD limitleri ve EV şarj etkisi", en: "THD harmonic distortion limits and EV charging impact", label: "≋ THD", category: "diagnostic" },
  { tr: "trafo yuk dengeleme izolasyon proseduru", en: "transformer load balancing isolation procedure", label: "🔧 RAG Self-Heal", category: "selfheal" },
  { tr: "Grafik zekası: aktif yük eğrisini yorumla", en: "Chart vision: interpret active load curve", label: "👁 Grafik", category: "vision" },
  { tr: "Otonom agent son kararlarını özetle ve raporla", en: "Summarize autonomous agent decisions and report", label: "📧 Rapor", category: "report" },
  { tr: "Bölgesel tüketim dağılımı ve Westminster yük konsantrasyonu", en: "Regional consumption distribution and Westminster load", label: "▦ Bölgesel", category: "analytics" },
  { tr: "Şebeke frekans sapması 50Hz nominal band analizi", en: "Grid frequency deviation 50Hz nominal band analysis", label: "∿ Frekans", category: "diagnostic" },
];
