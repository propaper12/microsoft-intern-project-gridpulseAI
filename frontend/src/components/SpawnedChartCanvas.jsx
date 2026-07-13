import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { CHART_LABELS } from "../utils/constants";
import {
  CHART_PALETTE, SEVERITY_COLORS, chartTypeGradient,
  axisTickStyle, gridStyle, ScadaTooltip,
} from "../utils/chartTheme.jsx";

const CHART_ICONS = {
  load: "⚡", voltage: "〰", temperature: "🌡", power_factor: "◉",
  frequency: "∿", thd: "≋", leakage: "↓", region_bar: "▦",
  compliance_pie: "◔", radar: "◎", scatter: "·",
};

const VIZ_H = 118;

function seedOffset(seed = 0) {
  return ((seed % 17) - 8) * 4;
}

function buildSample(chartType, seed = 0) {
  const off = seedOffset(seed);
  return {
    line: [
      { t: "00", v: 320 + off }, { t: "04", v: 280 + off }, { t: "08", v: 410 + off },
      { t: "12", v: 520 + off }, { t: "16", v: 480 + off }, { t: "20", v: 390 + off },
    ],
    bar: [
      { name: "W", v: 34 + (seed % 5) }, { name: "E", v: 28 + (seed % 4) },
      { name: "N", v: 22 + (seed % 3) }, { name: "S", v: 18 + (seed % 3) },
    ],
    pie: [
      { name: "S", value: 72 - (seed % 6) }, { name: "W", value: 18 + (seed % 3) },
      { name: "C", value: 10 + (seed % 2) },
    ],
    radar: [
      { m: "L", v: 82 + (seed % 5) }, { m: "V", v: 91 - (seed % 4) },
      { m: "T", v: 76 + (seed % 6) }, { m: "F", v: 88 }, { m: "P", v: 85 + (seed % 3) },
    ],
    scatter: Array.from({ length: 12 }, (_, i) => ({
      x: 20 + i * 6 + (seed % 3),
      y: 80 - i * 4 + (seed % 5),
    })),
  };
}

function MiniChart({ chartType, gradId, refreshSeed = 0 }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const grad = chartTypeGradient(chartType);
  const sample = useMemo(() => buildSample(chartType, refreshSeed), [chartType, refreshSeed]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (width < 20) {
    return <div ref={wrapRef} className="scada-chart-slot__viz" />;
  }

  const commonMargin = { top: 4, right: 4, left: 0, bottom: 0 };

  let chart = null;
  switch (chartType) {
    case "load":
    case "voltage":
    case "temperature":
    case "power_factor":
    case "timeline":
    case "frequency":
    case "thd":
      chart = (
        <AreaChart width={width} height={VIZ_H} data={sample.line} margin={commonMargin}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={grad.stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={grad.stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="t" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<ScadaTooltip />} />
          <Area type="monotone" dataKey="v" stroke={grad.stroke} fill={`url(#${gradId})`} strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      );
      break;
    case "region_bar":
    case "leakage":
      chart = (
        <BarChart width={width} height={VIZ_H} data={sample.bar} margin={commonMargin}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<ScadaTooltip />} />
          <Bar dataKey="v" fill={grad.stroke} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      );
      break;
    case "compliance_pie":
      chart = (
        <PieChart width={width} height={VIZ_H}>
          <Pie data={sample.pie} dataKey="value" innerRadius={20} outerRadius={38} paddingAngle={3} stroke="none" cx="50%" cy="50%" isAnimationActive={false}>
            {sample.pie.map((_, i) => <Cell key={i} fill={Object.values(CHART_PALETTE)[i % 4]} />)}
          </Pie>
          <Tooltip content={<ScadaTooltip />} />
        </PieChart>
      );
      break;
    case "radar":
      chart = (
        <RadarChart width={width} height={VIZ_H} data={sample.radar} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid stroke="rgba(148,163,184,0.15)" />
          <PolarAngleAxis dataKey="m" tick={{ fontSize: 8, fill: "var(--text-muted)" }} />
          <Radar dataKey="v" stroke={grad.stroke} fill={grad.fill} strokeWidth={2} isAnimationActive={false} />
        </RadarChart>
      );
      break;
    case "scatter":
      chart = (
        <ScatterChart width={width} height={VIZ_H} margin={commonMargin}>
          <CartesianGrid {...gridStyle} />
          <XAxis type="number" dataKey="x" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis type="number" dataKey="y" tick={axisTickStyle} axisLine={false} tickLine={false} width={20} />
          <Scatter data={sample.scatter} fill={CHART_PALETTE.warning} isAnimationActive={false} />
        </ScatterChart>
      );
      break;
    default:
      chart = (
        <LineChart width={width} height={VIZ_H} data={sample.line} margin={commonMargin}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="t" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<ScadaTooltip />} />
          <Line type="monotone" dataKey="v" stroke={CHART_PALETTE.secondary} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      );
  }

  return (
    <div ref={wrapRef} className="scada-chart-slot__viz">
      {chart}
    </div>
  );
}

function CanvasLiveStrip({ lang, agentActive, agentLogs, agentStatus, onOpenCopilot }) {
  const recent = agentLogs
    .filter((l) => l.includes("[VISION]") || l.includes("[AGENT]") || l.includes("yenilendi"))
    .slice(-3)
    .reverse();

  return (
    <div className="scada-canvas-strip">
      <div className="scada-canvas-strip__left">
        {agentActive && <span className="live-dot" />}
        <strong>{lang === "TR" ? "Canlı Tuval" : "Live Canvas"}</strong>
        <span className="text-muted">
          {agentActive
            ? (lang === "TR" ? "12 panel — agent veriyi yeniliyor" : "12 panels — agent refreshing data")
            : (lang === "TR" ? "Autopilot ile başlat" : "Start autopilot")}
        </span>
        {agentStatus && (
          <span className={`scada-canvas-strip__status scada-canvas-strip__status--${agentStatus.toLowerCase()}`}>
            {agentStatus}
          </span>
        )}
      </div>
      <div className="scada-canvas-strip__feed">
        {recent.length === 0 ? (
          <span className="text-muted">{lang === "TR" ? "Agent log bekleniyor..." : "Waiting for agent logs..."}</span>
        ) : (
          recent.map((line, i) => (
            <span key={i} className="scada-canvas-strip__item">{line.replace(/^\[[^\]]+\]\s*/, "")}</span>
          ))
        )}
      </div>
      {onOpenCopilot && (
        <button type="button" className="btn-ghost btn-sm" onClick={onOpenCopilot}>
          {lang === "TR" ? "AI Copilot →" : "AI Copilot →"}
        </button>
      )}
    </div>
  );
}

export default function SpawnedChartCanvas({
  lang,
  spawnedCharts,
  agentActive,
  agentLogs = [],
  agentStatus = "SAFE",
  onOpenCopilot,
}) {
  const [refreshedSlots, setRefreshedSlots] = useState(new Set());
  const prevUpdated = useRef({});

  const slots = useMemo(() => {
    const map = new Map();
    spawnedCharts.forEach((action) => {
      const slotId = action.slot_id || `${action.device_id}:${action.chart_type}`;
      map.set(slotId, { ...action, slot_id: slotId });
    });
    return [...map.values()].slice(0, 12);
  }, [spawnedCharts]);

  useEffect(() => {
    const next = new Set();
    slots.forEach((action) => {
      const slotId = action.slot_id;
      const stamp = action.updated_at || action.timestamp || "";
      if (prevUpdated.current[slotId] && prevUpdated.current[slotId] !== stamp) {
        next.add(slotId);
      }
      prevUpdated.current[slotId] = stamp;
    });
    if (next.size > 0) {
      setRefreshedSlots(next);
      const t = setTimeout(() => setRefreshedSlots(new Set()), 1000);
      return () => clearTimeout(t);
    }
  }, [slots]);

  const title = lang === "TR" ? "SCADA Grafik Tuvali" : "SCADA Chart Canvas";

  if (!slots.length) {
    return (
      <div className="panel scada-canvas scada-canvas--empty">
        <div className="panel-header">
          <h3>{title}</h3>
          {agentActive && <span className="scada-canvas__pulse">{lang === "TR" ? "Agent hazırlıyor..." : "Agent preparing..."}</span>}
        </div>
        <CanvasLiveStrip lang={lang} agentActive={agentActive} agentLogs={agentLogs} agentStatus={agentStatus} onOpenCopilot={onOpenCopilot} />
        <div className="scada-canvas-empty">
          <div className="scada-canvas-empty__icon">◈</div>
          <p>{lang === "TR" ? "12 sabit SCADA paneli — agent veriyi canlı yeniler" : "12 fixed SCADA panels — agent refreshes live"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel scada-canvas ${agentActive ? "scada-canvas--live" : ""}`}>
      <div className="panel-header">
        <h3>{title}</h3>
        <div className="scada-canvas__badges">
          {agentActive && (
            <>
              <span className="live-dot" />
              <span className="scada-canvas__pulse">{lang === "TR" ? "Yenileme aktif" : "Refresh active"}</span>
            </>
          )}
          <span className="badge-stable">{slots.length} {lang === "TR" ? "panel" : "panels"}</span>
        </div>
      </div>

      <CanvasLiveStrip
        lang={lang}
        agentActive={agentActive}
        agentLogs={agentLogs}
        agentStatus={agentStatus}
        onOpenCopilot={onOpenCopilot}
      />

      <div className="scada-canvas-grid">
        {slots.map((action) => {
          const slotId = action.slot_id;
          const label = CHART_LABELS[action.chart_type]?.[lang] || action.chart_type;
          const severity = action.severity || "LOW";
          const severityColor = SEVERITY_COLORS[severity] || SEVERITY_COLORS.LOW;
          const severityClass =
            severity === "CRITICAL" || severity === "HIGH"
              ? "badge-critical"
              : severity === "MEDIUM"
                ? "badge-warning"
                : "badge-stable";
          const isRefreshing = refreshedSlots.has(slotId);
          const icon = CHART_ICONS[action.chart_type] || "◈";
          const refreshSeed = (action.updated_at || action.timestamp || slotId).length;

          return (
            <article
              key={slotId}
              className={`scada-chart-slot ${isRefreshing ? "scada-chart-slot--refresh" : ""}`}
              style={{ "--slot-accent": severityColor }}
            >
              <div className="scada-chart-slot__accent" />
              <header className="scada-chart-slot__head">
                <div className="scada-chart-slot__title-wrap">
                  <span className="scada-chart-slot__icon">{icon}</span>
                  <h4 className="scada-chart-slot__title">{action.widget_title || label}</h4>
                </div>
                <span className={severityClass}>{severity}</span>
              </header>
              <div className="scada-chart-slot__meta">
                <span>{action.device_id}</span>
                {action.rule && <span className="scada-chart-slot__rule">{action.rule}</span>}
                {action.timestamp && <span className="scada-chart-slot__time">{action.timestamp}</span>}
              </div>
              <MiniChart
                chartType={action.chart_type}
                gradId={`grad-${slotId.replace(/[^a-zA-Z0-9]/g, "-")}`}
                refreshSeed={refreshSeed}
              />
              {action.message && (
                <p className="scada-chart-slot__msg">{action.message}</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
