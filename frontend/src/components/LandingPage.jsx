import { useEffect } from "react";
import LandingNav from "./landing/LandingNav";
import LandingHero from "./landing/LandingHero";
import "../styles/landing.css";

const FOOTER = {
  TR: {
    tagline: "Telemetri · Otonom Agent · GraphRAG",
    rights: "Operasyonel zeka platformu",
  },
  EN: {
    tagline: "Telemetry · Autonomous Agent · GraphRAG",
    rights: "Operational intelligence platform",
  },
};

export default function LandingPage({ lang, setLang, darkMode, onLaunch }) {
  const f = FOOTER[lang] || FOOTER.TR;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = e.target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        onLaunch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLaunch]);

  return (
    <div className={`landing2-page ${darkMode ? "dark" : ""}`}>
      <div className="landing2-grid-bg" aria-hidden />
      <div className="landing2-glow" aria-hidden />

      <LandingNav lang={lang} setLang={setLang} onLaunch={onLaunch} />

      <main className="landing2-main">
        <LandingHero lang={lang} onLaunch={onLaunch} />
      </main>

      <footer className="landing2-statusbar">
        <span className="landing2-statusbar-brand">GridPulse.AI</span>
        <span className="landing2-statusbar-mid">
          <span className="live-dot" aria-hidden />
          {f.tagline}
        </span>
        <span className="landing2-statusbar-end">{f.rights}</span>
      </footer>
    </div>
  );
}
