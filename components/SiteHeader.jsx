"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Services", href: "/services" },
  { label: "Why Choose Us", href: "/why-choose-us" },
  { label: "Our Prices", href: "/our-prices" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E3EEF5" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* ===== Logo — left aligned =====
            Drop the real logo at public/images/logo.png and it will
            show automatically. Falls back to a drawn tooth icon if
            the file isn't there yet. */}
        <Link href="/" className="focus-ring" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#142433" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 999, border: "2px solid #6FB6E0", background: "#F2F8FC",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden",
          }}>
            <img
              src="/images/logo.png"
              alt="Hullbridge Dental Clinic logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#142433" strokeWidth="1.6" style={{ display: "none" }}>
              <path d="M12 21c-1.2 0-1.8-3.6-2.7-3.6-1.1 0-1.5 1.7-2.6 1.4C5 18.4 4 15.8 4 12.8 4 7.9 6.7 4 10 4c1 0 1.6.6 2 .6.4 0 1-.6 2-.6 3.3 0 6 3.9 6 8.8 0 3-1 5.6-2.7 6 -1.1.3-1.5-1.4-2.6-1.4-.9 0-1.5 3.6-2.7 3.6Z" />
            </svg>
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em" }}>
              Hullbridge Dental Clinic
            </div>
            <div style={{ fontSize: 12, color: "#4A6478", fontWeight: 500 }}>An Independent Dental Surgery</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="desktop-nav" style={{ display: "none" }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="focus-ring" style={{
              textDecoration: "none", color: pathname === l.href ? "#2F7FB3" : "#142433",
              fontWeight: 600, fontSize: 14.5,
            }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/book" className="focus-ring cta-desktop" style={{
            display: "none", textDecoration: "none", background: "#2F7FB3", color: "#fff",
            fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 999,
          }}>
            Book Appointment
          </Link>
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="focus-ring hamburger-btn"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {menuOpen ? <X size={26} color="#142433" /> : (
              <>
                <span style={{ width: 26, height: 3, background: "#2F7FB3", borderRadius: 2 }} />
                <span style={{ width: 26, height: 3, background: "#2F7FB3", borderRadius: 2 }} />
                <span style={{ width: 26, height: 3, background: "#2F7FB3", borderRadius: 2 }} />
              </>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile" style={{ borderTop: "1px solid #E3EEF5", padding: "8px 20px 20px" }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="focus-ring" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              textDecoration: "none", color: "#142433", fontWeight: 600, fontSize: 16,
              padding: "14px 4px", borderBottom: "1px solid #F2F8FC",
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/book" onClick={() => setMenuOpen(false)} className="focus-ring" style={{
            display: "block", textAlign: "center", textDecoration: "none", background: "#2F7FB3",
            color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px", borderRadius: 999, marginTop: 14,
          }}>
            Book Appointment
          </Link>
        </nav>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; gap: 28px; align-items: center; }
          .cta-desktop { display: inline-flex !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
