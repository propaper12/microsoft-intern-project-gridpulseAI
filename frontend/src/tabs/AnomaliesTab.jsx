import { TRANSLATIONS, gridStations } from "../utils/constants";
import { parseTelemetry } from "../utils/telemetry";

export default function AnomaliesTab({
  lang,
  alerts,
  searchQuery,
  setSearchQuery,
  revertedIds,
  onRevert,
  onReview,
}) {
  const t = TRANSLATIONS[lang];
  const filtered = alerts
    .filter((a) => a.truth_score < 50 && !revertedIds.includes(`${a.account_id}-${a.hashtag}-${a.timestamp}`))
    .filter((a) =>
      (a.hashtag || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.account_id || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const recentAlarms = filtered.slice(0, 5);

  return (
    <div className="anomalies-tab">
      <div className="content-header">
        <h2>{t.anomalies_title}</h2>
        <div className="anomalies-toolbar">
          <input
            className="search-input"
            placeholder={t.search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => {
              const headers = "Timestamp,DeviceType,DeviceId,Reason,Stability\n";
              const rows = filtered.map((a) => `"${a.timestamp}","${a.hashtag}","${a.account_id}","${a.reason}",${a.truth_score}`).join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `grid_anomalies_${new Date().toISOString().slice(0, 10)}.csv`;
              link.click();
            }}
          >
            {t.export_csv}
          </button>
        </div>
      </div>

      {recentAlarms.length > 0 && (
        <div className="recent-alarms">
          <span className="recent-alarms-title">{lang === "TR" ? "Son 5 Alarm" : "Last 5 Alarms"}</span>
          <div className="recent-alarms-list">
            {recentAlarms.map((a, i) => (
              <div key={i} className="recent-alarm-item">
                <span className="badge-critical">{a.reason}</span>
                <span>{a.account_id}</span>
                <span className="text-muted">{gridStations[a.city] || a.city}</span>
                <span className="text-red">{a.truth_score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel anomalies-table-panel">
        <div className="panel-header">
          <h3>{lang === "TR" ? "Anomali Log Tablosu" : "Anomaly Log Table"} ({filtered.length})</h3>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{lang === "TR" ? "Cihaz Türü" : "Type"}</th>
                <th>{lang === "TR" ? "Cihaz ID" : "ID"}</th>
                <th>{lang === "TR" ? "Neden" : "Reason"}</th>
                <th>{lang === "TR" ? "Telemetri" : "Telemetry"}</th>
                <th>{lang === "TR" ? "Kararlılık" : "Stability"}</th>
                <th>{lang === "TR" ? "Aksiyon" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.hashtag}</td>
                  <td className="text-muted">{row.account_id}</td>
                  <td className="text-red">{row.reason}</td>
                  <td>{parseTelemetry(row.post_text)}</td>
                  <td className="text-red">{row.truth_score}%</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-danger btn-sm" onClick={() => onRevert(row)}>{t.isolate}</button>
                      <button type="button" className="btn-ghost btn-sm" onClick={() => onReview(row)}>{t.diag}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-empty">{t.no_matching_anomalies}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
