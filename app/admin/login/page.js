"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }
      router.push("/admin/bookings");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#142433", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: "100%", maxWidth: 380 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F2F8FC", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Lock size={24} color="#2F7FB3" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: "#142433" }}>Clinic Admin</h1>
        <p style={{ fontSize: 13.5, color: "#7C93A6", marginBottom: 24 }}>Staff access only</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14.5 }} />
          </label>
          <label>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14.5 }} />
          </label>

          {error && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#FDECEC", color: "#B3261E", fontSize: 13, padding: "10px 12px", borderRadius: 10 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10, padding: "13px",
            fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginTop: 4,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
