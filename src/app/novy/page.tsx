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

const CHAR_LIMITS: Record<string, number> = {
  Facebook: 63206,
  Instagram: 2200,
  LinkedIn: 3000,
  TikTok: 2200,
  "YouTube Shorts": 5000,
};

const TEMPLATES = [
  {
    label: "💡 Investiční tip",
    caption: "Víte, že nejlepší čas investovat do své firmy je právě teď? OneFlow vám pomůže najít správné investory a připravit váš byznys na další level. 🚀\n\n#investice #podnikání #OneFlow #byznys",
  },
  {
    label: "📈 Tržní update",
    caption: "Aktuální pohled na investiční trh: české SMB firmy získávají rekordní objem investic. OneFlow vás propojuje s prověřenými investory, kteří rozumí vašemu trhu.\n\n#trh #investice #OneFlow #česképodnikání",
  },
  {
    label: "🏆 Klientský příběh",
    caption: "Příběh úspěchu: náš klient dokázal za 6 měsíců díky investici přes OneFlow ztrojnásobit svůj obrat. Každý velký příběh začíná prvním krokem. 💪\n\n#success #klient #OneFlow #investice",
  },
  {
    label: "⚠️ Riziko a příležitost",
    caption: "Každá investice nese riziko – ale největším rizikem pro vaši firmu je nic nedělat. OneFlow vám pomůže posoudit příležitosti i rizika, abyste mohli rozhodovat s jistotou.\n\n#riziko #příležitost #OneFlow #podnikání",
  },
  {
    label: "🎯 OneFlow výhody",
    caption: "Proč OneFlow? ✅ Prověření investoři ✅ Transparentní proces ✅ Podpora od A do Z ✅ Česky a rychle\n\nZačněte ještě dnes na oneflow.cz\n\n#OneFlow #investice #startup #podnikání",
  },
];

function FacebookPreview({ caption, platform }: { caption: string; platform: string }) {
  return (
    <div style={{ background: "#1c1c1e", border: "1px solid #2a2a2e", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #2a2a2e", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white" }}>O</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>OneFlow | Stránka</div>
          <div style={{ fontSize: 11, color: "#555" }}>Právě teď · 🌐</div>
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <p style={{ fontSize: 13, color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{caption || "Váš caption se zobrazí zde..."}</p>
      </div>
      <div style={{ padding: "8px 16px", borderTop: "1px solid #2a2a2e", display: "flex", gap: 16 }}>
        {["👍 Líbí se mi", "💬 Komentář", "↗ Sdílet"].map((a) => (
          <button key={a} style={{ background: "none", border: "none", color: "#888", fontSize: 12, cursor: "pointer", padding: 0 }}>{a}</button>
        ))}
      </div>
    </div>
  );
}

function InstagramPreview({ caption }: { caption: string }) {
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(45deg, #E1306C, #F77737, #FCAF45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>O</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>oneflow.cz</span>
      </div>
      <div style={{ background: "#252535", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, margin: "0 14px" }}>
        <span style={{ color: "#444", fontSize: 12 }}>📷 Media</span>
      </div>
      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          {["❤️", "💬", "📤", "🔖"].map((i) => <span key={i} style={{ fontSize: 16, cursor: "pointer" }}>{i}</span>)}
        </div>
        <p style={{ fontSize: 12, color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.5, margin: 0 }}>
          <strong style={{ color: "#f0f0f0" }}>oneflow.cz</strong>{" "}
          {caption || "Váš caption se zobrazí zde..."}
        </p>
      </div>
    </div>
  );
}

function LinkedInPreview({ caption }: { caption: string }) {
  return (
    <div style={{ background: "#1c1c1e", border: "1px solid #2a2a2e", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#0A66C2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white" }}>F</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>Filip Dopita</div>
          <div style={{ fontSize: 11, color: "#555" }}>Founder OneFlow · 1h</div>
        </div>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <p style={{ fontSize: 13, color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0 }}>{caption || "Váš caption se zobrazí zde..."}</p>
      </div>
      <div style={{ padding: "8px 16px", borderTop: "1px solid #2a2a2e", display: "flex", gap: 16 }}>
        {["👍 Líbí se mi", "💬 Komentář", "↗ Sdílet"].map((a) => (
          <button key={a} style={{ background: "none", border: "none", color: "#888", fontSize: 11, cursor: "pointer", padding: 0 }}>{a}</button>
        ))}
      </div>
    </div>
  );
}

function YouTubePreview({ caption }: { caption: string }) {
  const title = caption.split("\n")[0] || "Váš titulek zde...";
  return (
    <div style={{ background: "#1c1c1e", border: "1px solid #2a2a2e", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "#111", aspectRatio: "9/16", maxHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, position: "relative" }}>
        <div style={{ width: 48, height: 48, background: "#FF0000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <span style={{ color: "#555", fontSize: 11 }}>Thumbnail 9:16</span>
        <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, background: "rgba(0,0,0,0.8)", borderRadius: 4, padding: "4px 8px" }}>
          <p style={{ fontSize: 12, color: "#f0f0f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        </div>
      </div>
    </div>
  );
}

function TikTokPreview({ caption }: { caption: string }) {
  return (
    <div style={{ background: "#161616", border: "1px solid #2a2a2e", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "#0d0d0d", aspectRatio: "9/16", maxHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ color: "#333", fontSize: 11 }}>📱 9:16 Video</span>
        <div style={{ position: "absolute", right: 8, bottom: 60, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {["❤️", "💬", "↗️", "🔖"].map((i) => <span key={i} style={{ fontSize: 20, cursor: "pointer" }}>{i}</span>)}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 8, right: 40, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "4px 8px" }}>
          <p style={{ fontSize: 11, color: "#f0f0f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{caption || "Caption..."}</p>
        </div>
      </div>
    </div>
  );
}

export default function NovyPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Instagram");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Instagram"]);
  const [datum, setDatum] = useState("");
  const [cas, setCas] = useState("10:00");
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState("");
  const [typ, setTyp] = useState("post");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  // AI Generator
  const [aiTopic, setAiTopic] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const togglePlatform = (name: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
    setSelectedPlatform(name);
  };

  const generateCaption = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, platform: selectedPlatform }),
      });
      const data = await res.json();
      if (data.caption) setCaption(data.caption);
    } catch (e) {
      console.error("AI error:", e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatforms.length === 0) { setError("Vyber alespoň jednu platformu."); return; }
    if (!datum) { setError("Vyber datum."); return; }
    setError("");
    setSubmitting(true);
    try {
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

  const charLimit = CHAR_LIMITS[selectedPlatform] || 2200;
  const charCount = caption.length;
  const charPct = Math.min((charCount / charLimit) * 100, 100);

  const renderPreview = () => {
    switch (selectedPlatform) {
      case "Facebook": return <FacebookPreview caption={caption} platform={selectedPlatform} />;
      case "Instagram": return <InstagramPreview caption={caption} />;
      case "LinkedIn": return <LinkedInPreview caption={caption} />;
      case "YouTube Shorts": return <YouTubePreview caption={caption} />;
      case "TikTok": return <TikTokPreview caption={caption} />;
      default: return <FacebookPreview caption={caption} platform={selectedPlatform} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>Nový příspěvek</h1>
          <p style={{ color: "#555", fontSize: 14 }}>Naplánuj příspěvek s AI asistencí</p>
        </div>
      </div>

      {success && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "14px 18px", color: "#4ade80", fontSize: 14 }}>
          ✅ Příspěvek úspěšně přidán! Přesměrovávám na frontu...
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24 }} className="novy-grid">
          {/* LEFT: Form panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Platform selector */}
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <label style={labelStyle}>Platformy</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {PLATFORMS.map((p) => {
                  const sel = selectedPlatforms.includes(p.name);
                  const active = selectedPlatform === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => togglePlatform(p.name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                        border: sel ? `2px solid ${p.color}` : "1px solid #1e1e22",
                        background: sel ? `${p.color}18` : "#0a0a0b",
                        color: sel ? p.color : "#666",
                        fontWeight: sel ? 600 : 400, fontSize: 13,
                        outline: active ? `2px solid ${p.color}44` : "none",
                        outlineOffset: 2,
                        transition: "all 0.15s",
                      }}
                    >
                      <PlatformIcon platform={p.name} size={16} />
                      {p.name}
                      {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
                    </button>
                  );
                })}
              </div>
              {selectedPlatforms.length > 1 && (
                <p style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
                  Příspěvek bude vytvořen pro {selectedPlatforms.length} platformy. Preview ukazuje: <strong style={{ color: "#c9a96e" }}>{selectedPlatform}</strong>
                </p>
              )}
            </div>

            {/* AI Generator */}
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>✨</span>
                <label style={labelStyle}>AI Generator</label>
                <span style={{ fontSize: 11, color: "#c9a96e", background: "rgba(201,169,110,0.1)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Gemini 2.0</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="input-field"
                  placeholder="Téma příspěvku (např. 'výhody investice pro SMB firmy')"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); generateCaption(); } }}
                />
                <button
                  type="button"
                  onClick={generateCaption}
                  disabled={aiGenerating || !aiTopic.trim()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "0 20px", borderRadius: 8, cursor: aiGenerating || !aiTopic.trim() ? "not-allowed" : "pointer",
                    background: aiGenerating || !aiTopic.trim() ? "rgba(201,169,110,0.3)" : "#c9a96e",
                    border: "none", color: "#0a0a0b", fontWeight: 700, fontSize: 13,
                    whiteSpace: "nowrap", height: 42, minWidth: 130,
                    transition: "background 0.15s",
                  }}
                >
                  {aiGenerating ? (
                    <>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#0a0a0b", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                      Generuji...
                    </>
                  ) : "✨ Generovat"}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
                Vygenerovaný text se vloží do pole Caption. Platforma: {selectedPlatform}
              </p>
            </div>

            {/* Templates */}
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <label style={{ ...labelStyle, marginBottom: 12, display: "block" }}>Šablony OneFlow</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setCaption(t.caption)}
                    style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                      background: "#0a0a0b", border: "1px solid #2a2a2e",
                      color: "#aaa", fontWeight: 500,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a96e"; (e.currentTarget as HTMLButtonElement).style.color = "#c9a96e"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2e"; (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={labelStyle}>Caption</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 4, background: "#1e1e22", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${charPct}%`, background: charPct > 90 ? "#f87171" : "#c9a96e", borderRadius: 2, transition: "width 0.2s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: charCount > charLimit ? "#f87171" : "#555" }}>
                    {charCount}/{charLimit}
                  </span>
                </div>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field"
                style={{ minHeight: 180, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                placeholder="Napiš caption nebo použij AI Generator / šablonu..."
              />
            </div>

            {/* Date, time, type */}
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <label style={{ ...labelStyle, marginBottom: 12, display: "block" }}>Plánování</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="date-grid">
                <div>
                  <label style={subLabelStyle}>Datum *</label>
                  <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={subLabelStyle}>Čas</label>
                  <input type="time" value={cas} onChange={(e) => setCas(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={subLabelStyle}>Typ</label>
                  <select value={typ} onChange={(e) => setTyp(e.target.value)} className="input-field">
                    {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Media URL */}
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <label style={{ ...labelStyle, marginBottom: 6, display: "block" }}>Media URL</label>
              <p style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>Google Drive, Canva export nebo jiný odkaz</p>
              <input
                type="url"
                value={mediaFile}
                onChange={(e) => setMediaFile(e.target.value)}
                className="input-field"
                placeholder="https://drive.google.com/..."
              />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                disabled={submitting || success}
                className="btn-gold"
                style={{ opacity: submitting || success ? 0.7 : 1, cursor: submitting || success ? "not-allowed" : "pointer", flex: 1 }}
              >
                {submitting ? (
                  <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#0a0a0b", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Ukládám...</>
                ) : success ? "Uloženo ✓" : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Přidat do fronty{selectedPlatforms.length > 1 ? ` (${selectedPlatforms.length}x)` : ""}
                  </>
                )}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-ghost">Zrušit</button>
            </div>
          </div>

          {/* RIGHT: Preview panel */}
          <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16, height: "fit-content" }}>
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <label style={labelStyle}>Preview</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {selectedPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlatform(p)}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                        background: selectedPlatform === p ? getPlatformColor(p) + "20" : "transparent",
                        border: `1px solid ${selectedPlatform === p ? getPlatformColor(p) : "#2a2a2e"}`,
                        color: selectedPlatform === p ? getPlatformColor(p) : "#666",
                        fontWeight: selectedPlatform === p ? 600 : 400,
                      }}
                    >
                      <PlatformIcon platform={p} size={12} />
                    </button>
                  ))}
                </div>
              </div>
              {renderPreview()}
              {charCount > 0 && (
                <div style={{ marginTop: 12, fontSize: 11, color: "#555", textAlign: "right" }}>
                  {charCount} / {charLimit} znaků
                  {charCount > charLimit && <span style={{ color: "#f87171", marginLeft: 6 }}>⚠️ Překračuje limit</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select.input-field option { background: #111113; color: #f0f0f0; }
        @media (max-width: 900px) {
          .novy-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .date-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "#f0f0f0",
};

const subLabelStyle: React.CSSProperties = {
  fontSize: 12, color: "#888", display: "block", marginBottom: 6,
};
