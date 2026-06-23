"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

export default function HomeHero({ heroVideoUrl }) {
  return (
    <section style={{
      position: "relative", overflow: "hidden", padding: "56px 20px 64px",
      background: heroVideoUrl ? "#0F1E2B" : "linear-gradient(180deg, #F2F8FC 0%, #FFFFFF 100%)",
      minHeight: 420, display: "flex", alignItems: "center",
    }}>
      {heroVideoUrl && (
        <>
          <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,30,43,0.55)", zIndex: 1 }} />
        </>
      )}

      <div style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto", textAlign: "center", width: "100%" }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(30px, 6vw, 46px)",
          lineHeight: 1.12, marginBottom: 16, color: heroVideoUrl ? "#fff" : "#142433",
        }}>
          Dentist in Hullbridge, Essex
        </h1>
        <p style={{ fontSize: 16.5, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 28px", color: heroVideoUrl ? "#E3EEF5" : "#3D5266" }}>
          Independent dental care on Ferry Road — gentle, straightforward, and close to home.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/book" className="focus-ring" style={{
            background: "#2F7FB3", color: "#fff", fontWeight: 700, fontSize: 15.5,
            padding: "14px 26px", borderRadius: 999, textDecoration: "none",
          }}>
            Book Online
          </Link>
          <a href="tel:+441702231067" className="focus-ring" style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            background: heroVideoUrl ? "rgba(255,255,255,0.12)" : "#fff",
            color: heroVideoUrl ? "#fff" : "#142433", fontWeight: 700, fontSize: 15.5,
            padding: "14px 26px", borderRadius: 999,
            border: heroVideoUrl ? "2px solid rgba(255,255,255,0.5)" : "2px solid #6FB6E0",
          }}>
            <Phone size={16} /> 01702 231 067
          </a>
        </div>
      </div>
    </section>
  );
}
