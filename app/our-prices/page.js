import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PricesSearch from "@/components/PricesSearch";
import Link from "next/link";
import { Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Our Prices — Hullbridge Dental Clinic",
  description: "Clear, transparent dental pricing at Hullbridge Dental Clinic, priced to closely match the NHS.",
};

async function getPriceCategories() {
  try {
    const categories = await prisma.priceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });
    // Shape to match what PricesSearch component expects
    return categories.map((cat) => ({
      name: cat.name,
      items: cat.items.map((item) => ({
        name: item.name,
        price: `£${Number(item.price).toFixed(2)}`,
        suffix: item.priceSuffix || "",
      })),
    }));
  } catch {
    return []; // DB not reachable — page still renders, just empty
  }
}

export default async function PricesPage() {
  const categories = await getPriceCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section style={{ background: "#F2F8FC", padding: "48px 20px 32px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", marginBottom: 10 }}>
            Our Prices
          </h1>
          <p style={{ color: "#4A6478", fontSize: 15.5, maxWidth: 520, margin: "0 auto 24px" }}>
            Priced to closely match the NHS, with a clear quotation before any work begins.
          </p>
          {categories.length > 0 ? (
            <PricesSearch categories={categories} />
          ) : (
            <p style={{ color: "#9CB0BF", fontSize: 14, marginTop: 32 }}>
              Price list coming soon — call us on 01702 231 067 for current pricing.
            </p>
          )}
        </section>

        <section style={{ background: "#2F7FB3", padding: "48px 20px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", color: "#fff", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>
            Questions about pricing?
          </h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book" className="focus-ring" style={{ textDecoration: "none", background: "#fff", color: "#2F7FB3", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 999 }}>
              Book a Consultation
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
