"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address.";
    if (form.phone && !/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = "Please enter a valid phone number.";
    if (form.message.trim().length < 10) e.message = "Please add a few more details (at least 10 characters).";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setSubmitError("Couldn't send your message — please call us instead on 01702 231 067.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: "#E9F6EE", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={26} color="#1F7A45" />
        </div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19, marginBottom: 6 }}>Message sent</h2>
        <p style={{ color: "#4A6478", fontSize: 14 }}>We&apos;ll get back to you as soon as we can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Your name" value={form.name} error={errors.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label="Email address" type="email" value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} />
      <Field label="Phone (optional)" type="tel" value={form.phone} error={errors.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <label>
        <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Message</span>
        <textarea
          rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="focus-ring"
          style={{ width: "100%", padding: "13px 14px", borderRadius: 12, fontSize: 15, fontFamily: "inherit", resize: "vertical", border: errors.message ? "2px solid #E08A8A" : "2px solid #DCEAF3" }}
        />
        {errors.message && <span style={{ display: "block", color: "#B3261E", fontSize: 12.5, marginTop: 5 }}>{errors.message}</span>}
      </label>
      {submitError && (
        <div style={{ background: "#FDECEC", color: "#B3261E", fontSize: 13.5, padding: "12px 14px", borderRadius: 12 }}>{submitError}</div>
      )}
      <button type="submit" disabled={submitting} className="focus-ring" style={{
        background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 999, padding: "14px",
        fontWeight: 700, fontSize: 15, cursor: submitting ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.7 : 1,
      }}>
        {submitting && <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />}
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", error }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="focus-ring"
        style={{ width: "100%", padding: "13px 14px", borderRadius: 12, fontSize: 15, fontFamily: "inherit", border: error ? "2px solid #E08A8A" : "2px solid #DCEAF3" }}
      />
      {error && <span style={{ display: "block", color: "#B3261E", fontSize: 12.5, marginTop: 5 }}>{error}</span>}
    </label>
  );
}
