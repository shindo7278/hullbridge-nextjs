import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export const metadata = {
  title: "Contact Us — Hullbridge Dental Clinic",
  description: "Get in touch with Hullbridge Dental Clinic, 130 Ferry Road, Hullbridge, Essex, SS5 6EU.",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: "Hullbridge Dental Clinic",
  telephone: "+441702231067",
  email: "info@hullbridgedentalclinic.co.uk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "130 Ferry Road",
    addressLocality: "Hullbridge",
    addressRegion: "Essex",
    postalCode: "SS5 6EU",
    addressCountry: "GB",
  },
  url: "https://www.hullbridgedentalclinic.co.uk",
  sameAs: ["https://en-gb.facebook.com/hullbridgedentalclinic/"],
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <main>
        <section style={{ background: "#F2F8FC", padding: "48px 20px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", marginBottom: 10 }}>
            Contact Us
          </h1>
          <p style={{ color: "#4A6478", fontSize: 15.5, maxWidth: 480, margin: "0 auto" }}>
            We&apos;re on Ferry Road in Hullbridge — call, message, or drop in.
          </p>
        </section>

        <section style={{
          maxWidth: 1000, margin: "0 auto", padding: "48px 20px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40,
        }} className="contact-grid">
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <MapPin size={19} color="#2F7FB3" />
                <span style={{ fontSize: 15, color: "#3D5266" }}>130 Ferry Road, Hullbridge, Essex, SS5 6EU</span>
              </div>
              <a href="tel:+441702231067" style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}>
                <Phone size={19} color="#2F7FB3" />
                <span style={{ fontSize: 15, color: "#3D5266" }}>01702 231 067</span>
              </a>
              <a href="mailto:info@hullbridgedentalclinic.co.uk" style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}>
                <Mail size={19} color="#2F7FB3" />
                <span style={{ fontSize: 15, color: "#3D5266" }}>info@hullbridgedentalclinic.co.uk</span>
              </a>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <a href="https://en-gb.facebook.com/hullbridgedentalclinic/" aria-label="Facebook" className="focus-ring" style={{
                width: 40, height: 40, borderRadius: 999, border: "2px solid #DCEAF3",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#2F7FB3",
              }}>
                <Facebook size={17} />
              </a>
              <a href="#" aria-label="Instagram" className="focus-ring" style={{
                width: 40, height: 40, borderRadius: 999, border: "2px solid #DCEAF3",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#2F7FB3",
              }}>
                <Instagram size={17} />
              </a>
            </div>

            <div style={{ borderRadius: 18, overflow: "hidden", minHeight: 260, background: "#F2F8FC" }}>
              <iframe
                title="Hullbridge Dental Clinic location"
                src="https://maps.google.com/maps?q=130%20Ferry%20Road%20Hullbridge%20Essex%20SS5%206EU&t=m&z=15&output=embed"
                width="100%" height="100%" style={{ border: 0, minHeight: 260 }} loading="lazy"
              />
            </div>
          </div>

          <ContactForm />
        </section>
      </main>
      <SiteFooter />

      <style>{`@media (max-width: 760px) { .contact-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
