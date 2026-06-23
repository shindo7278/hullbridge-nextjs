"use client";

// ============================================================
// /admin/opening-hours — Weekly schedule + one-off exceptions
// ============================================================
// This is the single source of truth the SEO audit flagged as
// missing: opening hours set here automatically drive (1) what the
// booking calendar in /book offers as selectable days/times, and
// (2) what's displayed everywhere else on the site and in the
// LocalBusiness schema — so the site, Google, and the booking
// calendar can never disagree with each other again.
// ============================================================
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Loader2, Check, CalendarOff } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminOpeningHours() {
  const [hours, setHours] = useState([]); // one row per dayOfWeek, may have isOpen=false
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newException, setNewException] = useState({ date: "", isOpen: false, reason: "" });

  useEffect(() => { loadSchedule(); }, []);

  async function loadSchedule() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/opening-hours");
      const data = await res.json();
      // ensure every day 0-6 has a row, even if not yet configured
      const byDay = Object.fromEntries((data.hours || []).map((h) => [h.dayOfWeek, h]));
      setHours(DAYS.map((_, i) => byDay[i] || { dayOfWeek: i, isOpen: false, startTime: "09:00", endTime: "17:00" }));
      setExceptions(data.exceptions || []);
    } finally {
      setLoading(false);
    }
  }

  function updateDay(dayOfWeek, patch) {
    setHours((prev) => prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)));
  }

  async function saveSchedule() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function addException() {
    if (!newException.date) return;
    const res = await fetch("/api/admin/opening-hours/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newException),
    });
    if (res.ok) {
      setNewException({ date: "", isOpen: false, reason: "" });
      loadSchedule();
    }
  }

  async function removeException(id) {
    await fetch(`/api/admin/opening-hours/exceptions/${id}`, { method: "DELETE" });
    loadSchedule();
  }

  if (loading) {
    return (
      <div style={{ padding: 40, display: "flex", alignItems: "center", gap: 8, color: "#4A6478" }}>
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading schedule…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>Opening Hours</h1>
          <p style={{ fontSize: 13, color: "#7C93A6", marginTop: 2 }}>
            Controls both the booking calendar and the hours shown across the site.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
        {/* ===== Weekly schedule ===== */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E3EEF5", padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "#142433", marginBottom: 16 }}>Weekly schedule</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hours.map((h) => (
              <div key={h.dayOfWeek} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, width: 130, flexShrink: 0 }}>
                  <input
                    type="checkbox" checked={h.isOpen}
                    onChange={(e) => updateDay(h.dayOfWeek, { isOpen: e.target.checked })}
                  />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#142433" }}>{DAYS[h.dayOfWeek]}</span>
                </label>
                {h.isOpen ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="time" value={h.startTime}
                      onChange={(e) => updateDay(h.dayOfWeek, { startTime: e.target.value })}
                      style={{ padding: "7px 10px", borderRadius: 8, border: "2px solid #DCEAF3", fontSize: 13 }}
                    />
                    <span style={{ color: "#9CB0BF", fontSize: 13 }}>to</span>
                    <input
                      type="time" value={h.endTime}
                      onChange={(e) => updateDay(h.dayOfWeek, { endTime: e.target.value })}
                      style={{ padding: "7px 10px", borderRadius: 8, border: "2px solid #DCEAF3", fontSize: 13 }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "#B7C5D1" }}>Closed</span>
                )}
              </div>
            ))}
          </div>

          <button onClick={saveSchedule} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: 8, background: "#2F7FB3", color: "#fff",
            border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 13.5,
            cursor: "pointer", marginTop: 18,
          }}>
            {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <Check size={15} /> : <Save size={15} />}
            {saving ? "Saving…" : saved ? "Saved" : "Save Schedule"}
          </button>
        </div>

        {/* ===== One-off exceptions (holidays, closures) ===== */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E3EEF5", padding: 20 }}>
          <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "#142433", marginBottom: 4 }}>Holidays & one-off closures</h2>
          <p style={{ fontSize: 12.5, color: "#9CB0BF", marginBottom: 16 }}>
            Overrides the weekly schedule for a single date — e.g. a bank holiday or staff training day.
          </p>

          {exceptions.length === 0 && (
            <p style={{ fontSize: 13, color: "#9CB0BF", marginBottom: 14 }}>No exceptions set.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {exceptions.map((ex) => (
              <div key={ex.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#FDECEC", borderRadius: 10, padding: "10px 14px",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#142433" }}>
                  <CalendarOff size={14} color="#B3261E" />
                  {new Date(ex.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  {ex.reason && <span style={{ color: "#7C93A6" }}>— {ex.reason}</span>}
                </span>
                <button onClick={() => removeException(ex.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Trash2 size={15} color="#B3261E" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#4A6478", marginBottom: 5 }}>Date</span>
              <input
                type="date" value={newException.date}
                onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                style={{ padding: "9px 10px", borderRadius: 8, border: "2px solid #DCEAF3", fontSize: 13 }}
              />
            </label>
            <label style={{ display: "block", flex: 1, minWidth: 160 }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#4A6478", marginBottom: 5 }}>Reason (optional)</span>
              <input
                type="text" value={newException.reason} placeholder="e.g. Bank Holiday"
                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "2px solid #DCEAF3", fontSize: 13 }}
              />
            </label>
            <button onClick={addException} style={{
              display: "flex", alignItems: "center", gap: 6, background: "#142433", color: "#fff",
              border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
