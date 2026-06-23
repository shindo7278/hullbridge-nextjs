"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminBlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(data.posts || []);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this post permanently?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    loadPosts();
  }

  return (
    <div style={{ background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>Blog</h1>
            <p style={{ fontSize: 13, color: "#7C93A6", marginTop: 2 }}>Write, edit, and publish patient guides.</p>
          </div>
          <Link href="/admin/blog/new" style={{
            display: "flex", alignItems: "center", gap: 6, background: "#2F7FB3", color: "#fff",
            textDecoration: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13.5,
          }}>
            <Plus size={16} /> New Post
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6478" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center", color: "#7C93A6", fontSize: 14 }}>
            No posts yet — click &quot;New Post&quot; to write your first guide.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              background: "#fff", borderRadius: 14, border: "1px solid #E3EEF5", padding: "16px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "#F2F8FC", flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#142433" }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: "#9CB0BF", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {post.isPublished ? <Eye size={12} color="#1F7A45" /> : <EyeOff size={12} />}
                    {post.isPublished ? "Published" : "Draft"}
                    {post.linkedService && <span>· links to {post.linkedService.name}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Link href={`/admin/blog/${post.id}`} style={{
                  background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#4A6478",
                }}>
                  <Pencil size={14} />
                </Link>
                <button onClick={() => deletePost(post.id)} style={{
                  background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <Trash2 size={14} color="#B3261E" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
