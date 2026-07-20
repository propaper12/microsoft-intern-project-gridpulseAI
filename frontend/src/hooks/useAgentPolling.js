import { useEffect, useState, useCallback } from "react";
import { GRIDPULSE_MODEL } from "../utils/constants";
import { apiUrl } from "../utils/apiBase";

const START_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url, options = {}, timeoutMs = START_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function useAgentPolling(pollAlways = true) {
  const [spawnedCharts, setSpawnedCharts] = useState([]);
  const [agentStatus, setAgentStatus] = useState("SAFE");
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentInsights, setAgentInsights] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [agentError, setAgentError] = useState(null);
  const [agentConfig, setAgentConfig] = useState({
    ops_email: "omercakan5@gmail.com",
    auto_report_enabled: true,
    smtp_configured: false,
  });
  const [reportHistory, setReportHistory] = useState([]);

  const fetchAgentData = useCallback(async () => {
    try {
      const [actionsRes, logsRes, statusRes, configRes, historyRes, insightsRes] = await Promise.all([
        fetch(apiUrl("/api/agent/actions")),
        fetch(apiUrl("/api/agent/logs")),
        fetch(apiUrl("/api/agent/status")),
        fetch(apiUrl("/api/agent/config")),
        fetch(apiUrl("/api/report/history")),
        fetch(apiUrl("/api/agent/insights")),
      ]);

      const actionsData = await actionsRes.json();
      const logsData = await logsRes.json();
      const statusData = await statusRes.json();
      const configData = await configRes.json();
      const historyData = await historyRes.json();
      const insightsData = await insightsRes.json();

      if (actionsData.actions) {
        setSpawnedCharts(actionsData.actions.filter((a) => a.action === "SPAWN_CHART"));
      }
      if (actionsData.status) setAgentStatus(actionsData.status);
      if (typeof actionsData.active === "boolean") setIsActive(actionsData.active);

      if (logsData.logs) setAgentLogs(logsData.logs);
      if (statusData.status) setAgentStatus(statusData.status);
      if (typeof statusData.active === "boolean") setIsActive(statusData.active);
      if (configData.ops_email) setAgentConfig(configData);
      if (historyData.reports) setReportHistory(historyData.reports);
      if (insightsData.insights) setAgentInsights(insightsData.insights);
    } catch {
      /* offline */
    }
  }, []);

  const refreshInsights = useCallback(async (lang = "TR") => {
    try {
      const res = await fetch(apiUrl("/api/agent/insights/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      const data = await res.json();
      if (data.insights) setAgentInsights(data.insights);
      fetchAgentData();
    } catch {
      /* offline */
    }
  }, [fetchAgentData]);

  useEffect(() => {
    fetchAgentData();
    if (!pollAlways && !isActive) return;
    const interval = setInterval(fetchAgentData, 2000);
    return () => clearInterval(interval);
  }, [pollAlways, isActive, fetchAgentData]);

  const startAgent = async () => {
    // Optimistic UI — do not wait for SMTP/bootstrap on the server.
    setAgentError(null);
    setIsActive(true);
    setAgentStatus("DIAGNOSING");

    try {
      const res = await fetchWithTimeout(apiUrl("/api/agent/start"), { method: "POST" });
      if (!res.ok) {
        throw new Error(`Agent start failed (HTTP ${res.status})`);
      }
      const data = await res.json().catch(() => ({}));
      if (data.active === false) {
        throw new Error("Agent did not activate");
      }
      setIsActive(true);
      await fetchAgentData();
      refreshInsights("TR");
    } catch (err) {
      const message =
        err?.name === "AbortError"
          ? "Agent start timed out — is the API on 127.0.0.1:8000 responding?"
          : err?.message || "Agent start failed";
      setAgentError(message);
      setIsActive(false);
      setAgentStatus("SAFE");
      console.error("[GridPulse] startAgent:", message);
    }
  };

  const stopAgent = async () => {
    setAgentError(null);
    setIsActive(false);
    setAgentStatus("SAFE");
    try {
      const res = await fetchWithTimeout(apiUrl("/api/agent/stop"), { method: "POST" }, 8000);
      if (!res.ok) {
        throw new Error(`Agent stop failed (HTTP ${res.status})`);
      }
    } catch (err) {
      const message = err?.message || "Agent stop failed";
      setAgentError(message);
      console.error("[GridPulse] stopAgent:", message);
    }
    fetchAgentData();
  };

  const updateConfig = async (payload) => {
    await fetch(apiUrl("/api/agent/config"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    fetchAgentData();
  };

  const sendReportNow = async (lang = "TR") => {
    await fetch(apiUrl("/api/report/send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_type: "manual", lang }),
    }).catch(() => {});
    fetchAgentData();
  };

  return {
    spawnedCharts,
    agentStatus,
    agentLogs,
    setAgentLogs,
    agentInsights,
    model: GRIDPULSE_MODEL,
    isActive,
    setIsActive,
    setAgentStatus,
    agentError,
    agentConfig,
    reportHistory,
    startAgent,
    stopAgent,
    updateConfig,
    sendReportNow,
    refreshInsights,
    refreshAgent: fetchAgentData,
  };
}
