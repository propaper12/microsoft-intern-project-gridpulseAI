export default function RagGraphViz({ graphContext, lang }) {
  const triplets = graphContext?.triplets || [];
  const entities = graphContext?.entities || [];

  if (!triplets.length && !entities.length) {
    return (
      <div className="rag-graph-empty">
        {lang === "TR" ? "GraphRAG alt graf çözümlenemedi." : "No GraphRAG subgraph resolved."}
      </div>
    );
  }

  const nodes = new Map();
  triplets.forEach((t) => {
    nodes.set(t.source, (nodes.get(t.source) || 0) + 1);
    nodes.set(t.target, (nodes.get(t.target) || 0) + 1);
  });
  const nodeList = [...nodes.keys()].slice(0, 8);
  const cx = 160;
  const cy = 100;
  const radius = 70;

  const positions = nodeList.map((name, i) => {
    const angle = (i / nodeList.length) * 2 * Math.PI - Math.PI / 2;
    return { name, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  const posMap = Object.fromEntries(positions.map((p) => [p.name, p]));

  return (
    <div className="rag-graph-viz">
      <svg viewBox="0 0 320 200" className="rag-graph-svg">
        {triplets.slice(0, 10).map((t, i) => {
          const from = posMap[t.source];
          const to = posMap[t.target];
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(59,158,255,0.35)" strokeWidth="1.5" />
              <text x={mx} y={my - 4} textAnchor="middle" fill="#f59e0b" fontSize="7" fontFamily="JetBrains Mono">
                {t.relation?.substring(0, 12)}
              </text>
            </g>
          );
        })}
        {positions.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="14" fill="rgba(59,158,255,0.12)" stroke="#3b9eff" strokeWidth="1.5" />
            <text x={p.x} y={p.y + 3} textAnchor="middle" fill="#e2e8f0" fontSize="6" fontFamily="JetBrains Mono">
              {p.name.substring(0, 8)}
            </text>
          </g>
        ))}
      </svg>
      <ul className="rag-triplet-list">
        {triplets.slice(0, 6).map((t, i) => (
          <li key={i}>
            <code>{t.source}</code>
            <span className="rag-triplet-arrow">—[{t.relation}]→</span>
            <code>{t.target}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
