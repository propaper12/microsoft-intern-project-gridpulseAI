export default function GroundednessGauge({ score, lang }) {
  const value = score ?? 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 90 ? "#22c55e" : value >= 75 ? "#f59e0b" : "#ef4444";
  const label = value >= 90
    ? (lang === "TR" ? "Yüksek güven" : "High confidence")
    : value >= 75
      ? (lang === "TR" ? "Orta güven" : "Moderate")
      : (lang === "TR" ? "Düşük güven" : "Low confidence");

  return (
    <div className="groundedness-gauge">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border-color)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" textAnchor="middle" fill="var(--text-main)" fontSize="26" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          {value.toFixed(1)}
        </text>
        <text x="70" y="82" textAnchor="middle" fill="var(--text-muted)" fontSize="10">%</text>
      </svg>
      <div className="groundedness-meta">
        <strong style={{ color }}>{label}</strong>
        <span className="text-muted">{lang === "TR" ? "Groundedness Skoru" : "Groundedness Score"}</span>
      </div>
    </div>
  );
}
