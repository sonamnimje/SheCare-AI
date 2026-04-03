import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api";

const Profile = () => {
  const [profile, setProfile] = useState({ name: "", email: "", age: "", weight: "", cycleLength: "", bio: "" });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    setLoading(true);
    setError("");
    api.getProfile()
      .then(res => {
        setProfile({ ...res, name: res.full_name || "", cycleLength: res.cycle_length });
        setForm({ ...res, name: res.full_name || "", cycleLength: res.cycle_length });
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm(profile);
  };

  const handleSave = e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    const payload = {
      ...form,
      full_name: form.name,
      cycle_length: form.cycleLength,
    };
    delete payload.cycleLength;
    api.put("/profile", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        setProfile({ ...res.data, name: res.data.full_name || "", cycleLength: res.data.cycle_length });
        setForm({ ...res.data, name: res.data.full_name || "", cycleLength: res.data.cycle_length });
        setEditing(false);
      })
      .catch(() => setError("Failed to update profile."))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("shecare_user");
    localStorage.removeItem("shecare_token");
    navigate("/login");
  };

  const handleDelete = () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("shecare_token");
    api.del("/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(() => {
        localStorage.removeItem("shecare_user");
        localStorage.removeItem("shecare_token");
        navigate("/signup");
      })
      .catch(() => setError("Failed to delete account."))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)", padding: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          background: "#fff",
          padding: 36,
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          minWidth: 340,
          maxWidth: 600,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 32
        }}
      >
        {/* Profile Avatar Circle */}
        <div
          style={{
            minWidth: 120,
            minHeight: 120,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#ffe0ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(215,38,96,0.08)",
            border: "4px solid #d72660",
            fontSize: 64,
            marginRight: 0,
            marginLeft: 0,
            userSelect: "none"
          }}
        >
          {/* You can replace this emoji with an <img src="..."/> if you want */}
          <span role="img" aria-label="profile">👧</span>
        </div>

        {/* Profile Details */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#d72660", marginBottom: 24, textAlign: "left" }}>My Profile</h2>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: "#d72660", marginBottom: 12 }}>{error}</div>}
          {!editing ? (
            <div>
              <div style={{ marginBottom: 16 }}><b>Name:</b> {profile.name}</div>
              <div style={{ marginBottom: 16 }}><b>Email:</b> {profile.email}</div>
              <div style={{ marginBottom: 16 }}><b>Age:</b> {profile.age}</div>
              <div style={{ marginBottom: 16 }}><b>Weight:</b> {profile.weight} kg</div>
              <div style={{ marginBottom: 16 }}><b>Cycle Length:</b> {profile.cycleLength || "-"} days</div>
              <div style={{ marginBottom: 24 }}><b>Bio:</b> {profile.bio}</div>
              <button onClick={handleEdit} style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", width: "100%", marginBottom: 10 }}>Edit Profile</button>
              <button onClick={handleLogout} style={{ background: "#fce4ec", color: "#d72660", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", width: "100%", marginBottom: 10 }}>Logout</button>
              <button onClick={() => setShowDelete(true)} style={{ background: "#fff0f6", color: "#d72660", border: "1px solid #d72660", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", width: "100%" }}>Delete Account</button>
              {showDelete && (
                <div style={{ marginTop: 16, background: "#fff0f6", padding: 12, borderRadius: 8 }}>
                  <div style={{ color: "#d72660", marginBottom: 8 }}>Are you sure you want to delete your account? This cannot be undone.</div>
                  <button onClick={handleDelete} style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontSize: 15, cursor: "pointer", marginRight: 8 }}>Yes, Delete</button>
                  <button onClick={() => setShowDelete(false)} style={{ background: "#fce4ec", color: "#d72660", border: "none", borderRadius: 6, padding: 10, fontSize: 15, cursor: "pointer" }}>Cancel</button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Name</label>
                <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Email</label>
                <input name="email" value={form.email} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Age</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Weight (kg)</label>
                <input name="weight" type="number" value={form.weight} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Cycle Length (days)</label>
                <input name="cycleLength" type="number" value={form.cycleLength || ""} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#555" }}>Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", flex: 1 }}>Save</button>
                <button type="button" onClick={handleCancel} style={{ background: "#fce4ec", color: "#d72660", border: "none", borderRadius: 6, padding: 12, fontSize: 16, cursor: "pointer", flex: 1 }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;