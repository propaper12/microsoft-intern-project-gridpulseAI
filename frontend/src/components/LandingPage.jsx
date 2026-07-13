import { useState } from "react";
import PillarsShowcase from "./PillarsShowcase";

export default function LandingPage({ lang, setLang, darkMode, onLaunch }) {
  return (
    <div className={`landing-page ${darkMode ? "dark" : ""}`}>
      <div className="grid-background" />
      <nav className="landing-nav">
        <div className="landing-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          GridPulse.AI
        </div>
        <div className="landing-nav-actions">
          <button type="button" className="btn-ghost" onClick={() => setLang(lang === "TR" ? "EN" : "TR")}>{lang}</button>
          <button type="button" className="btn-primary" onClick={onLaunch}>
            {lang === "TR" ? "Konsolu Başlat" : "Launch Console"}
          </button>
        </div>
      </nav>

      <div className="landing-hero">
        <span className="landing-badge">
          {lang === "TR" ? "Microsoft Staj / SCADA AI Demo" : "Microsoft Internship / SCADA AI Demo"}
        </span>
        <h1>
          {lang === "TR"
            ? "3 Motorlu Otonom Şebeke İzleme Platformu"
            : "3-Engine Autonomous Grid Monitoring Platform"}
        </h1>
        <p>
          {lang === "TR"
            ? "Anlık telemetri, otonom agent ve GraphRAG — tek konsolda birleşiyor. Agent kritik durumlarda operatöre otomatik e-posta raporu gönderir."
            : "Live telemetry, autonomous agent and GraphRAG — unified in one console. The agent automatically emails ops reports on critical events."}
        </p>
        <button type="button" className="btn-primary btn-lg" onClick={onLaunch}>
          {lang === "TR" ? "Sisteme Giriş Yap" : "Enter SCADA Console"}
        </button>
      </div>

      <section className="landing-pillars-section">
        <PillarsShowcase lang={lang} />
      </section>

      <section className="landing-flow">
        <h3>{lang === "TR" ? "Otonom Agent Akışı" : "Autonomous Agent Flow"}</h3>
        <div className="landing-flow-steps">
          {[
            lang === "TR" ? "Telemetri Tarama" : "Scan Telemetry",
            lang === "TR" ? "RAG + Kural Eşleşme" : "RAG + Rule Match",
            lang === "TR" ? "Karar + Grafik" : "Decision + Chart",
            lang === "TR" ? "E-posta Raporu" : "Email Report",
          ].map((step, i) => (
            <div key={step} className="landing-flow-step">
              <span className="landing-flow-num">{i + 1}</span>
              <span>{step}</span>
              {i < 3 && <span className="landing-flow-arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>GridPulseAI &copy; 2026</span>
        <span>{lang === "TR" ? "Telemetry · Agent · RAG" : "Telemetry · Agent · RAG"}</span>
      </footer>
    </div>
  );
}
