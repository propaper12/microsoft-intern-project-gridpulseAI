export function parseTelemetry(text) {
  if (!text || !text.includes("=")) {
    return <span className="text-muted italic">{text}</span>;
  }
  const cleaned = text.replace("Telemetry:", "").trim();
  const parts = cleaned.split(",").map((p) => p.trim());
  return (
    <div className="telemetry-tags">
      {parts.map((part, i) => {
        const splitPart = part.split("=");
        if (splitPart.length < 2) return <span key={i}>{part}</span>;
        const key = splitPart[0].trim();
        const val = splitPart[1].trim();
        let tagClass = "telemetry-tag telemetry-tag--load";
        if (key.toLowerCase().includes("volt") || key.toLowerCase().includes("gerilim")) {
          tagClass = "telemetry-tag telemetry-tag--volt";
        } else if (key.toLowerCase().includes("temp") || key.toLowerCase().includes("sıcaklık")) {
          tagClass = "telemetry-tag telemetry-tag--temp";
        }
        return (
          <span key={i} className={tagClass}>
            {key}: <strong>{val}</strong>
          </span>
        );
      })}
    </div>
  );
}
