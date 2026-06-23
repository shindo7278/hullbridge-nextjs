"use client";

import { useState, useMemo } from "react";
import { Search, Info } from "lucide-react";

export default function PricesSearch({ categories }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories
      .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.items.length > 0);
  }, [query, categories]);

  return (
    <>
      <div style={{ maxWidth: 380, margin: "0 auto" }}>
        <div style={{ position: "relative" }}>
          <Search size={17} color="#7C93A6" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a treatment…"
            className="focus-ring"
            style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: 999, border: "2px solid #DCEAF3", fontSize: 14.5, fontFamily: "inherit" }}
          />
        </div>
      </div>

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 0", textAlign: "left" }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#7C93A6", fontSize: 14.5 }}>
            No treatments match &quot;{query}&quot;. Call us on 01702 231 067 to ask directly.
          </p>
        )}

        {filtered.map((cat) => (
          <div key={cat.name} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{cat.name}</h2>
            <div style={{ background: "#F7FAFC", borderRadius: 16, overflow: "hidden" }}>
              {cat.items.map((item, i) => (
                <div key={item.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 18px", borderBottom: i < cat.items.length - 1 ? "1px solid #E3EEF5" : "none",
                }}>
                  <span style={{ fontSize: 14.5, color: "#3D5266" }}>{item.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{item.price}{item.suffix || ""}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, background: "#F2F8FC", borderRadius: 14, padding: "16px 18px", marginTop: 12, marginBottom: 8 }}>
          <Info size={18} color="#2F7FB3" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13.5, color: "#4A6478", lineHeight: 1.6 }}>
            Prices marked &quot;+&quot; depend on individual case complexity. You&apos;ll always receive a full written quotation after examination.
          </p>
        </div>
      </section>
    </>
  );
}
