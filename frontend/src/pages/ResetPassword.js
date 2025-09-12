import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import * as api from "../api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      // For now, we'll just show a success message since we don't have a reset password endpoint yet
      // In a real implementation, you would call an API endpoint to reset the password
      setMessage("Password reset functionality will be implemented soon. For now, please contact support if you need to reset your password.");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
        <div style={{ background: "#fff", padding: 36, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minWidth: 340, maxWidth: 500, textAlign: "center" }}>
          <h2 style={{ color: "#d72660", marginBottom: 24 }}>Invalid Reset Link</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" style={{ color: "#d72660", textDecoration: "none", fontWeight: "bold" }}>
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

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
            <label style={{ display: "block", marginBottom: 6, color: "#555" }}>New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 6, 
                border: "1px solid #ccc",
                fontSize: 16
              }} 
              disabled={loading}
              placeholder="Enter your new password"
              minLength={6}
            />
          </div>
          
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 6, 
                border: "1px solid #ccc",
                fontSize: 16
              }} 
              disabled={loading}
              placeholder="Confirm your new password"
              minLength={6}
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        
        <div style={{ textAlign: "center", color: "#555" }}>
          Remember your password? <Link to="/login" style={{ color: "#d72660", textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
