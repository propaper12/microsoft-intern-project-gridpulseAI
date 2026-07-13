export default function ServiceLEDs({ systemStatus }) {
  const services = [
    { key: "clickhouse", label: "CH" },
    { key: "redpanda", label: "RP" },
    { key: "sqlite_rag", label: "RAG" },
    { key: "ollama", label: "LLM" },
  ];

  return (
    <div className="service-leds">
      {services.map(({ key, label }) => {
        const online = systemStatus[key] === "ONLINE";
        return (
          <div key={key} className="service-led">
            <span className={`status-led ${online ? "status-led--ok" : "status-led--off"}`} />
            <span className="service-led-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
