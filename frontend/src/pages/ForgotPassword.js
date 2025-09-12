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
      setError("Please enter your email address.");
      return;
    }
    
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      const response = await api.forgotPassword({ email });
      if (response.reset_link) {
        // If reset link is provided directly (email not configured or failed)
        setMessage(
          <div>
            <p>{response.message}</p>
            <p style={{ marginTop: 10, padding: 10, background: "#f8f9fa", borderRadius: 6, border: "1px solid #dee2e6" }}>
              <strong>Reset Link:</strong><br />
              <a href={response.reset_link} target="_blank" rel="noopener noreferrer" style={{ color: "#d72660", wordBreak: "break-all" }}>
                {response.reset_link}
              </a>
            </p>
            {response.note && <p style={{ fontSize: 14, color: "#666", marginTop: 10 }}>{response.note}</p>}
          </div>
        );
      } else {
        // Normal success message
        setMessage("Password reset link sent to your email. Please check your inbox and follow the instructions to reset your password.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <div style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340, maxWidth: 500 }}>
        <h2 style={{ color: "#d72660", marginBottom: 24, textAlign: "center" }}>Reset Your Password</h2>
        
        {message && (
          <div style={{ 
            color: "#28a745", 
            marginBottom: 20, 
            padding: 12, 
            background: "#d4edda", 
            border: "1px solid #c3e6cb", 
            borderRadius: 6,
            textAlign: "center"
          }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: "#d72660", 
            marginBottom: 20, 
            padding: 12, 
            background: "#f8d7da", 
            border: "1px solid #f5c6cb", 
            borderRadius: 6,
            textAlign: "center"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 6, 
                border: "1px solid #ccc",
                fontSize: 16
              }} 
              disabled={loading}
              placeholder="Enter your email address"
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              width: "100%", 
              background: "#d72660", 
              color: "#fff", 
              border: "none", 
              borderRadius: 6, 
              padding: 12, 
              fontSize: 16, 
              cursor: loading ? "not-allowed" : "pointer", 
              marginBottom: 20,
              opacity: loading ? 0.7 : 1
            }} 
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <div style={{ textAlign: "center", color: "#555" }}>
          Remember your password? <Link to="/login" style={{ color: "#d72660", textDecoration: "none" }}>Sign in</Link>
        </div>
        
        <div style={{ textAlign: "center", marginTop: 12, color: "#555" }}>
          Don't have an account? <Link to="/signup" style={{ color: "#d72660", textDecoration: "none" }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;