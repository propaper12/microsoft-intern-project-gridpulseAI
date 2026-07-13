export default function KpiCard({ title, value, unit, trend, trendClass, barWidth, barClass, icon, accent }) {
  return (
    <div className={`kpi-card ${accent ? `kpi-card--${accent}` : ""}`}>
      <div className="kpi-card-top">
        {icon && <span className="kpi-icon">{icon}</span>}
        <div className="kpi-card-title">{title}</div>
      </div>
      <div className="kpi-value-row">
        <span className="kpi-big">{value}</span>
        {unit && <span className="kpi-unit">{unit}</span>}
        {trend && <span className={`kpi-trend ${trendClass || ""}`}>{trend}</span>}
      </div>
      {barWidth !== undefined && (
        <div className="kpi-bar-bg">
          <div className={`kpi-bar-fill ${barClass || ""}`} style={{ width: barWidth }} />
        </div>
      )}
    </div>
  );
}
