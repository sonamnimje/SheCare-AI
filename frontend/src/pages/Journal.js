import React, { useState, useEffect } from "react";
import * as api from "../api";

const MOODS = [
  { emoji: "😄", label: "Happy" },
  { emoji: "🙂", label: "Content" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙁", label: "Sad" },
  { emoji: "😢", label: "Stressed" }
];

function getWeekDates() {
  const today = new Date();
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    week.push(d.toISOString().slice(0, 10));
  }
  return week;
}

const Journal = () => {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [userData, setUserData] = useState({ age: "", weight: "", cycleLength: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  // Load user data (age, weight, cycleLength) on mount
  useEffect(() => {
    setUserLoading(true);
    setUserError("");
    api.getProfile()
      .then(res => {
        setUserData({
          age: res.age || "",
          weight: res.weight || "",
          cycleLength: res.cycle_length || ""
        });
      })
      .catch(() => setUserError("Failed to load user data."))
      .finally(() => setUserLoading(false));
  }, []);

  // Fetch journal entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api.get("/journal", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setEntries(res.data))
      .catch(() => {
        setError("Failed to load entries.");
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!entry || !mood || !date) return;
    setLoading(true);
    setError("");
    setAnalysis("");
    const token = localStorage.getItem("shecare_token");
    const isoDate = new Date(date).toISOString();
    api.post("/journal", { mood, text: entry, date: isoDate }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        setAnalysis(res.data.analysis || "");
        fetchEntries();
        setEntry("");
        setMood("");
        setDate(new Date().toISOString().slice(0, 10));
      })
      .catch(() => {
        setError("Failed to add entry.");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api.del(`/journal/${id}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
      .then(() => fetchEntries())
      .catch(() => setError("Failed to delete entry."))
      .finally(() => setLoading(false));
  };

  // Weekly mood trend
  const weekDates = getWeekDates();
  const weekMoods = weekDates.map(date => {
    const found = entries.find(e => (e.date || e.created_at || "").slice(0, 10) === date);
    return found ? found.mood : null;
  });
  const moodSummary = weekMoods.filter(Boolean).length
    ? `Mostly ${mostCommonMood(weekMoods)}`
    : "No entries this week.";

  function mostCommonMood(moods) {
    const counts = {};
    moods.forEach(m => { if (m) counts[m] = (counts[m] || 0) + 1; });
    const max = Math.max(...Object.values(counts));
    const mood = Object.keys(counts).find(m => counts[m] === max);
    return MOODS.find(mo => mo.label === mood)?.emoji || mood || "-";
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)", padding: 16 }}>
      <div style={{ background: "#fff", padding: 36, borderRadius: 24, boxShadow: "0 4px 32px rgba(215,38,96,0.10)", minWidth: 320, maxWidth: 480, width: "100%", transition: "box-shadow 0.3s", margin: 8 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24, textAlign: "center", fontWeight: 700, letterSpacing: 1 }}>Emotional Health Journal</h2>
        {userLoading && <div style={{ color: "#d72660", marginBottom: 12 }}>Loading user data...</div>}
        {userError && <div style={{ color: "#d72660", marginBottom: 12 }}>{userError}</div>}
        <div style={{ marginBottom: 12, color: "#b71c4a", fontSize: 15 }}>
          <b>Age:</b> {userData.age} &nbsp; <b>Weight:</b> {userData.weight} kg &nbsp; <b>Cycle Length:</b> {userData.cycleLength} days
        </div>
        <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ color: "#b71c4a", fontWeight: 500 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} style={{ border: "1px solid #f8bbd0", borderRadius: 8, padding: 8, fontSize: 15, color: "#d72660", background: "#fff0f6", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#b71c4a", fontWeight: 500, marginBottom: 6, display: "block" }}>How do you feel today?</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              {MOODS.map(m => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setMood(m.label)}
                  style={{
                    fontSize: 30,
                    background: mood === m.label ? "linear-gradient(135deg, #f8bbd0 0%, #d72660 100%)" : "#fce4ec",
                    color: mood === m.label ? "#fff" : "#d72660",
                    border: mood === m.label ? "2px solid #d72660" : "1px solid #f8bbd0",
                    borderRadius: 12,
                    padding: "10px 18px",
                    cursor: "pointer",
                    boxShadow: mood === m.label ? "0 2px 8px #f8bbd0" : "none",
                    transition: "all 0.2s"
                  }}
                  aria-label={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <textarea value={entry} onChange={e => setEntry(e.target.value)} rows={4} placeholder="Write about your day..." style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #f8bbd0", marginBottom: 14, fontSize: 15, background: "#fff0f6", color: "#d72660", outline: "none", resize: "vertical" }} disabled={loading} />
          <button type="submit" style={{ width: "100%", background: "linear-gradient(90deg, #d72660 0%, #f8bbd0 100%)", color: "#fff", border: "none", borderRadius: 10, padding: 14, fontSize: 17, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px #f8bbd0", transition: "background 0.2s" }} disabled={loading || !entry || !mood}>{loading ? "Saving..." : "Add Entry"}</button>
        </form>
        {analysis && <div style={{ color: "#388e3c", marginBottom: 12, textAlign: "center" }}>NLP Analysis: {analysis}</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12, textAlign: "center" }}>{error}</div>}
        <div style={{ marginBottom: 22 }}>
          <h4 style={{ color: "#b71c4a", marginBottom: 10, textAlign: "center", fontWeight: 600 }}>Weekly Mood Trend</h4>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 8 }}>
            {weekMoods.map((m, i) => (
              <span key={i} style={{ fontSize: 28, transition: "font-size 0.2s" }}>{MOODS.find(mo => mo.label === m)?.emoji || "-"}</span>
            ))}
          </div>
          <div style={{ color: "#b71c4a", fontSize: 15, textAlign: "center" }}>{moodSummary}</div>
        </div>
        <div>
          <h4 style={{ color: "#b71c4a", marginBottom: 10, textAlign: "center", fontWeight: 600 }}>Previous Entries</h4>
          <ul style={{ listStyle: "none", padding: 0, maxHeight: 260, overflowY: "auto" }}>
            {entries.map((e, i) => (
              <li key={i} style={{ background: "linear-gradient(135deg, #f8bbd0 0%, #fff0f6 100%)", borderRadius: 16, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px #f8bbd0", transition: "box-shadow 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 32, marginRight: 2 }}>{MOODS.find(mo => mo.label === e.mood)?.emoji || ""}</span>
                  <div>
                    <div style={{ fontSize: 14, color: "#b71c4a", fontWeight: 500 }}>{(e.date || e.created_at || "").slice(0, 10)}</div>
                    <div style={{ color: "#d72660", fontSize: 15, marginTop: 2 }}>{e.text}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(e.id)} style={{ background: "#fff", color: "#d72660", border: "1px solid #d72660", borderRadius: 8, padding: "7px 14px", fontSize: 15, cursor: "pointer", marginLeft: 12, fontWeight: 600, transition: "background 0.2s, color 0.2s" }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Journal;