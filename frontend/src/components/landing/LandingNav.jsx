export default function LandingNav({ lang, setLang, onLaunch }) {
  return (
    <header className="landing2-nav-wrap">
      <nav className="landing2-nav" aria-label={lang === "TR" ? "Ana menü" : "Main menu"}>
        <div className="landing2-brand" aria-label="GridPulse.AI">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>GridPulse.AI</span>
        </div>

        <div className="landing2-nav-meta">
          <span className="landing2-nav-live">
            <span className="live-dot" aria-hidden />
            {lang === "TR" ? "CANLI DEMO" : "LIVE DEMO"}
          </span>
        </div>

        <div className="landing2-nav-actions">
          <button
            type="button"
            className="btn-landing-secondary"
            onClick={() => setLang(lang === "TR" ? "EN" : "TR")}
            aria-label={lang === "TR" ? "Switch to English" : "Türkçe'ye geç"}
          >
            {lang}
          </button>
          <button type="button" className="btn-landing-primary" onClick={onLaunch}>
            {lang === "TR" ? "Konsolu Aç" : "Open Console"}
          </button>
        </div>
      </nav>
    </header>
  );
}
