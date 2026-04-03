import React, { useState, useEffect } from "react";
import * as api from "../api";

// Always treat yyyy-mm-dd as local date, never use new Date(str) directly!
function formatDate(date) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to ensure YYYY-MM-DD for API
function toIsoDate(str) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [d, m, y] = str.split("-");
    return `${y}-${m}-${d}`;
  }
  return str;
}

function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function getFertileAndOvulation(startDate, cycleLength = 28) {
  const ovulationDay = addDays(startDate, cycleLength - 14);
  const fertileStart = addDays(startDate, cycleLength - 19);
  const fertileEnd = addDays(startDate, cycleLength - 10);
  return { ovulationDay, fertileStart, fertileEnd };
}

function getNextPeriodDate(events, cycleLength) {
  if (!events.length) return null;
  const [year, month, day] = formatDate(events[0].start_date).split("-").map(Number);
  const lastStart = new Date(year, month - 1, day);
  lastStart.setHours(0, 0, 0, 0);
  lastStart.setDate(lastStart.getDate() + cycleLength);
  return formatDate(lastStart);
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CycleTracker = () => {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({ cycleLength: 28, age: "", weight: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  // Month navigation state
  const [displayYear, setDisplayYear] = useState(null);
  const [displayMonth, setDisplayMonth] = useState(null);

  // Load user data (cycleLength, age, weight) on mount
  useEffect(() => {
    setUserLoading(true);
    setUserError("");
    api.getProfile()
      .then(res => {
        setUserData({
          cycleLength: res.cycle_length || 28,
          age: res.age || "",
          weight: res.weight || ""
        });
      })
      .catch(() => setUserError("Failed to load user data."))
      .finally(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    // Set initial display month to latest entry or current month
    if (events.length > 0) {
      const [y, m] = formatDate(events[0].start_date).split("-").map(Number);
      setDisplayYear(y);
      setDisplayMonth(m - 1);
    } else {
      const today = new Date();
      setDisplayYear(today.getFullYear());
      setDisplayMonth(today.getMonth());
    }
  }, [events.length]);

  const fetchEntries = () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api
      .get("/cycle-tracker", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load cycle data."))
      .finally(() => setLoading(false));
  };

  const handleAddStartDate = (e) => {
    e.preventDefault();
    if (!startDate) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    // Convert to ISO 8601 datetime string (YYYY-MM-DDT00:00:00)
    const isoDate = toIsoDate(startDate);
    const payload = {
      start_date: isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate,
      end_date: null,
      notes: ""
    };
    console.log("Submitting payload:", payload); // Debug log
    api
      .post(
        "/cycle-tracker",
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )
      .then(() => {
        setStartDate("");
        fetchEntries();
      })
      .catch((err) => {
        setError("Failed to add period start date.");
        // Print backend error details
        if (err.response) {
          console.error("Backend error:", err.response.data);
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api
      .del(`/cycle-tracker/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      .then(() => fetchEntries())
      .catch(() => setError("Failed to delete period start date."))
      .finally(() => setLoading(false));
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  if (displayYear === null || displayMonth === null) return null;

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(new Date(displayYear, displayMonth, i + 1))
  );

  // --- Calculate period, ovulation, and fertile days for this month only ---
  const periodDates = new Set();
  const ovulationDates = new Set();
  const fertileDates = new Set();

  events.forEach((e) => {
    const start = formatDate(e.start_date);

    // Mark period days (5 days from start)
    for (let i = 0; i < 5; i++) {
      const day = addDays(start, i);
      if (day.startsWith(`${displayYear}-${String(displayMonth + 1).padStart(2, "0")}`)) {
        periodDates.add(day);
      }
    }

    // Calculate ovulation and fertile window for this cycle
    const { ovulationDay, fertileStart, fertileEnd } = getFertileAndOvulation(start, userData.cycleLength);

    if (ovulationDay.startsWith(`${displayYear}-${String(displayMonth + 1).padStart(2, "0")}`)) {
      ovulationDates.add(ovulationDay);
    }

    let fertile = new Date(fertileStart);
    const fertileEndDate = new Date(fertileEnd);
    while (fertile <= fertileEndDate) {
      const day = formatDate(fertile);
      if (day.startsWith(`${displayYear}-${String(displayMonth + 1).padStart(2, "0")}`)) {
        fertileDates.add(day);
      }
      fertile.setDate(fertile.getDate() + 1);
    }
  });

  const getDateColor = (date) => {
    if (periodDates.has(date)) return "#d72660";
    if (ovulationDates.has(date)) return "#66bb6a";
    if (fertileDates.has(date)) return "#42a5f5";
    return "#fce4ec";
  };

  const getTextColor = (date) => {
    if (periodDates.has(date) || ovulationDates.has(date) || fertileDates.has(date)) return "#fff";
    return "#d72660";
  };

  const nextPeriod = getNextPeriodDate(events, userData.cycleLength);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "#fff",
        padding: 36,
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        minWidth: 340,
        maxWidth: 480,
        textAlign: "center"
      }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>🌸 Cycle Tracker</h2>
        {userLoading && <div style={{ color: "#d72660", marginBottom: 12 }}>Loading user data...</div>}
        {userError && <div style={{ color: "#d72660", marginBottom: 12 }}>{userError}</div>}
        <div style={{ marginBottom: 12, color: "#b71c4a", fontSize: 15 }}>
          <b>Cycle Length:</b> {userData.cycleLength} days<br />
          <b>Age:</b> {userData.age} &nbsp; <b>Weight:</b> {userData.weight} kg
        </div>
        <form onSubmit={handleAddStartDate} style={{
          marginBottom: 18,
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="yyyy-mm-dd"
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />
          <button type="submit" style={{
            background: "#d72660",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 18px",
            fontSize: 16,
            cursor: "pointer"
          }} disabled={loading || !startDate}>
            Add
          </button>
        </form>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        {nextPeriod && (
          <div style={{ color: "#b71c4a", marginBottom: 12 }}>
            <b>Next Period Expected:</b> {nextPeriod}
          </div>
        )}
        <div style={{ marginBottom: 18 }}>
          <h4 style={{ color: "#b71c4a", marginBottom: 8 }}>📅 This Month</h4>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 8
          }}>
            <button onClick={handlePrevMonth} style={{
              background: "#fce4ec",
              border: "none",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 18,
              color: "#d72660",
              cursor: "pointer"
            }} aria-label="Previous Month">&lt;</button>
            <span style={{ fontWeight: "bold", fontSize: 18, color: "#1976d2" }}>
              {monthNames[displayMonth]} {displayYear}
            </span>
            <button onClick={handleNextMonth} style={{
              background: "#fce4ec",
              border: "none",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 18,
              color: "#d72660",
              cursor: "pointer"
            }} aria-label="Next Month">&gt;</button>
          </div>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: "center"
          }}>
            {calendarDays.map((day) => (
              <div key={day} style={{
                width: 32,
                height: 32,
                lineHeight: "32px",
                borderRadius: "50%",
                textAlign: "center",
                background: getDateColor(day),
                color: getTextColor(day),
                fontWeight: "bold"
              }}
                title={
                  periodDates.has(day) ? "Period" :
                    ovulationDates.has(day) ? "Ovulation" :
                      fertileDates.has(day) ? "Fertile Window" : ""
                }>
                {parseInt(day.slice(-2))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 14, textAlign: "left" }}>
            <div><span style={{ background: "#d72660", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>⬤</span> Period</div>
            <div><span style={{ background: "#66bb6a", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>⬤</span> Ovulation</div>
            <div><span style={{ background: "#42a5f5", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>⬤</span> Fertile Window</div>
          </div>
        </div>

        <div>
          <h4 style={{ color: "#b71c4a", marginBottom: 8 }}>📌 Your Entries</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((e, i) => (
              <li key={i} style={{
                background: "#fce4ec",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                color: "#b71c4a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>{formatDate(e.start_date)}</span>
                <button onClick={() => handleDelete(e.id)} style={{
                  background: "#d72660",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 14,
                  cursor: "pointer"
                }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;