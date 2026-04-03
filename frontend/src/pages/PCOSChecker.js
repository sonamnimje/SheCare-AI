import React, { useState, useEffect } from "react";
import * as api from "../api";

const cardStyle = {
  background: "#fff",
  borderRadius: 24,
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  padding: 40,
  maxWidth: 420,
  width: "100%",
  margin: "40px auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch"
};
const bgStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f8f9fa 0%, #ffe0ec 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
const headingStyle = {
  color: "#d72660",
  fontWeight: 700,
  fontSize: 28,
  textAlign: "center",
  marginBottom: 28
};
const labelStyle = {
  fontWeight: 500,
  color: "#444",
  marginBottom: 6,
  display: "block"
};
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #f8bbd0",
  borderRadius: 8,
  fontSize: 16,
  marginBottom: 18,
  outline: "none"
};
const symptomsWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 18
};
const symptomLabelStyle = (checked) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px 14px",
  borderRadius: 16,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  background: checked ? "#fce4ec" : "#fff",
  color: checked ? "#d72660" : "#b71c4a",
  border: checked ? "1.5px solid #d72660" : "1.5px solid #f8bbd0",
  marginBottom: 6
});
const buttonStyle = {
  width: "100%",
  background: "#d72660",
  color: "#fff",
  fontWeight: 600,
  fontSize: 18,
  border: "none",
  borderRadius: 10,
  padding: "12px 0",
  marginTop: 10,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(215,38,96,0.08)"
};
const resultStyle = (risk) => ({
  marginTop: 28,
  textAlign: "center",
  fontWeight: 600,
  fontSize: 20,
  color:
    risk === "High"
      ? "#d72660"
      : risk === "Moderate"
      ? "#b71c4a"
      : "#388e3c"
});

const PCOSChecker = () => {
  const [formData, setFormData] = useState({
    irregularPeriods: false,
    hirsutism: false,
    acne: false,
    hairLoss: false,
    weightGain: false,
    moodChanges: false,
    fertilityIssues: false,
    age: "",
    weight: "",
  });
  const [riskResult, setRiskResult] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user data (age, weight) on mount
  useEffect(() => {
    setLoading(true);
    setError("");
    api.getProfile()
      .then(res => {
        setFormData(prev => ({
          ...prev,
          age: res.age || "",
          weight: res.weight || ""
        }));
      })
      .catch(() => setError("Failed to load user data."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    // Prepare symptoms array for backend
    const symptoms = [
      formData.irregularPeriods && "irregularPeriods",
      formData.hirsutism && "hirsutism",
      formData.acne && "acne",
      formData.hairLoss && "hairLoss",
      formData.weightGain && "weightGain",
      formData.moodChanges && "moodChanges",
      formData.fertilityIssues && "fertilityIssues",
    ].filter(Boolean);
    const payload = {
      ...formData,
      symptoms,
    };
    api.post("/pcos-checker", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        setRiskResult(res.data.risk);
        setTips(res.data.tips || []);
      })
      .catch(() => setError("Failed to submit PCOS check."))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <h2 style={headingStyle}>Health Questionnaire</h2>
        {loading && <div style={{ color: "#d72660", marginBottom: 12 }}>Loading user data...</div>}
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        <label style={labelStyle} htmlFor="age">Age</label>
        <input
          style={inputStyle}
          type="number"
          name="age"
          id="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <label style={labelStyle} htmlFor="weight">Weight (kg)</label>
        <input
          style={inputStyle}
          type="number"
          name="weight"
          id="weight"
          value={formData.weight}
          onChange={handleChange}
          required
        />
        <div style={{ ...labelStyle, marginBottom: 8 }}>Symptoms</div>
        <div style={symptomsWrapStyle}>
          {[
            { name: "irregularPeriods", label: "Irregular periods" },
            { name: "hirsutism", label: "Excess hair growth" },
            { name: "acne", label: "Acne or oily skin" },
            { name: "weightGain", label: "Weight gain" },
            { name: "hairLoss", label: "Hair loss" },
            { name: "moodChanges", label: "Mood changes" },
            { name: "fertilityIssues", label: "Difficulty getting pregnant" },
          ].map((symptom) => (
            <label key={symptom.name} style={symptomLabelStyle(formData[symptom.name])}>
              <input
                type="checkbox"
                name={symptom.name}
                checked={formData[symptom.name]}
                onChange={handleChange}
                style={{ marginRight: 6 }}
              />
              {symptom.label}
            </label>
          ))}
        </div>
        <button type="submit" style={buttonStyle} disabled={loading}>Submit</button>
        {riskResult && (
          <div style={{ marginTop: 28 }}>
            <div style={resultStyle(riskResult)}>
              Your estimated PCOS Risk: <span style={{ textDecoration: "underline" }}>{riskResult}</span>
            </div>
            {tips.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ color: "#d72660", fontSize: 18, marginBottom: 12 }}>Recommendations:</h3>
                <ul style={{ textAlign: "left", paddingLeft: 20 }}>
                  {tips.map((tip, index) => (
                    <li key={index} style={{ 
                      color: "#444", 
                      marginBottom: 8, 
                      fontSize: 14,
                      lineHeight: 1.4
                    }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default PCOSChecker; 