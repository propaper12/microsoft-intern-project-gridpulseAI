import { useEffect, useState, useMemo } from "react";

const ACTIVITY_PATTERNS = [
  { match: /VISION|Grafik okundu|okundu/i, icon: "👁", labelTR: "Grafik okuyor", labelEN: "Reading chart" },
  { match: /REPORT|Rapor|📧/i, icon: "📧", labelTR: "Rapor hazırlıyor", labelEN: "Preparing report" },
  { match: /KARAR|Karar|🤖/i, icon: "🤖", labelTR: "Karar veriyor", labelEN: "Deciding" },
  { match: /Anomali|⚠/i, icon: "⚠", labelTR: "Anomali tarıyor", labelEN: "Scanning anomaly" },
  { match: /Grafik|SPAWN|widget/i, icon: "📊", labelTR: "Grafik üretiyor", labelEN: "Spawning chart" },
  { match: /Telemetri|taranıyor/i, icon: "📡", labelTR: "Telemetri okuyor", labelEN: "Reading telemetry" },
  { match: /KESİNTİ|OUTAGE|offline/i, icon: "🔴", labelTR: "Veri kesintisi tespit", labelEN: "Data outage detected" },
  { match: /Soru|🔍/i, icon: "🔍", labelTR: "Kural sorguluyor", labelEN: "Querying rules" },
];

function detectActivity(logs, lang) {
  const last = [...logs].reverse().find((lg) => lg.includes("[AGENT]") || lg.includes("[VISION]") || lg.includes("[REPORT]") || lg.includes("⚠"));
  if (!last) return null;
  for (const p of ACTIVITY_PATTERNS) {
    if (p.match.test(last)) {
      return { icon: p.icon, label: lang === "TR" ? p.labelTR : p.labelEN, raw: last };
    }
  }
  return { icon: "◎", label: lang === "TR" ? "İşlem yapıyor" : "Processing", raw: last };
}

export default function AgentLivePulse({ lang, agentActive, agentLogs, activeThought }) {
  const [tick, setTick] = useState(0);
  const activity = useMemo(() => detectActivity(agentLogs, lang), [agentLogs, lang]);

  useEffect(() => {
    if (!agentActive) return;
    const t = setInterval(() => setTick((v) => v + 1), 800);
    return () => clearInterval(t);
  }, [agentActive]);

  const dots = ".".repeat((tick % 3) + 1);

  if (!agentActive) {
    return (
      <div className="agent-live-pulse agent-live-pulse--idle">
        <span className="agent-live-avatar">🤖</span>
        <div>
          <strong>{lang === "TR" ? "Agent Beklemede" : "Agent Standby"}</strong>
          <p>{lang === "TR" ? "Autopilot başlatıldığında canlı izleme başlar." : "Live monitoring starts when autopilot is enabled."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-live-pulse agent-live-pulse--active">
      <div className="agent-live-avatar-wrap">
        <span className="agent-live-avatar agent-live-avatar--pulse">🤖</span>
        <span className="agent-live-ring" />
      </div>
      <div className="agent-live-body">
        <div className="agent-live-status-row">
          <span className="live-dot" />
          <strong>{activity?.icon} {activity?.label || (lang === "TR" ? "Çalışıyor" : "Working")}{dots}</strong>
        </div>
        <p className="agent-live-thought">{activeThought}</p>
        {activity?.raw && (
          <code className="agent-live-raw">{activity.raw.replace(/^\[[^\]]+\]\s*/, "").slice(0, 72)}</code>
        )}
      </div>
    </div>
  );
}
