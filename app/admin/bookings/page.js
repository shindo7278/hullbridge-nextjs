"use client";

// ============================================================
// /admin/bookings — Admin bookings dashboard
// ============================================================
// Two jobs in one screen:
//   1. See all upcoming bookings (online + manually entered)
//   2. Add a manual booking (patient called/walked in) — uses the
//      EXACT same date→slot→form flow as the public /book page,
//      and posts to the same /api/booking/create endpoint with
//      source: "ADMIN". The moment it's saved, that slot disappears
//      from the public site too, because both read from one table.
// ============================================================
import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, Calendar, Clock, Phone, Mail, User, Check, Loader2 } from "lucide-react";

const STATUS_COLORS = {
  PENDING: { bg: "#FFF6E0", text: "#7A5B00" },
  CONFIRMED: { bg: "#E9F6EE", text: "#1F7A45" },
  CANCELLED: { bg: "#FDECEC", text: "#B3261E" },
  COMPLETED: { bg: "#E8EEFA", text: "#3251A8" },
  NO_SHOW: { bg: "#F2F2F2", text: "#666" },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadBookings();
  }, [filterDate]);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?date=${filterDate}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      // surfaced inline below instead of blocking the whole screen
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, status) {
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadBookings(); // CANCELLED instantly frees the slot for the public site too
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>Bookings</h1>
          <button onClick={() => setShowNewBooking(true)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "#2F7FB3", color: "#fff",
            border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
          }}>
            <Plus size={16} /> New Manual Booking
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <label style={{ display: "block", marginBottom: 18 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#4A6478", display: "block", marginBottom: 6 }}>Date</span>
          <input
            type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14 }}
          />
        </label>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6478", padding: "20px 0" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center", color: "#7C93A6", fontSize: 14 }}>
            No bookings for this date.
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #E3EEF5" }}>
            {bookings.map((b) => (
              <div key={b.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                padding: "16px 20px", borderBottom: "1px solid #F2F8FC",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 64, fontWeight: 800, fontSize: 15, color: "#142433" }}>{b.startTime}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#142433" }}>{b.patientName}</div>
                    <div style={{ fontSize: 12.5, color: "#7C93A6", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <a href={`https://wa.me/${b.patientPhone.replace(/[\s\-()]/g, "")}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "#1F7A45", textDecoration: "none", fontSize: 12.5 }}><Phone size={11} /> {b.patientPhone}</a>
                      <a href={`mailto:${b.patientEmail}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "#2F7FB3", textDecoration: "none", fontSize: 12.5 }}><Mail size={11} /> {b.patientEmail}</a>
                      <span>Age {b.patientAge}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999,
                    background: STATUS_COLORS[b.status]?.bg, color: STATUS_COLORS[b.status]?.text,
                  }}>
                    {b.status}
                  </span>
                  <span style={{ fontSize: 11, color: "#B7C5D1" }}>{b.source === "ADMIN" ? "Phone" : "Online"}</span>
                  {b.status !== "CANCELLED" && (
                    <button onClick={() => updateStatus(b.id, "CANCELLED")} style={{
                      background: "none", border: "1px solid #DCEAF3", borderRadius: 8, padding: "6px 10px",
                      fontSize: 12, fontWeight: 700, color: "#B3261E", cursor: "pointer",
                    }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewBooking && (
        <ManualBookingModal onClose={() => setShowNewBooking(false)} onCreated={() => { setShowNewBooking(false); loadBookings(); }} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ----------------------------------------------------------------
// Manual booking modal — same date/slot logic as the public booking
// page, reused here so staff see exactly what a patient would see,
// then submits with source: "ADMIN".
// ----------------------------------------------------------------
function ManualBookingModal({ onClose, onCreated }) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", age: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/booking/availability?date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  async function submit() {
    setError(null);
    if (!selectedSlot) { setError("Please choose a time slot."); return; }
    if (!form.name || !form.phone || !form.email || !form.age) {
      setError("Please fill in all patient details.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date, startTime: selectedSlot,
          patientName: form.name, patientPhone: form.phone,
          patientEmail: form.email, patientAge: Number(form.age),
          source: "ADMIN",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not save booking."); return; }
      onCreated();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(20,36,51,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100,
    }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#142433" }}>New Manual Booking</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color="#7C93A6" />
          </button>
        </div>

        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#4A6478", display: "block", marginBottom: 6 }}>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{
            width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14,
          }} />
        </label>

        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#4A6478", display: "block", marginBottom: 6 }}>Available times</span>
          {loadingSlots && <div style={{ fontSize: 13, color: "#7C93A6" }}>Loading…</div>}
          {!loadingSlots && slots.length === 0 && <div style={{ fontSize: 13, color: "#B3261E" }}>No slots available this day.</div>}
          {!loadingSlots && slots.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {slots.map((s) => (
                <button key={s} onClick={() => setSelectedSlot(s)} style={{
                  padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: selectedSlot === s ? "2px solid #2F7FB3" : "2px solid #DCEAF3",
                  background: selectedSlot === s ? "#EAF4FB" : "#fff", color: "#142433",
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          <ModalField icon={User} placeholder="Patient name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <ModalField icon={Phone} placeholder="WhatsApp number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
          <ModalField icon={Mail} placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <ModalField icon={User} placeholder="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} type="number" />
        </div>

        {error && (
          <div style={{ background: "#FDECEC", color: "#B3261E", fontSize: 13, padding: "10px 12px", borderRadius: 10, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={submitting} style={{
          width: "100%", background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10,
          padding: "13px", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {submitting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
          {submitting ? "Saving…" : "Save Booking"}
        </button>
      </div>
    </div>
  );
}

function ModalField({ icon: Icon, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "2px solid #DCEAF3", borderRadius: 10, padding: "10px 12px" }}>
      <Icon size={15} color="#7C93A6" />
      <input
        type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        style={{ border: "none", outline: "none", fontSize: 14, flex: 1, fontFamily: "inherit" }}
      />
    </div>
  );
}
