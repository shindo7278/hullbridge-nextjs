import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Services", href: "/services" },
  { label: "Our Prices", href: "/our-prices" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer style={{ background: "#1E5E85", color: "#D6E9F4", padding: "40px 20px 22px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 28, marginBottom: 28 }}>
          <div style={{ maxWidth: 320 }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Hullbridge Dental Clinic</p>
            <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>Independent dental care on Ferry Road, Hullbridge, Essex.</p>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Sitemap</div>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "block", color: "#D6E9F4", textDecoration: "none", fontSize: 13.5, marginBottom: 8 }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Contact</div>
            <p style={{ fontSize: 13.5, marginBottom: 8 }}>01702 231 067</p>
            <p style={{ fontSize: 13.5, marginBottom: 8 }}>info@hullbridgedentalclinic.co.uk</p>
            <p style={{ fontSize: 13.5 }}>130 Ferry Road, SS5 6EU</p>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 18, fontSize: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>© {new Date().getFullYear()} Hullbridge Dental Clinic</span>
          <span>130 Ferry Road, Hullbridge, Essex, SS5 6EU</span>
        </div>
      </div>
    </footer>
  );
}
