"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ServiceFaqAccordion({ faqs }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {faqs.map((f, i) => (
        <div key={i} style={{ border: "1px solid #E3EEF5", borderRadius: 14, overflow: "hidden" }}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            className="focus-ring"
            aria-expanded={openFaq === i}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, padding: "16px 18px", background: openFaq === i ? "#F2F8FC" : "#fff",
              border: "none", cursor: "pointer", textAlign: "left",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>{f.question}</span>
            <ChevronDown size={18} color="#6FB6E0" style={{
              flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s",
            }} />
          </button>
          {openFaq === i && (
            <div style={{ padding: "0 18px 16px", fontSize: 14.5, lineHeight: 1.65, color: "#4A6478" }}>
              {f.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
