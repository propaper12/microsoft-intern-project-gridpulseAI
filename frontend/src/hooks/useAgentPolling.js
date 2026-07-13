import { useEffect, useState, useCallback } from "react";
import { GRIDPULSE_MODEL } from "../utils/constants";

export function useAgentPolling(pollAlways = true) {
  const [spawnedCharts, setSpawnedCharts] = useState([]);
  const [agentStatus, setAgentStatus] = useState("SAFE");
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentInsights, setAgentInsights] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
    ops_email: "omercakan5@gmail.com",
    auto_report_enabled: true,
    smtp_configured: false,
  });
  const [reportHistory, setReportHistory] = useState([]);

  const fetchAgentData = useCallback(async () => {
    try {
      const [actionsRes, logsRes, statusRes, configRes, historyRes, insightsRes] = await Promise.all([
        fetch("/api/agent/actions"),
        fetch("/api/agent/logs"),
        fetch("/api/agent/status"),
        fetch("/api/agent/config"),
        fetch("/api/report/history"),
        fetch("/api/agent/insights"),
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
      const res = await fetch("/api/agent/insights/refresh", {
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
    await fetch("/api/agent/start", { method: "POST" }).catch(() => {});
    setIsActive(true);
    setAgentStatus("DIAGNOSING");
    await fetchAgentData();
    await refreshInsights("TR");
  };

  const stopAgent = async () => {
    await fetch("/api/agent/stop", { method: "POST" }).catch(() => {});
    setIsActive(false);
    setAgentStatus("SAFE");
    fetchAgentData();
  };

  const updateConfig = async (payload) => {
    await fetch("/api/agent/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    fetchAgentData();
  };

  const sendReportNow = async (lang = "TR") => {
    await fetch("/api/report/send", {
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
