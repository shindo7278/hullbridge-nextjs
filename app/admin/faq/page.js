"use client";

import { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2, Check, Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

const CATEGORIES = [
  "Booking",
  "Pricing",
  "Treatments",
  "Emergencies",
  "General",
];

export default function AdminFaq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null); // null=closed, {}=new, {...}=editing
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadFaqs(); }, []);

  async function loadFaqs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq");
      const data = await res.json();
      setFaqs(data.faqs || []);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingFaq({ question: "", answer: "", category: "General", isPublished: true });
  }

  function openEdit(faq) {
    setEditingFaq({ ...faq });
  }

  async function saveFaq() {
    setError(null);
    if (!editingFaq.question?.trim() || !editingFaq.answer?.trim()) {
      setError("Both question and answer are required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = !editingFaq.id;
      const res = await fetch(
        isNew ? "/api/admin/faq" : `/api/admin/faq/${editingFaq.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingFaq),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not save.");
        return;
      }
      setEditingFaq(null);
      loadFaqs();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(faq) {
    await fetch(`/api/admin/faq/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...faq, isPublished: !faq.isPublished }),
    });
    loadFaqs();
  }

  async function deleteFaq(id) {
    if (!confirm("Delete this FAQ permanently?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    loadFaqs();
  }

  // Group by category for display
  const grouped = faqs.reduce((acc, faq) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>FAQs</h1>
            <p style={{ fontSize: 13, color: "#7C93A6", marginTop: 2 }}>
              Published FAQs appear on the site with FAQPage schema — helping Google show them as rich results.
            </p>
          </div>
          <button onClick={openNew} style={{
            display: "flex", alignItems: "center", gap: 6, background: "#2F7FB3", color: "#fff",
            border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
          }}>
            <Plus size={16} /> New FAQ
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6478" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        )}

        {!loading && faqs.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center", color: "#7C93A6", fontSize: 14 }}>
            No FAQs yet — click &quot;New FAQ&quot; to add your first question.
          </div>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 800, color: "#7C93A6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              {category}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((faq) => (
                <div key={faq.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E3EEF5", overflow: "hidden" }}>
                  {/* Question row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
                    <button
                      onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                      style={{ flex: 1, background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {expandedId === faq.id
                        ? <ChevronUp size={16} color="#6FB6E0" style={{ flexShrink: 0 }} />
                        : <ChevronDown size={16} color="#6FB6E0" style={{ flexShrink: 0 }} />
                      }
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: "#142433" }}>{faq.question}</span>
                    </button>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => togglePublish(faq)} title={faq.isPublished ? "Published — click to hide" : "Draft — click to publish"} style={{
                        background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      }}>
                        {faq.isPublished
                          ? <Eye size={14} color="#1F7A45" />
                          : <EyeOff size={14} color="#9CB0BF" />
                        }
                      </button>
                      <button onClick={() => openEdit(faq)} style={{
                        background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      }}>
                        <Pencil size={14} color="#4A6478" />
                      </button>
                      <button onClick={() => deleteFaq(faq.id)} style={{
                        background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      }}>
                        <Trash2 size={14} color="#B3261E" />
                      </button>
                    </div>
                  </div>

                  {/* Answer (expanded) */}
                  {expandedId === faq.id && (
                    <div style={{ padding: "0 16px 16px 42px", fontSize: 14, color: "#4A6478", lineHeight: 1.65, borderTop: "1px solid #F2F8FC" }}>
                      <div style={{ paddingTop: 12 }}>{faq.answer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Add / Edit Modal ===== */}
      {editingFaq && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(20,36,51,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100,
        }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#142433" }}>
                {editingFaq.id ? "Edit FAQ" : "New FAQ"}
              </h2>
              <button onClick={() => { setEditingFaq(null); setError(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#7C93A6" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Category */}
              <div>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Category</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setEditingFaq({ ...editingFaq, category: cat })} style={{
                      padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: editingFaq.category === cat ? "#2F7FB3" : "#F2F8FC",
                      color: editingFaq.category === cat ? "#fff" : "#4A6478",
                      border: "none",
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <label>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Question</span>
                <input
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="How do I book an appointment?"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14 }}
                />
              </label>

              {/* Answer */}
              <label>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Answer</span>
                <textarea
                  rows={5}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="You can book online at hullbridgedentalclinic.co.uk/book or call us on 01702 231 067."
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
                />
              </label>

              {/* Published */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={editingFaq.isPublished}
                  onChange={(e) => setEditingFaq({ ...editingFaq, isPublished: e.target.checked })}
                />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#142433" }}>
                  Published (visible on site + included in Google schema)
                </span>
              </label>

              {error && (
                <div style={{ background: "#FDECEC", color: "#B3261E", fontSize: 13, padding: "10px 12px", borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <button onClick={saveFaq} disabled={saving} style={{
                background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10,
                padding: "13px", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
                {saving ? "Saving…" : editingFaq.id ? "Save Changes" : "Add FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
