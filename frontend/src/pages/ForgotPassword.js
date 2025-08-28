import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Replace with your API call for password reset
      await api.forgotPassword({ email });
      setMessage("Password reset link sent to your email.");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send reset link.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24 }}>Forgot Password</h2>
        {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: "#28a745", marginBottom: 12 }}>{message}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} disabled={loading} />
        </div>
        <button type="submit" style={{ width: "100%", background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", marginBottom: 12 }} disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
        <div style={{ textAlign: "center", color: "#555" }}>
          <Link to="/login" style={{ color: "#d72660" }}>Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
