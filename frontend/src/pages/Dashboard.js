import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api";

// Helper function to calculate cycle day number from date string
function getCycleDayNumber(cycleDayStr) {
  if (!cycleDayStr) return "-";
  // Parse as local date (ignore time zone issues)
  const [year, month, day] = cycleDayStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const today = new Date();
  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : "-";
}

const Dashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api.get("/dashboard", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
      padding: 32
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 32,
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{ color: "#d72660", fontSize: 32, marginBottom: 8 }}>
          {data.name ? `Welcome back, ${data.name}! 🌞` : "Welcome back! 🌞"}
        </h2>
        <p style={{ color: "#555", fontSize: 18, marginBottom: 32 }}>
          Here's your health overview and quick access to your wellness tools.
        </p>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
          <SummaryWidget title="Cycle Day" value={getCycleDayNumber(data.cycle_day)} icon="📅" />
          <SummaryWidget title="Mood" value={data.mood || "-"} icon="📝" />
          <SummaryWidget title="PCOS Risk" value={data.pcos_risk || "-"} icon="🩺" />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          <DashboardCard title="PCOS Risk" desc="Check your risk" link="/pcos-checker" icon="🩺" />
          <DashboardCard title="Cycle Tracker" desc="Track your cycle" link="/cycle-tracker" icon="📅" />
          <DashboardCard title="Journal" desc="Log your emotions" link="/journal" icon="📝" />
          <DashboardCard title="SheBot" desc="Ask health questions" link="/chatbot" icon="🤖" />
          <DashboardCard title="Recommendations" desc="Personalized tips" link="/recommendations" icon="💡" />
        </div>
      </div>
    </div>
  );
};

const SummaryWidget = ({ title, value, icon }) => (
  <div style={{
    background: "#fce4ec",
    borderRadius: 16,
    padding: "18px 32px",
    minWidth: 140,
    textAlign: "center",
    color: "#d72660",
    fontWeight: 600,
    fontSize: 18,
    boxShadow: "0 2px 8px rgba(215,38,96,0.04)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <span style={{ fontSize: 28, marginBottom: 4 }}>{icon}</span>
    <div>{title}</div>
    <div style={{ fontSize: 16, color: "#b71c4a", marginTop: 2 }}>{value}</div>
  </div>
);

const DashboardCard = ({ title, desc, link, icon }) => (
  <Link to={link} style={{ textDecoration: "none" }}>
    <div style={{
      background: "#fce4ec",
      borderRadius: 16,
      padding: 28,
      minWidth: 180,
      minHeight: 120,
      textAlign: "center",
      color: "#d72660",
      fontWeight: 600,
      fontSize: 20,
      boxShadow: "0 2px 8px rgba(215,38,96,0.04)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <span style={{ fontSize: 36, marginBottom: 8 }}>{icon}</span>
      <div>{title}</div>
      <div style={{ fontSize: 14, color: "#b71c4a", marginTop: 4 }}>{desc}</div>
    </div>
  </Link>
);

export default Dashboard;