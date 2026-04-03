import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.loginUser({ email, password });
      const { access_token } = res;
      localStorage.setItem("shecare_token", access_token);
      api.setAuthToken(access_token);
      // Optionally fetch user profile here
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      const backendMessage = err.response?.data?.detail;
      if (backendMessage) {
        setError(backendMessage);
      } else if (err.request) {
        setError("Cannot reach server. Please try again in a moment.");
      } else {
        setError("Login failed.");
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>Login to SheCare AI</h2>
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <button type="submit" style={{ width: "100%", background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", marginBottom: 12 }} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Link to="/forgot-password" style={{ color: "#d72660", textDecoration: "underline" }}>Forgot Password?</Link>
        </div>
        <div style={{ textAlign: "center", color: "#555" }}>
          Don't have an account? <Link to="/signup" style={{ color: "#d72660" }}>Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
