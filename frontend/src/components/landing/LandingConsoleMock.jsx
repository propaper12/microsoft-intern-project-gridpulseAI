const STATUS = {
  TR: {
    autopilot: "AUTOPILOT AKTİF",
    status: "Agent durumu: DIAGNOSING",
    charts: "12 panel canlı yenileniyor",
  },
  EN: {
    autopilot: "AUTOPILOT ACTIVE",
    status: "Agent status: DIAGNOSING",
    charts: "12 panels live-refreshing",
  },
};

export default function LandingConsoleMock({ lang }) {
  const t = STATUS[lang] || STATUS.TR;
  return (
    <div className="landing2-mock">
      <div className="landing2-mock-top">
        <span className="landing2-dot" />
        <span className="landing2-dot" />
        <span className="landing2-dot" />
        <div className="landing2-mock-url">gridpulse.local/console</div>
      </div>

      <div className="landing2-mock-body">
        <aside className="landing2-mock-sidebar">
          <span />
          <span />
          <span />
          <span />
        </aside>

        <section className="landing2-mock-main">
          <div className="landing2-mock-kpis">
            <div className="landing2-kpi-card">
              <small>Telemetry</small>
              <strong>1.28M</strong>
            </div>
            <div className="landing2-kpi-card">
              <small>Groundedness</small>
              <strong>96.4%</strong>
            </div>
            <div className="landing2-kpi-card">
              <small>RAG Latency</small>
              <strong>38ms</strong>
            </div>
          </div>

          <div className="landing2-mock-strip">
            <span className="live-dot" />
            <span>{t.autopilot}</span>
            <small>{t.status}</small>
          </div>

          <div className="landing2-mock-grid">
            <div className="landing2-chart-card">
              <div className="landing2-chart-head">
                <strong>Load Curve</strong>
                <span className="badge-stable">LOW</span>
              </div>
              <div className="landing2-chart-lines" />
            </div>
            <div className="landing2-chart-card">
              <div className="landing2-chart-head">
                <strong>Voltage</strong>
                <span className="badge-warning">MEDIUM</span>
              </div>
              <div className="landing2-chart-bars" />
            </div>
            <div className="landing2-chart-card">
              <div className="landing2-chart-head">
                <strong>GraphRAG</strong>
                <span className="badge-stable">LIVE</span>
              </div>
              <div className="landing2-chart-dots" />
            </div>
          </div>
          <p className="landing2-mock-caption">{t.charts}</p>
        </section>
      </div>
    </div>
  );
}
