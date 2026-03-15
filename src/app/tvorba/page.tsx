"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const HASHTAG_SETS: Record<string, string[]> = {
  investment: ["#investice", "#investovani", "#oneflow", "#crowdfunding", "#portfolio", "#zhodnoceni", "#pasivniprijem"],
  education: ["#financnigramotnost", "#investicnivzdelavani", "#oneflow", "#finance", "#sporeni", "#penize"],
  motivation: ["#motivace", "#uspech", "#podnikani", "#oneflow", "#cile", "#financnisloboda", "#rust"],
  platform: ["#oneflow", "#investicniplatforma", "#ceskystartup", "#fintech", "#cesko", "#inovace"],
};

export default function TvorbaPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [platforma, setPlatforma] = useState("Obě");
  const [datum, setDatum] = useState("");
  const [cas, setCas] = useState("10:00");
  const [typ, setTyp] = useState("post");
  const [mediaFile, setMediaFile] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const maxChars = platforma === "Instagram" ? 2200 : 63206;
  const charCount = caption.length;
  const isOverLimit = charCount > maxChars;

  const addHashtags = (setKey: string) => {
    const tags = HASHTAG_SETS[setKey];
    if (tags) {
      const existing = caption.trim();
      const newCaption = existing ? `${existing}\n\n${tags.join(" ")}` : tags.join(" ");
      setCaption(newCaption);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || !datum) return;

    setSaving(true);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datum,
          cas,
          platforma,
          typ,
          caption,
          mediaFile,
          status: "pending",
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/fronta"), 1500);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dark-100">Příspěvek přidán!</h2>
          <p className="text-dark-400 mt-2">Přesměrování na frontu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Nový příspěvek</h1>
        <p className="text-dark-400 mt-1">Vytvořte nový příspěvek do fronty</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Form */}
        <div className="space-y-5">
          {/* Platform */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">Platforma</label>
            <div className="flex gap-2">
              {["Facebook", "Instagram", "Obě"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatforma(p)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    platforma === p
                      ? p === "Instagram" ? "bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/40" :
                        p === "Facebook" ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40" :
                        "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40"
                      : "bg-dark-800 text-dark-400 hover:text-dark-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">Typ příspěvku</label>
            <select
              value={typ}
              onChange={(e) => setTyp(e.target.value)}
              className="input-field w-full"
            >
              <option value="post">Post</option>
              <option value="story">Story</option>
              <option value="reel">Reel</option>
              <option value="carousel">Carousel</option>
            </select>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Datum</label>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Čas</label>
              <input
                type="time"
                value={cas}
                onChange={(e) => setCas(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-dark-300 text-sm font-medium">Caption</label>
              <span className={`text-xs ${isOverLimit ? "text-red-400" : "text-dark-500"}`}>
                {charCount}/{maxChars}
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Napište text příspěvku..."
              rows={6}
              className={`input-field w-full resize-y ${isOverLimit ? "!ring-2 !ring-red-500 !border-red-500" : ""}`}
              required
            />
          </div>

          {/* Hashtag sets */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">Hashtagy</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(HASHTAG_SETS).map(([key, tags]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => addHashtags(key)}
                  className="bg-dark-800 hover:bg-dark-700 text-dark-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  title={tags.join(" ")}
                >
                  {key === "investment" ? "Investice" :
                   key === "education" ? "Vzdělávání" :
                   key === "motivation" ? "Motivace" : "Platforma"}
                </button>
              ))}
            </div>
          </div>

          {/* Media file */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">Soubor média (cesta/URL)</label>
            <input
              type="text"
              value={mediaFile}
              onChange={(e) => setMediaFile(e.target.value)}
              placeholder="https://... nebo cesta k souboru"
              className="input-field w-full"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !caption.trim() || !datum || isOverLimit}
            className="btn-primary w-full !py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Ukládám..." : "Přidat do fronty"}
          </button>
        </div>

        {/* Right - Preview */}
        <div>
          <label className="block text-dark-300 text-sm font-medium mb-2">Náhled</label>
          <div className="card !bg-dark-800 space-y-4">
            {/* Fake post header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">OF</span>
              </div>
              <div>
                <p className="text-dark-100 font-semibold text-sm">OneFlow</p>
                <p className="text-dark-500 text-xs">
                  {datum || "Datum"} v {cas || "čas"} &middot; {platforma}
                </p>
              </div>
            </div>

            {/* Media placeholder */}
            {mediaFile ? (
              <div className="bg-dark-700 rounded-lg aspect-square flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-dark-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-dark-500 text-xs mt-2 break-all px-4">{mediaFile}</p>
                </div>
              </div>
            ) : (
              <div className="bg-dark-700 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-dark-500 text-sm">Bez média</p>
              </div>
            )}

            {/* Caption preview */}
            <div className="text-dark-200 text-sm whitespace-pre-wrap break-words">
              {caption || <span className="text-dark-500 italic">Text příspěvku se zobrazí zde...</span>}
            </div>

            {/* Fake engagement */}
            <div className="flex items-center gap-6 pt-2 border-t border-dark-700 text-dark-500 text-xs">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                To se mi líbí
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Komentář
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Sdílet
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
