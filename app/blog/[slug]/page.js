import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { Calendar, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getPost(slug) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        linkedService: { select: { name: true, slug: true, shortSummary: true } },
        linkedPost: { select: { title: true, slug: true, excerpt: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found — Hullbridge Dental Clinic" };
  return {
    title: post.metaTitle || `${post.title} — Hullbridge Dental Clinic`,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post || !post.isPublished) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt || post.createdAt,
    author: { "@type": "Organization", name: post.authorName },
  };

  // Body content is stored as plain text with blank-line paragraph
  // breaks from the admin editor's textarea — split it back into
  // paragraphs for rendering.
  const paragraphs = post.bodyContent.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <main>
        <article style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 56px" }}>
          <Link href="/blog" className="focus-ring" style={{
            display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
            color: "#7C93A6", fontSize: 13.5, fontWeight: 600, marginBottom: 20,
          }}>
            <ChevronLeft size={15} /> Back to all guides
          </Link>

          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(26px, 5vw, 34px)", margin: "10px 0 14px", lineHeight: 1.2 }}>
            {post.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#9CB0BF", marginBottom: 24 }}>
            <Calendar size={13} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          {post.coverImageUrl && (
            <img src={post.coverImageUrl} alt={post.title} style={{ width: "100%", borderRadius: 16, marginBottom: 24 }} />
          )}

          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: "#3D5266", marginBottom: 18 }}>{p}</p>
          ))}

          {post.secondImageUrl && (
            <img src={post.secondImageUrl} alt="" style={{ width: "100%", borderRadius: 16, margin: "8px 0 24px" }} />
          )}

          {/* ===== Internal links — the connective tissue between blog and services ===== */}
          {(post.linkedService || post.linkedPost) && (
            <div style={{ display: "grid", gridTemplateColumns: post.linkedService && post.linkedPost ? "1fr 1fr" : "1fr", gap: 14, marginTop: 8, marginBottom: 8 }}>
              {post.linkedService && (
                <Link href={`/services/${post.linkedService.slug}`} className="focus-ring" style={{
                  textDecoration: "none", display: "block", background: "#F2F8FC", borderRadius: 14, padding: 18,
                }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2F7FB3", textTransform: "uppercase" }}>Related service</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontWeight: 700, color: "#142433", fontSize: 14.5 }}>{post.linkedService.name}</span>
                    <ChevronRight size={16} color="#6FB6E0" />
                  </div>
                </Link>
              )}
              {post.linkedPost && (
                <Link href={`/blog/${post.linkedPost.slug}`} className="focus-ring" style={{
                  textDecoration: "none", display: "block", background: "#F2F8FC", borderRadius: 14, padding: 18,
                }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2F7FB3", textTransform: "uppercase" }}>Related guide</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontWeight: 700, color: "#142433", fontSize: 14.5 }}>{post.linkedPost.title}</span>
                    <ChevronRight size={16} color="#6FB6E0" />
                  </div>
                </Link>
              )}
            </div>
          )}

          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between",
            marginTop: 28, padding: "20px 22px", background: "#2F7FB3", borderRadius: 16,
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14.5 }}>Have questions about this treatment?</span>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/book" className="focus-ring" style={{ textDecoration: "none", background: "#fff", color: "#2F7FB3", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 999 }}>
                Book Online
              </Link>
              <a href="tel:+441702231067" className="focus-ring" style={{
                display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
                color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.4)",
              }}>
                <Phone size={13} /> Call
              </a>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
