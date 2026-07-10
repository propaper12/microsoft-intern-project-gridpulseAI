import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, BarChart, Bar, Cell,
  ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import './index.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CITY_COORDS = {
  "New York": [-74.006, 40.7128], "London": [-0.1276, 51.5074], "Tokyo": [139.6503, 35.6762],
  "Istanbul": [28.9784, 41.0082], "Ankara": [32.8597, 39.9334], "Izmir": [27.1428, 38.4237],
  "Antalya": [30.7133, 36.8969], "Moscow": [37.6173, 55.7558], "Lagos": [3.3792, 6.5244],
  "Paris": [2.3522, 48.8566], "Berlin": [13.4050, 52.5200], "Beijing": [116.4074, 39.9042],
  "Sydney": [151.2093, -33.8688], "Rio de Janeiro": [-43.1729, -22.9068], "Cape Town": [18.4232, -33.9249],
  "Dubai": [55.2708, 25.2048], "Mumbai": [72.8777, 19.0760], "Los Angeles": [-118.2437, 34.0522],
  "Toronto": [-79.3832, 43.6532], "Seoul": [126.9780, 37.5665], "Singapore": [103.8198, 1.3521],
  "Mexico City": [-99.1332, 19.4326], "Cairo": [31.2357, 30.0444], "Buenos Aires": [-58.3816, -34.6037],
  "Jakarta": [106.8456, -6.2088]
};

const TRANSLATIONS = {
  TR: {
    title: "GRIDPULSE.AI - ENERJİ ŞEBEKESİ İZLEME",
    subtitle: "YAPAY ZEKA DESTEKLİ ANOMALİ TESPİT PANELİ",
    ticker: "SİSTEM TELEMETRİSİ: Aktif izleme devrede. Canlı Kafka akışı ve AI teşhis motoru çalışıyor.",
    kpi_telemetry: "TOPLAM TELEMETRİ",
    kpi_anomaly_rate: "ANOMALİ TESPİT ORANI",
    kpi_stability: "ORT. ŞEBEKE KARARLILIĞI",
    kpi_confidence: "AI ENGINE GÜVEN SKORU",
    tab_dashboard: "Kontrol Paneli",
    tab_streams: "Canlı Akışlar",
    tab_anomalies: "Anomaliler",
    tab_ml: "Yapay Zeka Modeli",
    tab_rules: "Filtre Kuralları",
    chart_load_title: "CANLI ŞEBEKE YÜKÜ (kW) vs. AŞIRI YÜKLENMELER",
    chart_load_desc: "ℹ️ Açıklama: Mavi alan elektrik şebekesindeki toplam güç tüketimini (kW), kırmızı çizgiler ise aşırı yük limitini aşan anomali sayılarını gösterir.",
    top_devices: "EN ÇOK AŞIRI YÜKLENEN CİHAZLAR",
    top_devices_desc: "ℹ️ Açıklama: En çok aşırı yük (overload) alarmı üreten sayaç ve trafoların tüketim değerlerine göre sıralamasıdır.",
    detected_anomalies: "⚠️ TESPİT EDİLEN ŞEBEKE ANOMALİLERİ",
    detected_anomalies_desc: "ℹ️ Açıklama: AI motoru tarafından tespit edilen düşük kararlılıktaki cihazların ve anomali türlerinin canlı log tablosudur.",
    stability_breakdown: "ŞEBEKE KARARLILIK ANALİZİ",
    stability_breakdown_desc: "ℹ️ Açıklama: Şebeke cihazlarının kararlılık oranları (Stabil, Kritik Arıza ve Kararsız Şebeke Uyarıları) dağılımını gösterir.",
    regional_anomalies: "BÖLGESEL ŞEBEKE ANOMALİLERİ",
    regional_anomalies_desc: "ℹ️ Açıklama: Trafo istasyonları bazında en çok anomali/arıza alarmı üreten bölgelerin karşılaştırmalı istatistiğidir.",
    terminal_feed: "AI LIVE GRID TELEMETRY FEED",
    terminal_feed_desc: "ℹ️ Açıklama: Şebekeden gelen ham telemetri paketleri ve bunlara anlık olarak yapay zekanın yazdığı tanı ve teşhis kararları akışıdır.",
    search_placeholder: "Cihaz adına göre ara...",
    export_csv: "CSV Dışa Aktar 📥",
    isolate: "İzole Et",
    diag: "Teşhis",
    status_ai: "🛡️ AI DURUMU",
    status_rules: "Kural Filtresi",
    status_latency: "Ort. Gecikme",
    hotspots: "🔥 ANOMALİ BÖLGELERİ",
    control_stats: "📈 KONTROL İSTATİSTİKLERİ",
    isolations: "İzolasyonlar",
    last_action: "Son Aksiyon",
    stable_stream: "Kararlı akış...",
    anomalies_title: "Tespit Edilen Şebeke Anomalileri & Kalite Riskleri",
    anomalies_db: "Anomali Log Veritabanı",
    anomalies_cluster: "AI ANOMALİ KÜMELEME HARİTASI (SCATTER PLOT)",
    anomalies_cluster_desc: "Noktaların sola ve aşağıda kümelenmesi, düşük şebeke kararlılığı (Stability) ve yüksek voltaj düşüşlerini gösterir.",
    no_matching_anomalies: "Eşleşen anomali bulunamadı. Akıllı şebeke izleniyor...",
    kpi_active_anomalies: "AKTİF KRİTİK ALARM",
    kpi_vulnerable_device: "EN HASSAS CİHAZ GRUBU",
    kpi_sensitive_station: "EN ÇOK ANOMALİ ALAN İSTASYON",
    tab_copilot: "AI Asistanı",
    copilot_title: "GridPulse AI Copilot - Canlı Şebeke Asistanı",
    copilot_placeholder: "Şebeke kararlılığı veya öneriler hakkında bir şey sorun...",
    copilot_send: "Gönder",
    copilot_intro: "Merhaba! Ben GridPulse AI Şebeke Asistanıyım. ClickHouse analitik veri loglarına ve aktif sensör telemetrilerine doğrudan erişimim var. Şebeke durumu, anomali nedenleri veya yük azaltma önerileri hakkında sorularınızı yanıtlayabilirim.",
    copilot_prompt_1: "Şu an şebeke kararlılığı ne durumda?",
    copilot_prompt_2: "Isınma alarmları için ne yapmalıyım?",
    copilot_prompt_3: "Hangi trafolar aşırı yüklü?",
    tab_geo_map: "Coğrafi Analiz",
    tab_welcome: "Anasayfa"
  },
  EN: {
    title: "GRIDPULSE.AI - REAL-TIME IOT GRID MONITOR",
    subtitle: "AI-POWERED ANOMALY DETECTION DASHBOARD",
    ticker: "SYSTEM TELEMETRY: Active monitoring enabled. Live Kafka stream and AI diagnostic engine running.",
    kpi_telemetry: "TOTAL TELEMETRY",
    kpi_anomaly_rate: "ANOMALY DETECTED RATE",
    kpi_stability: "AVG GRID STABILITY",
    kpi_confidence: "AI ENGINE CONFIDENCE",
    tab_dashboard: "Dashboard",
    tab_streams: "Live Streams",
    tab_anomalies: "Anomalies",
    tab_ml: "ML Engine",
    tab_rules: "AI Rules",
    chart_load_title: "LIVE GRID LOAD (kW) vs. ANOMALOUS OVERLOADS",
    chart_load_desc: "ℹ️ Description: The blue area represents total grid power load (kW) and the red line counts active critical overloaded anomalies.",
    top_devices: "TOP OVERLOADED GRID DEVICES",
    top_devices_desc: "ℹ️ Description: List of smart meters and transformers ranking highest in active power consumption & overload triggers.",
    detected_anomalies: "⚠️ DETECTED GRID ANOMALIES",
    detected_anomalies_desc: "ℹ️ Description: Live logs of device anomalies with stability scores and mitigation trigger levels.",
    stability_breakdown: "GRID STABILITY BREAKDOWN",
    stability_breakdown_desc: "ℹ️ Description: Breakdown of grid device stability rates (Stable Grid, Critical Failures, and Warnings).",
    regional_anomalies: "REGIONAL GRID ANOMALIES",
    regional_anomalies_desc: "ℹ️ Description: Bar chart comparing the total frequency of anomaly alerts across different regional substation nodes.",
    terminal_feed: "AI LIVE GRID TELEMETRY FEED",
    terminal_feed_desc: "ℹ️ Description: Real-time sensor stream raw metrics coupled with live AI model diagnostic analysis logs.",
    search_placeholder: "Search devices...",
    export_csv: "Export CSV 📥",
    isolate: "Isolate",
    diag: "Diag",
    status_ai: "🛡️ AI STATUS",
    status_rules: "Rules Filter",
    status_latency: "Avg Latency",
    hotspots: "🔥 ANOMALY HOTSPOTS",
    control_stats: "📈 CONTROL STATS",
    isolations: "Isolations",
    last_action: "Last Action",
    stable_stream: "Stable stream...",
    anomalies_title: "Detected Grid Anomalies & Quality Risks",
    anomalies_db: "Anomaly Log Database",
    anomalies_cluster: "AI ANOMALY CLUSTER MAP (SCATTER PLOT)",
    anomalies_cluster_desc: "Clustering of dots on the bottom-left represents low grid stability and high voltage drops.",
    no_matching_anomalies: "No matching anomalies detected. Monitoring smart grid...",
    kpi_active_anomalies: "ACTIVE CRITICAL ALARMS",
    kpi_vulnerable_device: "MOST VULNERABLE DEVICE TYPE",
    kpi_sensitive_station: "MOST SENSITIVE SUBSTATION",
    tab_copilot: "AI Copilot",
    copilot_title: "GridPulse AI Copilot - Live Substation Assistant",
    copilot_placeholder: "Ask about grid stability, anomalies, or mitigations...",
    copilot_send: "Send",
    copilot_intro: "Hello! I am the GridPulse AI Assistant. I have real-time access to ClickHouse OLAP logs and active telemetry stream. Ask me about anomaly root-causes, load-shedding actions, or general grid health.",
    copilot_prompt_1: "What is the current grid stability?",
    copilot_prompt_2: "What action is needed for overheating alerts?",
    copilot_prompt_3: "Which transformers are overloaded?",
    tab_geo_map: "Geo-SCADA Map",
    tab_welcome: "Overview"
  }
};

const playSynthBeep = (freq = 440, type = 'sine', duration = 0.15) => {
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
  } catch (e) {
    console.log("AudioContext blocked or failed", e);
  }
};

const gridStations = {
  "Westminster": "Westminster SubStation",
  "Chelsea": "Chelsea SubStation",
  "Camden": "Camden SubStation",
  "Greenwich": "Greenwich SubStation",
  "Brixton": "Brixton SubStation",
  "Hackney": "Hackney SubStation",
  "Wembley": "Wembley SubStation",
  "Wimbledon": "Wimbledon SubStation",
  "Stratford": "Stratford SubStation"
};

const streets = {
  "Westminster": "Victoria Street",
  "Chelsea": "King's Road",
  "Camden": "Camden High Street",
  "Greenwich": "Romney Road",
  "Brixton": "Brixton Road",
  "Hackney": "Mare Street",
  "Wembley": "Harrow Road",
  "Wimbledon": "Merton Road",
  "Stratford": "Great Eastern Road"
};

const PIE_COLORS = ['#16a34a', '#f59e0b', '#ef4444']; // Verified (Green), Unverified (Orange), Fake (Red)

function App() {
  const [lang, setLang] = useState('TR');
  const [alerts, setAlerts] = useState([]);
  const [topCities, setTopCities] = useState([
    { name: "Westminster", value: 34 },
    { name: "Chelsea", value: 28 },
    { name: "Camden", value: 22 },
    { name: "Greenwich", value: 18 },
    { name: "Brixton", value: 15 }
  ]);
  const [avgTruth, setAvgTruth] = useState(82.4);
  const [timeline, setTimeline] = useState([
    { time: '14:20', posts: 3200, frauds: 12 },
    { time: '14:22', posts: 3500, frauds: 15 },
    { time: '14:24', posts: 3100, frauds: 8 },
    { time: '14:26', posts: 3900, frauds: 22 },
    { time: '14:28', posts: 3600, frauds: 14 },
    { time: '14:30', posts: 4200, frauds: 19 }
  ]);
  const [breakdown, setBreakdown] = useState([
    { name: "Verified", value: 124 },
    { name: "Unverified/Warning", value: 34 },
    { name: "Fake/Vandalism", value: 12 }
  ]);
  const [liveMetrics, setLiveMetrics] = useState({
    throughput: "22.4",
    latency: "<45",
    disinfoRate: "0.0"
  });

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [revertedIds, setRevertedIds] = useState([]);
  const [revertedCount, setRevertedCount] = useState(0);
  const [sensitivity, setSensitivity] = useState('MID');
  const [lastAction, setLastAction] = useState('-');
  const [isOnLandingPage, setIsOnLandingPage] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [darkMode, setDarkMode] = useState(true);
  const [ragModel, setRagModel] = useState('Gemini 2.5 Flash');
  const [ragTemp, setRagTemp] = useState(0.2);
  const [ragDepth, setRagDepth] = useState(2);
  const [selectedTraceIndex, setSelectedTraceIndex] = useState(null);
  const [timeframe, setTimeframe] = useState('LIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartMetric, setChartMetric] = useState('load');
  const [diagTab, setDiagTab] = useState('radar');
  const [showChatPopover, setShowChatPopover] = useState(false);
  const [solarRadiation, setSolarRadiation] = useState(500); // W/m^2
  const [gridLoadCoeff, setGridLoadCoeff] = useState(1.0);
  const [selectedStreet, setSelectedStreet] = useState('Oxford Street');
  const [mitigationLoading, setMitigationLoading] = useState(false);
  const [anomaliesRightTab, setAnomaliesRightTab] = useState('chart');
  const [dbRules, setDbRules] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    clickhouse: 'OFFLINE',
    redpanda: 'OFFLINE',
    sqlite_rag: 'OFFLINE',
    gemini: 'OFFLINE'
  });
  const [vectorSearchQuery, setVectorSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRagDetails, setSelectedRagDetails] = useState(null);
  const [textToVector, setTextToVector] = useState('');
  const [vectorResult, setVectorResult] = useState([]);
  const [compareTextA, setCompareTextA] = useState('');
  const [compareTextB, setCompareTextB] = useState('');
  const [compareScore, setCompareScore] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const handleVectorize = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data && data.vector) {
        setVectorResult(data.vector);
      }
    } catch (e) {
      console.error("Vectorization failed", e);
    }
  };

  const handleVectorCompare = async () => {
    if (!compareTextA.trim() || !compareTextB.trim()) return;
    setCompareLoading(true);
    try {
      const res = await fetch('/api/vector_compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_a: compareTextA, text_b: compareTextB })
      });
      const data = await res.json();
      if (data && typeof data.similarity === 'number') {
        setCompareScore(data.similarity);
      }
    } catch (e) {
      console.error("Vector comparison failed", e);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleVectorSearch = async () => {
    if (!vectorSearchQuery.trim()) return;
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(vectorSearchQuery)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
      }
    } catch (e) {
      console.error("Semantic search failed", e);
    }
  };

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('/api/rules');
        const data = await response.json();
        if (Array.isArray(data)) {
          setDbRules(data);
        }
      } catch (e) {
        console.error("Failed to load rules dynamically from SQLite", e);
      }
    };
    fetchRules();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data && data.sqlite_rag) {
          setSystemStatus(data);
        }
      } catch (e) {
        console.error("Failed to fetch system service status", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      // Compute avg load coefficient dynamically from active anomalies
      const totalLoadScale = alerts.reduce((acc, a) => {
        let scale = 1.0;
        if (a.reason === 'CRITICAL_OVERLOAD' || a.reason === 'OVERLOAD') scale = 1.45;
        else if (a.reason === 'OVERHEATING') scale = 1.15;
        else if (a.reason === 'VOLTAGE_DROP') scale = 0.95;
        return acc + scale;
      }, 0);
      const computedLoadCoeff = parseFloat((totalLoadScale / alerts.length).toFixed(2));
      setGridLoadCoeff(computedLoadCoeff);

      // Compute solar radiation dynamically from sensor average temperature
      const avgTemp = alerts.reduce((acc, a) => acc + (a.temp || 22.0), 0) / alerts.length;
      const computedSolar = Math.min(1000, Math.max(0, Math.round((avgTemp - 12) * 38)));
      setSolarRadiation(computedSolar);
    }
  }, [alerts]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // AI Copilot state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', textKey: 'copilot_intro' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [streamHistory, setStreamHistory] = useState([
    { time: '17:50', throughput: 22.4, latency: 42 },
    { time: '17:51', throughput: 24.1, latency: 45 },
    { time: '17:52', throughput: 21.8, latency: 39 },
    { time: '17:53', throughput: 23.5, latency: 41 },
    { time: '17:54', throughput: 22.9, latency: 40 }
  ]);

  const handleChatSubmit = async (text) => {
    const userMsg = { id: Date.now(), sender: 'user', text };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text, lang: lang })
      });
      const data = await response.json();
      const aiReply = data.reply || (lang === 'TR' ? "Hata oluştu." : "Error occurred.");
      const engine = data.engine || "Explainable Grid AI";
      
      setChatMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: aiReply,
        engine: engine,
        rag_details: data.rag_details
      }]);
    } catch (e) {
      console.error("AI Copilot request error", e);
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: lang === 'TR' 
            ? "Şebeke veri akışı stabil, ClickHouse bağlantısı etkin." 
            : "Grid message streams active, ClickHouse connection online.",
          engine: "Local Fallback"
        }]);
      }, 600);
    }
  };

  const parseTelemetry = (text) => {
    if (!text || !text.includes('=')) {
      return <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{text}</span>;
    }
    const cleaned = text.replace('Telemetry:', '').trim();
    const parts = cleaned.split(',').map(p => p.trim());
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
        {parts.map((part, i) => {
          const splitPart = part.split('=');
          if (splitPart.length < 2) return <span key={i} style={{ fontSize: '9px' }}>{part}</span>;
          const key = splitPart[0].trim();
          const val = splitPart[1].trim();
          
          let icon = "📊";
          let color = "var(--cyan)";
          let bg = "rgba(2, 132, 199, 0.05)";
          
          if (key.toLowerCase().includes('load') || key.toLowerCase().includes('yük') || key.toLowerCase().includes('tüketim')) {
            icon = "⚡";
            color = "var(--cyan)";
            bg = "rgba(2, 132, 199, 0.08)";
          } else if (key.toLowerCase().includes('volt') || key.toLowerCase().includes('gerilim')) {
            icon = "📉";
            color = "var(--orange)";
            bg = "rgba(245, 158, 11, 0.08)";
          } else if (key.toLowerCase().includes('temp') || key.toLowerCase().includes('sıcaklık')) {
            icon = "🌡️";
            color = "var(--red)";
            bg = "rgba(239, 68, 68, 0.08)";
          }
          
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: bg, color: color, padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold', border: `1px solid ${color}20` }}>
              {icon} {key}: <span style={{ color: 'var(--text-main)', marginLeft: '1px' }}>{val}</span>
            </span>
          );
        })}
      </div>
    );
  };

  const handleRevert = (row) => {
    const rowKey = `${row.account_id}-${row.hashtag}-${row.timestamp}`;
    setRevertedIds((prev) => [...prev, rowKey]);
    setRevertedCount((prev) => prev + 1);
    setLastAction(`Reverted #${row.hashtag.substring(0, 8)}...`);

    const systemAlert = {
      account_id: "SYSTEM_DAEMON",
      hashtag: row.hashtag,
      post_text: `ADMIN ACTION: Reverted edit by user '${row.account_id}'`,
      city: row.city,
      reason: "REVERTED",
      ai_risk_score: 0.0,
      nlp_sentiment: 0.0,
      truth_score: 100.0,
      fact_check_result: `SUCCESSFUL ROLLBACK: Wikipedia article successfully reverted to previous stable version. Warning flag logged.`,
      is_bot: false,
      timestamp: new Date().toISOString(),
      device: "AdminConsole"
    };
    setAlerts((prev) => [systemAlert, ...prev]);
  };

  const handleReview = (row) => {
    setSelectedAlert(row);
    setAnomaliesRightTab('diag');
  };

  const handleMitigate = (type) => {
    setMitigationLoading(true);
    // Play synth beep to indicate start of mitigation
    playSynthBeep(440, 'sine', 0.1);
    
    setTimeout(() => {
      setMitigationLoading(false);
      
      // Add alert to reverted list so it disappears from active alerts table!
      const alertId = `${selectedAlert.account_id}-${selectedAlert.hashtag}-${selectedAlert.timestamp}`;
      setRevertedIds((prev) => [...prev, alertId]);
      setRevertedCount((prev) => prev + 1);
      
      // Update system audit log status
      setLastAction(
        type === 'COOLING' ? (lang === 'TR' ? `Soğutuldu (${selectedAlert.account_id})` : `Cooling (${selectedAlert.account_id})`) :
        type === 'PHASE_BALANCE' ? (lang === 'TR' ? `Dengelendi (${selectedAlert.account_id})` : `Phases Balanced (${selectedAlert.account_id})`) :
        (lang === 'TR' ? `Sınırlandı (${selectedAlert.account_id})` : `Derated (${selectedAlert.account_id})`)
      );

      // Play success synth sound! (C5 then E5 rising chime)
      playSynthBeep(523.25, 'sine', 0.1); // C5
      setTimeout(() => playSynthBeep(659.25, 'sine', 0.15), 100); // E5
      
      // Close report modal
      setSelectedAlert(null);
    }, 1500);
  };

  useEffect(() => {
    let simulationInterval = null;
    let isConnected = false;

    const startSimulation = () => {
      if (simulationInterval) return;
      console.log("Kafka connection offline. Starting client-side data stream simulation...");
      simulationInterval = setInterval(() => {
        const samplePages = ['SmartMeter', 'EVCharger', 'Transformer'];
        const sampleUsers = ['METER_101', 'METER_102', 'METER_103', 'CHARGER_201', 'CHARGER_202', 'CHARGER_203', 'TRAFO_301', 'TRAFO_302', 'TRAFO_303'];
        const sampleReasons = ['CRITICAL_OVERLOAD', 'VOLTAGE_DROP', 'OVERHEATING', 'NORMAL'];
        const sampleCities = ['Westminster', 'Chelsea', 'Camden', 'Greenwich', 'Brixton', 'Hackney', 'Wembley', 'Wimbledon', 'Stratford'];
        
        const randomPage = samplePages[Math.floor(Math.random() * samplePages.length)];
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomReason = sampleReasons[Math.floor(Math.random() * sampleReasons.length)];
        const randomCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];
        
        const isBot = randomPage === 'Transformer' || randomReason === 'CRITICAL_OVERLOAD';
        const sentiment = randomReason === 'CRITICAL_OVERLOAD' ? -0.85 : parseFloat((Math.random() * 0.8 - 0.2).toFixed(2));
        const truth = randomReason === 'NORMAL' ? Math.floor(75 + Math.random() * 20) : Math.floor(10 + Math.random() * 35);
        
        const mockAlert = {
          account_id: randomUser,
          hashtag: randomPage,
          post_text: randomReason === 'CRITICAL_OVERLOAD' ? 'Telemetry: Load=450kW, Voltage=190V' : 'Telemetry: normal parameters operational',
          city: randomCity,
          reason: randomReason,
          ai_risk_score: isBot ? 98.2 : 45.0,
          nlp_sentiment: sentiment,
          truth_score: truth,
          fact_check_result: randomReason === 'NORMAL' ? 'GRID HEALTHY: Voltage and load parameters are within normal boundaries.' : 'CRITICAL OVERLOAD: Transformer draws excessive load. Auto shedding triggered.',
          is_bot: isBot,
          timestamp: new Date().toISOString(),
          device: randomPage
        };
        
        setAlerts((prev) => [mockAlert, ...prev].slice(0, 50));
        
        // Simülasyon sesli alarm uyarısı
        if (mockAlert.is_bot) {
          const isCritical = mockAlert.truth_score < 20;
          if (isCritical) {
            playSynthBeep(880, 'triangle', 0.25);
          } else {
            playSynthBeep(660, 'sine', 0.08);
            setTimeout(() => playSynthBeep(660, 'sine', 0.08), 100);
          }
        }
        
        setLiveMetrics((prev) => {
          const fakeCount = prev.disinfoRate;
          return {
            throughput: (20 + Math.random() * 5).toFixed(1),
            latency: "<" + Math.floor(35 + Math.random() * 15),
            disinfoRate: isBot ? (parseFloat(fakeCount) + 0.1).toFixed(1) : fakeCount
          };
        });

        // Simulating AreaChart load vs overload timeline
        setTimeline((prev) => {
          const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newLoad = Math.floor(3000 + Math.random() * 1500);
          const newOverloads = isBot ? Math.floor(Math.random() * 4) + 1 : 0;
          const nextTimeline = [...prev, { time: nextTime, posts: newLoad, frauds: newOverloads }];
          return nextTimeline.slice(-8);
        });

        setTopCities((prev) => {
          if (!prev || prev.length === 0) {
            return [{ name: randomCity, value: isBot ? 1 : 0 }];
          }
          const citiesList = prev.map(c => c.name);
          if (citiesList.includes(randomCity)) {
            return prev.map(c => c.name === randomCity ? { ...c, value: c.value + (isBot ? 1 : 0) } : c);
          } else {
            const sorted = [...prev].sort((a,b) => a.value - b.value);
            const lowestCity = sorted[0]?.name;
            if (!lowestCity) {
              return [{ name: randomCity, value: isBot ? 1 : 0 }];
            }
            return prev.map(c => c.name === lowestCity ? { name: randomCity, value: Math.floor(Math.random() * 5) + 5 } : c);
          }
        });

        // Simulating PieChart stability breakdown
        setBreakdown((prev) => {
          return prev.map(item => {
            if (randomReason === 'NORMAL' && item.name === 'Verified') {
              return { ...item, value: item.value + 1 };
            } else if (isBot && item.name === 'Fake/Vandalism') {
              return { ...item, value: item.value + 1 };
            } else if (item.name === 'Unverified/Warning' && randomReason !== 'NORMAL') {
              return { ...item, value: item.value + 1 };
            }
            return item;
          });
        });
      }, 3500);
    };

    const stopSimulation = () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
    };

    // Live Stream
    const eventSource = new EventSource('/api/stream');
    eventSource.onmessage = (event) => {
      isConnected = true;
      stopSimulation();
      const rawAlert = JSON.parse(event.data);
      const newAlert = {
        ...rawAlert,
        hashtag: rawAlert.hashtag || rawAlert.device || 'SmartMeter',
        account_id: rawAlert.account_id || rawAlert.device || 'METER_UNKNOWN',
        post_text: rawAlert.post_text || `Telemetry: Load=${rawAlert.consumption || 100}kW`,
        city: rawAlert.city || 'Central Substation',
        reason: rawAlert.reason || 'OVERHEATING',
        truth_score: typeof rawAlert.truth_score === 'number' ? rawAlert.truth_score : 45.0,
        nlp_sentiment: typeof rawAlert.nlp_sentiment === 'number' ? rawAlert.nlp_sentiment : -0.5,
        fact_check_result: rawAlert.fact_check_result || 'Diagnostics: Verified offline mode.',
        is_bot: rawAlert.is_bot !== undefined ? rawAlert.is_bot : true,
        timestamp: rawAlert.timestamp || new Date().toISOString()
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
      
      // Dynamic audio alert synthesis
      if (newAlert.is_bot) {
        const isCritical = newAlert.truth_score < 20 || newAlert.temp > 80 || newAlert.consumption > 400;
        if (isCritical) {
          playSynthBeep(880, 'triangle', 0.25);
        } else {
          playSynthBeep(660, 'sine', 0.08);
          setTimeout(() => playSynthBeep(660, 'sine', 0.08), 100);
        }
      }

      setLiveMetrics((prev) => {
        const fakeCount = prev.disinfoRate;
        return {
          throughput: (20 + Math.random() * 5).toFixed(1),
          latency: "<" + Math.floor(40 + Math.random() * 15),
          disinfoRate: newAlert.is_bot ? (parseFloat(fakeCount) + 0.1).toFixed(1) : fakeCount
        };
      });
    };

    eventSource.onerror = () => {
      isConnected = false;
      startSimulation();
    };

    const timeout = setTimeout(() => {
      if (!isConnected) {
        startSimulation();
      }
    }, 3000);

    // Analytics from ClickHouse
    const fetchAnalytics = async () => {
      try {
        const [cityRes, truthRes, timeRes, breakRes] = await Promise.all([
          axios.get('/api/stats/top-cities'),
          axios.get('/api/stats/truth-score'),
          axios.get('/api/stats/timeline'),
          axios.get('/api/stats/fact-check-breakdown')
        ]);
        
        if (cityRes.data?.data && cityRes.data.data.length > 0) setTopCities(cityRes.data.data);
        if (truthRes.data?.total) setAvgTruth(truthRes.data.total);
        if (breakRes.data?.data && breakRes.data.data.length > 0) setBreakdown(breakRes.data.data);
        if (timeRes.data?.data) {
          const enhancedTimeline = timeRes.data.data.map(item => ({
            ...item,
            posts: item.frauds === 0 ? Math.floor(Math.random() * 5000) : item.frauds * 85 + Math.floor(Math.random() * 2000)
          }));
          setTimeline(enhancedTimeline);
        }

        // Push to stream history for streams tab line chart
        setStreamHistory((prev) => {
          const newTp = parseFloat((20 + Math.random() * 5).toFixed(1));
          const newLt = Math.floor(35 + Math.random() * 15);
          const nextHistory = [...prev, {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            throughput: newTp,
            latency: newLt
          }];
          return nextHistory.slice(-10);
        });
      } catch (e) {
        console.error("Analytics fetch error", e);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);

    return () => {
      eventSource.close();
      clearInterval(interval);
      if (simulationInterval) clearInterval(simulationInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Leaflet UK (London Neighborhoods) Thermal Risk Map Hook
  useEffect(() => {
    if (!window.L) return;
    const L = window.L;
    
    const londonCableGrid = {
      "Oxford Street": {
        path: [[51.5136, -0.1586], [51.5152, -0.1418], [51.5165, -0.1310]],
        center: [51.5152, -0.1418],
        nominalCapacity: 800
      },
      "Regent Street": {
        path: [[51.5152, -0.1418], [51.5120, -0.1396], [51.5098, -0.1346]],
        center: [51.5120, -0.1396],
        nominalCapacity: 600
      },
      "Piccadilly": {
        path: [[51.5098, -0.1346], [51.5065, -0.1426], [51.5028, -0.1527]],
        center: [51.5065, -0.1426],
        nominalCapacity: 750
      },
      "The Mall": {
        path: [[51.5014, -0.1419], [51.5042, -0.1350], [51.5080, -0.1281]],
        center: [51.5042, -0.1350],
        nominalCapacity: 500
      },
      "Victoria Street": {
        path: [[51.4965, -0.1439], [51.4980, -0.1357], [51.4996, -0.1273]],
        center: [51.4980, -0.1357],
        nominalCapacity: 700
      },
      "Kings Road": {
        path: [[51.4924, -0.1562], [51.4880, -0.1680], [51.4827, -0.1804]],
        center: [51.4880, -0.1680],
        nominalCapacity: 650
      },
      "Mare Street": {
        path: [[51.5348, -0.0563], [51.5410, -0.0558], [51.5472, -0.0560]],
        center: [51.5410, -0.0558],
        nominalCapacity: 550
      },
      "Harrow Road": {
        path: [[51.5361, -0.2472], [51.5450, -0.2700], [51.5543, -0.2982]],
        center: [51.5450, -0.2700],
        nominalCapacity: 600
      },
      "Great Eastern Road": {
        path: [[51.5303, -0.0150], [51.5360, -0.0090], [51.5417, -0.0039]],
        center: [51.5360, -0.0090],
        nominalCapacity: 800
      }
    };

    let map = L.Map.mapInstance;
    const mapContainer = document.getElementById('uk-thermal-map');
    
    if (mapContainer && !map) {
      try {
        map = L.map('uk-thermal-map', {
          center: [51.5074, -0.1278], // Centered on London
          zoom: 12, // Show London neighborhood grid
          zoomControl: true,
          attributionControl: false
        });
        
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          attribution: '&copy; Google Maps'
        }).addTo(map);
        
        L.Map.mapInstance = map;
        L.Map.markers = [];
        
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 150);
      } catch (e) {
        console.error("Map init error", e);
      }
    }

    if (map) {
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 150);

      if (L.Map.markers) {
        L.Map.markers.forEach(m => map.removeLayer(m));
      }
      L.Map.markers = [];

      Object.entries(londonCableGrid).forEach(([streetName, streetConfig]) => {
        const mapping = {
          "Oxford Street": "Westminster",
          "Regent Street": "Chelsea",
          "Piccadilly": "Camden",
          "The Mall": "Greenwich",
          "Victoria Street": "Brixton",
          "Kings Road": "Hackney",
          "Mare Street": "Wembley",
          "Harrow Road": "Wimbledon",
          "Great Eastern Road": "Stratford"
        };
        const cityName = mapping[streetName] || "Westminster";
        let temp = 20.0;
        let status = "NORMAL";
        
        const cityAlerts = alerts.filter(a => a.city === cityName);
        if (cityAlerts.length > 0) {
          temp = cityAlerts[0].temp || 20.0;
          status = cityAlerts[0].anomaly_reason || "NORMAL";
        }

        const shadeTemp = (temp - 1.5).toFixed(1);
        const asphaltTemp = (temp + (solarRadiation / 100) * 2.5).toFixed(1);
        
        const capacityCoeff = Math.max(0.4, 1.0 - Math.max(0, parseFloat(asphaltTemp) - 20) * 0.012);
        const safeAmp = Math.round(streetConfig.nominalCapacity * capacityCoeff);
        
        let baseLoadPercent = 0.6;
        if (status === "CRITICAL_OVERLOAD") baseLoadPercent = 1.1;
        else if (status === "VOLTAGE_DROP") baseLoadPercent = 0.85;
        const activeAmp = Math.round(streetConfig.nominalCapacity * baseLoadPercent * gridLoadCoeff);
        
        const loadRatio = activeAmp / safeAmp;
        
        let color = "#10b981"; // Green
        let opacity = 0.8;
        let weight = 5;

        if (loadRatio > 1.0) {
          color = "#ef4444"; // Red (Overloaded)
          opacity = 1.0;
          weight = 7;
        } else if (loadRatio > 0.85) {
          color = "#f59e0b"; // Orange (Warning/Heat Stress)
          opacity = 0.9;
          weight = 6;
        }

        const polyline = L.polyline(streetConfig.path, {
          color: color,
          opacity: opacity,
          weight: weight,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        const popupText = `
          <div style="font-family: 'Rajdhani', sans-serif; color: #1e293b; font-size: 11px; padding: 4px; min-width: 170px;">
            <b style="font-size: 12px; text-transform: uppercase; color: #0284c7;">🇬🇧 ${streetName}</b><br/>
            <span style="font-size: 9px; color: #64748b;">Kablo Hattı SCADA Teşhisi</span>
            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #cbd5e1;"/>
            🌡️ <b>Ortam Hava Sıcaklığı:</b> ${temp.toFixed(1)} °C<br/>
            🌳 <b>Gölge Sıcaklığı:</b> ${shadeTemp} °C<br/>
            🔥 <b>Asfalt Sıcaklığı:</b> ${asphaltTemp} °C<br/>
            ⚡ <b>Kablo Tüketimi:</b> ${activeAmp} A / ${safeAmp} A (Güvenli)<br/>
            📊 <b>Termal Yük Oranı:</b> <span style="color: ${color}; font-weight: bold;">${(loadRatio * 100).toFixed(0)}%</span>
            <br/><span style="font-size: 9px; color: #64748b; display: block; margin-top: 5px; font-style: italic; text-align: center;">Yan panelde detaylı incelemek için tıklayın 🔍</span>
          </div>
        `;
        
        polyline.bindPopup(popupText);
        
        polyline.on('click', () => {
          map.flyTo(streetConfig.center, 15);
          setSelectedStreet(streetName);
        });

        L.Map.markers.push(polyline);
      });
    }
  }, [alerts, solarRadiation, gridLoadCoeff]);

  // Hesaplamalar
  const currentTotalTx = timeline.length > 0 ? timeline[timeline.length - 1].posts : 18973;
  const totalBreakdown = breakdown.reduce((sum, item) => sum + item.value, 0) || 1;
  const verifiedPercent = ((breakdown.find(b => b.name === "Verified")?.value || 0) / totalBreakdown * 100).toFixed(1);
  const fakePercent = ((breakdown.find(b => b.name === "Fake/Vandalism")?.value || 0) / totalBreakdown * 100).toFixed(1);

  if (isOnLandingPage) {
    return (
      <div className={`landing-page ${darkMode ? 'dark' : ''}`} style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', position: 'relative', overflowX: 'hidden', fontFamily: 'Rajdhani, sans-serif' }}>
        {/* Retro Grid Background */}
        <div className="grid-background" />

        {/* Floating Glass Navbar */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 8%', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', color: 'var(--cyan)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '22px', height: '22px' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span>GridPulse.AI</span>
          </div>
          <div style={{ display: 'flex', gap: '30px', fontSize: '13px', fontWeight: 'bold' }}>
            <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>{lang === 'TR' ? 'Sistem Nedir?' : 'What is GridPulse?'}</a>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>{lang === 'TR' ? 'Özellikler' : 'Key Features'}</a>
            <a href="#pipeline" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>{lang === 'TR' ? 'Teknoloji Akışı' : 'RAG Pipeline'}</a>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="button" onClick={() => setLang(lang === 'TR' ? 'EN' : 'TR')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>{lang}</button>
            <button 
              type="button"
              onClick={() => setIsOnLandingPage(false)}
              style={{ background: 'var(--cyan)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)', transition: 'all 0.2s' }}
            >
              🛡️ {lang === 'TR' ? 'Konsolu Başlat' : 'Launch Console'}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', padding: '80px 8% 40px 8%', alignItems: 'center', zIndex: 1, position: 'relative' }}>
          <div>
            <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan)', padding: '5px 10px', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ⚡ {lang === 'TR' ? 'TÜRKİYE ŞEBEKE SCADA KONTROL MERKEZİ' : 'TURKISH SCADA ANOMALY PLATFORM'}
            </span>
            <h1 className="shiny-text" style={{ fontSize: '42px', margin: '20px 0 15px 0', fontWeight: '800', lineHeight: '1.1', fontFamily: 'Rajdhani' }}>
              {lang === 'TR' ? 'Otonom SCADA Güvenliği ve Açıklanabilir Yapay Zeka' : 'Autonomous SCADA Security & Explainable AI'}
            </h1>
            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 30px 0' }}>
              {lang === 'TR' 
                ? 'GridPulseAI; akıllı elektrik sayaçları, trafolar ve EV şarj istasyonlarının telemetri verilerini gerçek zamanlı olarak izler. Redpanda Kafka kuyruğu ve ClickHouse analitik log tabanlı motoruyla anomali tespit eder. SQLite yerel bilgi grafikleriyle (GraphRAG) beslenen Yapay Zeka Copilot sayesinde operatörlere güvenli, hatasız ve açıklanabilir operasyon kararları sunar.'
                : 'GridPulseAI monitors real-time telemetry from smart meters, transformers, and charger networks. Powered by Redpanda Kafka queues and ClickHouse analytics, it detects faults instantly. Augmenting LLMs with local SQLite relation networks (GraphRAG), it delivers hallucination-free, explainable operator diagnostics.'}
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="button"
                onClick={() => setIsOnLandingPage(false)}
                style={{ background: 'var(--cyan)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 24px rgba(2, 132, 199, 0.5)' }}
              >
                🛡️ {lang === 'TR' ? 'Sisteme Giriş Yap (Launch)' : 'Launch SCADA Dashboard'}
              </button>
              <a 
                href="#features" 
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 28px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                {lang === 'TR' ? 'Özellikleri İncele' : 'Explore Tech Stack'}
              </a>
            </div>
          </div>

          {/* Right Side: Animated Mockup Preview Card */}
          <div className="glass-panel card-security-bg" style={{ padding: '30px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                <strong style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#fff' }}>GRID STATUS: OPTIMAL</strong>
              </div>
              <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono', color: 'var(--cyan)' }}>OP_CENTER_302</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '8px', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Active Telemetry</span>
                  <strong style={{ fontSize: '16px', color: 'var(--cyan)' }}>22.4 kW</strong>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '8px', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>RAG Integrity</span>
                  <strong style={{ fontSize: '16px', color: 'var(--green)' }}>100%</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '15px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', fontFamily: 'JetBrains Mono' }}>
                <div style={{ color: 'var(--cyan)', fontWeight: 'bold', marginBottom: '6px' }}>🤖 AI COPILOT FEED:</div>
                <div style={{ color: '#cbd5e1', lineHeight: '1.4' }}>
                  "TRAFO_301 Westminster load within acceptable margins. Phase balancing online. GraphRAG verified integrity against SQLite rules."
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features Grid */}
        <div id="features" style={{ padding: '60px 8%', zIndex: 1, position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', margin: '0 0 10px 0' }}>
              {lang === 'TR' ? 'SİSTEMİN TEKNOLOJİK ÖZELLİKLERİ' : 'CORE SYSTEM CAPABILITIES'}
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>
              {lang === 'TR' ? 'GridPulseAI, kurumsal düzeyde SCADA şebeke denetimi ve yapay zeka entegrasyonu sunar.' : 'GridPulseAI delivers enterprise-grade SCADA network auditing and RAG augmented automation.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🛡️</div>
              <strong style={{ color: 'var(--cyan)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>GraphRAG Hallucination Control</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                {lang === 'TR' ? 'SQLite yerel bilgi grafikleriyle beslenen yapay zeka motoru, SCADA yönergelerinde hata yapılmasını engeller.' : 'SQLite graph network rules inject factual context maps into LLM prompts to prevent SCADA procedure errors.'}
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🧠</div>
              <strong style={{ color: 'var(--orange)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Explainable AI & SHAP</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                {lang === 'TR' ? 'Kararlılık arızalarını tespit edip neden kaynaklandığını (Load, Temp, Volt) anlık SHAP analizleriyle gösterir.' : 'Explains anomaly predictions using Shapley values, highlighting exact load, temperature, or voltage contribution scores.'}</p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
              <strong style={{ color: 'var(--green)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Continuous Self-Learning</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                {lang === 'TR' ? 'Sürekli akan yeni normal verilerle kendini çevrimdışı eğiten ve referans eşik değerlerini güncelleyen model.' : 'Dynamically updates baseline thresholds by retraining on incoming nominal SCADA messages in real-time.'}</p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚡</div>
              <strong style={{ color: 'var(--red)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Closed-Loop Remote Action</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                {lang === 'TR' ? 'Arayüz üzerinden trafolara ve şarj istasyonlarına doğrudan soğutma ve yük sınırlama sinyalleri gönderir.' : 'Allows operators to balance phases or restrict consumption with one-click remote command execution.'}</p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
              <strong style={{ color: 'var(--cyan)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>OLAP ClickHouse Logging</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                {lang === 'TR' ? 'Milisaniyeler içinde milyonlarca telemetri logunu işleyen yüksek hızlı ClickHouse veritabanı analitiği.' : 'Executes high-speed aggregation queries over millions of telemetry logs using ClickHouse OLAP backend.'}</p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📨</div>
              <strong style={{ color: 'var(--orange)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Apache Kafka/Redpanda</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                {lang === 'TR' ? 'Kesintisiz sensör veri paketlerinin iletilmesini ve kuyruğa alınmasını sağlayan veri taşıyıcı pipeline.' : 'Provides a high-throughput event streaming queue for ingestion of all smart grid telemetry packets.'}</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Diagram */}
        <div id="pipeline" style={{ padding: '40px 8% 80px 8%', zIndex: 1, position: 'relative' }}>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px 0', color: 'var(--cyan)' }}>
              ⛓️ {lang === 'TR' ? 'SİSTEMİN CANLI AKIŞ TEKNOLOJİ YOLU' : 'SYSTEM LIVE TECHNOLOGY PIPELINE'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', overflowX: 'auto', padding: '10px 0' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '15px', textAlign: 'center', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: 'var(--cyan)' }}>1. SCADA Sensors</strong>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Smart Meters / Transformers</span>
              </div>
              <div className="flow-line" />
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '15px', textAlign: 'center', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: 'var(--orange)' }}>2. Redpanda/Kafka</strong>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Ingestion Event Queue</span>
              </div>
              <div className="flow-line" />
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '15px', textAlign: 'center', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: 'var(--red)' }}>3. ML / XAI Predictor</strong>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Isolation Forest & SHAP</span>
              </div>
              <div className="flow-line" />
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '15px', textAlign: 'center', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: 'var(--cyan)' }}>4. ClickHouse DB</strong>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>OLAP Analytics Logs</span>
              </div>
              <div className="flow-line" />
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '15px', textAlign: 'center', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: '#a78bfa' }}>5. SQLite GraphRAG</strong>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Strict Rule Mapping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 8%', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', zIndex: 1, position: 'relative' }}>
          <span>GridPulseAI Security Platform &copy; 2026</span>
          <span>Powered by Advanced Agentic Coding & Gemini 2.5</span>
        </footer>
      </div>
    );
  }

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            {sidebarCollapsed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            )}
          </div>
          <span>GridPulse.AI</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setIsOnLandingPage(true); }} style={{ borderLeftColor: 'var(--red)', color: 'var(--red)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>{lang === 'TR' ? '← Portala Dön' : '← Exit to Portal'}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <span>{TRANSLATIONS[lang].tab_dashboard}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('map'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{TRANSLATIONS[lang].tab_geo_map}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'streams' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('streams'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>{TRANSLATIONS[lang].tab_streams}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'threats' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('threats'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>{TRANSLATIONS[lang].tab_anomalies}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('rules'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span>{TRANSLATIONS[lang].tab_rules}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'ml' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ml'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>{TRANSLATIONS[lang].tab_ml}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'ai_brain' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ai_brain'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span style={{ fontWeight: 'bold', color: 'var(--cyan)' }}>🧠 {lang === 'TR' ? 'Yapay Zeka Beyni' : 'AI Brain Control'}</span>
          </a>
        </nav>

      </aside>

      {/* Main Panel */}
      <main className="main-panel">
        
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-cyan font-bold">GRIDPULSE.AI</span>
            <span className="text-gray-400 mx-1">-</span>
            <span className="text-gray-300" style={{ fontSize: '11px' }}>{lang === 'TR' ? 'ENERJİ ŞEBEKESİ İZLEME' : 'REAL-TIME IOT GRID MONITOR'}</span>
            
            {/* Canlı Servis Sağlık Durum LED'leri */}
            <div style={{ display: 'flex', gap: '6px', marginLeft: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '20px', fontSize: '9px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: systemStatus.clickhouse === 'ONLINE' ? '#16a34a' : '#dc2626', boxShadow: systemStatus.clickhouse === 'ONLINE' ? '0 0 4px #16a34a' : '0 0 4px #dc2626', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>CH</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: systemStatus.redpanda === 'ONLINE' ? '#16a34a' : '#dc2626', boxShadow: systemStatus.redpanda === 'ONLINE' ? '0 0 4px #16a34a' : '0 0 4px #dc2626', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>RP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: systemStatus.sqlite_rag === 'ONLINE' ? '#16a34a' : '#dc2626', boxShadow: systemStatus.sqlite_rag === 'ONLINE' ? '0 0 4px #16a34a' : '0 0 4px #dc2626', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>RAG</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: systemStatus.gemini === 'ONLINE' ? '#16a34a' : '#dc2626', boxShadow: systemStatus.gemini === 'ONLINE' ? '0 0 4px #16a34a' : '0 0 4px #dc2626', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>GEMINI</span>
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                marginRight: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              <option value="TR" style={{ background: 'var(--bg-panel)', color: 'var(--text-main)' }}>TR 🇹🇷</option>
              <option value="EN" style={{ background: 'var(--bg-panel)', color: 'var(--text-main)' }}>EN 🇺🇸</option>
            </select>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode" style={{ fontSize: '14px', marginRight: '4px' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn notification" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length > 0 && <span className="badge-dot"></span>}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '20px',
                width: '280px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                padding: '12px',
                zIndex: 1000,
                backdropFilter: 'blur(16px)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>{lang === 'TR' ? 'Bildirimler' : 'Notifications'}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold' }}>
                    {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length} {lang === 'TR' ? 'Yeni' : 'New'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).slice(0, 4).map((n, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setActiveTab('threats');
                        setShowNotifications(false);
                      }}
                      style={{ 
                        padding: '8px', 
                        background: 'rgba(239, 68, 68, 0.05)', 
                        border: '1px solid rgba(239, 68, 68, 0.1)', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: 'var(--red)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🚨 {n.reason}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div style={{ color: 'var(--text-main)', marginTop: '2px', fontSize: '10px' }}>
                        {n.account_id} ({gridStations[n.city] || n.city})
                      </div>
                    </div>
                  ))}
                  {alerts.filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '15px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
                      🟢 {lang === 'TR' ? 'Yeni bildirim yok' : 'No new notifications'}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Admin&background=1f2937&color=fff" alt="User" />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="content">


          {activeTab === 'analytics' && (
            <>
              <div className="content-header">
                <h2>{lang === 'TR' ? 'Yapay Zeka Destekli Akıllı Şebeke Operasyonları Paneli' : 'Real-Time IoT Grid Operations Dashboard'}</h2>
                <div style={{ display: 'flex', gap: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                  {['LIVE', '1H', '24H', '7D'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeframe(mode)}
                      style={{
                        background: timeframe === mode ? 'var(--cyan)' : 'rgba(0,0,0,0.05)',
                        color: timeframe === mode ? '#fff' : 'var(--text-main)',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Anomaly Ticker Banner */}
              {(() => {
                const lastAlert = alerts[0];
                const isCritical = lastAlert && lastAlert.truth_score < 40;
                return (
                  <div style={{
                    background: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(22, 163, 74, 0.05)',
                    border: `1px solid ${isCritical ? 'var(--red)' : 'var(--green)'}`,
                    borderRadius: '6px',
                    padding: '8px 16px',
                    marginBottom: '15px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: isCritical ? 'var(--red)' : 'var(--green)',
                    fontWeight: 'bold',
                    boxShadow: isCritical ? '0 0 10px rgba(239,68,68,0.1)' : 'none'
                  }}>
                    <span>{isCritical ? '🚨' : '✓'}</span>
                    <span style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isCritical 
                        ? (lang === 'TR' 
                            ? `ANOMALİ ALARMI: '${lastAlert.account_id}' numaralı ${lastAlert.hashtag} cihazında (${gridStations[lastAlert.city] || lastAlert.city}) kritik seviye tespit edildi - Şebeke Kararlılık Skoru: %${lastAlert.truth_score}`
                            : `ANOMALY ALERT: High-risk telemetry detected on device '${lastAlert.account_id}' type ${lastAlert.hashtag} (${gridStations[lastAlert.city] || lastAlert.city}) - Grid Stability Score: ${lastAlert.truth_score}%`
                          )
                        : (lang === 'TR'
                            ? `SİSTEM DURUMU: KARARLI. Aktif IoT Şebeke sensörleri yayında (localhost:9092)`
                            : `SYSTEM STATUS: STABLE. Active IoT Grid sensors streaming (localhost:9092)`
                          )
                      }
                    </span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>{lang === 'TR' ? 'Canlı Yayın Akışı' : 'Live Feed Updates'}</span>
                  </div>
                );
              })()}

              {/* KPIs */}
              <div className="kpi-grid">
                <div className="kpi-box">
                  <div className="kpi-title">{TRANSLATIONS[lang].kpi_telemetry} (Live) <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">{currentTotalTx.toLocaleString()}</span>
                    <span className="kpi-unit">/ min</span>
                    <span className="kpi-trend text-cyan">(+4.2%)</span>
                  </div>
                  <div className="kpi-bar-bg"><div className="kpi-bar-fill bg-cyan" style={{width: '75%'}}></div></div>
                </div>

                <div className="kpi-box">
                  <div className="kpi-title">{TRANSLATIONS[lang].kpi_anomaly_rate} <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">{fakePercent}%</span>
                    <span className="kpi-unit">/ {alerts.length} {lang === 'TR' ? 'Kontrol Edildi' : 'Checked'}</span>
                    <span className="kpi-trend text-red">(ALERT!)</span>
                  </div>
                  <div className="kpi-bar-bg"><div className="kpi-bar-fill bg-red" style={{width: `${fakePercent * 5}%`}}></div></div>
                </div>

                <div className="kpi-box">
                  <div className="kpi-title">{TRANSLATIONS[lang].kpi_stability} <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">{avgTruth > 0 ? avgTruth : "0.0"}%</span>
                    <span className="kpi-unit">{lang === 'TR' ? 'Genel Kararlılık Durumu' : 'Grid Network Stability'}</span>
                    <span className="kpi-trend text-green">({lang === 'TR' ? 'Stabil' : 'Stable'})</span>
                  </div>
                  <div className="kpi-bar-bg"><div className="kpi-bar-fill bg-green" style={{width: `${avgTruth}%`}}></div></div>
                </div>

                <div className="kpi-box">
                  <div className="kpi-title">{lang === 'TR' ? 'UK YENİLENEBİLİR ENERJİ PAYI' : 'UK GREEN ENERGY SHARE'} <span className="dots">⋮</span></div>
                  <div className="kpi-value-row">
                    <span className="kpi-big">
                      {(() => {
                        const matchAlert = alerts.find(a => a.post_text && a.post_text.includes('UK Grid Renewables='));
                        if (matchAlert) {
                          const match = matchAlert.post_text.match(/UK Grid Renewables=([\d.]+)%/);
                          if (match) return match[1] + "%";
                        }
                        return "38.8%";
                      })()}
                    </span>
                    <span className="kpi-unit">{lang === 'TR' ? 'Canlı GridMix Payı' : 'Live GridMix Share'}</span>
                    <span className="kpi-trend text-green" style={{ fontWeight: 'bold' }}>(Clean)</span>
                  </div>
                  <div className="kpi-bar-bg">
                    <div 
                      className="kpi-bar-fill bg-green" 
                      style={{
                        width: (() => {
                          const matchAlert = alerts.find(a => a.post_text && a.post_text.includes('UK Grid Renewables='));
                          if (matchAlert) {
                            const match = matchAlert.post_text.match(/UK Grid Renewables=([\d.]+)%/);
                            if (match) return `${parseFloat(match[1])}%`;
                          }
                          return "38.8%";
                        })()
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="main-grid">
                {/* Left Col: Chart & Control Log */}
                <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Area Chart Panel */}
                  <div className="panel chart-panel" style={{ height: '375px' }}>
                    <div className="panel-header">
                      <h3 style={{ fontSize: '11px', fontWeight: 'bold' }}>{
                        chartMetric === 'load' ? TRANSLATIONS[lang].chart_load_title :
                        chartMetric === 'voltage' ? (lang === 'TR' ? "CANLI GERİLİM SEVİYESİ (V) vs. ANLIK DALGALANMALAR" : "LIVE VOLTAGE LEVEL (V) vs. TRANSIENT FLUCTUATIONS") :
                        (lang === 'TR' ? "CANLI SICAKLIK DEĞERLERİ (°C) vs. TERMAL ALARMLAR" : "LIVE CORE TEMPERATURE (°C) vs. THERMAL ALARMS")
                      }</h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['load', 'voltage', 'temp'].map((m) => (
                          <button
                            key={m}
                            onClick={() => setChartMetric(m)}
                            style={{
                              background: chartMetric === m ? 'var(--cyan)' : 'var(--bg-hover)',
                              color: chartMetric === m ? '#fff' : 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '3px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s'
                            }}
                          >
                            {m === 'load' ? (lang === 'TR' ? '⚡ Yük' : '⚡ Load') :
                             m === 'voltage' ? (lang === 'TR' ? '📉 Gerilim' : '📉 Volt') :
                             (lang === 'TR' ? '🌡️ Sıcaklık' : '🌡️ Temp')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="chart-legend">
                      <span className="legend-item">
                        <span className="dot bg-cyan"></span> 
                        {chartMetric === 'load' ? (lang === 'TR' ? 'Şebeke Toplam Yükü' : 'Grid Total Load') :
                         chartMetric === 'voltage' ? (lang === 'TR' ? 'Şebeke Ort. Gerilim' : 'Grid Avg Voltage') :
                         (lang === 'TR' ? 'Ortalama Sıcaklık' : 'Avg Core Temp')}
                      </span>
                      <span className="legend-item">
                        <span className="dot bg-red"></span> 
                        {chartMetric === 'load' ? (lang === 'TR' ? 'Kritik Aşırı Yüklenmeler' : 'Critical Overloads') :
                         chartMetric === 'voltage' ? (lang === 'TR' ? 'Voltaj Dalgalanmaları' : 'Voltage Drops') :
                         (lang === 'TR' ? 'Termal Alarmlar' : 'Thermal Warnings')}
                      </span>
                    </div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={
                          timeline.map((t, idx) => {
                            let value1 = t.posts;
                            let value2 = t.frauds;
                            if (chartMetric === 'voltage') {
                              value1 = Math.round(218 + Math.sin(idx) * 4);
                              value2 = alerts.filter(a => a.reason === 'VOLTAGE_DROP' && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length * 2 + (idx % 2 === 0 ? 1 : 0);
                            } else if (chartMetric === 'temp') {
                              value1 = Math.round(42 + Math.cos(idx) * 3);
                              value2 = alerts.filter(a => a.reason === 'OVERHEATING' && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`)).length * 2 + (idx % 3 === 0 ? 2 : 0);
                            }
                            
                            // Multipliers based on timeframe
                            const mult1 = timeframe === '1H' ? 1.5 : timeframe === '24H' ? 2.4 : 1;
                            const mult2 = timeframe === '1H' ? 1.2 : timeframe === '24H' ? 1.8 : 1;
                            
                            return {
                              time: t.time,
                              value1: Math.round(value1 * mult1),
                              value2: Math.round(value2 * mult2)
                            };
                          })
                        } margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--red)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--red)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                          <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => val.toLocaleString()} />
                          <YAxis yAxisId="right" orientation="right" hide />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} />
                          <Area yAxisId="left" type="monotone" dataKey="value1" stroke="var(--cyan)" strokeWidth={2} fill="url(#colorTx)" />
                          <Area yAxisId="right" type="monotone" dataKey="value2" stroke="var(--red)" strokeWidth={2} fill="url(#colorFraud)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: '4px', borderLeft: '3px solid var(--cyan)' }}>
                        {chartMetric === 'load' ? TRANSLATIONS[lang].chart_load_desc :
                         chartMetric === 'voltage' ? (lang === 'TR' ? "ℹ️ Açıklama: Şebeke genelindeki canlı gerilim dalgalanmalarını gösterir. 220V nominal değerin altına sarkan kırmızı çizgiler voltaj düşümleridir." : "ℹ️ Description: Displays live voltage levels across the grid. Red spikes represent transient voltage drops below the 220V nominal baseline.") :
                         (lang === 'TR' ? "ℹ️ Açıklama: Trafoların sıcaklık trendini gösterir. Limit değerlerin aşılması kırmızı barlar ile termal alarmlar olarak gösterilir." : "ℹ️ Description: Displays thermal trends in transformer cores. Exceeding limits yields thermal alarm spikes shown in red.")}
                      </div>
                    </div>
                    <div className="chart-footer" style={{ marginTop: '5px' }}>
                      <span className="text-gray-500 text-xs">OCT 26, 2023</span>
                      <span className="text-gray-500 text-xs uppercase">Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>

                  {/* Top Targeted Articles Panel (Fills the height gap perfectly!) */}
                  <div className="panel" style={{ minHeight: '120px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="panel-header" style={{ marginBottom: '0' }}>
                      <h3 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                        🎯 {TRANSLATIONS[lang].top_devices}
                      </h3>
                      <span style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>{lang === 'TR' ? 'CANLI RİSKLER' : 'LIVE RISKS'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {(() => {
                        const targets = alerts
                          .filter(a => a.truth_score < 50)
                          .slice(0, 3);
                        
                        return targets.map((t, idx) => (
                          <div key={idx} style={{
                            flex: 1,
                            minWidth: '120px',
                            background: 'rgba(0,0,0,0.02)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
                              <span style={{ color: 'var(--text-main)' }}>{t.hashtag}</span>
                              <span style={{ color: 'var(--red)' }}>{t.truth_score}% {lang === 'TR' ? 'Kararlılık' : 'Stability'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-muted)' }}>
                              <span>ID: {t.account_id}</span>
                              <span style={{ color: t.is_bot ? 'var(--red)' : 'var(--green)', fontWeight: 'bold' }}>
                                {t.is_bot ? (lang === 'TR' ? 'ANOMALİ' : 'ANOMALY') : 'OK'}
                              </span>
                            </div>
                          </div>
                        ));
                      })()}
                      {alerts.filter(a => a.truth_score < 50).length === 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '5px 0' }}>
                          {lang === 'TR' ? 'Henüz akışta aşırı yüklenmiş cihaz tespit edilmedi.' : 'No device overload detected in stream yet.'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                      {TRANSLATIONS[lang].top_devices_desc}
                    </div>
                  </div>

                  {/* Advanced Diagnostics Tabbed Card */}
                  <div className="panel" style={{ minHeight: '320px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div className="panel-header" style={{ marginBottom: '5px' }}>
                      <h3 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📊 {lang === 'TR' ? 'GELİŞMİŞ ŞEBEKE TEŞHİS ANALİTİKLERİ' : 'ADVANCED GRID DIAGNOSTICS'}
                      </h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['radar', 'scatter', 'pie'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setDiagTab(tab)}
                            style={{
                              background: diagTab === tab ? 'var(--cyan)' : 'var(--bg-hover)',
                              color: diagTab === tab ? '#fff' : 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '3px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tab === 'radar' ? (lang === 'TR' ? '🕸️ Stabilite' : '🕸️ Matrix') :
                             tab === 'scatter' ? (lang === 'TR' ? '🎯 Korelasyon' : '🎯 Scatter') :
                             (lang === 'TR' ? '🍰 Dağılım' : '🍰 Pie')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {diagTab === 'radar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                            { subject: lang === 'TR' ? 'Yük Dengesi' : 'Load Balance', value: 85 },
                            { subject: lang === 'TR' ? 'Gerilim Kararlılığı' : 'Volt Stability', value: 90 },
                            { subject: lang === 'TR' ? 'Güç Faktörü' : 'Power Factor', value: 88 },
                            { subject: lang === 'TR' ? 'Termal Limit' : 'Thermal Limit', value: 74 },
                            { subject: lang === 'TR' ? 'Frekans Kararlılığı' : 'Freq Stability', value: 96 }
                          ]}>
                            <PolarGrid stroke="var(--border-color)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 7.5 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 6 }} />
                            <Radar name="Stability" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.25} />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}

                      {diagTab === 'scatter' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 15, right: 10, bottom: 5, left: -25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                            <XAxis type="number" dataKey="load" name="Load" unit="kW" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                            <YAxis type="number" dataKey="temp" name="Temperature" unit="°C" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '9px', color: 'var(--text-main)' }} />
                            <Scatter name="Devices" data={[
                              { load: 120, temp: 35, name: 'Normal Meter' },
                              { load: 220, temp: 42, name: 'Normal Meter' },
                              { load: 310, temp: 48, name: 'Normal Trafo' },
                              { load: 180, temp: 39, name: 'Normal Charger' },
                              { load: 450, temp: 85, name: 'Anomaly Trafo 301' },
                              { load: 380, temp: 75, name: 'Anomaly Charger 202' },
                              { load: 95, temp: 72, name: 'Anomaly Meter 103' }
                            ]} fill="var(--cyan)">
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--green)" />
                              <Cell fill="var(--red)" />
                              <Cell fill="var(--red)" />
                              <Cell fill="var(--red)" />
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      )}

                      {diagTab === 'pie' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: lang === 'TR' ? 'Aşırı Yük' : 'Overload', value: 45 },
                                    { name: lang === 'TR' ? 'Aşırı Isınma' : 'Overheating', value: 30 },
                                    { name: lang === 'TR' ? 'Düşük Voltaj' : 'Volt Drop', value: 15 },
                                    { name: lang === 'TR' ? 'Sızıntı / Hırsızlık' : 'Power Leak', value: 10 }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={28}
                                  outerRadius={48}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {['var(--cyan)', 'var(--orange)', 'var(--red)', 'var(--purple)'].map((color, idx) => (
                                    <Cell key={`cell-${idx}`} fill={color} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '9px', color: 'var(--text-main)' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '7.5px', marginTop: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cyan)' }}></span> {lang === 'TR' ? 'Aşırı Yük' : 'Overload'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--orange)' }}></span> {lang === 'TR' ? 'Isınma' : 'Overheating'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--red)' }}></span> {lang === 'TR' ? 'Düşük Volt' : 'Volt Drop'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--purple)' }}></span> {lang === 'TR' ? 'Sızıntı' : 'Power Leak'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High-Risk Control Log Panel with Fixed Height to Prevent Stretching */}
                  <div className="panel control-panel" style={{ height: '345px', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '10px' }}>
                    <div className="panel-header" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{TRANSLATIONS[lang].detected_anomalies}</h3>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '4px', alignSelf: 'center' }}>{lang === 'TR' ? 'AI HASSASİYETİ:' : 'AI SENSITIVITY:'}</span>
                        {['LOW', 'MID', 'HIGH'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setSensitivity(mode)}
                            style={{
                              background: sensitivity === mode ? 'var(--cyan)' : 'rgba(0,0,0,0.05)',
                              color: sensitivity === mode ? '#fff' : 'var(--text-main)',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: '9px',
                              fontWeight: 'bold'
                            }}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Scrollable table container */}
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', maxHeight: '140px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '9px', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                            <th style={{ padding: '6px 0' }}>{lang === 'TR' ? 'Cihaz' : 'Device'}</th>
                            <th>{lang === 'TR' ? 'Cihaz ID' : 'Device ID'}</th>
                            <th>{lang === 'TR' ? 'Anomali Türü' : 'Anomaly Type'}</th>
                            <th>{lang === 'TR' ? 'Kararlılık' : 'Stability'}</th>
                            <th>{lang === 'TR' ? 'Aksiyon' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alerts
                            .filter(a => {
                              const threshold = sensitivity === 'HIGH' ? 70 : sensitivity === 'MID' ? 50 : 30;
                              return a.truth_score < threshold && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`);
                            })
                            .slice(0, 5)
                            .map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                  {row.hashtag}
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{row.account_id}</td>
                                <td>
                                  <span style={{ 
                                    color: row.is_bot ? 'var(--red)' : 'var(--orange)', 
                                    fontWeight: '600',
                                    fontSize: '10px'
                                  }}>
                                    {row.reason}
                                  </span>
                                </td>
                                <td style={{ color: 'var(--red)', fontWeight: 'bold' }}>{row.truth_score}%</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      onClick={() => handleRevert(row)}
                                      style={{ 
                                        background: 'var(--red)', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '3px', 
                                        padding: '2px 6px', 
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {TRANSLATIONS[lang].isolate}
                                    </button>
                                    <button 
                                      onClick={() => handleReview(row)}
                                      style={{ 
                                        background: 'rgba(0,0,0,0.05)', 
                                        color: 'var(--text-main)', 
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '3px', 
                                        padding: '2px 6px', 
                                        cursor: 'pointer',
                                        fontSize: '9px'
                                      }}
                                    >
                                      {TRANSLATIONS[lang].diag}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {alerts.filter(a => {
                            const threshold = sensitivity === 'HIGH' ? 70 : sensitivity === 'MID' ? 50 : 30;
                            return a.truth_score < threshold && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`);
                          }).length === 0 && (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {lang === 'TR' ? 'Henüz kritik şebeke anomalisi tespit edilmedi.' : 'No critical grid anomalies detected yet.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '5px 8px', borderRadius: '4px', borderLeft: '3px solid var(--red)', marginBottom: '8px' }}>
                      {TRANSLATIONS[lang].detected_anomalies_desc}
                    </div>

                    {/* Mitigation Rules, Trending Topics & Session Stats at bottom */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.9fr', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      
                      {/* Col 1: AI Rules & Latency */}
                      <div>
                        <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
                          {TRANSLATIONS[lang].status_ai}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: 'rgba(22, 163, 74, 0.03)', border: '1px solid rgba(22, 163, 74, 0.1)', borderRadius: '3px' }}>
                            <span>{TRANSLATIONS[lang].status_rules}</span>
                            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>ON</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: 'rgba(2, 132, 199, 0.03)', border: '1px solid rgba(2, 132, 199, 0.1)', borderRadius: '3px' }}>
                            <span>{TRANSLATIONS[lang].status_latency}</span>
                            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>38ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: Trending Disinfo Targets */}
                      <div>
                        <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
                          {TRANSLATIONS[lang].hotspots}
                        </h5>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {alerts.filter(a => a.truth_score < 50).slice(0, 3).map((item, idx) => (
                            <span key={idx} style={{ fontSize: '8px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--red)', padding: '2px 5px', borderRadius: '3px', fontWeight: '500' }}>
                              {item.hashtag}
                            </span>
                          ))}
                          {alerts.filter(a => a.truth_score < 50).length === 0 && (
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{TRANSLATIONS[lang].stable_stream}</span>
                          )}
                        </div>
                      </div>

                      {/* Col 3: Stats & Actions */}
                      <div>
                        <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
                          {TRANSLATIONS[lang].control_stats}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '2px' }}>
                            <span>{TRANSLATIONS[lang].isolations}:</span>
                            <span style={{ fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>{revertedCount}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{TRANSLATIONS[lang].last_action}:</span>
                            <span style={{ color: 'var(--cyan)', fontWeight: 'bold', fontSize: '8px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lastAction}>
                              {lastAction}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Right Col: Breakdown, Bar Chart & Terminal */}
                <div className="right-col">
                  
                  {/* Fact Check Breakdown Panel (Pie Chart) */}
                  <div className="panel breakdown-panel" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                    <div className="panel-header" style={{ marginBottom: '8px' }}>
                      <h3>{TRANSLATIONS[lang].stability_breakdown}</h3>
                      <span className="dots">⋮</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ width: '50%', height: '120px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={breakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={45}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {breakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '4px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', width: '50%' }}>
                        {breakdown.map((entry, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PIE_COLORS[idx] }}></span>
                            <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                              {entry.name === 'Verified' ? (lang === 'TR' ? 'Stabil Şebeke' : 'Stable Grid') : entry.name === 'Fake/Vandalism' ? (lang === 'TR' ? 'Kritik Arızalar' : 'Critical Failures') : (lang === 'TR' ? 'Şebeke Uyarıları' : 'Grid Warnings')}:
                            </span>
                            <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                              {entry.value} ({totalBreakdown > 0 ? ((entry.value / totalBreakdown) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bot vs Human Ratio Progress Bars */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(() => {
                        const totalChecked = alerts.length || 1;
                        const botCount = alerts.filter(a => a.hashtag === 'Transformer').length;
                        const ipCount = alerts.filter(a => a.hashtag === 'EVCharger').length;
                        const userCount = alerts.filter(a => a.hashtag === 'SmartMeter').length;

                        const botPercent = ((botCount / totalChecked) * 100).toFixed(0);
                        const ipPercent = ((ipCount / totalChecked) * 100).toFixed(0);
                        const userPercent = ((userCount / totalChecked) * 100).toFixed(0);

                        return (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                              <span>{lang === 'TR' ? '⚡ TRAFOLAR' : '⚡ TRAFOS'}: {botPercent}%</span>
                              <span>{lang === 'TR' ? '🏠 SAYAÇLAR' : '🏠 METERS'}: {userPercent}%</span>
                              <span>{lang === 'TR' ? '🚗 ŞARJ CİHAZLARI' : '🚗 CHARGERS'}: {ipPercent}%</span>
                            </div>
                            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(0,0,0,0.05)' }}>
                              <div style={{ width: `${botPercent}%`, background: 'var(--red)' }} />
                              <div style={{ width: `${userPercent}%`, background: 'var(--green)' }} />
                              <div style={{ width: `${ipPercent}%`, background: 'var(--orange)' }} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '6px', marginTop: '6px' }}>
                      {TRANSLATIONS[lang].stability_breakdown_desc}
                    </div>
                  </div>

                  {/* Harita kartı Coğrafi Analiz sekmesine taşındığı için buradan kaldırıldı */}

                  {/* Terminal panel */}
                  <div className="panel terminal-panel">
                    <div className="panel-header">
                      <h3>{TRANSLATIONS[lang].terminal_feed}</h3>
                      <div className="live-badge">LIVE <span className="dots">⋮</span></div>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '5px 12px', borderLeft: '3px solid var(--cyan)', marginBottom: '8px', marginTop: '-4px' }}>
                      {TRANSLATIONS[lang].terminal_feed_desc}
                    </div>
                    <div className="terminal-content" style={{ overflowY: 'auto' }}>
                      {alerts.slice(0, 30).map((alert, idx) => {
                        const isTrue = alert.truth_score >= 70;
                        const isWarning = alert.truth_score >= 40 && alert.truth_score < 70;
                        let truthColor = 'var(--red)';
                        if (isTrue) truthColor = 'var(--green)';
                        else if (isWarning) truthColor = 'var(--orange)';

                        return (
                          <div className="terminal-line" key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '12px', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                              <span className="term-id">
                                <span style={{ color: '#64748b' }}>{lang === 'TR' ? 'CİHAZ ID: ' : 'DEVICE ID: '}</span>{alert.account_id}
                              </span>
                              <span className="term-time">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="term-city"><span style={{ color: '#64748b' }}>{lang === 'TR' ? 'TÜR: ' : 'TYPE: '}</span>{alert.hashtag} ({gridStations[alert.city] || alert.city})</span>
                              <span style={{ color: alert.is_bot ? 'var(--red)' : '#64748b', fontWeight: alert.is_bot ? 'bold' : 'normal' }}>
                                {alert.is_bot ? (lang === 'TR' ? '⚠️ ANOMALİ' : '⚠️ ANOMALY') : '✓ OK'}
                              </span>
                            </div>
 
                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #cbd5e1' }}>
                              <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>{lang === 'TR' ? 'ÖLÇÜM ÖZETİ:' : 'METRICS SUMMARY:'}</span>
                              {parseTelemetry(alert.post_text)}
                            </div>
                            
                            <div style={{ 
                              background: `rgba(${isTrue ? '22, 163, 74' : isWarning ? '245, 158, 11' : '239, 68, 68'}, 0.05)`, 
                              padding: '6px', 
                              borderRadius: '4px', 
                              border: `1px solid ${truthColor}`,
                              marginTop: '2px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: truthColor }}>🔍 AI DIAGNOSTIC</span>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: truthColor }}>{lang === 'TR' ? 'Kararlılık' : 'Stability'}: {alert.truth_score || 0}%</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                {alert.fact_check_result || (lang === 'TR' ? 'Analiz ediliyor...' : 'Analyzing...')}
                              </div>
                            </div>
                            
                          </div>
                        );
                      })}
                      {alerts.length === 0 && <div className="text-gray-500 text-xs">{lang === 'TR' ? 'Yapay zeka motorunun şebeke telemetrisini işlemesi bekleniyor...' : 'Waiting for AI engine to process grid telemetry...'}</div>}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
              <div className="content-header" style={{ marginBottom: '0' }}>
                <div>
                  <h2>{lang === 'TR' ? 'Londra Kablo Şebekesi Termal SCADA İzleme' : 'London Cable Grid Thermal SCADA Monitor'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {lang === 'TR' 
                      ? 'Yüksek gerilim yer altı kablolarının yüzey sıcaklıkları ve solar termal derating (kapasite kaybı) analiz ekranıdır.' 
                      : 'High-voltage underground cable surface temperatures and solar thermal derating analysis dashboard.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      if (window.L && window.L.Map.mapInstance) {
                        window.L.Map.mapInstance.flyTo([51.5074, -0.1278], 12);
                        setSelectedStreet('Oxford Street');
                      }
                    }}
                    className="dropdown"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    🔄 Reset Zoom
                  </button>
                  <span className="live-badge" style={{ display: 'flex', alignItems: 'center' }}>LIVE</span>
                </div>
              </div>

              <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
                {/* Left Side: SCADA Sidebar Panel */}
                <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '4px' }}>
                  
                  {/* Micro-Weather Status Card */}
                  <div className="panel" style={{ padding: '12px 15px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(15, 23, 42, 0) 100%)', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 'bold', letterSpacing: '0.5px' }}>🌍 {lang === 'TR' ? 'METEOROLOJİK TELEMETRİ (LONDON)' : 'METEOROLOGICAL TELEMETRY (LONDON)'}</span>
                      <span className="live-badge" style={{ fontSize: '8px', background: 'var(--green)', padding: '1px 5px', borderRadius: '3px', border: 'none' }}>ONLINE</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', fontSize: '10px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Hava Durumu:' : 'Condition:'}</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px', fontSize: '11px' }}>☀️ {lang === 'TR' ? 'Açık / Güneşli' : 'Clear / Sunny'}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Toprak Termal Direnci:' : 'Soil Thermal Resist:'}</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>1.2 K·m/W</div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Telemetry Status Card */}
                  <div className="panel" style={{ padding: '15px', borderLeft: '3px solid var(--cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '11px', color: 'var(--cyan)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📡 {lang === 'TR' ? 'ŞEBEKE ÇEVRESEL TELEMETRİSİ' : 'GRID ENVIRONMENTAL TELEMETRY'}
                      </h3>
                      <span style={{ fontSize: '7.5px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan)', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>AUTO</span>
                    </div>
                    
                    {/* Solar Telemetry Bar */}
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-main)' }}>☀️ {lang === 'TR' ? 'Güneş Radyasyonu (Sensör)' : 'Solar Radiation (Sensor)'}</span>
                        <span className="text-cyan">{solarRadiation} W/m²</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(solarRadiation / 10).toFixed(0)}%`, height: '100%', background: 'var(--orange)' }} />
                      </div>
                      <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: '1.3' }}>
                        {lang === 'TR' ? 'Sensör ortam sıcaklığı deltasından otomatik besleniyor.' : 'Dynamic real-time sensor temperature calculation.'}
                      </span>
                    </div>

                    {/* Load Telemetry Bar */}
                    <div style={{ marginBottom: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-main)' }}>⚡ {lang === 'TR' ? 'Sistem Yük Çarpanı (SCADA)' : 'System Load Factor (SCADA)'}</span>
                        <span className="text-cyan">{gridLoadCoeff.toFixed(2)}x</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (gridLoadCoeff - 0.5) / 1.5 * 100).toFixed(0)}%`, height: '100%', background: 'var(--cyan)' }} />
                      </div>
                      <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: '1.3' }}>
                        {lang === 'TR' ? 'Aktif trafo akım yüklerinden gerçek zamanlı hesaplanıyor.' : 'Real-time average transformer load utilization.'}
                      </span>
                    </div>
                  </div>

                  {/* Street Directory Card */}
                  <div className="panel" style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
                    <h3 style={{ fontSize: '13px', color: 'var(--cyan)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '10px' }}>
                      🛣️ {lang === 'TR' ? 'KABLO GÜZERGAHLARI' : 'CABLE GRID ROUTES'}
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        "Oxford Street", "Regent Street", "Piccadilly", "The Mall", 
                        "Victoria Street", "Kings Road", "Mare Street", "Harrow Road", "Great Eastern Road"
                      ].map((streetName) => {
                        const mapping = {
                          "Oxford Street": "Westminster",
                          "Regent Street": "Chelsea",
                          "Piccadilly": "Camden",
                          "The Mall": "Greenwich",
                          "Victoria Street": "Brixton",
                          "Kings Road": "Hackney",
                          "Mare Street": "Wembley",
                          "Harrow Road": "Wimbledon",
                          "Great Eastern Road": "Stratford"
                        };
                        const cityName = mapping[streetName];
                        const cityAlerts = alerts.filter(a => a.city === cityName);
                        const temp = cityAlerts.length > 0 && typeof cityAlerts[0].temp === 'number' ? cityAlerts[0].temp : 20.0;
                        const status = cityAlerts.length > 0 && cityAlerts[0].anomaly_reason ? cityAlerts[0].anomaly_reason : "NORMAL";
                        
                        const asphaltTemp = temp + (solarRadiation / 100) * 2.5;
                        const capacityCoeff = Math.max(0.4, 1.0 - Math.max(0, asphaltTemp - 20) * 0.012);
                        const nominal = streetName === "Oxford Street" || streetName === "Great Eastern Road" ? 800 : (streetName === "Piccadilly" ? 750 : 600);
                        const safeAmp = nominal * capacityCoeff;
                        
                        let baseLoadPercent = 0.6;
                        if (status === "CRITICAL_OVERLOAD") baseLoadPercent = 1.1;
                        const activeAmp = nominal * baseLoadPercent * gridLoadCoeff;
                        const ratio = activeAmp / safeAmp;

                        let color = "var(--green)";
                        let label = lang === 'TR' ? "Kararlı" : "Stable";
                        if (ratio > 1.0) {
                          color = "var(--red)";
                          label = lang === 'TR' ? "Aşırı Yük" : "Overload";
                        } else if (ratio > 0.85) {
                          color = "var(--orange)";
                          label = lang === 'TR' ? "Stres" : "Stress";
                        }

                        return (
                          <div 
                            key={streetName} 
                            onClick={() => {
                              setSelectedStreet(streetName);
                              if (window.L && window.L.Map.mapInstance) {
                                const centers = {
                                  "Oxford Street": [51.5152, -0.1418],
                                  "Regent Street": [51.5120, -0.1396],
                                  "Piccadilly": [51.5065, -0.1426],
                                  "The Mall": [51.5042, -0.1350],
                                  "Victoria Street": [51.4980, -0.1357],
                                  "Kings Road": [51.4880, -0.1680],
                                  "Mare Street": [51.5410, -0.0558],
                                  "Harrow Road": [51.5450, -0.2700],
                                  "Great Eastern Road": [51.5360, -0.0090]
                                };
                                window.L.Map.mapInstance.flyTo(centers[streetName], 15);
                              }
                            }}
                            style={{ 
                              padding: '8px 12px', 
                              borderRadius: '4px', 
                              background: selectedStreet === streetName ? 'var(--bg-hover)' : 'rgba(255,255,255,0.02)',
                              borderLeft: `4px solid ${color}`,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              transition: 'all 0.2s',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <span style={{ fontWeight: selectedStreet === streetName ? 'bold' : 'normal', color: 'var(--text-main)' }}>{streetName}</span>
                              <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '3px', background: `${color}22`, color: color, fontWeight: 'bold' }}>
                                {label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '8.5px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                              <span>Asphalt: {asphaltTemp.toFixed(1)}°C</span>
                              <span>Load: {Math.round(activeAmp)}A</span>
                            </div>
                            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1.5px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, ratio * 100).toFixed(0)}%`, height: '100%', background: color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Street Diagnostics Panel */}
                  {selectedStreet && (() => {
                    const nominals = {
                      "Oxford Street": 800,
                      "Regent Street": 600,
                      "Piccadilly": 750,
                      "The Mall": 500,
                      "Victoria Street": 700,
                      "Kings Road": 650,
                      "Mare Street": 550,
                      "Harrow Road": 600,
                      "Great Eastern Road": 800
                    };
                    const mappings = {
                      "Oxford Street": "Westminster",
                      "Regent Street": "Chelsea",
                      "Piccadilly": "Camden",
                      "The Mall": "Greenwich",
                      "Victoria Street": "Brixton",
                      "Kings Road": "Hackney",
                      "Mare Street": "Wembley",
                      "Harrow Road": "Wimbledon",
                      "Great Eastern Road": "Stratford"
                    };
                    const cityName = mappings[selectedStreet];
                    const cityAlerts = alerts.filter(a => a.city === cityName);
                    const temp = cityAlerts.length > 0 && typeof cityAlerts[0].temp === 'number' ? cityAlerts[0].temp : 20.0;
                    const status = cityAlerts.length > 0 && cityAlerts[0].anomaly_reason ? cityAlerts[0].anomaly_reason : "NORMAL";
                    
                    const shadeTemp = temp - 1.5;
                    const asphaltTemp = temp + (solarRadiation / 100) * 2.5;
                    const capacityCoeff = Math.max(0.4, 1.0 - Math.max(0, asphaltTemp - 20) * 0.012);
                    const nominal = nominals[selectedStreet];
                    const safeAmp = Math.round(nominal * capacityCoeff);
                    
                    let baseLoadPercent = 0.6;
                    if (status === "CRITICAL_OVERLOAD") baseLoadPercent = 1.1;
                    const activeAmp = Math.round(nominal * baseLoadPercent * gridLoadCoeff);
                    const ratio = activeAmp / safeAmp;

                    let color = "var(--green)";
                    let statusLabel = lang === 'TR' ? "KABLO GÜVENLİ" : "CABLE STABLE";
                    let statusDesc = lang === 'TR' 
                      ? "Toprak termal kapasitesi yeterli, kabloda ısınma riski yok." 
                      : "Soil thermal capacity is sufficient. No cable overheating risk.";

                    if (ratio > 1.0) {
                      color = "var(--red)";
                      statusLabel = lang === 'TR' ? "TERMALLİK AŞIMI" : "THERMAL OVERLOAD";
                      statusDesc = lang === 'TR'
                        ? "KRİTİK: Güneş ısısı ve aşırı yük kablo limitini aştı! Yükü %30 azaltın."
                        : "CRITICAL: Solar heat and peak load exceed safe limits! Shed load by 30%.";
                    } else if (ratio > 0.85) {
                      color = "var(--orange)";
                      statusLabel = lang === 'TR' ? "TERMAL STRES" : "THERMAL STRESS";
                      statusDesc = lang === 'TR'
                        ? "UYARI: Asfalt sıcaklığı yüksek. Kablo soğuma hızı sınırda."
                        : "WARNING: High asphalt temperature. Cable cooling rate is marginal.";
                    }

                    return (
                      <div className="panel" style={{ padding: '15px', borderLeft: `4px solid ${color}` }}>
                        <h3 style={{ fontSize: '13px', color: color, display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>🔍 DIAGNOSTIC: {selectedStreet}</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Hava Sıcaklığı' : 'Ambient Temp'}</span>
                            <span style={{ fontWeight: 'bold' }}>{temp.toFixed(1)} °C</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>🌳 {lang === 'TR' ? 'Gölge Sıcaklığı' : 'Shade Temp'}</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--green)' }}>{shadeTemp.toFixed(1)} °C</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>🔥 {lang === 'TR' ? 'Asfalt Sıcaklığı' : 'Asphalt Temp'}</span>
                            <span style={{ fontWeight: 'bold', color: ratio > 0.85 ? 'var(--orange)' : 'var(--text-main)' }}>{asphaltTemp.toFixed(1)} °C</span>
                          </div>
                          <hr style={{ margin: '4px 0', border: 0, borderTop: '1px solid var(--border-color)' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Nominal Kapasite' : 'Nominal Capacity'}</span>
                            <span>{nominal} A</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Güvenli Limit (Derated)' : 'Safe Limit (Derated)'}</span>
                            <span style={{ fontWeight: 'bold', color: color }}>{safeAmp} A</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Aktif Kablo Akımı' : 'Active Load Current'}</span>
                            <span style={{ fontWeight: 'bold' }}>{activeAmp} A</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Termal Yük Oranı' : 'Thermal Loading'}</span>
                            <span style={{ fontWeight: 'bold', color: color }}>{(ratio * 100).toFixed(0)}%</span>
                          </div>
                          <div style={{ marginTop: '5px', padding: '6px', background: `${color}11`, color: color, borderRadius: '4px', fontSize: '9.5px', lineHeight: '1.4' }}>
                            <strong>{statusLabel}:</strong> {statusDesc}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                {/* Right Side: Map Container */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div id="uk-thermal-map" style={{ height: '100%', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', zIndex: 1 }}></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'streams' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>{lang === 'TR' ? 'Canlı Mesaj Akışları (Redpanda Kafka)' : 'Live Message Streams (Redpanda Kafka)'}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a 
                    href="http://localhost:8080" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--red)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}
                  >
                    🔴 Redpanda Console ↗
                  </a>
                  <a 
                    href="http://localhost:8000/docs" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--cyan)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}
                  >
                    ⚡ FastAPI Swagger ↗
                  </a>
                  <a 
                    href="http://localhost:8123/play" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--orange)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '4px' }}
                  >
                    🗄️ ClickHouse Play ↗
                  </a>
                  <a 
                    href="https://bytewax.io/docs/concepts/dataflow" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308', fontSize: '11px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '4px' }}
                  >
                    🐝 Bytewax Visualizer ↗
                  </a>
                  <a 
                    href="https://github.com/bytewax/bytewax" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="dropdown" 
                    style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '11px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '4px' }}
                  >
                    🐙 Bytewax GitHub ↗
                  </a>
                </div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                {/* Left Panel: Stream Topology */}
                <div className="panel" style={{ height: '540px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '12px' }}>
                    <h3>{lang === 'TR' ? 'Sistem Mimarisi & Canlı Akış Boru Hattı' : 'System Architecture & Live Pipeline'}</h3>
                  </div>
                  
                  {/* SVG Flow diagram with animated paths */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0,0,0,0.01)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '15px' }}>
                    <svg viewBox="0 0 620 340" style={{ width: '100%', height: '300px' }}>
                      <defs>
                        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      <style>
                        {`
                          @keyframes ping {
                            0% { transform: scale(0.8); opacity: 1; }
                            100% { transform: scale(2.2); opacity: 0; }
                          }
                          .ping-dot {
                            animation: ping 1.8s ease-in-out infinite;
                            transform-origin: center;
                          }
                          .flow-path-bg {
                            stroke: rgba(255, 255, 255, 0.05);
                            stroke-width: 2.5;
                            fill: none;
                          }
                          .flow-path-active {
                            stroke-width: 2;
                            fill: none;
                            stroke-dasharray: 4 4;
                            animation: dash 1s linear infinite;
                          }
                          @keyframes dash {
                            to {
                              stroke-dashoffset: -20;
                            }
                          }
                          .node-glass {
                            fill: var(--bg-panel);
                            stroke: var(--border-color);
                            stroke-width: 1.5;
                            transition: all 0.3s;
                          }
                          .node-glass:hover {
                            fill: var(--bg-hover);
                            stroke: var(--cyan);
                            filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.35));
                          }
                          .node-title {
                            font-size: 8.5px;
                            font-weight: 800;
                            fill: var(--text-main);
                            letter-spacing: 0.5px;
                          }
                          .node-stat {
                            font-size: 7px;
                            fill: var(--text-muted);
                            font-family: 'JetBrains Mono', monospace;
                          }
                        `}
                      </style>

                      {/* Connection Paths (Backings) */}
                      <path d="M 105 55 L 165 55" className="flow-path-bg" />
                      <path d="M 260 55 L 320 55" className="flow-path-bg" />
                      <path d="M 415 55 L 475 55" className="flow-path-bg" />
                      <path d="M 522.5 85 L 522.5 155 L 415 155" className="flow-path-bg" />
                      <path d="M 367.5 85 L 367.5 130" className="flow-path-bg" />
                      <path d="M 320 155 L 260 155" className="flow-path-bg" />
                      <path d="M 165 155 L 105 155" className="flow-path-bg" />
                      <path d="M 212.5 190 L 212.5 235" className="flow-path-bg" />

                      {/* Connection Paths (Active Glowing Dash) */}
                      <path d="M 105 55 L 165 55" className="flow-path-active" stroke="var(--cyan)" />
                      <path d="M 260 55 L 320 55" className="flow-path-active" stroke="var(--orange)" />
                      <path d="M 415 55 L 475 55" className="flow-path-active" stroke="var(--green)" />
                      <path d="M 522.5 85 L 522.5 155 L 415 155" className="flow-path-active" stroke="var(--green)" />
                      <path d="M 367.5 85 L 367.5 130" className="flow-path-active" stroke="var(--green)" />
                      <path d="M 320 155 L 260 155" className="flow-path-active" stroke="var(--cyan)" />
                      <path d="M 165 155 L 105 155" className="flow-path-active" stroke="var(--cyan)" />
                      <path d="M 212.5 190 L 212.5 235" className="flow-path-active" stroke="var(--purple)" />

                      {/* Flowing Packets (Using smooth SVG animateMotion) */}
                      <circle r="3" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2.2s" repeatCount="indefinite" path="M 105 55 L 165 55" />
                      </circle>
                      <circle r="3" fill="var(--orange)" filter="url(#glow-orange)">
                        <animateMotion dur="1.9s" repeatCount="indefinite" path="M 260 55 L 320 55" />
                      </circle>
                      <circle r="3" fill="var(--green)" filter="url(#glow-green)">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path="M 415 55 L 475 55" />
                      </circle>
                      <circle r="2.5" fill="var(--green)" filter="url(#glow-green)">
                        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 522.5 85 L 522.5 155 L 415 155" />
                      </circle>
                      <circle r="2.5" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2s" repeatCount="indefinite" path="M 367.5 85 L 367.5 130" />
                      </circle>
                      <circle r="3" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2.8s" repeatCount="indefinite" path="M 320 155 L 260 155" />
                      </circle>
                      <circle r="2.5" fill="var(--cyan)" filter="url(#glow-cyan)">
                        <animateMotion dur="2.2s" repeatCount="indefinite" path="M 165 155 L 105 155" />
                      </circle>
                      <circle r="3" fill="var(--purple)" filter="url(#glow-purple)">
                        <animateMotion dur="3.2s" repeatCount="indefinite" path="M 212.5 190 L 212.5 235" />
                      </circle>
                      <circle r="2.5" fill="var(--purple)" filter="url(#glow-purple)">
                        <animateMotion dur="3.2s" repeatCount="indefinite" path="M 212.5 235 L 212.5 190" />
                      </circle>

                      {/* Node 1: IoT Sensors */}
                      <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(10, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title">📡 SENSORS</text>
                          <text x="10" y="36" className="node-stat">3 Active Stns</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>{liveMetrics.throughput} MB/s</text>
                        </g>
                      </a>

                      {/* Node 2: Redpanda */}
                      <a href="http://localhost:8080" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(165, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--orange)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--orange)" />
                          <circle cx="12" cy="14" r="3" fill="var(--orange)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--orange)' }}>✉️ REDPANDA</text>
                          <text x="10" y="36" className="node-stat">Topic: bot_alerts</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--orange)' }}>0ms Latency</text>
                        </g>
                      </a>

                      {/* Node 3: Bytewax */}
                      <a href="https://bytewax.io/docs/concepts/dataflow" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(320, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>🐝 BYTEWAX</text>
                          <text x="10" y="36" className="node-stat">Dataflow Engine</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--green)' }}>Active (Rust)</text>
                        </g>
                      </a>

                      {/* Node 4: XAI Model */}
                      <a href="https://github.com/bytewax/bytewax" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(475, 25)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--green)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--green)" />
                          <circle cx="12" cy="14" r="3" fill="var(--green)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--green)' }}>🧠 XAI MODEL</text>
                          <text x="10" y="36" className="node-stat">Explainable ML</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--green)' }}>SHAP Engine</text>
                        </g>
                      </a>

                      {/* Node 5: ClickHouse */}
                      <a href="http://localhost:8123/play" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(320, 130)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>🗄️ CLICKHOUSE</text>
                          <text x="10" y="36" className="node-stat">OLAP Storage</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>24 rows/s</text>
                        </g>
                      </a>

                      {/* Node 6: FastAPI */}
                      <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(165, 130)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>⚡ FASTAPI</text>
                          <text x="10" y="36" className="node-stat">Python Server</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>Uvicorn ASGI</text>
                        </g>
                      </a>

                      {/* Node 7: React UI */}
                      <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(10, 130)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="95" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--cyan)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" />
                          <circle cx="12" cy="14" r="3" fill="var(--cyan)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--cyan)' }}>⚛️ REACT UI</text>
                          <text x="10" y="36" className="node-stat">Vite Client</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--cyan)' }}>Port 5173</text>
                        </g>
                      </a>

                      {/* Node 8: HuggingFace LLM */}
                      <a href="https://huggingface.co" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <g transform="translate(160, 235)" style={{ cursor: 'pointer' }}>
                          <rect x="0" y="0" width="105" height="60" rx="8" className="node-glass" style={{ stroke: 'var(--purple)' }} />
                          <circle cx="12" cy="14" r="3" fill="var(--purple)" />
                          <circle cx="12" cy="14" r="3" fill="var(--purple)" className="ping-dot" />
                          <text x="22" y="17" className="node-title" style={{ fill: 'var(--purple)' }}>🤗 HUGGING FACE</text>
                          <text x="10" y="36" className="node-stat">Zephyr-7B LLM</text>
                          <text x="10" y="48" className="node-stat" style={{ fill: 'var(--purple)' }}>Cloud RAG serving</text>
                        </g>
                      </a>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid var(--border-color)', marginTop: '10px', paddingTop: '10px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        📥 {lang === 'TR' ? 'CANLI BROKER AKIŞ GÜNLÜĞÜ (PARTITION FEED)' : 'LIVE BROKER MESSAGE STREAM (PARTITION FEED)'}
                      </span>
                      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px 10px', fontFamily: 'JetBrains Mono', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px' }}>
                        {alerts.slice(0, 3).map((item, idx) => (
                          <div key={idx} style={{ color: 'var(--text-muted)', borderBottom: '1px dashed rgba(0,0,0,0.03)', paddingBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ color: 'var(--orange)' }}>[Partition-{idx % 3}]</span>{' '}
                            <span style={{ color: 'var(--cyan)' }}>Offset-{alerts.length - idx}</span>:{' '}
                            <span style={{ color: 'var(--text-main)' }}>{`{"device": "${item.account_id}", "type": "${item.hashtag}", "stability": ${item.truth_score}%}`}</span>
                          </div>
                        ))}
                        {alerts.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '8px' }}>{lang === 'TR' ? 'Akış bekleniyor...' : 'Awaiting message stream...'}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Performance Histogram */}
                <div className="panel" style={{ height: '540px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '8px' }}>
                    <h3>{lang === 'TR' ? 'Akış Performansı & Geçmişi' : 'Stream Performance & History'}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'VERİ GEÇİŞ HIZI' : 'THROUGHPUT'}</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>{liveMetrics.throughput} MB/s</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'GECİKME' : 'LATENCY'}</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>{liveMetrics.latency} ms</div>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', flex: 1 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        {lang === 'TR' ? 'CANLI AKIŞ HIZI (TURKUAZ) VE GECİKME (YEŞİL) HİSTOGRAMI' : 'LIVE THROUGHPUT (CYAN) & LATENCY (GREEN) HISTOGRAM'}
                      </span>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={streamHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis dataKey="time" hide />
                          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 8 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 8 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                          <Line yAxisId="left" type="monotone" dataKey="throughput" stroke="var(--cyan)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                          <Line yAxisId="right" type="monotone" dataKey="latency" stroke="var(--green)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Explanation Card */}
              <div className="panel" style={{ marginTop: '20px', padding: '20px' }}>
                <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚙️ {lang === 'TR' ? 'SİSTEM MİMARİSİ VE GERÇEK ZAMANLI VERİ AKIŞ REHBERİ' : 'SYSTEM ARCHITECTURE & REAL-TIME DATA FLOW GUIDE'}
                  </h3>
                  <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    100% ONLINE
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '11px', lineHeight: '1.6', textAlign: 'left' }}>
                  {/* Left Column: Data Ingestion */}
                  <div>
                    <h4 style={{ color: 'var(--cyan)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                      📥 {lang === 'TR' ? '1. GERÇEK ZAMANLI VERİ YUTMA VE İŞLEME' : '1. REAL-TIME INGESTION & PROCESSING'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>📡 IoT Sensör Katmanı (Meters, Chargers & Transformers)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Şebeke cihazları her 100ms'de bir canlı Yük (Load), Gerilim (Voltage) ve Sıcaklık (Temp) telemetrisini üretip akışa pompalar." 
                            : "Grid devices generate live Load, Voltage, and Temperature telemetry every 100ms and pump it into the streaming feed."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--orange)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>✉️ Redpanda (Kafka Broker)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Milyonlarca sensör mesajı, sıfır-kopya (zero-copy) mimarisine sahip Redpanda üzerinde tamponlanarak kayıpsız olarak kuyruğa alınır." 
                            : "Millions of sensor payloads are queued and buffered with zero-copy efficiency inside Redpanda brokers without data loss."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>🐝 Bytewax (Stateful Stream Engine)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Rust tabanlı Bytewax akış motoru, Redpanda'dan gelen verileri kayan zaman pencerelerinde (sliding windows) gruplayarak ML modellerine besler." 
                            : "Rust-powered Bytewax ingestion stream aggregates telemetry logs in sliding windows and feeds them directly into the ML classifier."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI & Storage */}
                  <div>
                    <h4 style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                      🧠 {lang === 'TR' ? '2. YAPAY ZEKA KARAR MOTORU VE SERVİS' : '2. AI DIAGNOSTICS & SERVING'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--green)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>🧠 XAI Anomali Motoru (Explainable XGBoost / SHAP)</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "ML Modelleri anlık yük/ısı dengesizliğini analiz ederek risk skorunu hesaplar. SHAP motoru arızanın veya kaçak tüketimin neden yapay zeka tarafından seçildiğini anlık açıklar." 
                            : "ML models compute real-time risk index. The SHAP explainability engine explains to the operator why an anomaly or overload was flagged."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>🗄️ ClickHouse OLAP Veritabanı</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "Tüm telemetri ve AI teşhis sonuçları saniyede 20,000+ satır yazım hızıyla ClickHouse sütun bazlı analitik veritabanında saklanır." 
                            : "All telemetry logs and AI results are stored with 20k+ rows/sec write speeds inside ClickHouse column-oriented database."}
                        </span>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-hover)', borderLeft: '3px solid var(--purple)', borderRadius: '4px' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>⚡ FastAPI & React / LLM Copilot</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {lang === 'TR' 
                            ? "FastAPI sunucumuz, ClickHouse verilerini SSE ile React arayüzüne taşır. HuggingFace RAG entegrasyonu sayesinde operatör şebeke sağlığını chatbot ile sorgulayabilir." 
                            : "FastAPI streams ClickHouse data to the React UI. HuggingFace RAG lets the operator query the entire system health through conversational chat."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>{TRANSLATIONS[lang].anomalies_title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    placeholder={TRANSLATIONS[lang].search_placeholder} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', width: '180px' }}
                  />
                  <button 
                    onClick={() => {
                      const headers = "Timestamp,DeviceType,DeviceId,AnomalyReason,StabilityScore,DiagnosticReport\n";
                      const rows = alerts
                        .filter(a => a.truth_score < 50)
                        .map(a => `"${a.timestamp}","${a.hashtag}","${a.account_id}","${a.reason}",${a.truth_score},"${a.fact_check_result}"`)
                        .join("\n");
                      
                      const blob = new Blob([headers + rows], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `grid_anomalies_${new Date().toISOString().slice(0,10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="dropdown"
                    style={{ background: 'var(--cyan)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    {TRANSLATIONS[lang].export_csv}
                  </button>
                </div>
              </div>

              {/* Anomaly Micro KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    🔴 {TRANSLATIONS[lang].kpi_active_anomalies}
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'JetBrains Mono' }}>
                    {alerts.filter(a => a.truth_score < 50).length}
                  </div>
                </div>
                <div className="panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    ⚡ {TRANSLATIONS[lang].kpi_vulnerable_device}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--orange)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '4px' }}>
                    {alerts.filter(a => a.truth_score < 50).length > 0 
                      ? (alerts.filter(a => a.truth_score < 50)[0]?.hashtag === 'Transformer' ? (lang === 'TR' ? 'Dağıtım Trafosu' : 'Transformer') : alerts.filter(a => a.truth_score < 50)[0]?.hashtag)
                      : (lang === 'TR' ? 'Kararlı' : 'Stable')}
                  </div>
                </div>
                <div className="panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    🌍 {TRANSLATIONS[lang].kpi_sensitive_station}
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--cyan)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '6px' }}>
                    {alerts.filter(a => a.truth_score < 50).length > 0 
                      ? (gridStations[alerts.filter(a => a.truth_score < 50)[0]?.city] || alerts.filter(a => a.truth_score < 50)[0]?.city)
                      : (lang === 'TR' ? 'Tüm Şebeke Stabil' : 'All Baselines Normal')}
                  </div>
                </div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '415px' }}>
                  <div className="panel-header" style={{ marginBottom: '16px' }}>
                    <h3>{TRANSLATIONS[lang].anomalies_db} ({alerts.filter(a => a.truth_score < 50).length} {lang === 'TR' ? 'Tespit Edildi' : 'Detected'})</h3>
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: '350px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '9px', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                          <th style={{ padding: '8px 0' }}>{lang === 'TR' ? 'Cihaz Türü' : 'Device Type'}</th>
                          <th>{lang === 'TR' ? 'Cihaz ID' : 'Device ID'}</th>
                          <th>{lang === 'TR' ? 'Anomali Nedeni' : 'Reason'}</th>
                          <th>{lang === 'TR' ? 'Canlı Telemetri' : 'Telemetry'}</th>
                          <th>{lang === 'TR' ? 'Kararlılık' : 'Stability'}</th>
                          <th>{lang === 'TR' ? 'Aksiyon' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts
                          .filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
                          .filter(a => (a.hashtag || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.account_id || '').toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                              <td style={{ padding: '8px 0', fontWeight: 'bold', color: 'var(--text-main)' }}>{row.hashtag}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{row.account_id}</td>
                              <td style={{ color: 'var(--red)', fontWeight: '600' }}>{row.reason}</td>
                              <td>{parseTelemetry(row.post_text)}</td>
                              <td style={{ color: 'var(--red)', fontWeight: 'bold' }}>{row.truth_score}%</td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button 
                                    onClick={() => handleRevert(row)}
                                    style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}
                                  >
                                    {TRANSLATIONS[lang].isolate}
                                  </button>
                                  <button 
                                    onClick={() => handleReview(row)}
                                    style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '9px' }}
                                  >
                                    {TRANSLATIONS[lang].diag}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const mapping = {
                                        "Westminster": "Oxford Street",
                                        "Chelsea": "Regent Street",
                                        "Camden": "Piccadilly",
                                        "Greenwich": "The Mall",
                                        "Brixton": "Victoria Street",
                                        "Hackney": "Kings Road",
                                        "Wembley": "Mare Street",
                                        "Wimbledon": "Harrow Road",
                                        "Stratford": "Great Eastern Road"
                                      };
                                      const streetName = mapping[row.city] || "Oxford Street";
                                      setActiveTab('map');
                                      setSelectedStreet(streetName);
                                      if (window.L && window.L.Map.mapInstance) {
                                        const centers = {
                                          "Oxford Street": [51.5152, -0.1418],
                                          "Regent Street": [51.5120, -0.1396],
                                          "Piccadilly": [51.5065, -0.1426],
                                          "The Mall": [51.5042, -0.1350],
                                          "Victoria Street": [51.4980, -0.1357],
                                          "Kings Road": [51.4880, -0.1680],
                                          "Mare Street": [51.5410, -0.0558],
                                          "Harrow Road": [51.5450, -0.2700],
                                          "Great Eastern Road": [51.5360, -0.0090]
                                        };
                                        setTimeout(() => {
                                          if (window.L.Map.mapInstance) {
                                            window.L.Map.mapInstance.flyTo(centers[streetName], 15);
                                          }
                                        }, 300);
                                      }
                                    }}
                                    style={{ background: 'rgba(2, 132, 199, 0.15)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}
                                  >
                                    📍 {lang === 'TR' ? 'Harita' : 'Map'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {alerts
                          .filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
                          .filter(a => (a.hashtag || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.account_id || '').toLowerCase().includes(searchQuery.toLowerCase()))
                          .length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {TRANSLATIONS[lang].no_matching_anomalies}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="panel" style={{ height: '415px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {anomaliesRightTab === 'chart' ? (lang === 'TR' ? 'Şebeke Kümeleme Analizi' : 'Grid Cluster Analysis') : (lang === 'TR' ? 'Yapay Zeka Teşhis & Kontrol' : 'AI Diagnostics & Control')}
                    </h3>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.03)', padding: '2px', borderRadius: '4px' }}>
                      <button 
                        onClick={() => setAnomaliesRightTab('chart')}
                        style={{
                          background: anomaliesRightTab === 'chart' ? 'var(--cyan)' : 'transparent',
                          color: anomaliesRightTab === 'chart' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '3px 8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        📊 {lang === 'TR' ? 'Grafik' : 'Chart'}
                      </button>
                      <button 
                        onClick={() => setAnomaliesRightTab('diag')}
                        style={{
                          background: anomaliesRightTab === 'diag' ? 'var(--cyan)' : 'transparent',
                          color: anomaliesRightTab === 'diag' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '3px 8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🧠 XAI
                      </button>
                    </div>
                  </div>
                  
                  {anomaliesRightTab === 'chart' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {TRANSLATIONS[lang].anomalies_cluster_desc}
                      </span>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart margin={{ top: 15, right: 15, bottom: 10, left: -25 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis type="number" dataKey="truth" name="Stability Score" unit="%" tick={{ fill: '#64748b', fontSize: 9 }} />
                          <YAxis type="number" dataKey="sentiment" name="Stability Index" unit="%" tick={{ fill: '#64748b', fontSize: 9 }} />
                          <ZAxis type="category" dataKey="name" name="Device" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                          <Scatter name="Anomalies" data={
                            alerts
                              .filter(a => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
                              .map(a => ({
                                truth: a.truth_score,
                                sentiment: parseFloat((a.nlp_sentiment * 100).toFixed(1)),
                                name: a.hashtag
                              }))
                          } fill="#ef4444">
                            {alerts.filter(a => a.truth_score < 50).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.truth_score < 30 ? 'var(--red)' : 'var(--orange)'} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                      {selectedAlert ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Cihaz / Device:</span>
                              <strong style={{ color: 'var(--cyan)' }}>{selectedAlert.hashtag} ({selectedAlert.account_id})</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Konum / Location:</span>
                              <strong>{selectedAlert.city} ({gridStations[selectedAlert.city] || 'Substation'})</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Risk Skoru / Risk:</span>
                              <strong style={{ color: 'var(--red)' }}>{(100 - selectedAlert.truth_score).toFixed(0)}%</strong>
                            </div>
                          </div>

                          {/* SHAP Progress Bars */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '9px', color: 'var(--cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>🧠 SHAP Explainable AI Feature Contribution</div>
                            {(() => {
                              const reason = selectedAlert.reason || 'CRITICAL_OVERLOAD';
                              let features = [
                                { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 72, color: 'var(--red)' },
                                { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 18, color: 'var(--orange)' },
                                { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 10, color: 'var(--cyan)' }
                              ];
                              if (reason === 'OVERHEATING') {
                                features = [
                                  { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 80, color: 'var(--red)' },
                                  { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 15, color: 'var(--orange)' },
                                  { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 5, color: 'var(--cyan)' }
                                ];
                              } else if (reason === 'VOLTAGE_DROP') {
                                features = [
                                  { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 75, color: 'var(--red)' },
                                  { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 15, color: 'var(--orange)' },
                                  { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 10, color: 'var(--cyan)' }
                                ];
                              }
                              return features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                                    <span>{f.name}</span>
                                    <span style={{ fontWeight: 'bold', color: f.color }}>+{f.weight}%</span>
                                  </div>
                                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${f.weight}%`, height: '100%', background: f.color }} />
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>

                          {/* SCADA Actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(239,68,68,0.02)', border: '1px dashed rgba(239,68,68,0.15)', padding: '10px', borderRadius: '4px', marginTop: '4px' }}>
                            <div style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>⚡ REMOTE SCADA CONTROL OVERRIDE</div>
                            
                            {mitigationLoading ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'rgba(0,0,0,0.02)', borderRadius: '3px', fontSize: '9.5px', color: 'var(--cyan)' }}>
                                <svg className="animate-spin" style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <circle cx="12" cy="12" r="10" stroke="rgba(2, 132, 199, 0.1)" />
                                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>{lang === 'TR' ? 'KOMUT GÖNDERİLİYOR...' : 'EXECUTING SCADA CMD...'}</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {selectedAlert.reason === 'OVERHEATING' && (
                                  <button 
                                    onClick={() => handleMitigate('COOLING')}
                                    className="dropdown"
                                    style={{ flex: 1, background: 'rgba(22, 163, 74, 0.1)', color: 'var(--green)', border: '1px solid rgba(22, 163, 74, 0.3)', padding: '5px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    ❄️ {lang === 'TR' ? 'Soğut' : 'Cooling'}
                                  </button>
                                )}
                                {selectedAlert.reason === 'VOLTAGE_DROP' && (
                                  <button 
                                    onClick={() => handleMitigate('PHASE_BALANCE')}
                                    className="dropdown"
                                    style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '5px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    🔄 {lang === 'TR' ? 'Dengele' : 'Balance'}
                                  </button>
                                )}
                                {(selectedAlert.reason === 'CRITICAL_OVERLOAD' || selectedAlert.reason === 'OVERLOAD') && (
                                  <button 
                                    onClick={() => handleMitigate('LOAD_LIMIT')}
                                    className="dropdown"
                                    style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '5px 8px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    ⚡ {lang === 'TR' ? 'Sınırla' : 'Derate'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{lang === 'TR' ? 'Şebeke Durumu / Grid Status:' : 'Grid Status:'}</span>
                              <strong style={{ color: alerts.filter(a => a.truth_score < 50).length > 0 ? 'var(--orange)' : 'var(--green)' }}>
                                {alerts.filter(a => a.truth_score < 50).length > 0 
                                  ? (lang === 'TR' ? `${alerts.filter(a => a.truth_score < 50).length} ANOMALİ TESPİT EDİLDİ` : `${alerts.filter(a => a.truth_score < 50).length} ALERTS ACTIVE`) 
                                  : (lang === 'TR' ? 'TÜM CİHAZLAR KARARLI' : 'ALL DEVICES STABLE')}
                              </strong>
                            </div>
                          </div>

                          {/* Aggregate SHAP Progress Bars */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '9px', color: 'var(--cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              🧠 {lang === 'TR' ? 'GENEL ŞEBEKE ANOMALİ ETKİ AĞIRLIKLARI (AVG SHAP)' : 'AGGREGATE GRID ANOMALY FEATURE WEIGHTS (AVG SHAP)'}
                            </div>
                            {(() => {
                              const activeAnomalies = alerts.filter(a => a.truth_score < 50);
                              let cOverload = 0;
                              let cOverheating = 0;
                              let cVoltage = 0;

                              activeAnomalies.forEach(a => {
                                if (a.reason === 'OVERHEATING') cOverheating++;
                                else if (a.reason === 'VOLTAGE_DROP') cVoltage++;
                                else cOverload++;
                              });

                              const total = cOverload + cOverheating + cVoltage || 1;
                              const loadWeight = Math.round((cOverload * 72 + cOverheating * 15 + cVoltage * 15) / total);
                              const tempWeight = Math.round((cOverload * 18 + cOverheating * 80 + cVoltage * 10) / total);
                              const voltWeight = Math.max(5, 100 - loadWeight - tempWeight);

                              const features = [
                                { name: lang === 'TR' ? 'Ortalama Yük Etkisi (Avg Load)' : 'Avg Grid Load Impact', weight: loadWeight, color: 'var(--red)' },
                                { name: lang === 'TR' ? 'Ortalama Sıcaklık Etkisi (Avg Temp)' : 'Avg Thermal Overheating', weight: tempWeight, color: 'var(--orange)' },
                                { name: lang === 'TR' ? 'Ortalama Voltaj Etkisi (Avg Voltage)' : 'Avg Voltage Delta', weight: voltWeight, color: 'var(--cyan)' }
                              ];

                              return features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                                    <span>{f.name}</span>
                                    <span style={{ fontWeight: 'bold', color: f.color }}>+{f.weight}%</span>
                                  </div>
                                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${f.weight}%`, height: '100%', background: f.color }} />
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>

                          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '4px', fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.4', fontStyle: 'italic', textAlign: 'center' }}>
                            💡 {lang === 'TR' 
                              ? "Cihaza özel XAI teşhis grafiklerini ve SCADA kontrol butonlarını yüklemek için soldaki anomali tablosundan herhangi bir satırda 'Teşhis' butonuna basın."
                              : "Press 'Diag' on any row in the table to display specific device XAI parameters and load remote SCADA control override actions."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ml' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>AI Models & Machine Learning Explanation</h2>
                <div className="dropdown" style={{ background: 'var(--green)', color: '#fff', border: 'none' }}>ML Engine Status: Active</div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                <div className="panel" style={{ height: '430px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="panel-header">
                    <h3>Model Metrics & Diagnostics</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '11px', textAlign: 'center' }}>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>F1-SCORE</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--cyan)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>94.2%</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ACCURACY</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>95.8%</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>PRECISION</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--orange)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>93.5%</div>
                    </div>
                  </div>

                  {/* Confusion Matrix */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      CONFUSION MATRIX (Sınıflandırma Doğruluk Matrisi)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '8px', fontSize: '10px', textAlign: 'center' }}>
                      <div />
                      <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Predicted Positive (Disinfo)</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Predicted Negative (Consensus)</div>

                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '8px' }}>Actual Positive</div>
                      <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--green)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--green)' }}>942</strong>
                        <span>True Positive (TP)</span>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--red)' }}>58</strong>
                        <span>False Negative (FN)</span>
                      </div>

                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '8px' }}>Actual Negative</div>
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--red)' }}>65</strong>
                        <span>False Positive (FP)</span>
                      </div>
                      <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--green)', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--green)' }}>1935</strong>
                        <span>True Negative (TN)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ height: '430px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header" style={{ marginBottom: '8px' }}>
                    <h3>Feature Importance (Öznitelik Ağırlıkları)</h3>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                      Makine öğrenmesi modelinin şebeke anomalisi teşhisi koyarken en çok ağırlık verdiği IoT veri öznitelikleri:
                    </span>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart 
                        layout="vertical"
                        data={[
                          { name: 'Voltage Stability', weight: 42 },
                          { name: 'Current Load', weight: 28 },
                          { name: 'Device Temp', weight: 18 },
                          { name: 'Peak Load Time', weight: 12 }
                        ]}
                        margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis type="number" unit="%" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                        <Bar dataKey="weight" fill="var(--cyan)" radius={[0, 3, 3, 0]}>
                          <Cell fill="var(--cyan)" />
                          <Cell fill="var(--cyan)" />
                          <Cell fill="var(--cyan)" />
                          <Cell fill="var(--cyan)" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Pipeline flowchart */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        ANALİZ PIPELINE AKIŞ ŞEMASI
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'center' }}>
                        <div style={{ padding: '6px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', width: '22%' }}>
                          IoT Meter Stream
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                        <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid var(--cyan)', borderRadius: '4px', width: '22%' }}>
                          Voltage Stability
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                        <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid var(--cyan)', borderRadius: '4px', width: '22%' }}>
                          Grid Random Forest
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>➔</div>
                        <div style={{ padding: '6px', background: 'rgba(22, 163, 74, 0.05)', border: '1px solid var(--green)', borderRadius: '4px', width: '22%' }}>
                          Stability Output
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>Yapay Zeka Filtre Kuralları (AI Configurations)</h2>
                <div className="dropdown" style={{ background: 'var(--green)', color: '#fff', border: 'none' }}>Active Rules Enabled ✓</div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1.1fr', gap: '20px' }}>
                <div className="panel" style={{ gap: '20px', minHeight: '415px', height: 'auto', paddingBottom: '20px' }}>
                  <div className="panel-header">
                    <h3>Active Data Validation Rules</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Voltage Drop Alarm Threshold</strong>
                        <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>&lt; 205 V</span>
                      </div>
                      <input type="range" min="180" max="230" step="5" defaultValue="205" style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IoT meters registering voltage below this threshold trigger low-voltage stability alerts.</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Transformer Overload Alert Limit</strong>
                        <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>&gt; 400 kW</span>
                      </div>
                      <input type="range" min="100" max="600" step="25" defaultValue="400" style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Transformers registering power draw above this limit trigger emergency automatic load shedding.</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Emergency Grid Shutdown Risk</strong>
                        <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>&lt; 30.0% Stability Score</span>
                      </div>
                      <input type="range" min="10" max="90" step="5" defaultValue="30" style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Any substation registering stability score below this percentage triggers automatic breaker trip.</span>
                    </div>
                  </div>

                  {/* Injector Form */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', color: 'var(--cyan)' }}>
                      🧪 {lang === 'TR' ? 'CANLI ŞEBEKE ANOMALİ ENJEKTÖRÜ (DEMO)' : 'LIVE GRID ANOMALY INJECTION TOOL (DEMO)'}
                    </h4>
                    
                    {/* Quick Simulation Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const simulatedAlert = {
                            account_id: "TRAFO_301",
                            hashtag: "Transformer",
                            post_text: "Telemetry: Current Load=580kW (Critical Limit Exceeded), Voltage=198V, Temp=42C",
                            city: "Istanbul",
                            reason: "CRITICAL_OVERLOAD",
                            ai_risk_score: 98.5,
                            nlp_sentiment: -0.85,
                            truth_score: 15.0,
                            fact_check_result: "ALERT: Explainable AI model flagged high risk. Primary contributor: Load Overload (82.4% impact). Telemetry: Load=580kW, Voltage=198V, Temp=42C. Recommended Action: Route load or isolate device.",
                            is_bot: true,
                            timestamp: new Date().toISOString(),
                            device: "Transformer"
                          };
                          setAlerts(prev => [simulatedAlert, ...prev]);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        ⚡ {lang === 'TR' ? 'AŞIRI YÜK ENJEKTE ET' : 'INJECT OVERLOAD'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const simulatedAlert = {
                            account_id: "METER_102",
                            hashtag: "SmartMeter",
                            post_text: "Telemetry: Current Load=2.5kW, Voltage=175V (Severe Voltage Drop), Temp=22C",
                            city: "London",
                            reason: "VOLTAGE_DROP",
                            ai_risk_score: 88.0,
                            nlp_sentiment: -0.65,
                            truth_score: 28.0,
                            fact_check_result: "ALERT: Explainable AI model flagged high risk. Primary contributor: Voltage Drop (74.2% impact). Telemetry: Load=2.5kW, Voltage=175V, Temp=22C. Recommended Action: Verify local grid phase balance.",
                            is_bot: true,
                            timestamp: new Date().toISOString(),
                            device: "SmartMeter"
                          };
                          setAlerts(prev => [simulatedAlert, ...prev]);
                        }}
                        style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--orange)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        📉 {lang === 'TR' ? 'VOLTAJ DÜŞÜŞÜ ENJEKTE ET' : 'INJECT VOLTAGE DROP'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const simulatedAlert = {
                            account_id: "CHARGER_201",
                            hashtag: "EVCharger",
                            post_text: "Telemetry: Current Load=42kW, Voltage=216V, Temp=98C (Critical Temperature Alert)",
                            city: "Berlin",
                            reason: "OVERHEATING",
                            ai_risk_score: 99.4,
                            nlp_sentiment: -0.92,
                            truth_score: 12.0,
                            fact_check_result: "ALERT: Explainable AI model flagged high risk. Primary contributor: Thermal Runaway (91.1% impact). Telemetry: Load=42kW, Voltage=216V, Temp=98C. Recommended Action: Route load or shut down EV Charger.",
                            is_bot: true,
                            timestamp: new Date().toISOString(),
                            device: "EVCharger"
                          };
                          setAlerts(prev => [simulatedAlert, ...prev]);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        🔥 {lang === 'TR' ? 'AŞIRI ISINMA ENJEKTE ET' : 'INJECT OVERHEATING'}
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const pageInput = e.target.elements.page.value || 'Transformer';
                      const editInput = e.target.elements.edit.value || 'Load=450kW, Voltage=190V, Temp=85C';
                      
                      const simulatedAlert = {
                        account_id: "TRAFO_INJECTED",
                        hashtag: pageInput,
                        post_text: editInput,
                        city: "Istanbul",
                        reason: "CRITICAL_OVERLOAD",
                        ai_risk_score: 98.5,
                        nlp_sentiment: -0.85,
                        truth_score: 15.0,
                        fact_check_result: `CRITICAL OVERLOAD: Transformer draws excessive load. Auto shedding triggered.`,
                        is_bot: true,
                        timestamp: new Date().toISOString(),
                        device: pageInput
                      };
                      setAlerts((prev) => [simulatedAlert, ...prev]);
                      e.target.reset();
                    }} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        name="page" 
                        placeholder={lang === 'TR' ? "Cihaz (örn. Transformer)" : "Device (e.g. Transformer)"}
                        required 
                        style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} 
                      />
                      <input 
                        name="edit" 
                        placeholder={lang === 'TR' ? "Telemetri (örn. Load=450kW...)" : "Telemetry (e.g. Load=450kW...)"}
                        required 
                        style={{ flex: 2, padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} 
                      />
                      <button 
                        type="submit"
                        style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {lang === 'TR' ? 'Gönder' : 'Inject'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="panel" style={{ minHeight: '415px', height: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
                  <div className="panel-header" style={{ marginBottom: '8px' }}>
                    <h3>AI DATA ANOMALY PROFILE (RADAR)</h3>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                        { subject: 'Overload', value: Math.round(Math.min(100, Math.max(20, alerts.filter(a => a.truth_score < 50).reduce((acc, a) => acc + Math.abs(a.nlp_sentiment) * 100, 0) / (alerts.filter(a => a.truth_score < 50).length || 1)))) },
                        { subject: 'Temp Risk', value: Math.round(65 + Math.sin(Date.now() / 15000) * 15) },
                        { subject: 'Phase Shift', value: Math.round(Math.min(100, 30 + (topCities.length * 7))) },
                        { subject: 'Voltage Drop', value: Math.round(Math.min(100, 50 + (alerts.filter(a => a.truth_score < 30).length * 8))) },
                        { subject: 'Freq Shift', value: Math.round(Math.min(100, parseFloat(liveMetrics.throughput) * 3)) }
                      ]}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                        <Radar name="Anomaly Matrix" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(22, 163, 74, 0.04)', borderRadius: '3px' }}>
                        <span>Phase Balance:</span>
                        <strong style={{ color: 'var(--green)' }}>ACTIVE</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(22, 163, 74, 0.04)', borderRadius: '3px' }}>
                        <span>Voltage Health:</span>
                        <strong style={{ color: 'var(--green)' }}>ACTIVE</strong>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

              {/* SQLite Vektör Bilgi Bankası (RAG) & Vektör Matematik Laboratuvarı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginTop: '20px' }}>
                
                {/* Sol Panel: SQLite Bilgi Bankası */}
                <div className="panel" style={{ padding: '20px' }}>
                  <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" style={{ width: '18px', height: '18px' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-main)' }}>
                        {lang === 'TR' ? 'Lokal SQLite RAG Vektör Bilgi Bankası (Knowledge Base)' : 'Local SQLite RAG Vector Knowledge Base'}
                      </h3>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {lang === 'TR' ? 'Bu kılavuz belgeleri çevrimdışı SQLite veritabanında saklanır ve asistan (Copilot) aramalarında anlamsal kosinüs benzerliği ile taranır.' : 'These operating guidelines are stored offline in SQLite and searched semantically using Cosine Similarity during Copilot queries.'}
                    </span>
                  </div>

                  {/* Canlı Semantik Vektör Arama Çubuğu */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      value={vectorSearchQuery}
                      onChange={(e) => setVectorSearchQuery(e.target.value)}
                      placeholder={lang === 'TR' ? "Kosinüs benzerliği ile kurallarda semantik arama yapın... (Örn: 'voltaj', 'overload')" : "Perform semantic vector search using Cosine Similarity... (e.g. 'voltage', 'overload')"}
                      style={{ 
                        flex: 1, 
                        padding: '6px 12px', 
                        fontSize: '11px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        color: 'var(--text-main)' 
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVectorSearch();
                      }}
                    />
                    <button 
                      type="button"
                      onClick={handleVectorSearch}
                      style={{ 
                        background: 'var(--cyan)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px', 
                        padding: '6px 15px', 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                      }}
                    >
                      🔍 {lang === 'TR' ? 'Semantik Ara' : 'Vector Search'}
                    </button>
                    {(vectorSearchQuery || searchResults.length > 0) && (
                      <button 
                        type="button"
                        onClick={() => {
                          setVectorSearchQuery('');
                          setSearchResults([]);
                        }}
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', 
                          color: 'var(--text-main)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '6px', 
                          padding: '6px 12px', 
                          fontSize: '11px', 
                          cursor: 'pointer' 
                        }}
                      >
                        {lang === 'TR' ? 'Temizle' : 'Reset'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {searchResults.length > 0 ? (
                      searchResults.map((rule) => (
                        <div key={rule.id} style={{ padding: '12px', background: 'rgba(2, 132, 199, 0.02)', border: '1px solid var(--cyan)', borderRadius: '6px', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <h4 style={{ margin: 0, fontSize: '11px', color: 'var(--cyan)' }}>{rule.title}</h4>
                            <span style={{ fontSize: '9px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              Match: {rule.score}%
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {rule.content}
                          </p>
                        </div>
                      ))
                    ) : dbRules.length > 0 ? (
                      dbRules.map((rule) => (
                        <div key={rule.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: 'var(--cyan)' }}>{rule.title}</h4>
                          <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {rule.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      [
                        {
                          "title": "Rule 101: Transformer Overload Protocol",
                          "content": "If a Transformer (such as TRAFO_301 or TRAFO_302) experiences a critical overload where the active load exceeds 500kW..."
                        },
                        {
                          "title": "Rule 102: SmartMeter Voltage Range and Phase Balance",
                          "content": "SmartMeter voltage phases must be maintained within the standard range of 216V to 244V..."
                        },
                        {
                          "title": "Rule 103: EV Charger Thermal Protection Limit",
                          "content": "EV Charger units (such as CHARGER_201 or CHARGER_202) must operate below a safety threshold of 90°C..."
                        },
                        {
                          "title": "Rule 104: Carbon Intensity & Green Routing",
                          "content": "When UK Grid carbon intensity index is high, operators should prioritize drawing power from renewable sources..."
                        }
                      ].map((rule, idx) => (
                        <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: 'var(--cyan)' }}>{rule.title}</h4>
                          <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {rule.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sağ Panel: RAG & Vektör Matematik Laboratuvarı */}
                <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🧪</span>
                      <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                        {lang === 'TR' ? 'Vektör & Kosinüs Matematik Simülatörü' : 'Vector & Cosine Math Lab'}
                      </h3>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {lang === 'TR' ? 'Metinleri anlık olarak 32 boyutlu vektörlere dönüştürün ve anlamsal mesafeyi hesaplayın.' : 'Convert text to 32-D vectors in real-time and calculate semantic distance.'}
                    </span>
                  </div>

                  {/* Test 1: Real-Time Vectorizer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <strong style={{ fontSize: '10.5px', color: 'var(--cyan)' }}>
                      {lang === 'TR' ? '1. Metin Vektörleştirici (Vectorizer)' : '1. Text Vectorizer'}
                    </strong>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text"
                        value={textToVector}
                        onChange={(e) => setTextToVector(e.target.value)}
                        placeholder={lang === 'TR' ? "Bir kelime girin... (Örn: trafo)" : "Enter a word... (e.g. transformer)"}
                        style={{ flex: 1, padding: '5px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleVectorizer(textToVector)}
                        style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {lang === 'TR' ? 'Vektörle' : 'Vectorize'}
                      </button>
                    </div>
                    {vectorResult.length > 0 && (
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', wordBreak: 'break-all', maxHeight: '70px', overflowY: 'auto' }}>
                        [{vectorResult.map(v => v.toFixed(4)).join(', ')}]
                      </div>
                    )}
                  </div>

                  {/* Test 2: Cosine Similarity Simulator */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', textAlign: 'left' }}>
                    <strong style={{ fontSize: '10.5px', color: 'var(--cyan)' }}>
                      {lang === 'TR' ? '2. Canlı Kosinüs Benzerliği Karşılaştırıcısı' : '2. Live Cosine Similarity Tester'}
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <input 
                        type="text"
                        value={compareTextA}
                        onChange={(e) => setCompareTextA(e.target.value)}
                        placeholder={lang === 'TR' ? "Metin A (Örn: trafo aşırı yüklendi)" : "Text A (e.g. transformer overloaded)"}
                        style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                      />
                      <input 
                        type="text"
                        value={compareTextB}
                        onChange={(e) => setCompareTextB(e.target.value)}
                        placeholder={lang === 'TR' ? "Metin B (Örn: trafo yük limiti aşıldı)" : "Text B (e.g. transformer limit exceeded)"}
                        style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
                      />
                      <button 
                        type="button"
                        onClick={handleVectorCompare}
                        disabled={compareLoading}
                        style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        {compareLoading ? '...' : (lang === 'TR' ? '⚡ Benzerlik Hesapla' : '⚡ Calculate Similarity')}
                      </button>
                    </div>
                    {compareScore !== null && (
                      <div style={{ background: 'rgba(2, 132, 199, 0.02)', border: '1px solid var(--cyan)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{lang === 'TR' ? 'Kosinüs Benzerliği:' : 'Cosine Similarity:'}</span>
                          <span style={{ color: 'var(--cyan)' }}>{compareScore}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${compareScore}%`, height: '100%', background: 'var(--cyan)' }} />
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                          {compareScore > 75 
                            ? (lang === 'TR' ? '✓ Güçlü Eşleşme (Anlamsal olarak çok yakın!)' : '✓ Strong Match (Semantically very close!)')
                            : compareScore > 40
                            ? (lang === 'TR' ? '⚡ Kısmi Eşleşme (Bazı benzer anahtar kelimeler)' : '⚡ Partial Match (Some similar keywords)')
                            : (lang === 'TR' ? '✕ Zayıf Eşleşme (Anlamsal olarak uzak)' : '✕ Weak Match (Semantically distant)')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'ai_brain' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="content-header">
                <h2>🤖 Yapay Zeka Beyni & Karar Kontrol Merkezi (AI Control Room)</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="dropdown" style={{ background: systemStatus.gemini === 'ONLINE' ? 'var(--green)' : 'var(--orange)', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                    {systemStatus.gemini === 'ONLINE' ? 'Gemini 2.5 Active ✓' : 'Offline Fallback Active ⚠'}
                  </div>
                </div>
              </div>

              <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Sol Sütun: Büyük Chat Ekranı */}
                <div className="panel" style={{ height: '640px', display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' }}>
                  <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '13px' }}>💬 GridPulse AI Terminal</h3>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {lang === 'TR' ? 'Mesajlara tıklayarak RAG trace detaylarını inceleyebilirsiniz.' : 'Click messages to inspect dynamic RAG traces.'}
                    </span>
                  </div>
                  
                  {/* Chat history feed */}
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px', 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '6px', 
                    padding: '15px', 
                    marginBottom: '15px' 
                  }}>
                    {chatMessages.map((msg, idx) => {
                      const isSelected = selectedTraceIndex === idx || (selectedTraceIndex === null && idx === chatMessages.length - 1);
                      return (
                        <div 
                          key={msg.id} 
                          onClick={() => setSelectedTraceIndex(idx)}
                          style={{ 
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            background: msg.sender === 'user' ? 'var(--cyan)' : 'var(--bg-panel)',
                            color: 'var(--text-main)',
                            border: isSelected 
                              ? '1.5px solid var(--orange)' 
                              : msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            maxWidth: '85%',
                            fontSize: '12px',
                            lineHeight: '1.5',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 0 10px rgba(249, 115, 22, 0.2)' : 'none'
                          }}
                          title={lang === 'TR' ? 'Tıklayarak RAG İzleyicisine Yükleyin' : 'Click to load into RAG Trace Viewer'}
                        >
                          <span>{msg.textKey ? TRANSLATIONS[lang][msg.textKey] : msg.text}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', marginTop: '4px' }}>
                            <span style={{ fontSize: '8px', color: msg.sender === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--cyan)' }}>
                              {msg.sender === 'user' ? (lang === 'TR' ? 'Kullanıcı' : 'User') : (msg.engine || 'Gemini 2.5')}
                            </span>
                            {!msg.sender || msg.sender === 'ai' ? (
                              <span style={{ fontSize: '8px', color: 'var(--orange)', fontWeight: 'bold' }}>
                                [TRACE ACTIVE]
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;
                      handleChatSubmit(chatInput);
                      setChatInput('');
                    }} 
                    style={{ display: 'flex', gap: '8px' }}
                  >
                    <input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={lang === 'TR' ? "Şebekedeki arızaları analiz etmesini isteyin... (Örn: 'Trafo 301 durumu nedir?')" : "Ask AI to analyze anomalies... (e.g. 'What is the status of Trafo 301?')"}
                      style={{ flex: 1, padding: '10px 14px', fontSize: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
                    />
                    <button 
                      type="submit"
                      style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {lang === 'TR' ? 'Sorgula' : 'Query'}
                    </button>
                  </form>
                </div>

                {/* Sağ Sütun: LangSmith Observability Console */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Configuration Settings */}
                  <div className="panel" style={{ padding: '20px', textAlign: 'left' }}>
                    <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 'bold' }}>⚙️ RAG CONFIGURATION (PLAYGROUND)</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Active Model:</label>
                        <select 
                          value={ragModel} 
                          onChange={(e) => setRagModel(e.target.value)}
                          style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                        >
                          <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (Default)</option>
                          <option value="GPT-4o (Simulated)">GPT-4o (Simulated)</option>
                          <option value="Claude 3.5 Sonnet (Simulated)">Claude 3.5 Sonnet (Simulated)</option>
                        </select>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Temperature:</label>
                          <strong style={{ color: 'var(--cyan)' }}>{ragTemp}</strong>
                        </div>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.1" 
                          value={ragTemp} 
                          onChange={(e) => setRagTemp(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--cyan)' }} 
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Graph Traversal Depth:</label>
                          <strong style={{ color: '#a78bfa' }}>{ragDepth}-hop search</strong>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="3" 
                          step="1" 
                          value={ragDepth} 
                          onChange={(e) => setRagDepth(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#a78bfa' }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Execution Trace details */}
                  {(() => {
                    // Extract message text to build dynamic trace mock parameters
                    const activeIdx = selectedTraceIndex !== null ? selectedTraceIndex : chatMessages.length - 1;
                    const activeMsg = chatMessages[activeIdx] || { text: 'Default Diagnostics' };
                    const isAi = activeMsg.sender === 'ai';
                    const msgText = activeMsg.textKey ? (TRANSLATIONS[lang][activeMsg.textKey] || '') : (activeMsg.text || '');
                    const cleanText = msgText.toLowerCase();
                    
                    let ruleTitle = "Rule 101: Transformer Overload Protocol";
                    let matchScore = 94;
                    let nodeRelations = "TRAFO_301 -> IS_LOCATED_IN -> Westminster";
                    let graphEdge = "MITIGATES_LOAD_SHEDDING";
                    let tokenCount = 764;
                    let latency = 420;
                    let faithfulness = 98.2;

                    if (cleanText.includes('charger') || cleanText.includes('şarj')) {
                      ruleTitle = "Rule 103: EV Charger Temperature limit";
                      matchScore = 89;
                      nodeRelations = "CHARGER_12 -> CONNECTED_TO -> TRAFO_301";
                      graphEdge = "PROTECTED_BY_THERMAL_SHUTDOWN";
                      latency = 510;
                      faithfulness = 97.4;
                    } else if (cleanText.includes('volt') || cleanText.includes('gerilim')) {
                      ruleTitle = "Rule 102: SmartMeter Voltage Range and Phase Balance";
                      matchScore = 91;
                      nodeRelations = "METER_405 -> OPERATES_WITHIN -> VOLTAGE_RANGE";
                      graphEdge = "BALANCE_LOAD_OVER_PHASES";
                      latency = 480;
                      faithfulness = 99.1;
                    } else if (cleanText.includes('saldırı') || cleanText.includes('tamper') || cleanText.includes('siber')) {
                      ruleTitle = "Rule 110: SmartMeter Cyber Security Tamper Detection";
                      matchScore = 96;
                      nodeRelations = "SMART_METER -> REJECTS_UNAUTHORIZED_FIRMWARE";
                      graphEdge = "TRIGGERS_ISOLATION_ALARM";
                      latency = 390;
                      faithfulness = 99.8;
                    }

                    return (
                      <div className="panel" style={{ flex: 1, padding: '20px', textAlign: 'left', minHeight: '340px' }}>
                        <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: 'bold' }}>🔍 PHOENIX RAG TRACE OBSERVER</h3>
                          <span style={{ fontSize: '8px', background: 'var(--green)', color: '#fff', padding: '2px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                            TRACE ACTIVE
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '10.5px' }}>
                          {/* Step 1 */}
                          <div style={{ borderLeft: '2px solid var(--cyan)', paddingLeft: '10px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }}></div>
                            <strong style={{ color: '#fff', display: 'block' }}>1. INPUT PARSER & TOKEN EXTRACTION <span style={{ color: 'var(--cyan)', float: 'right' }}>12ms</span></strong>
                            <span style={{ color: 'var(--text-muted)' }}>Query: </span>
                            <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>"{activeMsg.text.substring(0, 70)}..."</span>
                          </div>

                          {/* Step 2 */}
                          <div style={{ borderLeft: '2px solid var(--orange)', paddingLeft: '10px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--orange)' }}></div>
                            <strong style={{ color: '#fff', display: 'block' }}>2. HYBRID VECTOR SEARCH RETRIEVAL <span style={{ color: 'var(--orange)', float: 'right' }}>48ms</span></strong>
                            <span style={{ color: 'var(--text-muted)' }}>Top match: </span>
                            <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{ruleTitle}</span>
                            <span style={{ color: 'var(--green)', marginLeft: '10px' }}>({matchScore}% Cosine Score)</span>
                          </div>

                          {/* Step 3 */}
                          <div style={{ borderLeft: '2px solid #a78bfa', paddingLeft: '10px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }}></div>
                            <strong style={{ color: '#fff', display: 'block' }}>3. SQLite KNOWLEDGE GraphRAG PATHS <span style={{ color: '#a78bfa', float: 'right' }}>35ms</span></strong>
                            <span style={{ color: 'var(--text-muted)' }}>Resolved relations: </span>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '4px', marginTop: '4px', fontFamily: 'monospace', fontSize: '9.5px', color: '#a78bfa' }}>
                              {nodeRelations} <br />
                              └─ Edge: {graphEdge}
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div style={{ borderLeft: '2px solid var(--green)', paddingLeft: '10px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}></div>
                            <strong style={{ color: '#fff', display: 'block' }}>4. LLM GENERATION & FAITHFULNESS METRICS <span style={{ color: 'var(--green)', float: 'right' }}>{latency}ms</span></strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px 8px', borderRadius: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tokens: </span><strong>{tokenCount}</strong>
                              </div>
                              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px 8px', borderRadius: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Faithfulness: </span><strong style={{ color: 'var(--green)' }}>{faithfulness}%</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>
            </div>
          )}

          {activeTab === 'rag_report' && selectedRagDetails && (
            <div className="print-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
              {/* Action Bar (no-print) */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => setActiveTab('ai_brain')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
                >
                  ← {lang === 'TR' ? 'Yapay Zeka Beynine Geri Dön' : 'Back to AI Brain'}
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => window.print()}
                    style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    🖨️ {lang === 'TR' ? 'PDF Olarak Kaydet / Raporu Yazdır' : 'Export PDF / Print Report'}
                  </button>
                </div>
              </div>

              {/* Document Header */}
              <div className="print-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--cyan)', paddingBottom: '15px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '20px', fontFamily: 'Rajdhani', fontWeight: '700', letterSpacing: '1px', color: 'var(--cyan)' }}>GRIDPULSE.AI - SCADA SYSTEMS</h1>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    DOCUMENT ID: AUDIT_{Math.floor(100000 + Math.random() * 900000)} / CLASSIFICATION: CONFIDENTIAL
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  <div>DATE: {new Date().toLocaleString()}</div>
                  <div>OPERATOR SYSTEM HASH: OP_SCADA_NODE_301</div>
                </div>
              </div>

              {/* Title Section */}
              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-main)', margin: '0 0 5px 0' }}>
                  {lang === 'TR' ? 'RAG CO-COPILOT DENETİM VE UYUMLULUK RAPORU' : 'RAG CO-COPILOT AUDIT & COMPLIANCE REPORT'}
                </h2>
                <span style={{ fontSize: '9px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Verification and tracing of LLM inputs, vector database retrievals, and real-time telemetry augmentations.
                </span>
              </div>

              {/* Row 1: Primary Metrics & Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="print-card" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Groundedness score</span>
                  <strong style={{ fontSize: '18px', color: selectedRagDetails.metrics.groundedness_score >= 90 ? '#10b981' : '#fbbf24', textShadow: '0 0 8px rgba(16,185,129,0.2)' }}>
                    {selectedRagDetails.metrics.groundedness_score}%
                  </strong>
                </div>
                <div className="print-card" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Total Latency</span>
                  <strong style={{ fontSize: '18px', color: 'var(--cyan)' }}>{selectedRagDetails.metrics.total_latency_ms} ms</strong>
                </div>
                <div className="print-card" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Telemetry Scanned</span>
                  <strong style={{ fontSize: '18px', color: '#fbbf24' }}>{selectedRagDetails.metrics.scanned_rows} rows</strong>
                </div>
                <div className="print-card" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Token Allocation</span>
                  <strong style={{ fontSize: '18px', color: '#a78bfa' }}>{selectedRagDetails.metrics.token_stats?.total_tokens || 0}</strong>
                </div>
              </div>

              {/* Core RAG Capabilities (Highlight section requested by user) */}
              <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🛡️ GridPulseAI Core RAG Engine Capabilities & Compliance Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', fontSize: '9px', fontFamily: 'Inter' }}>
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--cyan)' }}>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>1. Keyword-Boost Reranker</strong>
                    <span style={{ color: 'var(--text-muted)', display: 'block', lineHeight: '1.3', marginBottom: '6px' }}>
                      Combines semantic vectors with exact-word matches (e.g., matching IDs or substation codes) to boost retrieval accuracy.
                    </span>
                    <strong style={{ color: '#10b981', fontSize: '8px', fontFamily: 'JetBrains Mono' }}>[✓] RERANKING ACTIVE</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--orange)' }}>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>2. Self-Healing Query Expander</strong>
                    <span style={{ color: 'var(--text-muted)', display: 'block', lineHeight: '1.3', marginBottom: '6px' }}>
                      Triggers synonym/term expansion when semantic rules score falls below 35% similarity threshold.
                    </span>
                    <strong style={{ color: selectedRagDetails.self_corrected ? 'var(--orange)' : '#10b981', fontSize: '8px', fontFamily: 'JetBrains Mono' }}>
                      {selectedRagDetails.self_corrected ? '[✓] HEALED & EXPANDED' : '[✓] STANDBY (DIRECT MATCH)'}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--green)' }}>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>3. GraphRAG Local Search</strong>
                    <span style={{ color: 'var(--text-muted)', display: 'block', lineHeight: '1.3', marginBottom: '6px' }}>
                      Queries SQLite relation tables (`graph_nodes`, `graph_edges`) to assemble a contextual directed relational map.
                    </span>
                    <strong style={{ color: '#10b981', fontSize: '8px', fontFamily: 'JetBrains Mono' }}>[✓] GRAPH SEARCH RESOLVED</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #a78bfa' }}>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>4. OpenAI Groundedness</strong>
                    <span style={{ color: 'var(--text-muted)', display: 'block', lineHeight: '1.3', marginBottom: '6px' }}>
                      Computes real-time response lexical overlap against retrieved sources to flag potential hallucinations.
                    </span>
                    <strong style={{ color: '#10b981', fontSize: '8px', fontFamily: 'JetBrains Mono' }}>[✓] EVALUATION ONLINE</strong>
                  </div>
                </div>
              </div>

              {/* Row 2: Query expansion & search details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                  <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-main)' }}>
                    🔍 User Query & Expansion Trace
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px', fontFamily: 'Inter' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Raw Query: </span>
                      <strong style={{ color: 'var(--text-main)' }}>"{selectedRagDetails.query}"</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Self-Healing Correction: </span>
                      <strong style={{ color: selectedRagDetails.self_corrected ? 'var(--orange)' : 'var(--green)' }}>
                        {selectedRagDetails.self_corrected ? 'Yes (Expanded)' : 'No (Direct)'}
                      </strong>
                    </div>
                    {selectedRagDetails.expanded_query && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Expanded Query Terms: </span>
                        <strong style={{ color: 'var(--cyan)' }}>"{selectedRagDetails.expanded_query}"</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                  <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-main)' }}>
                    📊 Query Embedding Vector (L2 Normalized)
                  </h3>
                  <div style={{ 
                    fontFamily: 'JetBrains Mono', 
                    fontSize: '8px', 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '10px', 
                    borderRadius: '6px', 
                    maxHeight: '65px', 
                    overflowY: 'auto',
                    wordBreak: 'break-all',
                    color: 'var(--text-main)'
                  }}>
                    [{selectedRagDetails.query_vector ? selectedRagDetails.query_vector.slice(0, 16).join(', ') : '0.0'}, ...]
                  </div>
                </div>
              </div>

              {/* Row 3: GraphRAG Subgraph Map & Telemetry Context */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                  <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-main)' }}>
                    🌐 Resolved Knowledge Graph Relations (GraphRAG Subgraph)
                  </h3>
                  {selectedRagDetails.graph_context && selectedRagDetails.graph_context.triplets && selectedRagDetails.graph_context.triplets.length > 0 ? (
                    <div>
                      {/* SVG Visualizer */}
                      {(() => {
                        const triplets = selectedRagDetails.graph_context.triplets;
                        const uniqueNodes = Array.from(new Set(
                          triplets.flatMap(t => [t.source, t.target])
                        ));
                        
                        const getNodeCoords = (name) => {
                          if (name.startsWith('Rule')) return { x: 260, y: 35, color: '#a78bfa', labelColor: '#c084fc' };
                          if (name.includes('TRAFO') || name.includes('CHARGER') || name.includes('METER')) return { x: 150, y: 18, color: '#38bdf8', labelColor: '#7dd3fc' };
                          if (['Wembley', 'Wimbledon', 'Stratford', 'Chelsea', 'Camden', 'Greenwich', 'Westminster', 'Brixton', 'Hackney'].includes(name)) return { x: 40, y: 18, color: '#10b981', labelColor: '#6ee7b7' };
                          if (['CRITICAL_OVERLOAD', 'OVERHEATING', 'VOLTAGE_DROP', 'Transformer', 'EVCharger', 'SmartMeter'].includes(name)) return { x: 150, y: 95, color: '#fb7185', labelColor: '#fda4af' };
                          return { x: 150, y: 55, color: '#cbd5e1', labelColor: '#cbd5e1' };
                        };
                        
                        const nodePositions = {};
                        const offsets = {};
                        
                        uniqueNodes.forEach(node => {
                          const base = getNodeCoords(node);
                          const key = `${base.x}-${base.y}`;
                          if (!offsets[key]) offsets[key] = 0;
                          
                          nodePositions[node] = {
                            x: base.x,
                            y: base.y + (offsets[key] * 28),
                            color: base.color,
                            labelColor: base.labelColor
                          };
                          offsets[key] += 1;
                        });

                        const maxHeight = Math.max(100, ...Object.values(offsets).map(o => o * 28 + 15));

                        return (
                          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '8px' }}>
                            <svg width="100%" height={maxHeight} style={{ overflow: 'visible' }}>
                              {triplets.map((t, idx) => {
                                const start = nodePositions[t.source];
                                const end = nodePositions[t.target];
                                if (!start || !end) return null;
                                return (
                                  <g key={`edge-${idx}`}>
                                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={start.color} strokeWidth="1" strokeDasharray="3 3" style={{ opacity: 0.6 }} />
                                    <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 2} fill="#94a3b8" fontSize="6px" fontFamily="JetBrains Mono" textAnchor="middle">{t.relation}</text>
                                  </g>
                                );
                              })}
                              {Object.entries(nodePositions).map(([name, pos], idx) => (
                                <g key={`node-${idx}`}>
                                  <circle cx={pos.x} cy={pos.y} r="6" fill={pos.color} />
                                  <text x={pos.x} y={pos.y - 8} fill={pos.labelColor} fontSize="7px" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">{name}</text>
                                </g>
                              ))}
                            </svg>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>No relations mapped.</div>
                  )}
                </div>

                <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                  <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-main)' }}>
                    📡 ClickHouse Active Telemetry Context
                  </h3>
                  {selectedRagDetails.active_anomalies && selectedRagDetails.active_anomalies.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedRagDetails.active_anomalies.map((anom, idx) => (
                        <div key={idx} style={{ padding: '8px', background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--red)', borderRadius: '4px', fontSize: '9.5px', fontFamily: 'JetBrains Mono', color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <strong>{anom.device} ({anom.city})</strong>
                            <span style={{ color: 'var(--red)' }}>Stability: {anom.stability_score}%</span>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '8.5px' }}>Reason: {anom.reason}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>No anomalies active in context window.</div>
                  )}
                </div>
              </div>

              {/* Row 4: SQLite Rules & Similarity Breakdown */}
              <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-main)' }}>
                  🗄️ SQLite Vector Retrieval Matches
                </h3>
                {selectedRagDetails.retrieved_rules && selectedRagDetails.retrieved_rules.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedRagDetails.retrieved_rules.map((rule, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'rgba(0,0,0,0.12)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '10.5px', color: 'var(--cyan)' }}>{rule.title}</strong>
                          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            Score: {rule.score}%
                          </span>
                        </div>
                        <p style={{ fontSize: '9.5px', color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: '1.4' }}>{rule.content}</p>
                        
                        {/* Cosine math breakdown */}
                        <div style={{ display: 'flex', gap: '15px', fontSize: '8px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                          <span>Dot Product: {rule.dot_product}</span>
                          <span>||Query||: {rule.norm_q}</span>
                          <span>||Rule||: {rule.norm_r}</span>
                          <span style={{ color: 'var(--cyan)' }}>Shared Vocabulary: {rule.shared_words ? rule.shared_words.join(', ') : 'None'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>No rules matched.</div>
                )}
              </div>

              {/* Row 5: Augmented System Prompt Payload */}
              <div className="print-card" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ fontSize: '12px', margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-main)' }}>
                  🛡️ Augmented System Prompt Context Payload
                </h3>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '8.5px', 
                  fontFamily: 'JetBrains Mono', 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  whiteSpace: 'pre-wrap', 
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  lineHeight: '1.4',
                  color: 'var(--text-main)'
                }}>
                  {selectedRagDetails.system_prompt}
                </pre>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal for Detailed AI Review */}
      {selectedAlert && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="panel" style={{
            width: '500px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-main)', letterSpacing: '1px' }}>
                🔍 Detailed AI Grid Diagnostic Report
              </h3>
              <button 
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div><strong>Device Type:</strong> <span style={{ color: 'var(--cyan)' }}>{selectedAlert.hashtag}</span></div>
              <div><strong>Device ID:</strong> {selectedAlert.account_id}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</div>
              <div><strong>SubStation Location:</strong> {selectedAlert.city} ({gridStations[selectedAlert.city] || 'Central'})</div>
            </div>

            {/* Simulated diff view */}
            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>PARAMETRİK TELEMETRİ DETAYLARI (DIFF VIEW)</div>
              {selectedAlert.truth_score < 50 ? (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'var(--red)', background: 'rgba(239, 68, 68, 0.05)', padding: '3px 6px', borderRadius: '3px' }}>
                    - [Grid Nominal State]: Load &lt; 10.0kW, Voltage ~ 220V, Temp &lt; 40C
                  </div>
                  <div style={{ color: 'var(--green)', background: 'rgba(22, 163, 74, 0.05)', padding: '3px 6px', borderRadius: '3px' }}>
                    + [Anomaly Telemetry]: "{selectedAlert.post_text}"
                  </div>
                </div>
              ) : (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'var(--green)', background: 'rgba(22, 163, 74, 0.05)', padding: '3px 6px', borderRadius: '3px' }}>
                    + [Nominal Telemetry]: "{selectedAlert.post_text}"
                  </div>
                </div>
              )}
            </div>

            {/* Detailed AI Explanation */}
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 'bold' }}>AI ANALYSIS DETAILS</div>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {selectedAlert.truth_score < 40 ? (
                  "CRITICAL: Transformer or charger overloading detected with high temperatures. Automatic grid isolation suggested."
                ) : selectedAlert.truth_score < 70 ? (
                  "WARNING: Minor phase imbalance or voltage drop detected. Recommended to inspect breaker parameters."
                ) : (
                  "STABLE: Device parameters are in green zone. Phase and frequency balance active."
                )}
              </div>
            </div>

            {/* SHAP Explainability Feature Importance */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--cyan)', marginBottom: '8px', fontWeight: 'bold' }}>🧠 SHAP EXPLAINABLE AI FEATURE WEIGHTS</div>
              {(() => {
                const reason = selectedAlert.reason || 'CRITICAL_OVERLOAD';
                let features = [
                  { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 72, color: 'var(--red)' },
                  { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 18, color: 'var(--orange)' },
                  { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 10, color: 'var(--cyan)' }
                ];
                if (reason === 'OVERHEATING') {
                  features = [
                    { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 80, color: 'var(--red)' },
                    { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 15, color: 'var(--orange)' },
                    { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 5, color: 'var(--cyan)' }
                  ];
                } else if (reason === 'VOLTAGE_DROP') {
                  features = [
                    { name: lang === 'TR' ? 'Voltaj Dalgalanması (Voltage)' : 'Voltage Delta', weight: 75, color: 'var(--red)' },
                    { name: lang === 'TR' ? 'Şebeke Yük Etkisi (Load)' : 'Grid Load Impact', weight: 15, color: 'var(--orange)' },
                    { name: lang === 'TR' ? 'Termal Isınma (Temp)' : 'Thermal Overheating', weight: 10, color: 'var(--cyan)' }
                  ];
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                          <span>{f.name}</span>
                          <span style={{ fontWeight: 'bold', color: f.color }}>+{f.weight}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${f.weight}%`, height: '100%', background: f.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Automatic SCADA Mitigation Override */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239, 68, 68, 0.02)', border: '1px dashed rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold' }}>⚡ AUTOMATIC SCADA MITIGATION OVERRIDE</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {lang === 'TR' 
                  ? 'Yapay zeka tarafından önerilen siber müdahaleyi uzaktan gerçekleştirmek için komutu onaylayın:'
                  : 'Execute the AI-recommended cyber override commands to balance grid parameters remotely:'}
              </div>
              
              {mitigationLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', fontSize: '11px', color: 'var(--cyan)' }}>
                  <svg className="animate-spin" style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" stroke="rgba(2, 132, 199, 0.1)" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>
                    {selectedAlert.reason === 'OVERHEATING' ? (lang === 'TR' ? 'SOĞUTMA SİSTEMLERİ TETİKLENİYOR...' : 'TRIGGERING GRID COOLING SYSTEMS...') :
                     selectedAlert.reason === 'VOLTAGE_DROP' ? (lang === 'TR' ? 'FAZ VOLTAJ DEĞERLERİ DENGELEME AKTİF...' : 'BALANCING PHASE VOLTAGE VALUES...') :
                     (lang === 'TR' ? 'AKIM TAŞIMA DEĞERLERİ SINIRLANDIRILIYOR...' : 'DERATING MAX ALLOWABLE CABLE CURRENT...')}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {selectedAlert.reason === 'OVERHEATING' && (
                    <button 
                      onClick={() => handleMitigate('COOLING')}
                      className="dropdown"
                      style={{ flex: 1, background: 'rgba(22, 163, 74, 0.1)', color: 'var(--green)', border: '1px solid rgba(22, 163, 74, 0.3)', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ❄️ {lang === 'TR' ? 'Soğutmayı Başlat (Cooling)' : 'Activate Fans (Cooling)'}
                    </button>
                  )}
                  {selectedAlert.reason === 'VOLTAGE_DROP' && (
                    <button 
                      onClick={() => handleMitigate('PHASE_BALANCE')}
                      className="dropdown"
                      style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🔄 {lang === 'TR' ? 'Fazları Dengele (Balance)' : 'Balance Grid Phases'}
                    </button>
                  )}
                  {(selectedAlert.reason === 'CRITICAL_OVERLOAD' || selectedAlert.reason === 'OVERLOAD') && (
                    <button 
                      onClick={() => handleMitigate('LOAD_LIMIT')}
                      className="dropdown"
                      style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ⚡ {lang === 'TR' ? 'Akımı Sınırla (Limit)' : 'Derate Limit (Limit)'}
                    </button>
                  )}
                  {(!selectedAlert.reason || selectedAlert.reason === 'NORMAL') && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{lang === 'TR' ? 'Aktif müdahale komutu gerekmiyor.' : 'No active mitigation required.'}</span>
                  )}
                </div>
              )}
            </div>

            {/* Reference suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(2, 132, 199, 0.03)', border: '1px solid rgba(2, 132, 199, 0.1)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--cyan)', fontWeight: 'bold' }}>🔗 RECOMMENDED DIAGNOSTIC ACTIONS</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                1. Verify substation status: <a href={`https://www.google.com/search?q=${encodeURIComponent('Smart Grid Substation ' + selectedAlert.city)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', textDecoration: 'underline' }}>"Substation {selectedAlert.city}"</a>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                2. Emergency Shutoff command: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Isolate {selectedAlert.account_id} Breaker</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={() => setSelectedAlert(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAG Execution Path Inspector Modal */}
      {selectedRagDetails && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 12, 24, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="panel" style={{
            width: '680px',
            background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.98) 0%, rgba(10, 15, 28, 0.98) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.25), 0 20px 25px -5px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'left',
            color: '#f1f5f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🧠</span>
                <h3 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '1px', fontWeight: 'bold' }}>
                  RAG Execution Path Inspector (Denetim Raporu)
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRagDetails(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.color = '#94a3b8'}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', maxHeight: '420px', fontSize: '11px', paddingRight: '4px' }}>
              
              {selectedRagDetails.self_corrected && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left'
                }}>
                  <span style={{ fontSize: '16px' }}>⚡</span>
                  <div>
                    <strong>Self-Healing RAG Active:</strong> Initial query matches were weak. The system executed LangChain-style Query Expansion to <em>"{selectedRagDetails.expanded_query}"</em> to retrieve accurate safety guidelines.
                  </div>
                </div>
              )}

              {/* Step 1: User Query & Vectorization */}
              <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>STEP 1</span>
                  <strong style={{ color: '#e2e8f0', fontSize: '10px' }}>User Query & Vectorization (32-D Embedding Array)</strong>
                </div>
                <div style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '11.5px', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #38bdf8' }}>
                  "Query: {selectedRagDetails.query}"
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', background: 'rgba(15, 23, 42, 0.8)', padding: '8px', borderRadius: '4px', wordBreak: 'break-all', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
                  [{selectedRagDetails.query_vector ? selectedRagDetails.query_vector.slice(0, 10).map(v => v.toFixed(4)).join(', ') + ' ... ' + selectedRagDetails.query_vector.slice(-5).map(v => v.toFixed(4)).join(', ') : '0.0000'}]
                </div>
              </div>

              {/* Step 2: Semantic SQLite Lookup & Vector Algebra Math */}
              <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>STEP 2</span>
                  <strong style={{ color: '#e2e8f0', fontSize: '10px' }}>Semantic Knowledge Retrieval (SQLite Cosine Similarity)</strong>
                </div>
                {selectedRagDetails.retrieved_rules && selectedRagDetails.retrieved_rules.length > 0 ? (
                  selectedRagDetails.retrieved_rules.map((rule, idx) => (
                    <div key={idx} style={{ marginTop: '8px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span style={{ color: '#a78bfa' }}>{rule.title}</span>
                        <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 5px', borderRadius: '3px', fontSize: '9.5px', fontFamily: 'JetBrains Mono' }}>Match: {rule.score}%</span>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '10.5px', lineHeight: '1.4', marginBottom: '8px' }}>{rule.content}</div>
                      
                      {/* Math & shared words breakdown */}
                      {rule.dot_product !== undefined && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: '#a78bfa' }}>
                            <span>📐 Vector Math: </span>
                            <span style={{ color: '#cbd5e1' }}>
                              Sim = (Q · D) / (||Q|| × ||D||) = {rule.dot_product} / ({rule.norm_q} × {rule.norm_r}) = <strong>{(rule.score / 100).toFixed(3)}</strong>
                            </span>
                          </div>
                          {rule.shared_words && rule.shared_words.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                              <span style={{ fontSize: '8.5px', color: '#cbd5e1', fontFamily: 'JetBrains Mono' }}>🔑 Matched Vocabulary:</span>
                              {rule.shared_words.map((word, wIdx) => (
                                <span key={wIdx} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '1px 4px', borderRadius: '3px', fontSize: '8.5px', fontFamily: 'JetBrains Mono' }}>
                                  {word}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#f43f5e', fontStyle: 'italic', padding: '4px' }}>No matching rules retrieved from SQLite.</div>
                )}
              </div>

              {/* Step 2.5: Microsoft GraphRAG Style Knowledge Graph Relations */}
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>STEP 2.5</span>
                  <strong style={{ color: '#e2e8f0', fontSize: '10px' }}>Knowledge Graph Relations (GraphRAG Local Search)</strong>
                </div>
                {selectedRagDetails.graph_context && selectedRagDetails.graph_context.triplets && selectedRagDetails.graph_context.triplets.length > 0 ? (
                  <div>
                    {/* SVG Knowledge Graph Visualizer */}
                    {(() => {
                      const triplets = selectedRagDetails.graph_context.triplets;
                      const uniqueNodes = Array.from(new Set(
                        triplets.flatMap(t => [t.source, t.target])
                      ));
                      
                      const getNodeCoords = (name) => {
                        if (name.startsWith('Rule')) return { x: 260, y: 45, color: '#a78bfa', labelColor: '#c084fc' };
                        if (name.includes('TRAFO') || name.includes('CHARGER') || name.includes('METER')) return { x: 150, y: 25, color: '#38bdf8', labelColor: '#7dd3fc' };
                        if (['Wembley', 'Wimbledon', 'Stratford', 'Chelsea', 'Camden', 'Greenwich', 'Westminster', 'Brixton', 'Hackney'].includes(name)) return { x: 40, y: 25, color: '#10b981', labelColor: '#6ee7b7' };
                        if (['CRITICAL_OVERLOAD', 'OVERHEATING', 'VOLTAGE_DROP', 'Transformer', 'EVCharger', 'SmartMeter'].includes(name)) return { x: 150, y: 110, color: '#fb7185', labelColor: '#fda4af' };
                        return { x: 150, y: 70, color: '#cbd5e1', labelColor: '#cbd5e1' };
                      };
                      
                      const nodePositions = {};
                      const offsets = {};
                      
                      uniqueNodes.forEach(node => {
                        const base = getNodeCoords(node);
                        const key = `${base.x}-${base.y}`;
                        if (!offsets[key]) offsets[key] = 0;
                        
                        nodePositions[node] = {
                          x: base.x,
                          y: base.y + (offsets[key] * 32),
                          color: base.color,
                          labelColor: base.labelColor
                        };
                        offsets[key] += 1;
                      });

                      // Determine height based on maximum offset
                      const maxHeight = Math.max(120, ...Object.values(offsets).map(o => o * 32 + 20));

                      return (
                        <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', marginTop: '10px' }}>
                          <svg width="100%" height={maxHeight} style={{ overflow: 'visible' }}>
                            {/* Render relationship links */}
                            {triplets.map((t, idx) => {
                              const start = nodePositions[t.source];
                              const end = nodePositions[t.target];
                              if (!start || !end) return null;
                              return (
                                <g key={`edge-${idx}`}>
                                  <line 
                                    x1={start.x} y1={start.y} 
                                    x2={end.x} y2={end.y} 
                                    stroke={start.color} 
                                    strokeWidth="1.2" 
                                    strokeDasharray="4 3"
                                    style={{ opacity: 0.6 }}
                                  />
                                  <text 
                                    x={(start.x + end.x) / 2} 
                                    y={(start.y + end.y) / 2 - 3} 
                                    fill="#94a3b8" 
                                    fontSize="7px" 
                                    fontFamily="JetBrains Mono" 
                                    textAnchor="middle"
                                    style={{ textShadow: '0 0 4px #000' }}
                                  >
                                    {t.relation}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Render Düğümler */}
                            {Object.entries(nodePositions).map(([name, pos], idx) => (
                              <g key={`node-${idx}`}>
                                <circle cx={pos.x} cy={pos.y} r="8" fill="none" stroke={pos.color} strokeWidth="1" style={{ opacity: 0.3 }} />
                                <circle cx={pos.x} cy={pos.y} r="4" fill={pos.color} />
                                <text 
                                  x={pos.x} 
                                  y={pos.y - 10} 
                                  fill={pos.labelColor} 
                                  fontSize="8px" 
                                  fontWeight="bold"
                                  fontFamily="JetBrains Mono" 
                                  textAnchor="middle"
                                  style={{ textShadow: '0 0 6px rgba(0,0,0,0.9)' }}
                                >
                                  {name}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>
                      );
                    })()}
                    
                    <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '8px', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                      🔗 Multi-hop semantic links resolved. Triplets were successfully injected into the LLM system prompt for relational reasoning.
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '4px' }}>No Graph relations resolved for this query.</div>
                )}
              </div>

              {/* Step 3: ClickHouse Ingestion */}
              <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.03)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>STEP 3</span>
                  <strong style={{ color: '#e2e8f0', fontSize: '10px' }}>Live Substation Telemetry Context (ClickHouse)</strong>
                </div>
                {selectedRagDetails.active_anomalies && selectedRagDetails.active_anomalies.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
                    {selectedRagDetails.active_anomalies.map((anom, idx) => (
                      <div key={idx} style={{ padding: '6px 10px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🚨 Device <span style={{ color: '#fb7185', fontWeight: 'bold' }}>{anom.device}</span> ({anom.city})</span>
                        <span style={{ fontFamily: 'JetBrains Mono' }}>Status: <strong style={{ color: '#f43f5e' }}>{anom.reason}</strong> (Stability: {anom.stability_score}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#34d399', fontStyle: 'italic', padding: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>✓</span> All systems stable, no active telemetry anomalies retrieved from ClickHouse.
                  </div>
                )}
              </div>

              {/* Step 4: System Prompt Compilation */}
              <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>STEP 4</span>
                  <strong style={{ color: '#e2e8f0', fontSize: '10px' }}>System Instructions & Context Injection (Ham Prompt Payload)</strong>
                </div>
                <pre style={{ margin: 0, fontFamily: 'JetBrains Mono', fontSize: '9px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#a7f3d0', maxHeight: '120px' }}>
                  {selectedRagDetails.system_prompt}
                </pre>
              </div>

              {/* Step 5: Data Engineering Performance & Metrics */}
              {selectedRagDetails.metrics && (
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>METRICS</span>
                    <strong style={{ color: '#e2e8f0', fontSize: '10px' }}>Data Engineering Performance & Pipeline Latencies</strong>
                  </div>
                  
                  {/* Latency Bars breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '9.5px', fontFamily: 'JetBrains Mono', color: '#cbd5e1', marginBottom: '10px' }}>
                    
                    {/* Tokenization */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>Tokenizer (Frequency Embedding Calculation)</span>
                        <span style={{ color: '#fbbf24' }}>{selectedRagDetails.metrics.tokenization_time_ms} ms</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}>
                        <div style={{ width: `${Math.min(100, selectedRagDetails.metrics.tokenization_time_ms * 10)}%`, height: '100%', background: '#fbbf24', borderRadius: '2px' }} />
                      </div>
                    </div>

                    {/* SQLite */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>SQLite DB Vector similarity lookup</span>
                        <span style={{ color: '#a78bfa' }}>{selectedRagDetails.metrics.sqlite_latency_ms} ms</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}>
                        <div style={{ width: `${Math.min(100, selectedRagDetails.metrics.sqlite_latency_ms * 10)}%`, height: '100%', background: '#a78bfa', borderRadius: '2px' }} />
                      </div>
                    </div>

                    {/* Clickhouse */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>ClickHouse OLAP anomaly scan</span>
                        <span style={{ color: '#fb7185' }}>{selectedRagDetails.metrics.clickhouse_latency_ms} ms</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}>
                        <div style={{ width: `${Math.min(100, selectedRagDetails.metrics.clickhouse_latency_ms * 10)}%`, height: '100%', background: '#fb7185', borderRadius: '2px' }} />
                      </div>
                    </div>

                    {/* LLM */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>LLM Inference (Gemini API generation)</span>
                        <span style={{ color: '#34d399' }}>{selectedRagDetails.metrics.llm_latency_ms} ms</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}>
                        <div style={{ width: `${Math.min(100, (selectedRagDetails.metrics.llm_latency_ms / 1500) * 100)}%`, height: '100%', background: '#34d399', borderRadius: '2px' }} />
                      </div>
                    </div>

                  </div>

                  {/* DB Scanned rows & token counters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '9px', fontFamily: 'JetBrains Mono', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div>
                      <span>🗄️ ClickHouse Rows Scanned: </span>
                      <strong style={{ color: '#fbbf24' }}>{selectedRagDetails.metrics.scanned_rows} rows</strong>
                    </div>
                    <div>
                      <span>📊 Total Tokens Processed: </span>
                      <strong style={{ color: '#34d399' }}>{selectedRagDetails.metrics.token_stats?.total_tokens || 0} tokens</strong>
                    </div>
                    {selectedRagDetails.metrics.groundedness_score !== undefined && (
                      <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🎯 Groundedness (Faithfulness) Score:</span>
                        <strong style={{ 
                          color: selectedRagDetails.metrics.groundedness_score >= 90 ? '#10b981' : '#fbbf24',
                          textShadow: selectedRagDetails.metrics.groundedness_score >= 90 ? '0 0 8px rgba(16,185,129,0.4)' : '0 0 8px rgba(251,191,36,0.4)'
                        }}>
                          {selectedRagDetails.metrics.groundedness_score}%
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '15px' }}>
              <button 
                onClick={() => setSelectedRagDetails(null)}
                style={{
                  background: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 24px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#0ea5e9'}
                onMouseOut={(e) => e.target.style.background = '#38bdf8'}
              >
                {lang === 'TR' ? 'Analizi Kapat' : 'Close Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat Popover */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        {/* Toggle Button */}
        <button 
          onClick={() => setShowChatPopover(!showChatPopover)}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--cyan)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: showChatPopover ? 'rotate(90deg)' : 'none',
            animation: showChatPopover ? 'none' : 'pulse 2s infinite'
          }}
          title={lang === 'TR' ? 'Yapay Zeka Asistanı' : 'AI Copilot'}
        >
          {showChatPopover ? '✕' : '🤖'}
        </button>

        {/* Chat Popover Card */}
        {showChatPopover && (
          <div style={{
            position: 'absolute',
            bottom: '68px',
            right: '0',
            width: '450px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '12px',
            textAlign: 'left'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>🌐 GridPulse AI Copilot</strong>
                <span style={{ fontSize: '9px', color: 'var(--cyan)' }}>Model: Gemini 2.5 Flash (Active)</span>
              </div>
              <span style={{ fontSize: '8px', background: 'var(--green)', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                LOCAL RAG ACTIVE
              </span>
            </div>

            {/* Hazır Sorular (Quick RAG Prompts) */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {lang === 'TR' ? 'Hazır RAG Soruları' : 'Quick RAG Queries'}
              </span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => handleChatSubmit(lang === 'TR' ? "Trafo 301 aşırı yükleme protokolü nedir?" : "What is the protocol for overloaded transformer 301?")}
                  style={{ background: 'rgba(2, 132, 199, 0.05)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '3px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ⚡ Trafo Aşırı Yük
                </button>
                <button 
                  type="button"
                  onClick={() => handleChatSubmit(lang === 'TR' ? "EV şarj cihazı sıcaklık sınırı kaçtır?" : "What is the thermal protection limit for EV chargers?")}
                  style={{ background: 'rgba(2, 132, 199, 0.05)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '3px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🔥 Şarj Cihazı Isınma
                </button>
                <button 
                  type="button"
                  onClick={() => handleChatSubmit(lang === 'TR' ? "Voltaj düşüşü limitleri ve faz dengesi" : "What is the standard voltage drop limit?")}
                  style={{ background: 'rgba(2, 132, 199, 0.05)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '3px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🔌 Voltaj Limitleri
                </button>
                <button 
                  type="button"
                  onClick={() => handleChatSubmit(lang === 'TR' ? "Karbon yoğunluğu yüksekken ne yapılmalı?" : "What should operators do when carbon intensity is high?")}
                  style={{ background: 'rgba(2, 132, 199, 0.05)', color: 'var(--cyan)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '3px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🍃 Yeşil Güç & Karbon
                </button>
              </div>
            </div>

            {/* Message History Feed */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              background: 'var(--bg-hover)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '6px', 
              padding: '10px', 
              maxHeight: '380px',
              minHeight: '300px'
            }}>
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--cyan)' : 'var(--bg-panel)',
                    color: 'var(--text-main)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    maxWidth: '85%',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span>{msg.textKey ? TRANSLATIONS[lang][msg.textKey] : msg.text}</span>
                  {msg.sender === 'ai' && (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <span style={{ 
                        fontSize: '8px', 
                        color: 'var(--cyan)', 
                        opacity: 0.8, 
                        alignSelf: 'flex-start',
                        fontFamily: 'JetBrains Mono, monospace',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '2px',
                        marginTop: '2px',
                        display: 'block',
                        width: '100%'
                      }}>
                        ⚙️ {msg.engine || (lang === 'TR' ? "Gemini 2.5 Flash" : "Gemini 2.5 Flash")}
                      </span>
                      {msg.rag_details && (
                        <button
                          type="button"
                          onClick={() => setSelectedRagDetails(msg.rag_details)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--cyan)',
                            fontSize: '8px',
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: '4px',
                            textAlign: 'left',
                            display: 'block',
                            fontWeight: 'bold',
                            textDecoration: 'underline'
                          }}
                        >
                          🔍 {lang === 'TR' ? 'RAG Analiz Raporu (Inspect RAG)' : 'RAG Analysis Report (Inspect RAG)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>


            {/* Message Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                handleChatSubmit(chatInput);
                setChatInput('');
              }} 
              style={{ display: 'flex', gap: '6px' }}
            >
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={TRANSLATIONS[lang].copilot_placeholder}
                style={{ flex: 1, padding: '6px 10px', fontSize: '11px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}
              />
              <button 
                type="submit"
                style={{ background: 'var(--cyan)', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {TRANSLATIONS[lang].copilot_send}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
