import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ServiceFaqAccordion from "@/components/ServiceFaqAccordion";
import Link from "next/link";
import { Phone, ChevronRight, Star } from "lucide-react";

// Placeholder content keyed by slug — in production this fetches
// from the Service + ServiceFaq Prisma tables by slug instead.
const SERVICES_DATA = {
  "dental-implants": {
    name: "Dental Implants",
    category: "Specialist Consultation",
    intro: "Dental implants replace missing teeth with a permanent, natural-looking solution anchored directly into the jawbone. At Hullbridge Dental Clinic we offer an honest, no-pressure consultation to talk through whether implants are right for you.",
    bodyParagraphs: [
      "A dental implant is a small titanium post placed into the jawbone, acting as an artificial tooth root. Once it has fused with the bone, a custom crown is fitted on top.",
      "Implants are most often considered after losing a tooth to decay, gum disease, or injury. We begin with a thorough consultation to assess your suitability before discussing next steps.",
      "Every patient's situation is different, which is why we avoid quoting a single fixed price online — you'll always receive a clear, written quotation before any treatment is booked.",
    ],
    faqs: [
      { question: "How much do dental implants cost in Essex?", answer: "Implant pricing varies by case. Book a consultation for a written quotation specific to your situation." },
      { question: "Are dental implants painful?", answer: "Placement is carried out under local anaesthetic. Mild soreness afterwards is normal and manageable with over-the-counter pain relief." },
      { question: "How long do dental implants last?", answer: "With good oral hygiene and regular check-ups, implants can last well over 15-20 years." },
    ],
  },
};

const DEFAULT_SERVICE = {
  name: "Dental Treatment",
  category: "General Dentistry",
  intro: "Our team provides gentle, straightforward dental care at our Ferry Road practice in Hullbridge.",
  bodyParagraphs: ["Contact us to find out more about this treatment, including pricing and what to expect at your appointment."],
  faqs: [],
};

export function generateMetadata({ params }) {
  const service = SERVICES_DATA[params.slug] || DEFAULT_SERVICE;
  return {
    title: `${service.name} in Hullbridge, Essex — Hullbridge Dental Clinic`,
    description: service.intro,
  };
}

export default function ServiceDetailPage({ params }) {
  const service = SERVICES_DATA[params.slug] || DEFAULT_SERVICE;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    provider: {
      "@type": "Dentist",
      name: "Hullbridge Dental Clinic",
      address: { "@type": "PostalAddress", streetAddress: "130 Ferry Road", addressLocality: "Hullbridge", addressRegion: "Essex", postalCode: "SS5 6EU", addressCountry: "GB" },
      telephone: "+441702231067",
    },
  };

  const faqSchema = service.faqs.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  } : null;

  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <main>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px 0", fontSize: 13, color: "#7C93A6" }}>
          <Link href="/" style={{ color: "#7C93A6", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/services" style={{ color: "#7C93A6", textDecoration: "none" }}>Services</Link>
          {" / "}
          <span style={{ color: "#142433", fontWeight: 600 }}>{service.name}</span>
        </div>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 0" }}>
          <span style={{ color: "#2F7FB3", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{service.category}</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", margin: "8px 0 16px" }}>
            {service.name} in Hullbridge, Essex
          </h1>
        </section>

        <section style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 20px 56px",
          display: "grid", gridTemplateColumns: "1fr 300px", gap: 40,
        }} className="svc-detail-grid">
          <div>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "#3D5266", marginBottom: 24 }}>{service.intro}</p>
            {service.bodyParagraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 15.5, lineHeight: 1.75, color: "#3D5266", marginBottom: 18 }}>{p}</p>
            ))}

            {service.faqs.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>
                  Common questions about {service.name.toLowerCase()}
                </h2>
                <ServiceFaqAccordion faqs={service.faqs} />
              </div>
            )}
          </div>

          <aside>
            <div style={{ background: "#F2F8FC", borderRadius: 18, padding: 24, position: "sticky", top: 90 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17, marginBottom: 14 }}>Book a consultation</h3>
              <Link href="/book" className="focus-ring" style={{
                display: "block", textAlign: "center", textDecoration: "none", background: "#2F7FB3",
                color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px", borderRadius: 999, marginBottom: 10,
              }}>
                Book Online
              </Link>
              <a href="tel:+441702231067" className="focus-ring" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                textDecoration: "none", color: "#142433", fontWeight: 700, fontSize: 14.5,
                padding: "12px", borderRadius: 999, border: "2px solid #DCEAF3", marginBottom: 20,
              }}>
                <Phone size={15} /> 01702 231 067
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F2C94C" color="#F2C94C" />)}
                <span style={{ fontSize: 12.5, color: "#7C93A6", marginLeft: 4 }}>5.0 · 10 Google reviews</span>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        @media (max-width: 760px) { .svc-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
