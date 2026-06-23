import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { ShieldCheck, Stethoscope, Sparkles, Hammer, Smile, Phone, ChevronRight, Activity, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Our Services — Hullbridge Dental Clinic",
  description: "Preventative, restorative and cosmetic dentistry for the whole family at Hullbridge Dental Clinic, Ferry Road, Essex.",
};

const SERVICE_GROUPS = [
  { category: "Preventative Dentistry", icon: ShieldCheck, services: [
    { slug: "dental-examination", name: "Dental Examinations", summary: "Routine and new patient check-ups, including X-rays where needed." },
    { slug: "scale-and-polish", name: "Scale & Polish", summary: "Professional cleaning to remove plaque and tartar build-up." },
    { slug: "fissure-sealants", name: "Fissure Sealants", summary: "A protective coating for back teeth, popular for children." },
  ]},
  { category: "Restorative Dentistry", icon: Stethoscope, services: [
    { slug: "white-fillings", name: "White Fillings", summary: "Tooth-coloured composite fillings for a natural look." },
    { slug: "crowns-and-bridges", name: "Crowns & Bridges", summary: "Restoring damaged teeth or replacing missing ones." },
    { slug: "dentures", name: "Dentures", summary: "Full and partial dentures fitted to suit your mouth." },
    { slug: "root-canal-treatment", name: "Root Canal Treatment", summary: "Saving infected or badly damaged teeth from extraction." },
  ]},
  { category: "Cosmetic Dentistry", icon: Sparkles, services: [
    { slug: "teeth-whitening", name: "Teeth Whitening", summary: "Safe, professional home whitening kits." },
    { slug: "porcelain-veneers", name: "Porcelain Veneers", summary: "Thin custom shells to reshape and brighten your smile." },
  ]},
  { category: "Oral Surgery", icon: Hammer, services: [
    { slug: "tooth-extraction", name: "Tooth Extraction", summary: "Simple and surgical extractions." },
  ]},
  { category: "Specialist Consultation", icon: Smile, services: [
    { slug: "dental-implants", name: "Dental Implants", summary: "Consultation and referral guidance for implant treatment." },
    { slug: "clenching-and-grinding", name: "Clenching & Grinding Guards", summary: "Custom mouth guards to protect teeth overnight." },
    { slug: "sports-guards", name: "Sports Guards", summary: "Custom-fitted mouth guards for sport." },
  ]},
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section style={{ background: "#F2F8FC", padding: "48px 20px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", marginBottom: 10 }}>
            Our Services
          </h1>
          <p style={{ color: "#4A6478", fontSize: 15.5, maxWidth: 520, margin: "0 auto" }}>
            Preventative, restorative and cosmetic dentistry for the whole family, on Ferry Road in Hullbridge.
          </p>
        </section>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px" }}>
          {SERVICE_GROUPS.map((group) => (
            <div key={group.category} style={{ marginBottom: 44 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F2F8FC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <group.icon size={19} color="#2F7FB3" />
                </div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 21 }}>{group.category}</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {group.services.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="focus-ring" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    textDecoration: "none", color: "#142433", background: "#F7FAFC", borderRadius: 14, padding: "16px 18px",
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                      <div style={{ color: "#6C8294", fontSize: 13, marginTop: 2 }}>{s.summary}</div>
                    </div>
                    <ChevronRight size={18} color="#6FB6E0" style={{ flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section style={{ background: "#2F7FB3", color: "#fff", padding: "48px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <InfoBlock icon={Activity} title="Booking appointments" text="Walk in within opening hours or book online. Call 01702 231067 to register or book by phone." />
            <InfoBlock icon={AlertCircle} title="Dental emergencies" text="Phone the clinic as early as possible. We aim to see emergency patients the same day." />
            <InfoBlock icon={ShieldCheck} title="Cancellations" text="Please give 24 hours' notice. Less than 24 hours may incur a £35 failed appointment fee." />
          </div>
        </section>

        <section style={{ padding: "56px 20px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Ready to book?</h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" className="focus-ring" style={{ textDecoration: "none", background: "#2F7FB3", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 999 }}>
              Book Online
            </Link>
            <a href="tel:+441702231067" className="focus-ring" style={{
              display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
              background: "#fff", color: "#142433", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 999, border: "2px solid #6FB6E0",
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

function InfoBlock({ icon: Icon, title, text }) {
  return (
    <div>
      <Icon size={22} color="#fff" style={{ marginBottom: 10 }} />
      <h3 style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#E3EEF5" }}>{text}</p>
    </div>
  );
}
