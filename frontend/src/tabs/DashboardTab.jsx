import { useState, useMemo } from "react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import KpiCard from "../components/KpiCard";
import PillarsShowcase from "../components/PillarsShowcase";
import { TRANSLATIONS, PIE_COLORS, gridStations } from "../utils/constants";
import { axisTickStyle, gridStyle, ScadaTooltip } from "../utils/chartTheme.jsx";

function GridHealthRing({ score, lang }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="grid-health-ring">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border-color)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="48" y="44" textAnchor="middle" fill="var(--text-main)" fontSize="18" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          {Math.round(score)}
        </text>
        <text x="48" y="58" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
          {lang === "TR" ? "SAĞLIK" : "HEALTH"}
        </text>
      </svg>
      <div className="grid-health-meta">
        <strong>{lang === "TR" ? "Şebeke Sağlık Skoru" : "Grid Health Score"}</strong>
        <span className="text-muted">{lang === "TR" ? "Canlı telemetri + AI analizi" : "Live telemetry + AI analysis"}</span>
      </div>
    </div>
  );
}

export default function DashboardTab({ lang, alerts, avgTruth, timeline, breakdown }) {
  const t = TRANSLATIONS[lang];
  const [timeframe, setTimeframe] = useState("LIVE");

  const currentTotalTx = timeline.length > 0 ? timeline[timeline.length - 1].posts : 0;
  const totalBreakdown = breakdown.reduce((sum, item) => sum + item.value, 0) || 1;
  const fakePercent = ((breakdown.find((b) => b.name === "Fake/Vandalism")?.value || 0) / totalBreakdown * 100).toFixed(1);
  const criticalCount = alerts.filter((a) => a.truth_score < 50).length;
  const lastAlert = alerts[0];
  const isCritical = lastAlert && lastAlert.truth_score < 40;
  const aiConfidence = Math.min(99.9, Math.max(60, avgTruth * 1.05 + 8)).toFixed(1);

  const deviceCounts = useMemo(() => {
    const counts = { Transformer: 0, SmartMeter: 0, EVCharger: 0 };
    alerts.slice(0, 30).forEach((a) => {
      const type = a.hashtag || "SmartMeter";
      if (counts[type] !== undefined) counts[type]++;
      else counts.SmartMeter++;
    });
    return counts;
  }, [alerts]);

  const chartData = timeline.map((item, idx) => {
    const mult = timeframe === "1H" ? 1.4 : timeframe === "24H" ? 2.2 : 1;
    return {
      time: item.time,
      load: Math.round(item.posts * mult),
      overloads: Math.round(item.frauds * (timeframe === "24H" ? 1.8 : 1)),
      idx,
    };
  });

  const recentFeed = alerts.slice(0, 6);

  return (
    <>
      <PillarsShowcase lang={lang} compact activePillar="telemetry" />

      <div className="content-header dashboard-header">
        <div>
          <h2>{lang === "TR" ? "Akıllı Şebeke Operasyonları" : "Grid Operations Dashboard"}</h2>
          <p className="app-page-subtitle">
            {lang === "TR"
              ? "Şebeke sağlığı, yük profili ve cihaz dağılımı — canlı akış"
              : "Grid health, load profile, and device mix — live stream"}
          </p>
          <div className="dashboard-live-tag">
            <span className="live-dot" />
            LIVE · {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="timeframe-tabs">
          {["LIVE", "1H", "24H"].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`timeframe-btn ${timeframe === mode ? "timeframe-btn--active" : ""}`}
              onClick={() => setTimeframe(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className={`alarm-banner ${isCritical ? "alarm-banner--critical" : "alarm-banner--stable"}`}>
        <span className="alarm-badge">{isCritical ? "KRİTİK" : "STABİL"}</span>
        <span className="alarm-banner-text">
          {isCritical
            ? `${lastAlert.account_id} · ${lastAlert.reason} · ${lang === "TR" ? "Kararlılık" : "Stability"} ${lastAlert.truth_score}%`
            : lang === "TR"
              ? `${alerts.length} telemetri paketi işlendi · ${criticalCount} aktif anomali`
              : `${alerts.length} telemetry packets processed · ${criticalCount} active anomalies`}
        </span>
      </div>

      <div className="dashboard-top-row">
        <GridHealthRing score={avgTruth || 0} lang={lang} />
        <div className="device-chips">
          <span className="device-chips-label">{lang === "TR" ? "Cihaz Dağılımı (son 30)" : "Device Mix (last 30)"}</span>
          <div className="device-chips-row">
            {[
              { key: "Transformer", label: lang === "TR" ? "Trafo" : "Transformer", color: "cyan" },
              { key: "SmartMeter", label: lang === "TR" ? "Sayaç" : "Meter", color: "green" },
              { key: "EVCharger", label: lang === "TR" ? "Şarj" : "Charger", color: "orange" },
            ].map(({ key, label, color }) => (
              <div key={key} className={`device-chip device-chip--${color}`}>
                <span className="device-chip-count">{deviceCounts[key]}</span>
                <span className="device-chip-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon="⚡" accent="cyan" title={`${t.kpi_telemetry}`} value={currentTotalTx.toLocaleString()} unit="/ dk" trend="LIVE" trendClass="text-cyan" barWidth="75%" barClass="bg-cyan" />
        <KpiCard icon="⚠" accent="red" title={t.kpi_anomaly_rate} value={`${fakePercent}%`} unit={`${criticalCount} alarm`} trend={criticalCount > 0 ? "!" : "OK"} trendClass={criticalCount > 0 ? "text-red" : "text-green"} barWidth={`${Math.min(parseFloat(fakePercent) * 5, 100)}%`} barClass="bg-red" />
        <KpiCard icon="◉" accent="green" title={t.kpi_stability} value={`${avgTruth > 0 ? avgTruth : "0.0"}%`} trend={avgTruth >= 75 ? (lang === "TR" ? "İyi" : "Good") : (lang === "TR" ? "Dikkat" : "Watch")} trendClass={avgTruth >= 75 ? "text-green" : "text-orange"} barWidth={`${avgTruth}%`} barClass="bg-green" />
        <KpiCard icon="◈" accent="purple" title={t.kpi_confidence} value={`${aiConfidence}%`} unit="RAG" trend="AI" trendClass="text-cyan" barWidth={`${aiConfidence}%`} barClass="bg-cyan" />
      </div>

      <div className="main-grid dashboard-charts">
        <div className="panel panel--chart">
          <div className="panel-header">
            <h3>{t.chart_load_title}</h3>
            <span className="text-muted text-sm">{timeframe}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b9eff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b9eff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="overloadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<ScadaTooltip />} />
              <Area type="monotone" dataKey="load" name={lang === "TR" ? "Yük (kW)" : "Load (kW)"} stroke="#3b9eff" fill="url(#loadGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="overloads" name={lang === "TR" ? "Aşırı Yük" : "Overloads"} stroke="#ef4444" fill="url(#overloadGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel panel--chart">
          <div className="panel-header">
            <h3>{t.stability_breakdown}</h3>
            <span className="text-muted text-sm">{totalBreakdown} {lang === "TR" ? "kayıt" : "records"}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={5} stroke="none">
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ScadaTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend chart-legend--grid">
            {breakdown.map((item, i) => (
              <span key={item.name} className="legend-item">
                <span className="dot" style={{ background: PIE_COLORS[i] }} />
                <span>{item.name.replace("Fake/Vandalism", lang === "TR" ? "Kritik" : "Critical").replace("Verified", lang === "TR" ? "Stabil" : "Stable")}</span>
                <strong>{((item.value / totalBreakdown) * 100).toFixed(0)}%</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="panel live-feed-panel">
        <div className="panel-header">
          <h3>{lang === "TR" ? "Canlı Telemetri Akışı" : "Live Telemetry Feed"}</h3>
          <span className="badge-stable">{recentFeed.length} {lang === "TR" ? "son olay" : "recent"}</span>
        </div>
        <div className="live-feed-list">
          {recentFeed.length === 0 ? (
            <p className="text-muted">{lang === "TR" ? "Telemetri bekleniyor..." : "Awaiting telemetry..."}</p>
          ) : (
            recentFeed.map((a, i) => (
              <div key={i} className={`live-feed-item ${a.truth_score < 50 ? "live-feed-item--alert" : ""}`}>
                <span className="live-feed-time">{new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                <span className="live-feed-device">{a.account_id}</span>
                <span className="live-feed-type">{a.hashtag}</span>
                <span className={`live-feed-reason ${a.truth_score < 50 ? "text-red" : "text-green"}`}>{a.reason}</span>
                <span className="live-feed-location text-muted">{gridStations[a.city] || a.city}</span>
                <span className={`live-feed-score ${a.truth_score < 50 ? "text-red" : "text-green"}`}>{a.truth_score}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
