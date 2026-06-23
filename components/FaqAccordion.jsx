"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqAccordion({ faqs }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {faqs.map((faq) => (
        <div key={faq.id} style={{ border: "1px solid #E3EEF5", borderRadius: 14, overflow: "hidden" }}>
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            aria-expanded={openId === faq.id}
            className="focus-ring"
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, padding: "16px 18px", background: openId === faq.id ? "#F2F8FC" : "#fff",
              border: "none", cursor: "pointer", textAlign: "left",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: "#142433" }}>{faq.question}</span>
            <ChevronDown
              size={18} color="#6FB6E0"
              style={{ flexShrink: 0, transform: openId === faq.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            />
          </button>
          {openId === faq.id && (
            <div style={{ padding: "0 18px 16px", fontSize: 14.5, color: "#4A6478", lineHeight: 1.7 }}>
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
