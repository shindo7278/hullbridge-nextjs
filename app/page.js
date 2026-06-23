import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HomeHero from "@/components/HomeHero";
import { Phone, ShieldCheck, Sparkles, Stethoscope, Star } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Reads the admin-controlled hero video URL straight from the
// database on every request, so uploading/removing it in
// /admin/homepage takes effect immediately with no caching step.
async function getClinicSettings() {
  try {
    return await prisma.clinicSettings.findUnique({ where: { id: 1 } });
  } catch {
    return null; // DB not connected yet — page still renders with the plain background
  }
}

const SERVICES = [
  { icon: ShieldCheck, title: "Preventative Dentistry", copy: "Scale and polish, fluoride advice, and the everyday habits that keep problems small." },
  { icon: Stethoscope, title: "Restorative Dentistry", copy: "Fillings, crowns, bridges and dentures, fitted with care." },
  { icon: Sparkles, title: "Cosmetic & Consultation", copy: "Whitening, veneers and honest guidance on specialist treatments." },
];

const REVIEWS = [
  { name: "Ché Sadler", text: "They explained exactly what was needed and put me at ease. Lovely staff." },
  { name: "Ashleigh Halil", text: "Hassiba and her team were friendly and professional throughout. Would 100% recommend." },
  { name: "Sam Bambury", text: "My five year old is in love with the receptionist after one visit." },
];

export default async function HomePage() {
  const settings = await getClinicSettings();

  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero heroVideoUrl={settings?.heroVideoUrl || null} />

        {/* Services */}
        <section style={{ padding: "64px 20px", maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 34px)", textAlign: "center", marginBottom: 36 }}>
            What we offer
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {SERVICES.map((s) => (
              <div key={s.title} style={{ background: "#F2F8FC", borderRadius: 20, padding: "28px 22px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, margin: "0 auto 16px", background: "#fff", borderRadius: 999, border: "2px solid #2F7FB3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={24} color="#2F7FB3" />
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17.5, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ color: "#4A6478", fontSize: 14, lineHeight: 1.55 }}>{s.copy}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/services" className="focus-ring" style={{ color: "#2F7FB3", fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}>
              See all services →
            </Link>
          </div>
        </section>

        {/* Reviews */}
        <section style={{ background: "#2F7FB3", color: "#fff", padding: "64px 20px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 34px)", marginBottom: 10 }}>
                Why patients choose us
              </h2>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={17} fill="#F2C94C" color="#F2C94C" />)}
                <span style={{ marginLeft: 6, color: "#E3EEF5", fontSize: 14 }}>5.0 on Google · 10 reviews</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
              {REVIEWS.map((r) => (
                <div key={r.name} style={{ background: "rgba(255,255,255,0.14)", borderRadius: 18, padding: 22, border: "1px solid rgba(255,255,255,0.22)" }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#fff", marginBottom: 14 }}>&ldquo;{r.text}&rdquo;</p>
                  <p style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking teaser */}
        <section style={{ padding: "64px 20px", background: "#F2F8FC", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 32px)", marginBottom: 12 }}>
            Book your appointment online
          </h2>
          <p style={{ color: "#4A6478", fontSize: 15.5, lineHeight: 1.6, marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
            Pick a date, choose an open time slot, and we&apos;ll confirm by WhatsApp or email.
          </p>
          <Link href="/book" className="focus-ring" style={{
            display: "inline-flex", background: "#2F7FB3", color: "#fff", fontWeight: 700, fontSize: 15.5,
            padding: "14px 28px", borderRadius: 999, textDecoration: "none",
          }}>
            Check Availability
          </Link>
        </section>

        {/* Find us */}
        <section style={{ padding: "56px 20px 72px", background: "#F2F8FC" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(24px, 4vw, 30px)", marginBottom: 8 }}>Find us</h2>
              <p style={{ color: "#4A6478", fontSize: 14.5 }}>130 Ferry Road, Hullbridge, Essex, SS5 6EU</p>
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", minHeight: 280, background: "#fff" }}>
              <iframe
                title="Hullbridge Dental Clinic location"
                src="https://maps.google.com/maps?q=130%20Ferry%20Road%20Hullbridge%20Essex%20SS5%206EU&t=m&z=15&output=embed"
                width="100%" height="100%" style={{ border: 0, minHeight: 280 }} loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
