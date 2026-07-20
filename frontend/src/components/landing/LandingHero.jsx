import LandingConsoleMock from "./LandingConsoleMock";

const COPY = {
  TR: {
    badge: "SCADA · AI",
    title: "Şebeke zekası, tek konsol",
    desc: "Canlı telemetri, otonom kararlar ve GraphRAG — operatör için tek ekran.",
    primary: "Konsola Gir",
    pillars: [
      { id: "telemetry", label: "Canlı Telemetri", hint: "SSE akış" },
      { id: "agent", label: "Otonom Agent", hint: "Autopilot" },
      { id: "rag", label: "GraphRAG", hint: "Grounded" },
    ],
  },
  EN: {
    badge: "SCADA · AI",
    title: "Grid intelligence, one console",
    desc: "Live telemetry, autonomous decisions, and GraphRAG — one surface for operators.",
    primary: "Enter Console",
    pillars: [
      { id: "telemetry", label: "Live Telemetry", hint: "SSE stream" },
      { id: "agent", label: "Autonomous Agent", hint: "Autopilot" },
      { id: "rag", label: "GraphRAG", hint: "Grounded" },
    ],
  },
};

export default function LandingHero({ lang, onLaunch }) {
  const t = COPY[lang] || COPY.TR;

  return (
    <section className="landing2-hero-wrap">
      <div className="landing2-shell landing2-hero-shell">
        <div className="landing2-hero">
          <div className="landing2-hero-copy">
            <span className="landing2-badge">{t.badge}</span>
            <h1>{t.title}</h1>
            <p>{t.desc}</p>

            <ul className="landing2-pillars" aria-label={lang === "TR" ? "Platform yetenekleri" : "Platform capabilities"}>
              {t.pillars.map((p) => (
                <li key={p.id} className="landing2-pillar-chip">
                  <strong>{p.label}</strong>
                  <span>{p.hint}</span>
                </li>
              ))}
            </ul>

            <div className="landing2-hero-actions">
              <button type="button" className="btn-landing-primary btn-lg" onClick={onLaunch}>
                {t.primary}
              </button>
              <span className="landing2-hero-kbd">
                {lang === "TR" ? "Enter ile de açılır" : "Press Enter to open"}
              </span>
            </div>
          </div>

          <div className="landing2-hero-mock">
            <LandingConsoleMock lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
