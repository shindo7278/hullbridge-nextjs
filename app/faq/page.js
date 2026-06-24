import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";
import { Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Frequently Asked Questions — Hullbridge Dental Clinic",
  description: "Answers to the most common questions from our patients in Hullbridge, Essex.",
};

async function getPublishedFaqs() {
  try {
    const faqs = await prisma.generalFaq.findMany({
      where: { isPublished: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      select: { id: true, question: true, answer: true, category: true },
    });
    return faqs;
  } catch (err) {
    console.error("[FAQ PAGE] Failed to load FAQs:", err);
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();

  // Group by category
  const grouped = faqs.reduce((acc, faq) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  // FAQPage Schema — this is what makes Google show these Q&As
  // as rich results and lets AI engines extract them directly
  const faqSchema = faqs.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <>
      <SiteHeader />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <main>
        <section style={{ background: "#F2F8FC", padding: "48px 20px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", marginBottom: 10 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: "#4A6478", fontSize: 15.5, maxWidth: 520, margin: "0 auto" }}>
            Common questions from our patients in Hullbridge and Essex.
          </p>
        </section>

        <section style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
          {faqs.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9CB0BF", fontSize: 14 }}>
              FAQs coming soon.
            </p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 13.5, fontWeight: 800, color: "#2F7FB3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                  {category}
                </h2>
                <FaqAccordion faqs={items} />
              </div>
            ))
          )}

          <div style={{
            marginTop: 40, padding: "24px", background: "#F2F8FC", borderRadius: 16, textAlign: "center",
          }}>
            <p style={{ fontSize: 15, color: "#142433", fontWeight: 600, marginBottom: 14 }}>
              Can&apos;t find what you&apos;re looking for?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="focus-ring" style={{
                textDecoration: "none", background: "#2F7FB3", color: "#fff",
                fontWeight: 700, fontSize: 14.5, padding: "12px 22px", borderRadius: 999,
              }}>
                Send us a message
              </Link>
              <a href="tel:+441702231067" className="focus-ring" style={{
                display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none",
                background: "#fff", color: "#142433", fontWeight: 700, fontSize: 14.5,
                padding: "12px 22px", borderRadius: 999, border: "2px solid #DCEAF3",
              }}>
                <Phone size={15} /> 01702 231 067
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}