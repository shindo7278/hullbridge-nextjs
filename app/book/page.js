"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Check, Loader2, AlertCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Booking Page — /book
 * Flow: pick a date → see open slots only → pick a slot → fill patient
 * form (name, WhatsApp, age, email) → confirm. Mirrors the exact flow
 * described in the brief: a slot taken online OR entered manually by
 * the admin disappears from this calendar immediately, because both
 * write to the same `bookings` table via the same /api/booking/* routes.
 *
 * This component expects two endpoints (see app/api/booking/):
 *   GET  /api/booking/availability?date=YYYY-MM-DD
 *   POST /api/booking/create
 */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function BookingPage() {
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState("date"); // date -> slot -> form -> confirmed
  const [form, setForm] = useState({ name: "", phone: "", email: "", age: "" });
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const cells = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);
    fetch(`/api/booking/availability?date=${toISODate(selectedDate)}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        if ((data.slots || []).length === 0) {
          setSlotsError(
            data.reason === "closed" || data.reason === "past-date"
              ? "We're closed on this day. Please pick another date."
              : "No times left on this day. Please pick another date."
          );
        }
      })
      .catch(() => setSlotsError("Couldn't load times right now. Please try again."))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  function pickDate(d) {
    if (!d || d < today) return;
    setSelectedDate(d);
    setStep("slot");
  }

  function pickSlot(s) {
    setSelectedSlot(s);
    setStep("form");
  }

  function validateForm() {
    const errs = [];
    if (form.name.trim().length < 2) errs.push("Please enter your full name.");
    const digits = form.phone.replace(/[\s\-()]/g, "");
    if (!/^\+?\d{10,15}$/.test(digits)) errs.push("Please enter a valid WhatsApp number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push("Please enter a valid email address.");
    const age = Number(form.age);
    if (!age || age < 0 || age > 120) errs.push("Please enter a valid age.");
    return errs;
  }

  async function submitBooking() {
    const errs = validateForm();
    setFormErrors(errs);
    if (errs.length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: toISODate(selectedDate),
          startTime: selectedSlot,
          patientName: form.name,
          patientPhone: form.phone,
          patientEmail: form.email,
          patientAge: Number(form.age),
          source: "ONLINE",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 409 = someone else just took this exact slot
        setSubmitError(data.error || "Something went wrong. Please try again.");
        if (res.status === 409) {
          setStep("slot");
          setSelectedSlot(null);
          // refresh slots so the now-taken time disappears
          const refreshed = await fetch(`/api/booking/availability?date=${toISODate(selectedDate)}`).then(r => r.json());
          setSlots(refreshed.slots || []);
        }
        return;
      }
      setStep("confirmed");
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function changeMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  return (
    <>
      <SiteHeader />
      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#142433", background: "#fff", minHeight: "70vh" }}>
      <style>{`
        .focus-ring:focus-visible { outline: 3px solid #2F7FB3; outline-offset: 2px; }
        button { font-family: inherit; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px 60px" }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(24px, 5vw, 30px)",
          textAlign: "center", marginBottom: 6,
        }}>
          Book an appointment
        </h1>
        <p style={{ textAlign: "center", color: "#4A6478", fontSize: 14.5, marginBottom: 28 }}>
          Hullbridge Dental Clinic — 130 Ferry Road
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {["date", "slot", "form", "confirmed"].map((s, i) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: 999,
              background: ["date","slot","form","confirmed"].indexOf(step) >= i ? "#2F7FB3" : "#DCEAF3",
            }} />
          ))}
        </div>

        {/* ===== STEP 1: Calendar ===== */}
        {(step === "date" || step === "slot" || step === "form") && (
          <div style={{
            background: "#F2F8FC", borderRadius: 20, padding: 20, marginBottom: step !== "date" ? 16 : 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button onClick={() => changeMonth(-1)} className="focus-ring" aria-label="Previous month" style={{
                background: "#fff", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={() => changeMonth(1)} className="focus-ring" aria-label="Next month" style={{
                background: "#fff", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {WEEKDAYS.map((w) => (
                <div key={w} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "#7C93A6" }}>{w}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((d, i) => {
                const isPast = d && d < today;
                const isSelected = d && selectedDate && d.getTime() === selectedDate.getTime();
                return (
                  <button
                    key={i}
                    disabled={!d || isPast}
                    onClick={() => pickDate(d)}
                    className="focus-ring"
                    style={{
                      aspectRatio: "1/1", border: "none", borderRadius: 10,
                      background: isSelected ? "#2F7FB3" : d && !isPast ? "#fff" : "transparent",
                      color: isSelected ? "#fff" : isPast ? "#C2D2DD" : "#142433",
                      cursor: d && !isPast ? "pointer" : "default",
                      fontWeight: isSelected ? 700 : 500, fontSize: 14,
                    }}
                  >
                    {d ? d.getDate() : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== STEP 2: Time slots ===== */}
        {(step === "slot" || step === "form") && selectedDate && (
          <div style={{ marginBottom: step === "form" ? 16 : 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#4A6478", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={15} /> Available times — {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>

            {slotsLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6478", fontSize: 14, padding: "12px 0" }}>
                <Loader2 size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} /> Loading times…
              </div>
            )}

            {!slotsLoading && slotsError && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, background: "#FDECEC", color: "#B3261E",
                fontSize: 13.5, padding: "12px 14px", borderRadius: 12,
              }}>
                <AlertCircle size={16} /> {slotsError}
              </div>
            )}

            {!slotsLoading && !slotsError && step === "slot" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {slots.map((s) => (
                  <button key={s} onClick={() => pickSlot(s)} className="focus-ring" style={{
                    padding: "12px 0", borderRadius: 10, border: "2px solid #DCEAF3", background: "#fff",
                    fontWeight: 700, fontSize: 14.5, cursor: "pointer", color: "#142433",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {step === "form" && selectedSlot && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#E9F6EE", borderRadius: 12, padding: "12px 16px",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1F7A45" }}>
                  {selectedSlot} on {selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <button onClick={() => setStep("slot")} className="focus-ring" style={{
                  background: "none", border: "none", color: "#1F7A45", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "underline",
                }}>
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 3: Patient form ===== */}
        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Jane Smith" />
            <Field label="WhatsApp number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="07123 456789" type="tel" />
            <Field label="Email address" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="jane@email.com" type="email" />
            <Field label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} placeholder="34" type="number" />

            {formErrors.length > 0 && (
              <div style={{ background: "#FDECEC", color: "#B3261E", fontSize: 13.5, padding: "12px 14px", borderRadius: 12 }}>
                {formErrors.map((e) => <div key={e}>{e}</div>)}
              </div>
            )}
            {submitError && (
              <div style={{ background: "#FDECEC", color: "#B3261E", fontSize: 13.5, padding: "12px 14px", borderRadius: 12 }}>
                {submitError}
              </div>
            )}

            <button onClick={submitBooking} disabled={submitting} className="focus-ring" style={{
              background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 999, padding: "15px",
              fontWeight: 700, fontSize: 15.5, cursor: submitting ? "default" : "pointer", marginTop: 6,
              opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {submitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {submitting ? "Confirming…" : "Confirm Appointment"}
            </button>
          </div>
        )}

        {/* ===== STEP 4: Confirmed ===== */}
        {step === "confirmed" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, background: "#E9F6EE", margin: "0 auto 18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check size={30} color="#1F7A45" />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
              Request received
            </h2>
            <p style={{ color: "#4A6478", fontSize: 14.5, lineHeight: 1.6, marginBottom: 4 }}>
              {selectedSlot} on {selectedDate?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p style={{ color: "#4A6478", fontSize: 14, lineHeight: 1.6 }}>
              We'll confirm by WhatsApp or email shortly.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
      <SiteFooter />
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring"
        style={{
          width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #DCEAF3",
          fontSize: 15, fontFamily: "inherit", color: "#142433",
        }}
      />
    </label>
  );
}
