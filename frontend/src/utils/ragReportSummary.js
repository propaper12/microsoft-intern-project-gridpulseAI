/**
 * RAG raporu için operatör odaklı özet üretir (frontend-only, rag_details'tan türetilir).
 */
export function buildRagReportSummary(details, lang) {
  const isTR = lang === "TR";
  const score = details.metrics?.groundedness_score ?? 0;
  const topRule = details.retrieved_rules?.[0];
  const anomalies = details.active_anomalies || [];
  const criticalCount = anomalies.filter((a) => (a.stability_score ?? 100) < 50).length;

  let verdict;
  let verdictClass;
  let trustMessage;

  if (score >= 90) {
    verdict = isTR ? "Güvenilir" : "Trustworthy";
    verdictClass = "stable";
    trustMessage = isTR
      ? "Yanıt SQLite kuralları ve ClickHouse telemetrisiyle uyumlu görünüyor."
      : "Response appears aligned with SQLite rules and ClickHouse telemetry.";
  } else if (score >= 75) {
    verdict = isTR ? "Dikkatli Kullan" : "Use With Caution";
    verdictClass = "warning";
    trustMessage = isTR
      ? "Kısmi kaynak eşleşmesi var — operasyonel karar öncesi telemetriyi doğrulayın."
      : "Partial source match — verify telemetry before operational decisions.";
  } else {
    verdict = isTR ? "Güvenme" : "Do Not Rely";
    verdictClass = "critical";
    trustMessage = isTR
      ? "Groundedness düşük — yanıt manuel denetim gerektirir."
      : "Low groundedness — response requires manual review.";
  }

  let actionVerdict;
  if (score >= 90 && criticalCount === 0) {
    actionVerdict = isTR ? "Operatör aksiyonu önerilebilir" : "Operator action may be recommended";
  } else if (score >= 75 || criticalCount > 0) {
    actionVerdict = isTR ? "Ek doğrulama sonrası aksiyon alın" : "Take action after additional verification";
  } else {
    actionVerdict = isTR ? "Manuel denetim gerekli — otomatik aksiyon almayın" : "Manual review required — do not auto-act";
  }

  const bullets = [];

  if (topRule) {
    bullets.push(
      isTR
        ? `Eşleşen kural: ${topRule.title || "SQLite kuralı"} (${topRule.score}% benzerlik)`
        : `Matched rule: ${topRule.title || "SQLite rule"} (${topRule.score}% similarity)`
    );
  }

  if (anomalies.length > 0) {
    const a = anomalies[0];
    bullets.push(
      isTR
        ? `${anomalies.length} telemetri kaydı tarandı — odak: ${a.device_id} @ ${a.city}`
        : `${anomalies.length} telemetry records scanned — focus: ${a.device_id} @ ${a.city}`
    );
    if (a.reason) {
      bullets.push(
        isTR
          ? `Anomali: ${a.reason}, kararlılık skoru ${a.stability_score ?? "—"}%`
          : `Anomaly: ${a.reason}, stability score ${a.stability_score ?? "—"}%`
      );
    }
    if (criticalCount > 0) {
      bullets.push(
        isTR
          ? `${criticalCount} kritik seviye kayıt tespit edildi`
          : `${criticalCount} critical-level records detected`
      );
    }
  } else {
    bullets.push(isTR ? "ClickHouse'ta eşleşen aktif anomali bulunamadı" : "No matching active anomalies in ClickHouse");
  }

  if (details.self_corrected) {
    bullets.push(isTR ? "Sorgu self-healing ile genişletildi (düşük ilk eşleşme)" : "Query expanded via self-healing (low initial match)");
  }

  const tripletCount = details.graph_context?.triplets?.length || 0;
  if (tripletCount > 0) {
    bullets.push(isTR ? `GraphRAG: ${tripletCount} ilişki zinciri çözümlendi` : `GraphRAG: ${tripletCount} relation chains resolved`);
  }

  const ruleTitle = (topRule?.title || "").toLowerCase();
  const query = (details.query || "").toLowerCase();
  let suggestedAction;

  if (ruleTitle.includes("101") || query.includes("yük") || query.includes("load") || query.includes("trafo")) {
    suggestedAction = isTR ? "Yük dengeleme veya trafo izolasyonu değerlendirilsin" : "Evaluate load balancing or transformer isolation";
  } else if (ruleTitle.includes("102") || query.includes("volt") || query.includes("gerilim")) {
    suggestedAction = isTR ? "Faz dengesi ve voltaj limitleri kontrol edilsin" : "Check phase balance and voltage limits";
  } else if (ruleTitle.includes("103") || query.includes("sıcak") || query.includes("temp") || query.includes("şarj")) {
    suggestedAction = isTR ? "Termal koruma ve soğutma sistemleri devreye alınsın" : "Activate thermal protection and cooling systems";
  } else if (ruleTitle.includes("110") || query.includes("siber") || query.includes("tamper")) {
    suggestedAction = isTR ? "Cihaz izolasyonu ve siber güvenlik alarmı tetiklensin" : "Trigger device isolation and cyber security alert";
  } else if (criticalCount > 0) {
    suggestedAction = isTR ? "Kritik anomali — operatör müdahalesi gerekli" : "Critical anomaly — operator intervention required";
  } else {
    suggestedAction = isTR ? "Rutin şebeke izlemeye devam edin" : "Continue routine grid monitoring";
  }

  return {
    score,
    verdict,
    verdictClass,
    trustMessage,
    actionVerdict,
    bullets,
    suggestedAction,
    topRule,
    anomalies,
    criticalCount,
  };
}
