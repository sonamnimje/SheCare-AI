import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
// ...existing code...
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PCOSChecker from "./pages/PCOSChecker";
import CycleTracker from "./pages/CycleTracker";
import Journal from "./pages/Journal";
// import Chatbot from "./pages/Chatbot";
import Recommendations from "./pages/Recommendations";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import OmniTextChatbot from "./pages/OmniTextChatbot";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("shecare_user");
    localStorage.removeItem("shecare_token");
    navigate("/login");
  };
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pcos-checker", label: "PCOS Checker" },
    { to: "/cycle-tracker", label: "Cycle Tracker" },
    { to: "/journal", label: "Journal" },
    { to: "/recommendations", label: "Recommendations" },
  ];
  return (
    <nav
      style={{
        padding: "10px 24px",
        borderBottom: "1px solid #ccc",
        background: "#fff0f6",
        display: "flex",
        alignItems: "center",
        gap: 0,
        minHeight: 64,
      }}
    >
      <div
        onClick={() => navigate("/profile")}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#ffe0ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #d72660",
          fontSize: 26,
          cursor: "pointer",
          marginRight: 32,
          userSelect: "none",
          transition: "box-shadow 0.2s",
          boxShadow: "0 2px 8px rgba(215,38,96,0.08)",
        }}
        title="Profile"
      >
        <span role="img" aria-label="profile">👧</span>
      </div>
      <div style={{ display: "flex", gap: 40, flex: 1, justifyContent: "center" }}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              color: location.pathname === link.to ? "#fff" : "#d72660",
              background: location.pathname === link.to ? "#d72660" : "transparent",
              fontWeight: "bold",
              fontSize: 22,
              textDecoration: "none",
              borderRadius: 8,
              padding: location.pathname === link.to ? "8px 18px" : undefined,
              transition: "all 0.2s"
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        style={{
          marginLeft: "auto",
          background: "#d72660",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 22px",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(215,38,96,0.08)",
          transition: "background 0.2s"
        }}
        title="Logout"
      >
        Logout
      </button>
    </nav>
  );
};

const Feature = ({ icon, title }) => (
  <motion.div
    whileHover={{ scale: 1.07, boxShadow: "0 4px 16px rgba(215,38,96,0.12)" }}
    style={{
      background: "#fce4ec",
      borderRadius: 12,
      padding: "18px 24px",
      minWidth: 120,
      textAlign: "center",
      fontSize: 20,
      color: "#d72660",
      fontWeight: 500,
      boxShadow: "0 2px 8px rgba(215,38,96,0.04)",
      marginBottom: 12,
      cursor: "pointer",
      transition: "box-shadow 0.2s"
    }}
  >
    <span style={{ fontSize: 28 }}>{icon}</span>
    <div>{title}</div>
  </motion.div>
);

function App() {
  const [showVoiceWidget, setShowVoiceWidget] = useState(false);
  const [voiceWidgetError, setVoiceWidgetError] = useState(null);
  const [voiceWidgetLoading, setVoiceWidgetLoading] = useState(true);
  const [micPermissionStatus, setMicPermissionStatus] = useState(null);
  const iframeTimeoutRef = useRef(null);

  // Check microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setMicPermissionStatus(result.state);
        return result.state === 'granted';
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Fallback: try to access microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        setMicPermissionStatus('granted');
        return true;
      }
      return null; // Can't check
    } catch (error) {
      setMicPermissionStatus('denied');
      return false;
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setMicPermissionStatus('granted');
      return true;
    } catch (error) {
      setMicPermissionStatus('denied');
      setVoiceWidgetError("Microphone permission is required for the voice agent. Please allow microphone access in your browser settings.");
      return false;
    }
  };

  // Monitor iframe loading state
  useEffect(() => {
    if (showVoiceWidget && voiceWidgetLoading) {
      // Additional check: if iframe loads but doesn't trigger onLoad
      const checkInterval = setInterval(() => {
        const iframe = document.querySelector('iframe[title="SheCare Voice Agent"]');
        if (iframe && iframe.contentWindow) {
          try {
            // Try to access iframe content (will fail if cross-origin, which is expected)
            // But if we can check it exists, it might be loaded
            if (iframe.contentDocument || iframe.contentWindow.document) {
              console.log("Iframe appears to be loaded");
              if (iframeTimeoutRef.current) {
                clearTimeout(iframeTimeoutRef.current);
                iframeTimeoutRef.current = null;
              }
              setVoiceWidgetLoading(false);
              clearInterval(checkInterval);
            }
          } catch (e) {
            // Cross-origin error is expected, ignore it
          }
        }
      }, 1000);

      return () => clearInterval(checkInterval);
    }
  }, [showVoiceWidget, voiceWidgetLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (iframeTimeoutRef.current) {
        clearTimeout(iframeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)" }}>
      <Router>
        <NavBar />

        {/* Microphone Icon Button */}
        <button
          onClick={async () => {
            setShowVoiceWidget(true);
            setVoiceWidgetError(null);
            setVoiceWidgetLoading(true);
            
            // Check and request microphone permission
            const hasPermission = await checkMicrophonePermission();
            if (hasPermission === false) {
              const granted = await requestMicrophonePermission();
              if (!granted) {
                setVoiceWidgetLoading(false);
                return;
              }
            }
            
            // Set a timeout in case iframe doesn't load
            if (iframeTimeoutRef.current) {
              clearTimeout(iframeTimeoutRef.current);
            }
            iframeTimeoutRef.current = setTimeout(() => {
              // Only show error if still loading
              if (voiceWidgetLoading) {
                setVoiceWidgetLoading(false);
                setVoiceWidgetError("Voice agent is taking too long to load. The service might be unavailable or your connection is slow. Please try again or check your internet connection.");
              }
            }, 20000); // 20 second timeout (increased from 10)
          }}
          style={{
            position: "fixed",
            bottom: 110,
            right: 32,
            background: "#fff",
            color: "#d72660",
            border: "2px solid #d72660",
            borderRadius: "50%",
            width: 56,
            height: 56,
            boxShadow: "0 2px 8px rgba(215,38,96,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            cursor: "pointer",
            zIndex: 1001
          }}
          title="Open Voice Agent"
        >
          <span role="img" aria-label="Microphone">🎤</span>
        </button>

        {/* Modal for Voice Agent */}
        {showVoiceWidget && (
          <>
            <div
              onClick={() => {
                setShowVoiceWidget(false);
                setVoiceWidgetError(null);
                setVoiceWidgetLoading(true);
              }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.25)",
                zIndex: 1999
              }}
            />
            <div
              style={{
                position: "fixed",
                top: 80,
                right: 40,
                width: 340,
                height: 480,
                maxWidth: "95vw",
                maxHeight: "90vh",
                background: "#ffe0ec",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                zIndex: 2000,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                border: "1px solid #eee",
                padding: 0,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "#d72660",
                  color: "#fff",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  fontWeight: 600,
                  fontSize: 20
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src="/logo1.png" alt="SheCare Logo" style={{ width: 60, height: 60, borderRadius: "50%" }} />
                  <span>SheCare Voice Agent</span>
                </div>
                <button
                  onClick={() => {
                    setShowVoiceWidget(false);
                    setVoiceWidgetError(null);
                    setVoiceWidgetLoading(true);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 28,
                    color: "#fff",
                    cursor: "pointer",
                    marginLeft: 8
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
              {voiceWidgetError ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 40,
                    textAlign: "center",
                    color: "#666"
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#d72660" }}>
                    Voice Agent Error
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 20 }}>
                    {voiceWidgetError}
                  </div>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 20, maxWidth: 280 }}>
                    Troubleshooting tips:
                    <ul style={{ textAlign: "left", marginTop: 8, paddingLeft: 20 }}>
                      <li>Check your internet connection</li>
                      <li>Try refreshing the page</li>
                      <li>Check browser console for errors</li>
                      <li>Verify microphone permissions</li>
                    </ul>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => {
                        setVoiceWidgetError(null);
                        setVoiceWidgetLoading(true);
                        // Reset and retry
                        if (iframeTimeoutRef.current) {
                          clearTimeout(iframeTimeoutRef.current);
                        }
                        iframeTimeoutRef.current = setTimeout(() => {
                          if (voiceWidgetLoading) {
                            setVoiceWidgetLoading(false);
                            setVoiceWidgetError("Voice agent is taking too long to load. The service might be unavailable or your connection is slow. Please try again or check your internet connection.");
                          }
                        }, 20000);
                      }}
                      style={{
                        background: "#d72660",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 20px",
                        fontSize: 14,
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        window.open("https://omnidim.io/web_widget.js?secret_key=6561779da9e4d1df0383c9dae0d26d65", "_blank");
                      }}
                      style={{
                        background: "transparent",
                        color: "#d72660",
                        border: "2px solid #d72660",
                        borderRadius: 8,
                        padding: "10px 20px",
                        fontSize: 14,
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                  {voiceWidgetLoading && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                        zIndex: 10
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          border: "4px solid #ffe0ec",
                          borderTop: "4px solid #d72660",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }}
                      />
                      <div style={{ color: "#d72660", fontSize: 14, fontWeight: 500 }}>
                        Loading Voice Agent...
                      </div>
                    </div>
                  )}
                  <iframe
                    src="https://omnidim.io/voice-widget?secret=8b7c769b68400c46338749c7ef868d3e"
                    width="100%"
                    height="100%"
                    style={{
                      border: "none",
                      borderRadius: "0 0 16px 16px",
                      flex: 1,
                      minHeight: 0,
                      opacity: voiceWidgetLoading ? 0 : 1,
                      transition: "opacity 0.3s",
                      position: "relative",
                      zIndex: 1,
                      backgroundColor: "#fff"
                    }}
                    allow="microphone *; autoplay *; camera *"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={(e) => {
                      console.log("Voice widget iframe loaded successfully");
                      if (iframeTimeoutRef.current) {
                        clearTimeout(iframeTimeoutRef.current);
                        iframeTimeoutRef.current = null;
                      }
                      setVoiceWidgetLoading(false);
                      setVoiceWidgetError(null);
                    }}
                    onError={(e) => {
                      console.error("Voice widget iframe error:", e);
                      if (iframeTimeoutRef.current) {
                        clearTimeout(iframeTimeoutRef.current);
                        iframeTimeoutRef.current = null;
                      }
                      setVoiceWidgetLoading(false);
                      setVoiceWidgetError("Failed to load voice agent. Please check your internet connection and try again.");
                    }}
                    title="SheCare Voice Agent"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* OmniDimension SheBot floating chat icon */}
        <OmniTextChatbot />

        {/* Main App Routes */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pcos-checker" element={<PCOSChecker />} />
          <Route path="/cycle-tracker" element={<CycleTracker />} />
          <Route path="/journal" element={<Journal />} />
          {/* <Route path="/chatbot" element={<Chatbot />} /> */}
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </div>
  );
}

const Landing = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      position: "relative"
    }}
  >
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: 40,
        maxWidth: 600,
        textAlign: "center"
      }}
    >
      <img src="/logo1.png" alt="SheCare Logo" style={{ width: 340, marginBottom: 35 }} />
      <h1 style={{ fontSize: 36, color: "#d72660", marginBottom: 12 }}>SheCare AI</h1>
      <h2 style={{ fontWeight: 400, color: "#333", marginBottom: 24 }}>
        Empowering Women Through AI-Powered Health Insights
      </h2>
      <p style={{ color: "#555", fontSize: 18, marginBottom: 32 }}>
        SheCare AI is your smart, web-based wellness assistant. Get holistic, personalized health insights using the power of Machine Learning and Natural Language Processing. Understand your physical and emotional health—every day.
      </p>
      <Link to="/signup">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: "#d72660",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(215,38,96,0.08)"
          }}
        >
          Get Started
        </motion.button>
      </Link>
      <div className="feature-cards" style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
        <Feature icon="💡" title="Personalized Insights" />
        <Feature icon="🤖" title="Voice Agent" />
        <Feature icon="🩺" title="PCOS Risk Checker" />
        <Feature icon="📅" title="Cycle Tracker" />
        <Feature icon="📝" title="Emotional Journal" />
      </div>
    </motion.div>
    <footer
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#fff0f6",
        color: "#d72660",
        textAlign: "center",
        padding: 16,
        fontSize: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: "0 -2px 8px rgba(215,38,96,0.04)"
      }}
    >
      © {new Date().getFullYear()} SheCare AI. Empowering Women Everywhere.
    </footer>
  </div>
);

export default App;