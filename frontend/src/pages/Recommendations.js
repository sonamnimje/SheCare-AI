import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getRecommendations } from "../api";

const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    type: "general",
    text: "Keep a water bottle nearby and aim for steady hydration through the day.",
    date: new Date().toISOString()
  },
  {
    id: 2,
    type: "wellness",
    text: "Take a 10-minute stretch or walk break to reset your energy and focus.",
    date: new Date().toISOString()
  },
  {
    id: 3,
    type: "nutrition",
    text: "Build meals around protein, fiber, and healthy fats to support steadier energy.",
    date: new Date().toISOString()
  },
  {
    id: 4,
    type: "mood",
    text: "If your mood feels low, try journaling for a few minutes or message someone you trust.",
    date: new Date().toISOString()
  },
  {
    id: 5,
    type: "cycle",
    text: "Track your cycle and symptoms regularly so you can spot patterns earlier.",
    date: new Date().toISOString()
  }
];

const MIN_RECOMMENDATIONS = 5;

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(true);

  useEffect(() => {
    console.log("Recommendations component mounted");
    fetchRecommendations();
  }, []);

  useEffect(() => {
    console.log("Recommendations state changed:", recommendations);
  }, [recommendations, loading]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setUsingMockData(true);
      console.log("Fetching recommendations...");
      const data = await getRecommendations();
      console.log("Recommendations received:", data);
      console.log("Setting recommendations state with:", data);
      if (Array.isArray(data) && data.length >= MIN_RECOMMENDATIONS) {
        setRecommendations(data);
        setUsingMockData(false);
      } else if (Array.isArray(data) && data.length > 0) {
        const combined = [...data];
        MOCK_RECOMMENDATIONS.forEach((item) => {
          if (combined.length < MIN_RECOMMENDATIONS) {
            const duplicate = combined.some(
              (entry) => entry.type === item.type && entry.text === item.text
            );
            if (!duplicate) {
              combined.push(item);
            }
          }
        });
        setRecommendations(combined.slice(0, Math.max(MIN_RECOMMENDATIONS, combined.length)));
        setUsingMockData(true);
      } else {
        setRecommendations(MOCK_RECOMMENDATIONS);
        setUsingMockData(true);
      }
      setError(null);
      console.log("State updated, recommendations count:", data.length);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Showing mock recommendations because live data could not be loaded.");
      console.log("Using mock recommendations:", MOCK_RECOMMENDATIONS);
      setRecommendations(MOCK_RECOMMENDATIONS);
      setUsingMockData(true);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      cycle: "🩸",        // Menstrual blood drop
      mood: "🧠",         // Brain for mood/mental health
      symptom: "🤒",      // Face with thermometer
      pcos: "🧬",         // DNA for PCOS
      engagement: "🎯",   // Target for engagement
      age: "🎂",          // Birthday cake for age
      nutrition: "🍉",    // Watermelon for nutrition
      wellness: "🧘",     // Person in lotus position for wellness
      seasonal: "🌸",     // Cherry blossom for seasonal
      achievement: "🥇",  // Gold medal for achievement
      motivation: "🚀",   // Rocket for motivation
      general: "✨"       // Sparkles for general
    };
    return icons[type] || "✨";
  };

  const getTypeColor = (type) => {
    const colors = {
      cycle: "#ff6b9d",
      mood: "#4ecdc4",
      symptom: "#ff9ff3",
      pcos: "#54a0ff",
      engagement: "#5f27cd",
      age: "#00d2d3",
      nutrition: "#ff9f43",
      wellness: "#10ac84",
      seasonal: "#48dbfb",
      achievement: "#ffd32a",
      motivation: "#ff6b6b",
      general: "#d72660"
    };
    return colors[type] || "#d72660";
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          textAlign: "center",
          color: "#d72660"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>Analyzing your health data...</div>
          <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>Generating personalized recommendations</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
      padding: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div className="shecare-main-content" style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        <h2 style={{
          color: "#d72660",
          marginBottom: 32,
          textAlign: "center",
          fontWeight: 700,
          letterSpacing: 1,
          fontSize: 30,
        }}>
          💡 Your Recommendations
        </h2>
        
        {error && (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            color: "#856404",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        {recommendations.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#666",
            padding: 40
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No recommendations yet</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>
              Start tracking your cycles, moods, and symptoms to get personalized insights!
            </div>
          </div>
        ) : (
          <>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              border: "1px solid #ffe0ec",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                🤖 AI-Powered Analysis
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Based on your {recommendations.length} health patterns and data
              </div>
              {usingMockData && (
                <div style={{ fontSize: 12, color: "#d72660", marginTop: 6, fontWeight: 600 }}>
                  Demo mode: displaying mock recommendations
                </div>
              )}
              <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                Debug: Showing {recommendations.length} recommendations
              </div>
            </div>

            <div style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              maxWidth: "1200px",
              margin: "0 auto"
            }}>
              {recommendations.map((rec, i) => {
                console.log(`Rendering recommendation ${i + 1}:`, rec);
                return (
                <motion.div
                  key={rec.id || i}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(215,38,96,0.15)" }}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 4px 16px rgba(215,38,96,0.10)",
                    border: `2px solid ${getTypeColor(rec.type)}20`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    minHeight: 100,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: getTypeColor(rec.type),
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 0.5
                  }}>
                    <span style={{ marginRight: 4 }}>{getTypeIcon(rec.type)}</span>{rec.type}
                  </div>
                  
                  <span style={{ 
                    color: "#333", 
                    fontSize: 16, 
                    fontWeight: 500, 
                    lineHeight: 1.6,
                    marginTop: 8
                  }}>
                    <span style={{ 
                      fontSize: 28, 
                      verticalAlign: "middle", 
                      marginRight: 12 
                    }}>
                      {getTypeIcon(rec.type)}
                    </span>
                    {rec.text}
                  </span>
                  
                  <div style={{ 
                    fontSize: 12, 
                    color: "#888", 
                    textAlign: "right", 
                    marginTop: 16, 
                    width: "100%",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 12
                  }}>
                    {new Date(rec.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </motion.div>
              )})}
            </div>

            <div style={{
              textAlign: "center",
              marginTop: 32,
              padding: 20,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #ffe0ec"
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                💡 Tips for better recommendations:
              </div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                • Track your cycles regularly • Log your moods and symptoms • Complete your profile • Take health assessments
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations; 