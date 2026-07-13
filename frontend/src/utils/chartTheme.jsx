export const CHART_PALETTE = {
  primary: "#3b9eff",
  secondary: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#a78bfa",
  muted: "#64748b",
};

export const SEVERITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

export const CHART_GRADIENTS = {
  cyan: { stroke: "#3b9eff", fill: "rgba(59,158,255,0.18)", fillEnd: "rgba(59,158,255,0)" },
  green: { stroke: "#22c55e", fill: "rgba(34,197,94,0.18)", fillEnd: "rgba(34,197,94,0)" },
  orange: { stroke: "#f59e0b", fill: "rgba(245,158,11,0.18)", fillEnd: "rgba(245,158,11,0)" },
  red: { stroke: "#ef4444", fill: "rgba(239,68,68,0.18)", fillEnd: "rgba(239,68,68,0)" },
  purple: { stroke: "#a78bfa", fill: "rgba(167,139,250,0.18)", fillEnd: "rgba(167,139,250,0)" },
};

export function chartTypeGradient(chartType) {
  const map = {
    load: "orange",
    voltage: "cyan",
    temperature: "red",
    power_factor: "green",
    timeline: "cyan",
    frequency: "cyan",
    thd: "purple",
    leakage: "orange",
    region_bar: "cyan",
    compliance_pie: "green",
    radar: "cyan",
    scatter: "orange",
  };
  return CHART_GRADIENTS[map[chartType] || "cyan"] ?? CHART_GRADIENTS.cyan;
}

export const axisTickStyle = { fill: "var(--text-muted)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" };

export const gridStyle = { strokeDasharray: "3 6", vertical: false, stroke: "rgba(148,163,184,0.12)" };

export function ScadaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="scada-chart-tooltip">
      <div className="scada-chart-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="scada-chart-tooltip-row">
          <span className="scada-chart-tooltip-dot" style={{ background: p.color || p.stroke }} />
          <span>{p.name || p.dataKey}</span>
          <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export const tooltipContentStyle = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border-color)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
};
