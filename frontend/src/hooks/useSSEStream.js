import { useEffect, useState } from "react";
import axios from "axios";
import { playSynthBeep } from "../utils/constants";
import { apiUrl } from "../utils/apiBase";

export function useSSEStream() {
  const [alerts, setAlerts] = useState([]);
  const [avgTruth, setAvgTruth] = useState(82.4);
  const [timeline, setTimeline] = useState([
    { time: "14:20", posts: 3200, frauds: 12 },
    { time: "14:22", posts: 3500, frauds: 15 },
    { time: "14:24", posts: 3100, frauds: 8 },
    { time: "14:26", posts: 3900, frauds: 22 },
    { time: "14:28", posts: 3600, frauds: 14 },
    { time: "14:30", posts: 4200, frauds: 19 },
  ]);
  const [breakdown, setBreakdown] = useState([
    { name: "Verified", value: 124 },
    { name: "Unverified/Warning", value: 34 },
    { name: "Fake/Vandalism", value: 12 },
  ]);

  useEffect(() => {
    let simulationInterval = null;
    let isConnected = false;

    const startSimulation = () => {
      if (simulationInterval) return;
      simulationInterval = setInterval(() => {
        const samplePages = ["SmartMeter", "EVCharger", "Transformer"];
        const sampleUsers = ["METER_101", "METER_102", "CHARGER_201", "TRAFO_301", "TRAFO_302"];
        const sampleReasons = ["CRITICAL_OVERLOAD", "VOLTAGE_DROP", "OVERHEATING", "NORMAL"];
        const sampleCities = ["Westminster", "Chelsea", "Camden", "Greenwich", "Hackney"];

        const randomPage = samplePages[Math.floor(Math.random() * samplePages.length)];
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomReason = sampleReasons[Math.floor(Math.random() * sampleReasons.length)];
        const randomCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];
        const isBot = randomPage === "Transformer" || randomReason === "CRITICAL_OVERLOAD";
        const truth = randomReason === "NORMAL" ? Math.floor(75 + Math.random() * 20) : Math.floor(10 + Math.random() * 35);

        const mockAlert = {
          account_id: randomUser,
          hashtag: randomPage,
          post_text: randomReason === "CRITICAL_OVERLOAD" ? "Telemetry: Load=450kW, Voltage=190V" : "Telemetry: normal parameters operational",
          city: randomCity,
          reason: randomReason,
          truth_score: truth,
          is_bot: isBot,
          timestamp: new Date().toISOString(),
        };

        setAlerts((prev) => [mockAlert, ...prev].slice(0, 50));
        setTimeline((prev) => {
          const nextTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          const nextTimeline = [...prev, { time: nextTime, posts: Math.floor(3000 + Math.random() * 1500), frauds: isBot ? Math.floor(Math.random() * 4) + 1 : 0 }];
          return nextTimeline.slice(-8);
        });
        setBreakdown((prev) =>
          prev.map((item) => {
            if (randomReason === "NORMAL" && item.name === "Verified") return { ...item, value: item.value + 1 };
            if (isBot && item.name === "Fake/Vandalism") return { ...item, value: item.value + 1 };
            if (item.name === "Unverified/Warning" && randomReason !== "NORMAL") return { ...item, value: item.value + 1 };
            return item;
          })
        );
      }, 3500);
    };

    const stopSimulation = () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
    };

    const eventSource = new EventSource(apiUrl("/api/stream"));
    eventSource.onmessage = (event) => {
      isConnected = true;
      stopSimulation();
      const rawAlert = JSON.parse(event.data);
      const newAlert = {
        ...rawAlert,
        hashtag: rawAlert.hashtag || rawAlert.device || "SmartMeter",
        account_id: rawAlert.account_id || rawAlert.device || "METER_UNKNOWN",
        post_text: rawAlert.post_text || `Telemetry: Load=${rawAlert.consumption || 100}kW`,
        city: rawAlert.city || "Central Substation",
        reason: rawAlert.reason || "OVERHEATING",
        truth_score: typeof rawAlert.truth_score === "number" ? rawAlert.truth_score : 45.0,
        is_bot: rawAlert.is_bot !== undefined ? rawAlert.is_bot : true,
        timestamp: rawAlert.timestamp || new Date().toISOString(),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
      if (newAlert.is_bot && newAlert.truth_score < 50) playSynthBeep(660, "sine", 0.08);
    };

    eventSource.onerror = () => {
      isConnected = false;
      startSimulation();
    };

    const timeout = setTimeout(() => {
      if (!isConnected) startSimulation();
    }, 3000);

    const fetchAnalytics = async () => {
      try {
        const [truthRes, timeRes, breakRes] = await Promise.all([
          axios.get(apiUrl("/api/stats/truth-score")),
          axios.get(apiUrl("/api/stats/timeline")),
          axios.get(apiUrl("/api/stats/fact-check-breakdown")),
        ]);
        if (truthRes.data?.total) setAvgTruth(truthRes.data.total);
        if (breakRes.data?.data?.length > 0) setBreakdown(breakRes.data.data);
        if (timeRes.data?.data) {
          setTimeline(
            timeRes.data.data.map((item) => ({
              ...item,
              posts: item.frauds === 0 ? Math.floor(Math.random() * 5000) : item.frauds * 85 + Math.floor(Math.random() * 2000),
            }))
          );
        }
      } catch {
        /* offline fallback */
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);

    return () => {
      eventSource.close();
      clearInterval(interval);
      stopSimulation();
      clearTimeout(timeout);
    };
  }, []);

  return { alerts, setAlerts, avgTruth, timeline, breakdown };
}
