"use client";

// ============================================================
// /admin/messages — Contact Us form submissions
// ============================================================
// Shows every message saved via /api/contact, newest first, with an
// "email sent" indicator so staff can tell at a glance if the
// notification email actually went out for a given message (useful
// if email delivery is ever misconfigured — nothing is silently lost
// either way, since this list is the real source of truth).
// ============================================================
import React, { useState, useEffect } from "react";
import { Mail, Phone, Loader2, MailWarning, Check, Circle } from "lucide-react";

const STATUS_COLORS = {
  NEW: { bg: "#FFF6E0", text: "#7A5B00" },
  READ: { bg: "#E8EEFA", text: "#3251A8" },
  REPLIED: { bg: "#E9F6EE", text: "#1F7A45" },
};

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    setExpandedId(expandedId === id ? null : id);
    const msg = messages.find((m) => m.id === id);
    if (msg && msg.status === "NEW") {
      await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "READ" }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "READ" } : m)));
    }
  }

  const unreadCount = messages.filter((m) => m.status === "NEW").length;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>Messages</h1>
          {unreadCount > 0 && (
            <span style={{ background: "#2F7FB3", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
              {unreadCount} new
            </span>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6478" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center", color: "#7C93A6", fontSize: 14 }}>
            No messages yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E3EEF5", overflow: "hidden" }}>
              <button onClick={() => markAsRead(m.id)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "16px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {m.status === "NEW" && <Circle size={8} fill="#2F7FB3" color="#2F7FB3" style={{ flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#142433" }}>{m.name}</div>
                    <div style={{ fontSize: 12.5, color: "#9CB0BF" }}>
                      {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {!m.emailSentOk && (
                    <span title="Notification email failed to send" style={{ display: "flex" }}>
                      <MailWarning size={15} color="#B3261E" />
                    </span>
                  )}
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 999,
                    background: STATUS_COLORS[m.status]?.bg, color: STATUS_COLORS[m.status]?.text,
                  }}>
                    {m.status}
                  </span>
                </div>
              </button>

              {expandedId === m.id && (
                <div style={{ padding: "0 18px 18px", borderTop: "1px solid #F2F8FC" }}>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "#3D5266", margin: "14px 0" }}>{m.message}</p>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <a href={`mailto:${m.email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2F7FB3", textDecoration: "none", fontWeight: 700 }}>
                      <Mail size={14} /> {m.email}
                    </a>
                    {m.phone && (
                      <>
                        <a href={`tel:${m.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2F7FB3", textDecoration: "none", fontWeight: 700 }}>
                          <Phone size={14} /> {m.phone}
                        </a>
                        <a href={`https://wa.me/${m.phone.replace(/[\s\-()]/g, "")}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1F7A45", textDecoration: "none", fontWeight: 700 }}>
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                  {!m.emailSentOk && (
                    <p style={{ fontSize: 12, color: "#B3261E", marginTop: 10 }}>
                      Heads-up: the notification email for this message didn't send — but it's safely stored here.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
