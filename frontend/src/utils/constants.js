export const GRIDPULSE_MODEL = "llama3.2:1b";

export const TRANSLATIONS = {
  TR: {
    title: "GRIDPULSE.AI - ENERJİ ŞEBEKESİ İZLEME",
    subtitle: "Yapay Zeka Destekli Anomali Tespit Paneli",
    kpi_telemetry: "Toplam Telemetri",
    kpi_anomaly_rate: "Anomali Tespit Oranı",
    kpi_stability: "Ort. Şebeke Kararlılığı",
    kpi_confidence: "AI Engine Güven Skoru",
    tab_dashboard: "Kontrol Paneli",
    tab_ai: "Otonom SCADA Merkezi",
    tab_copilot: "Grid AI Copilot",
    tab_anomalies: "Anomaliler",
    chart_load_title: "Canlı Şebeke Yükü (kW)",
    stability_breakdown: "Şebeke Kararlılık Analizi",
    search_placeholder: "Cihaz adına göre ara...",
    export_csv: "CSV Dışa Aktar",
    isolate: "İzole Et",
    diag: "Teşhis",
    anomalies_title: "Tespit Edilen Şebeke Anomalileri",
    no_matching_anomalies: "Eşleşen anomali bulunamadı. Akıllı şebeke izleniyor...",
    copilot_intro: "Merhaba! Ben GridPulse AI Şebeke Asistanıyım. ClickHouse analitik veri loglarına ve aktif sensör telemetrilerine doğrudan erişimim var.",
    copilot_placeholder: "Şebeke durumu hakkında sorun... (Örn: Trafo 301 durumu nedir?)",
    copilot_send: "Sorgula",
    voice_mic: "Ses",
    voice_listening: "Dinliyorum...",
    voice_not_supported: "Sesli giriş bu tarayıcıda desteklenmiyor.",
    tts_toggle: "Yanıtı seslendir",
    voice_agent_mode: "Sesli Agent",
    voice_agent_mode_off: "Sesli agent kapalı",
    voice_agent_listening: "Agent dinliyor...",
    voice_agent_thinking: "Agent düşünüyor...",
    voice_agent_speaking: "Agent konuşuyor...",
    voice_continuous: "Sürekli diyalog",
    voice_agent_empty: "Anlaşılamadı, tekrar deneyin.",
    voice_agent_error: "Bağlantı hatası, tekrar deneyin.",
    voice_mic_permission: "Mikrofon izni gerekli.",
  },
  EN: {
    title: "GRIDPULSE.AI - REAL-TIME IOT GRID MONITOR",
    subtitle: "AI-Powered Anomaly Detection Dashboard",
    kpi_telemetry: "Total Telemetry",
    kpi_anomaly_rate: "Anomaly Detected Rate",
    kpi_stability: "Avg Grid Stability",
    kpi_confidence: "AI Engine Confidence",
    tab_dashboard: "Dashboard",
    tab_ai: "Autonomous SCADA Center",
    tab_copilot: "Grid AI Copilot",
    tab_anomalies: "Anomalies",
    chart_load_title: "Live Grid Load (kW)",
    stability_breakdown: "Grid Stability Breakdown",
    search_placeholder: "Search devices...",
    export_csv: "Export CSV",
    isolate: "Isolate",
    diag: "Diag",
    anomalies_title: "Detected Grid Anomalies",
    no_matching_anomalies: "No matching anomalies detected. Monitoring smart grid...",
    copilot_intro: "Hello! I am the GridPulse AI Assistant with real-time access to ClickHouse logs and active telemetry streams.",
    copilot_placeholder: "Ask about grid status... (e.g. What is the status of Trafo 301?)",
    copilot_send: "Query",
    voice_mic: "Voice",
    voice_listening: "Listening...",
    voice_not_supported: "Speech recognition is not supported in this browser.",
    tts_toggle: "Read AI replies",
    voice_agent_mode: "Talk to Agent",
    voice_agent_mode_off: "Voice agent off",
    voice_agent_listening: "Agent is listening...",
    voice_agent_thinking: "Agent is thinking...",
    voice_agent_speaking: "Agent is speaking...",
    voice_continuous: "Continuous dialog",
    voice_agent_empty: "Couldn't understand, try again.",
    voice_agent_error: "Connection error, try again.",
    voice_mic_permission: "Microphone permission required.",
  },
};

export const gridStations = {
  Westminster: "Westminster SubStation",
  Chelsea: "Chelsea SubStation",
  Camden: "Camden SubStation",
  Greenwich: "Greenwich SubStation",
  Brixton: "Brixton SubStation",
  Hackney: "Hackney SubStation",
  Wembley: "Wembley SubStation",
  Wimbledon: "Wimbledon SubStation",
  Stratford: "Stratford SubStation",
};

export const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export const playSynthBeep = (freq = 440, type = "sine", duration = 0.15) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* audio blocked */
  }
};

export const CHART_LABELS = {
  load: { TR: "Yük Grafiği", EN: "Load Chart" },
  voltage: { TR: "Voltaj Grafiği", EN: "Voltage Chart" },
  temperature: { TR: "Sıcaklık Grafiği", EN: "Temperature Chart" },
  power_factor: { TR: "Güç Faktörü", EN: "Power Factor" },
  timeline: { TR: "Zaman Çizelgesi", EN: "Timeline" },
  compliance_pie: { TR: "Uyumluluk Dağılımı", EN: "Compliance Pie" },
  region_bar: { TR: "Bölgesel Tüketim", EN: "Regional Consumption" },
  radar: { TR: "Stabilite Radarı", EN: "Stability Radar" },
  scatter: { TR: "Anomali Dağılımı", EN: "Anomaly Scatter" },
  frequency: { TR: "Frekans Çizgisi", EN: "Frequency Line" },
  leakage: { TR: "Kaçak Kayıp", EN: "Leakage Loss" },
  thd: { TR: "Harmonik Bozulma", EN: "THD Distortion" },
};
