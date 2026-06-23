"use client";

// ============================================================
// /admin/homepage — Hero background video control
// ============================================================
// Full control, not just "add": the admin can upload a new video,
// replace the current one, or remove it entirely and fall back to
// the plain gradient background. There is no scheduling here — the
// moment a video is uploaded it's live; the moment it's removed,
// the homepage reverts immediately. (If "show this video only
// during X dates" is ever needed, that would be a separate
// scheduledFrom/scheduledTo pair on ClinicSettings — not built yet
// since it wasn't asked for.)
// ============================================================
import React, { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Play, Loader2, Check, AlertCircle, Film } from "lucide-react";

const MAX_SIZE_MB = 25;
const ACCEPTED_TYPES = ["video/mp4", "video/webm"];

export default function AdminHomepageVideo() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/homepage/video/status")
      .then((r) => r.json())
      .then((data) => setVideoUrl(data.heroVideoUrl || null))
      .finally(() => setInitialLoading(false));
  }, []);

  function pickFile() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload an MP4 or WebM video.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large — please keep it under ${MAX_SIZE_MB}MB for fast loading.`);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("video", file);

      // In production: upload progress via XHR or a presigned URL to
      // object storage (S3/Cloudflare R2/etc.), not raw POST through
      // the Node server, to keep memory usage sane for video files.
      const res = await fetch("/api/admin/homepage/video", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setVideoUrl(data.heroVideoUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Upload failed — please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeVideo() {
    if (!confirm("Remove the background video? The homepage will go back to the plain background immediately.")) return;
    setError(null);
    try {
      await fetch("/api/admin/homepage/video", { method: "DELETE" });
      setVideoUrl(null);
    } catch {
      setError("Could not remove the video — please try again.");
    }
  }

  if (initialLoading) {
    return (
      <div style={{ padding: 40, display: "flex", alignItems: "center", gap: 8, color: "#4A6478" }}>
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>Homepage Video</h1>
          <p style={{ fontSize: 13, color: "#7C93A6", marginTop: 2 }}>
            Background video for the homepage hero — replace or remove any time.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E3EEF5", padding: 24 }}>
          {videoUrl ? (
            <>
              <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 16, background: "#0F1E2B" }}>
                <video src={videoUrl} controls style={{ width: "100%", display: "block", maxHeight: 280 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={pickFile} disabled={uploading} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                }}>
                  <Upload size={15} /> Replace video
                </button>
                <button onClick={removeVideo} disabled={uploading} style={{
                  display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#B3261E",
                  border: "1px solid #F0C5C5", borderRadius: 10, padding: "12px 16px",
                  fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                }}>
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            </>
          ) : (
            <div style={{
              border: "2px dashed #DCEAF3", borderRadius: 14, padding: "40px 20px",
              textAlign: "center", cursor: "pointer",
            }} onClick={pickFile}>
              <Film size={32} color="#6FB6E0" style={{ marginBottom: 12 }} />
              <p style={{ fontWeight: 700, fontSize: 14.5, color: "#142433", marginBottom: 4 }}>No video set</p>
              <p style={{ fontSize: 13, color: "#9CB0BF", marginBottom: 16 }}>
                The homepage currently shows the plain background. Upload an MP4 to replace it.
              </p>
              <button disabled={uploading} style={{
                display: "inline-flex", alignItems: "center", gap: 8, background: "#2F7FB3", color: "#fff",
                border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              }}>
                {uploading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={15} />}
                {uploading ? `Uploading…` : "Upload video"}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef} type="file" accept="video/mp4,video/webm"
            onChange={handleFileSelected} style={{ display: "none" }}
          />

          {error && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#FDECEC", color: "#B3261E", fontSize: 13, padding: "10px 12px", borderRadius: 10, marginTop: 14 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {saved && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#E9F6EE", color: "#1F7A45", fontSize: 13, padding: "10px 12px", borderRadius: 10, marginTop: 14 }}>
              <Check size={15} /> Live on the homepage now.
            </div>
          )}

          <p style={{ fontSize: 12, color: "#9CB0BF", marginTop: 16, lineHeight: 1.6 }}>
            MP4 or WebM, under {MAX_SIZE_MB}MB. Keep clips short (10-20 seconds, looping) so the page
            still loads quickly on mobile data.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
