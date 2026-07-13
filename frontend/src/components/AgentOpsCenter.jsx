import { useEffect, useRef, useState, useMemo } from "react";
import AgentLivePulse from "./AgentLivePulse";
import AgentDecisionFeed from "./AgentDecisionFeed";
import { colorizeLog } from "./AgentPipeline";
import { SEVERITY_COLORS } from "../utils/chartTheme.jsx";
import { CHART_LABELS } from "../utils/constants";

const CHART_ICONS = {
  load: "⚡", voltage: "〰", temperature: "🌡", power_factor: "◉",
  frequency: "∿", thd: "≋", leakage: "↓", region_bar: "▦",
  compliance_pie: "◔", radar: "◎", scatter: "·",
};

function formatLogEntry(line, lang) {
  const time = line.match(/\[(\d{2}:\d{2}:\d{2})\]/)?.[1] || "";
  let icon = "·";
  let text = line;
  if (line.includes("[VISION]") || line.includes("Grafik okundu")) { icon = "👁"; text = line.split("] ").slice(-1)[0]; }
  else if (line.includes("[REPORT]") || line.includes("📧")) { icon = "📧"; text = line.split("] ").slice(-1)[0]; }
  else if (line.includes("KARAR") || line.includes("🤖")) { icon = "🤖"; text = line.split("] ").slice(-1)[0]; }
  else if (line.includes("⚠") || line.includes("Anomali")) { icon = "⚠"; text = line.split("] ").slice(-1)[0]; }
  else if (line.includes("[SYS]")) { icon = "◎"; text = line.replace("[SYS] ", ""); }
  else if (line.includes("KESİNTİ") || line.includes("OUTAGE")) { icon = "🔴"; text = line.split("] ").slice(-1)[0]; }
  else text = line.replace(/^\[[^\]]+\]\s*/, "");
  return { time, icon, text };
}

export default function AgentOpsCenter({
  lang,
  agentActive,
  agentStatus,
  agentLogs,
  spawnedCharts,
  agentInsights,
  agentConfig,
  reportHistory,
  alerts,
  activeThought,
  onUpdateConfig,
  onSendReport,
  onRefreshInsights,
}) {
  const [tab, setTab] = useState("live");
  const [emailDraft, setEmailDraft] = useState(agentConfig?.ops_email || "");
  const feedRef = useRef(null);

  useEffect(() => {
    if (agentConfig?.ops_email) setEmailDraft(agentConfig.ops_email);
  }, [agentConfig?.ops_email]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [agentLogs]);

  useEffect(() => {
    if (tab === "vision" && spawnedCharts.length > 0) onRefreshInsights?.();
  }, [tab, spawnedCharts.length, onRefreshInsights]);

  const lastAction = spawnedCharts[spawnedCharts.length - 1];
  const lastReport = reportHistory[0];

  const watchedDevices = useMemo(() => {
    const map = new Map();
    spawnedCharts.forEach((c) => {
      if (!c.device_id) return;
      const existing = map.get(c.device_id) || { id: c.device_id, charts: 0, severity: "LOW", rules: new Set() };
      existing.charts += 1;
      if (c.severity === "CRITICAL" || (c.severity === "HIGH" && existing.severity !== "CRITICAL")) {
        existing.severity = c.severity;
      }
      if (c.rule) existing.rules.add(c.rule);
      map.set(c.device_id, existing);
    });
    alerts.slice(0, 10).forEach((a) => {
      const id = a.account_id;
      if (!id) return;
      const existing = map.get(id) || { id, charts: 0, severity: "LOW", rules: new Set() };
      if ((a.truth_score || 100) < 50) existing.severity = "HIGH";
      existing.reason = a.reason;
      map.set(id, existing);
    });
    return [...map.values()].slice(0, 8);
  }, [spawnedCharts, alerts]);

  const formattedLogs = agentLogs.slice(-20).map((lg) => formatLogEntry(lg, lang));

  const tabs = [
    { id: "live", TR: "Canlı Operasyon", EN: "Live Ops" },
    { id: "vision", TR: "Grafik Zekası", EN: "Chart Vision" },
    { id: "reports", TR: "Raporlama", EN: "Reporting" },
  ];

  return (
    <section className="agent-ops-center panel">
      <div className="panel-header agent-ops-header">
        <div>
          <h3>{lang === "TR" ? "Agent Operasyon Merkezi" : "Agent Operations Center"}</h3>
          <p className="text-muted text-sm">
            {lang === "TR" ? "Canlı izleme · grafik yorumlama · otonom raporlama" : "Live monitoring · chart vision · autonomous reporting"}
          </p>
        </div>
        <div className="agent-ops-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`agent-ops-tab ${tab === t.id ? "agent-ops-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {lang === "TR" ? t.TR : t.EN}
            </button>
          ))}
        </div>
      </div>

      {tab === "live" && (
        <div className="agent-ops-live">
          <AgentLivePulse lang={lang} agentActive={agentActive} agentLogs={agentLogs} activeThought={activeThought} />

          {lastAction && (
            <div className="ops-hero-action">
              <span className="ops-hero-label">{lang === "TR" ? "Son Aksiyon" : "Last Action"}</span>
              <div className="ops-hero-content">
                <span className="ops-hero-icon">{CHART_ICONS[lastAction.chart_type] || "◈"}</span>
                <div>
                  <strong>{lastAction.widget_title || lastAction.chart_type}</strong>
                  <span className="text-muted">{lastAction.device_id} · {lastAction.rule}</span>
                  {lastAction.message && <p>{lastAction.message}</p>}
                </div>
                <span
                  className="ops-hero-severity"
                  style={{ color: SEVERITY_COLORS[lastAction.severity] || SEVERITY_COLORS.LOW }}
                >
                  {lastAction.severity}
                </span>
              </div>
            </div>
          )}

          <div className="ops-grid-2">
            <div className="ops-panel-block">
              <h4>{lang === "TR" ? "İzlenen Cihazlar" : "Watched Devices"}</h4>
              {watchedDevices.length === 0 ? (
                <p className="text-muted">{lang === "TR" ? "Henüz cihaz izlenmiyor." : "No devices watched yet."}</p>
              ) : (
                <div className="ops-device-list">
                  {watchedDevices.map((d) => (
                    <div key={d.id} className="ops-device-row">
                      <span className="ops-device-id">{d.id}</span>
                      <span className="text-muted">{d.charts} {lang === "TR" ? "grafik" : "charts"}</span>
                      <span style={{ color: SEVERITY_COLORS[d.severity] || SEVERITY_COLORS.LOW }}>{d.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ops-panel-block ops-panel-block--decisions">
              <AgentDecisionFeed lang={lang} spawnedCharts={spawnedCharts} agentLogs={agentLogs} />
            </div>
          </div>

          <div className="ops-panel-block ops-live-feed">
            <h4>{lang === "TR" ? "Canlı İşlem Akışı" : "Live Execution Feed"}</h4>
            <div className="ops-feed-timeline" ref={feedRef}>
              {formattedLogs.length === 0 ? (
                <p className="text-muted">{lang === "TR" ? "Agent beklemede." : "Agent standby."}</p>
              ) : (
                formattedLogs.map((entry, i) => (
                  <div key={i} className="ops-feed-item">
                    <span className="ops-feed-time">{entry.time}</span>
                    <span className="ops-feed-icon">{entry.icon}</span>
                    <span className={colorizeLog(agentLogs.slice(-20)[i])}>{entry.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "vision" && (
        <div className="agent-ops-vision">
          <p className="ops-vision-intro text-muted">
            {lang === "TR"
              ? "Agent, ürettiği SCADA grafiklerini okuyup yorumlar ve operatör dilinde raporlar."
              : "Agent reads spawned SCADA charts and reports interpretations in operator language."}
          </p>
          {agentInsights.length === 0 ? (
            <div className="ops-vision-empty">
              <span>👁</span>
              <p>{lang === "TR" ? "Autopilot başlatıldığında grafik analizleri burada görünür." : "Chart analyses appear here once autopilot starts."}</p>
            </div>
          ) : (
            <div className="ops-vision-list">
              {[...agentInsights].reverse().map((ins) => (
                <div key={ins.id} className="ops-vision-card">
                  <div className="ops-vision-card-top">
                    <span>{CHART_ICONS[ins.chart_type] || "◈"}</span>
                    <strong>{ins.widget_title || CHART_LABELS[ins.chart_type]?.[lang] || ins.chart_type}</strong>
                    <span className="ops-vision-device">{ins.device_id}</span>
                    {ins.rule && <span className="ops-vision-rule">{ins.rule}</span>}
                  </div>
                  <p>{ins.interpretation}</p>
                  <span className="text-muted ops-vision-time">
                    {ins.timestamp ? new Date(ins.timestamp).toLocaleTimeString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="agent-ops-reports">
          <div className="ops-report-config">
            <h4>📧 {lang === "TR" ? "Otonom E-posta Raporlama" : "Autonomous Email Reporting"}</h4>
            <p className="text-muted">
              {lang === "TR"
                ? "Agent kritik durumlarda, veri kesintisinde ve periyodik olarak bu adrese rapor gönderir."
                : "Agent sends reports on critical events, data outages, and periodic digests to this address."}
            </p>
            {!agentConfig?.smtp_configured && (
              <span className="badge-warning">Outbox — SMTP yapılandırılmadı</span>
            )}
            <label className="agent-email-label">
              {lang === "TR" ? "Operatör E-postası" : "Ops Email"}
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                onBlur={() => onUpdateConfig({ ops_email: emailDraft })}
                className="agent-email-input"
              />
            </label>
            <button type="button" className="agent-email-send-btn" onClick={() => onSendReport(lang)}>
              {lang === "TR" ? "Manuel Rapor Gönder" : "Send Manual Report"}
            </button>
          </div>

          <div className="ops-report-history">
            <h4>{lang === "TR" ? "Gönderilen Raporlar" : "Sent Reports"}</h4>
            {reportHistory.length === 0 ? (
              <p className="text-muted">{lang === "TR" ? "Henüz rapor yok." : "No reports yet."}</p>
            ) : (
              reportHistory.slice(0, 6).map((r) => (
                <div key={r.id} className="ops-report-row">
                  <span className={`ops-report-status ops-report-status--${r.status}`}>{r.status}</span>
                  <span className="ops-report-subject">{r.subject}</span>
                  <span className="text-muted">{r.to}</span>
                  <span className="text-muted">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ""}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
