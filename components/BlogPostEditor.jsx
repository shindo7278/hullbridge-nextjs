"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Check, AlertCircle, X, Link2 } from "lucide-react";

const MAX_IMAGE_MB = 10;

export default function BlogPostEditor({ postId = null }) {
  const router = useRouter();
  const isEditing = !!postId;

  const [form, setForm] = useState({
    title: "", excerpt: "", bodyContent: "",
    coverImageUrl: "", secondImageUrl: "",
    metaTitle: "", metaDescription: "",
    isPublished: false, linkedServiceId: "", linkedPostId: "",
  });
  const [linkOptions, setLinkOptions] = useState({ services: [], posts: [] });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null); // "cover" | "second" | null

  const coverInputRef = useRef(null);
  const secondInputRef = useRef(null);

  useEffect(() => {
    // Always load the link dropdown options
    fetch("/api/admin/blog/link-options")
      .then((r) => r.json())
      .then((data) => setLinkOptions({ services: data.services || [], posts: data.posts || [] }));

    // If editing, also load the existing post
    if (isEditing) {
      fetch(`/api/admin/blog/${postId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.post) {
            setForm({
              title: data.post.title || "",
              excerpt: data.post.excerpt || "",
              bodyContent: data.post.bodyContent || "",
              coverImageUrl: data.post.coverImageUrl || "",
              secondImageUrl: data.post.secondImageUrl || "",
              metaTitle: data.post.metaTitle || "",
              metaDescription: data.post.metaDescription || "",
              isPublished: data.post.isPublished || false,
              linkedServiceId: data.post.linkedServiceId || "",
              linkedPostId: data.post.linkedPostId || "",
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isEditing, postId]);

  async function handleImageUpload(file, target) {
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image is too large — please keep it under ${MAX_IMAGE_MB}MB.`);
      return;
    }
    setUploadingImage(target);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/blog/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm((prev) => ({ ...prev, [target === "cover" ? "coverImageUrl" : "secondImageUrl"]: data.url }));
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setUploadingImage(null);
    }
  }

  async function handleSave() {
    setError(null);
    if (!form.title.trim() || !form.excerpt.trim() || !form.bodyContent.trim()) {
      setError("Title, short description, and content are all required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/blog/${postId}` : "/api/admin/blog", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save post");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, display: "flex", alignItems: "center", gap: 8, color: "#4A6478" }}>
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
      </div>
    );
  }

  return (
    <div style={{ background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>{isEditing ? "Edit Post" : "New Post"}</h1>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E3EEF5", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>

          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="How Much Do Dental Implants Cost in Essex?" />

          <div>
            <FieldLabel>Short description</FieldLabel>
            <textarea
              rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="One or two sentences shown on the blog index card and in search results."
              style={textareaStyle}
            />
          </div>

          {/* ===== Two in-article images, compressed on upload, URL-only in the database ===== */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ImageUploadField
              label="Cover image"
              imageUrl={form.coverImageUrl}
              uploading={uploadingImage === "cover"}
              onUpload={(file) => handleImageUpload(file, "cover")}
              onRemove={() => setForm({ ...form, coverImageUrl: "" })}
              inputRef={coverInputRef}
            />
            <ImageUploadField
              label="Second image (in-article)"
              imageUrl={form.secondImageUrl}
              uploading={uploadingImage === "second"}
              onUpload={(file) => handleImageUpload(file, "second")}
              onRemove={() => setForm({ ...form, secondImageUrl: "" })}
              inputRef={secondInputRef}
            />
          </div>

          <div>
            <FieldLabel>Content</FieldLabel>
            <textarea
              rows={12} value={form.bodyContent} onChange={(e) => setForm({ ...form, bodyContent: e.target.value })}
              placeholder="Write the full article here. Paragraph breaks are kept as written."
              style={{ ...textareaStyle, fontFamily: "ui-monospace, monospace", fontSize: 13.5 }}
            />
          </div>

          {/* ===== Internal linking — the actual SEO benefit the buyer asked for ===== */}
          <div style={{ borderTop: "1px solid #E3EEF5", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Link2 size={15} color="#2F7FB3" />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#142433" }}>Internal links</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#9CB0BF", marginBottom: 12 }}>
              Link this article to a related service page and/or another post — both will show as a
              &quot;Related&quot; box inside the published article, which helps search engines understand how
              your pages connect.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <FieldLabel>Link to a service</FieldLabel>
                <select
                  value={form.linkedServiceId}
                  onChange={(e) => setForm({ ...form, linkedServiceId: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {linkOptions.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Link to another post</FieldLabel>
                <select
                  value={form.linkedPostId}
                  onChange={(e) => setForm({ ...form, linkedPostId: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {linkOptions.posts.filter((p) => p.id !== postId).map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ===== SEO fields ===== */}
          <div style={{ borderTop: "1px solid #E3EEF5", paddingTop: 16 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "#142433", display: "block", marginBottom: 12 }}>SEO (optional)</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Meta title (defaults to the title above)" value={form.metaTitle} onChange={(v) => setForm({ ...form, metaTitle: v })} />
              <Field label="Meta description (defaults to the short description above)" value={form.metaDescription} onChange={(v) => setForm({ ...form, metaDescription: v })} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#142433" }}>Published (visible on the live site)</span>
          </label>

          {error && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#FDECEC", color: "#B3261E", fontSize: 13, padding: "10px 12px", borderRadius: 10 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{
            background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10, padding: "13px",
            fontWeight: 700, fontSize: 14.5, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Post"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ImageUploadField({ label, imageUrl, uploading, onUpload, onRemove, inputRef }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {imageUrl ? (
        <div style={{ position: "relative" }}>
          <img src={imageUrl} alt="" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }} />
          <button onClick={onRemove} style={{
            position: "absolute", top: 6, right: 6, background: "rgba(20,36,51,0.7)", border: "none",
            borderRadius: 999, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <X size={13} color="#fff" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: "100%", height: 110, border: "2px dashed #DCEAF3", borderRadius: 10, background: "none",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {uploading ? <Loader2 size={18} color="#2F7FB3" style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={18} color="#6FB6E0" />}
          <span style={{ fontSize: 11.5, color: "#9CB0BF" }}>{uploading ? "Uploading…" : "Click to upload"}</span>
        </button>
      )}
      <input
        ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onUpload(e.target.files?.[0])}
        style={{ display: "none" }}
      />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "block" }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14 }}
      />
    </label>
  );
}

function FieldLabel({ children }) {
  return <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>{children}</span>;
}

const textareaStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #DCEAF3",
  fontSize: 14, fontFamily: "inherit", resize: "vertical",
};
const selectStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 13.5, background: "#fff",
};
