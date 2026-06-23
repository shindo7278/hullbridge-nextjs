import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Patient Guides & Advice — Hullbridge Dental Clinic",
  description: "Honest, practical answers to the questions our patients in Hullbridge ask us most.",
};

async function getPublishedPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return []; // DB not reachable — page still renders, just empty
  }
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <SiteHeader />
      <main>
        <section style={{ background: "#F2F8FC", padding: "48px 20px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 38px)", marginBottom: 10 }}>
            Patient Guides & Advice
          </h1>
          <p style={{ color: "#4A6478", fontSize: 15.5, maxWidth: 520, margin: "0 auto" }}>
            Honest, practical answers to the questions our patients in Hullbridge ask us most.
          </p>
        </section>

        <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9CB0BF", fontSize: 14 }}>
              No guides published yet — check back soon.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="focus-ring" style={{
                  textDecoration: "none", color: "#142433", background: "#F7FAFC", borderRadius: 18, padding: 22, display: "block",
                }}>
                  {post.coverImageUrl && (
                    <img src={post.coverImageUrl} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 14 }} />
                  )}
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.4 }}>{post.title}</h2>
                  <p style={{ fontSize: 13.5, color: "#6C8294", lineHeight: 1.6, marginBottom: 14 }}>{post.excerpt}</p>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9CB0BF" }}>
                    <Calendar size={12} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
