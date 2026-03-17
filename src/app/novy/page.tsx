"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformIcon, getPlatformColor } from "@/components/PlatformIcon";

const PLATFORMS = [
  { name: "Facebook", color: "#1877F2" },
  { name: "Instagram", color: "#E1306C" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "TikTok", color: "#FF0050" },
  { name: "YouTube Shorts", color: "#FF0000" },
];

const POST_TYPES = ["post", "reel", "story", "carousel", "video"];

export default function NovyPage() {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [datum, setDatum] = useState("");
  const [cas, setCas] = useState("10:00");
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState("");
  const [typ, setTyp] = useState("post");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (name: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatforms.length === 0) {
      setError("Vyber alespoň jednu platformu.");
      return;
    }
    if (!datum) {
      setError("Vyber datum.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Create one post per platform
      for (const platforma of selectedPlatforms) {
        await fetch("/api/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datum, cas, platforma, typ, caption, mediaFile, status: "pending" }),
        });
      }
      setSuccess(true);
      setTimeout(() => router.push("/fronta"), 1500);
    } catch (err) {
      setError("Chyba při ukládání. Zkus to znovu.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = caption.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8, maxWidth: 720 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>Nový příspěvek</h1>
        <p style={{ color: "#555", fontSize: 14 }}>Naplánuj příspěvek na sociální sítě OneFlow</p>
      </div>

      {success && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "14px 18px", color: "#4ade80", fontSize: 14 }}>
          Příspěvek úspěšně přidán! Přesměrovávám na frontu...
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Platform selection */}
        <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
          <label style={labelStyle}>Platformy <span style={{ color: "#f87171" }}>*</span></label>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>Vyber jednu nebo více platforem</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PLATFORMS.map((p) => {
              const selected = selectedPlatforms.includes(p.name);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => togglePlatform(p.name)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                    border: selected ? `1px solid ${p.color}` : "1px solid #1e1e22",
                    background: selected ? `${p.color}15` : "#0a0a0b",
                    color: selected ? p.color : "#888",
                    fontWeight: selected ? 600 : 400,
                    fontSize: 13,
                    transition: "all 0.15s",
                  }}
                >
                  <PlatformIcon platform={p.name} size={16} />
                  {p.name}
                  {selected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date, time, type */}
        <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
          <label style={labelStyle}>Plánování</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="date-grid">
            <div>
              <label style={subLabelStyle}>Datum <span style={{ color: "#f87171" }}>*</span></label>
              <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label style={subLabelStyle}>Čas</label>
              <input type="time" value={cas} onChange={(e) => setCas(e.target.value)} className="input-field" />
            </div>
            <div>
              <label style={subLabelStyle}>Typ příspěvku</label>
              <select value={typ} onChange={(e) => setTyp(e.target.value)} className="input-field">
                {POST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={labelStyle}>Caption</label>
            <span style={{ fontSize: 11, color: charCount > 2200 ? "#f87171" : "#555" }}>{charCount} znaků</span>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field"
            style={{ minHeight: 160, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            placeholder="Napiš caption pro příspěvek..."
          />
          {/* Live preview */}
          {caption && (
            <div style={{ marginTop: 14, padding: 14, background: "#0a0a0b", borderRadius: 8, border: "1px solid #1a1a1e" }}>
              <div style={{ fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                Preview
              </div>
              <p style={{ fontSize: 13, color: "#ccc", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{caption}</p>
            </div>
          )}
        </div>

        {/* Media */}
        <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
          <label style={labelStyle}>Media URL</label>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>Google Drive link, Canva export link nebo jiný URL</p>
          <input
            type="url"
            value={mediaFile}
            onChange={(e) => setMediaFile(e.target.value)}
            className="input-field"
            placeholder="https://drive.google.com/... nebo https://canva.com/..."
          />
          {mediaFile && (
            <div style={{ marginTop: 10 }}>
              <a href={mediaFile} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#c9a96e", textDecoration: "none" }}>
                Otevřít odkaz →
              </a>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="submit"
            disabled={submitting || success}
            className="btn-gold"
            style={{ opacity: submitting || success ? 0.7 : 1, cursor: submitting || success ? "not-allowed" : "pointer" }}
          >
            {submitting ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#0a0a0b", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                Ukládám...
              </>
            ) : success ? (
              "Uloženo ✓"
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Přidat do fronty
                {selectedPlatforms.length > 1 && ` (${selectedPlatforms.length}x)`}
              </>
            )}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Zrušit
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select.input-field option { background: #111113; color: #f0f0f0; }
        @media (max-width: 640px) {
          .date-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#f0f0f0",
  display: "block",
};

const subLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#888",
  display: "block",
  marginBottom: 6,
};
