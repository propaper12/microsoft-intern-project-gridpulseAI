import { useMemo } from "react";
import { SEVERITY_COLORS } from "../utils/chartTheme.jsx";

const CHART_ICONS = {
  load: "⚡",
  voltage: "〰",
  temperature: "🌡",
  power_factor: "◉",
  frequency: "∿",
  thd: "≋",
  leakage: "↓",
  region_bar: "▦",
  compliance_pie: "◔",
  radar: "◎",
  scatter: "·",
};

function parseLogDecisions(logs) {
  return logs
    .filter((lg) => lg.includes("Rule") || lg.includes("ANOMALY") || lg.includes("SPAWN"))
    .slice(-5)
    .reverse()
    .map((lg, i) => {
      const ruleMatch = lg.match(/Rule \d+/);
      const severity = lg.includes("CRITICAL") ? "CRITICAL" : lg.includes("HIGH") ? "HIGH" : lg.includes("MEDIUM") ? "MEDIUM" : "LOW";
      return {
        id: `log-${i}`,
        rule: ruleMatch?.[0] || null,
        severity,
        message: lg.replace(/^\[[^\]]+\]\s*/, "").slice(0, 80),
        source: "log",
      };
    });
}

export default function AgentDecisionFeed({ lang, spawnedCharts, agentLogs }) {
  const decisions = useMemo(() => {
    const fromCharts = [...spawnedCharts]
      .slice(-6)
      .reverse()
      .map((a, i) => ({
        id: `chart-${i}-${a.chart_type}`,
        rule: a.rule,
        severity: a.severity || "LOW",
        device: a.device_id,
        chartType: a.chart_type,
        message: a.message || a.widget_title,
        source: "action",
      }));

    const fromLogs = parseLogDecisions(agentLogs);
    const merged = [...fromCharts];
    fromLogs.forEach((d) => {
      if (!merged.some((m) => m.rule && m.rule === d.rule)) merged.push(d);
    });
    return merged.slice(0, 5);
  }, [spawnedCharts, agentLogs]);

  if (!decisions.length) {
    return (
      <div className="agent-decision-feed agent-decision-feed--empty">
        <span className="agent-decision-feed-title">
          {lang === "TR" ? "Karar Geçmişi" : "Decision History"}
        </span>
        <p className="text-muted">
          {lang === "TR" ? "Autopilot başlatıldığında kararlar burada görünür." : "Decisions appear here once autopilot starts."}
        </p>
      </div>
    );
  }

  return (
    <div className="agent-decision-feed">
      <span className="agent-decision-feed-title">
        {lang === "TR" ? "Son Kararlar" : "Recent Decisions"}
      </span>
      <div className="agent-decision-list">
        {decisions.map((d) => {
          const color = SEVERITY_COLORS[d.severity] || SEVERITY_COLORS.LOW;
          return (
            <div key={d.id} className="agent-decision-card" style={{ borderLeftColor: color }}>
              <div className="agent-decision-card-top">
                {d.chartType && <span className="agent-decision-icon">{CHART_ICONS[d.chartType] || "◈"}</span>}
                {d.rule && <span className="agent-decision-rule">{d.rule}</span>}
                <span className="agent-decision-severity" style={{ color }}>{d.severity}</span>
              </div>
              {d.device && <span className="agent-decision-device">{d.device}</span>}
              <p className="agent-decision-msg">{d.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
