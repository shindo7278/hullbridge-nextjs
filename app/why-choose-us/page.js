import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { Star, ShieldCheck, Smile, Clock, Phone } from "lucide-react";

export const metadata = {
  title: "Why Choose Us — Hullbridge Dental Clinic",
  description: "Why patients across Hullbridge and Essex choose Hullbridge Dental Clinic for gentle, honest dental care.",
};

const REASONS = [
  { icon: Smile, title: "Gentle with nervous patients", text: "We take time to explain every step, especially for patients who feel anxious about dental visits." },
  { icon: ShieldCheck, title: "Honest, written quotations", text: "No surprise costs — you always know what a treatment involves and what it costs before agreeing to it." },
  { icon: Clock, title: "Flexible appointments", text: "Online booking, phone bookings, and same-day emergency slots wherever possible." },
  { icon: Star, title: "Trusted locally", text: "Rated 5 out of 5 by patients across Hullbridge and the wider Essex area." },
];

export default function WhyChooseUsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section style={{ background: "#F2F8FC", padding: "48px 20px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", marginBottom: 10 }}>
            Why Choose Us
          </h1>
          <p style={{ color: "#4A6478", fontSize: 15.5, maxWidth: 520, margin: "0 auto" }}>
            An independent dental surgery on Ferry Road, built around gentle, honest care.
          </p>
        </section>

        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {REASONS.map((r) => (
              <div key={r.title} style={{ background: "#F7FAFC", borderRadius: 18, padding: 24 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fff", border: "2px solid #2F7FB3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <r.icon size={22} color="#2F7FB3" />
                </div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{r.title}</h2>
                <p style={{ color: "#4A6478", fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: "#2F7FB3", padding: "48px 20px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", color: "#fff", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>
            Ready to book your visit?
          </h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" className="focus-ring" style={{ textDecoration: "none", background: "#fff", color: "#2F7FB3", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 999 }}>
              Book Online
            </Link>
            <a href="tel:+441702231067" className="focus-ring" style={{
              display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
              background: "transparent", color: "#fff", fontWeight: 700, fontSize: 15,
              padding: "13px 26px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.5)",
            }}>
              <Phone size={16} /> 01702 231 067
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
