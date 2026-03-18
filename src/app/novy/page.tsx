'use client';

import { useState } from 'react';

const PLATFORMS = ['FB', 'IG', 'LI', 'TT', 'YT'] as const;
type PlatformKey = typeof PLATFORMS[number];

const PLATFORM_FULL: Record<PlatformKey, string> = {
  FB: 'Facebook', IG: 'Instagram', LI: 'LinkedIn', TT: 'TikTok', YT: 'YouTube',
};

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  FB: '#1877f2', IG: '#e1306c', LI: '#0077b5', TT: '#010101', YT: '#ff0000',
};

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  FB: 'Facebook', IG: 'Instagram', LI: 'LinkedIn', TT: 'TikTok', YT: 'YouTube',
};

const TEMPLATES = [
  {
    label: '💡 Investiční tip',
    text: 'Investiční tip dne:\n\n[Vaše investiční rada nebo insight pro české podnikatele]\n\nOneFlow pomáhá firmám získat kapitál pro růst. 🚀\n\n#investice #podnikání #OneFlow #business',
  },
  {
    label: '📈 Tržní update',
    text: 'Tržní update:\n\n[Aktuální situace na trhu – co to znamená pro české firmy?]\n\nBýt připraven na změny je klíč k úspěchu.\n\n#trh #investice #OneFlow',
  },
  {
    label: '🏆 Klientský příběh',
    text: 'Příběh úspěchu:\n\n[Firma] dokázali s pomocí OneFlow [dosažený výsledek].\n\n„[Citát klienta]"\n\n#úspěch #OneFlow #investice',
  },
  {
    label: '⚠️ Riziko',
    text: 'Věděli jste, že?\n\n[Nejčastější investiční chyba nebo riziko]\n\nJak se chránit:\n✅ [Rada 1]\n✅ [Rada 2]\n\nOneFlow vás provede bezpečně.\n\n#riziko #investice #OneFlow',
  },
  {
    label: '🎯 O OneFlow',
    text: 'OneFlow – vaše investiční platforma pro české firmy.\n\n✅ [Klíčová výhoda 1]\n✅ [Klíčová výhoda 2]\n✅ [Klíčová výhoda 3]\n\nZačněte dnes 👉 oneflow.cz\n\n#OneFlow #investice',
  },
];

const POST_TYPES = ['post', 'reel', 'story', 'video'] as const;
const AI_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube Shorts'];

export default function NovyPage() {
  const [selectedPlats, setSelectedPlats] = useState<PlatformKey[]>([]);
  const [datum, setDatum] = useState('');
  const [cas, setCas] = useState('');
  const [typ, setTyp] = useState<string>('post');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [aiTopic, setAiTopic] = useState('');
  const [aiPlatform, setAiPlatform] = useState('LinkedIn');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const togglePlat = (p: PlatformKey) => {
    setSelectedPlats(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const submit = async () => {
    if (!caption.trim()) { setMsg({ type: 'error', text: 'Vyplň caption příspěvku.' }); return; }
    if (selectedPlats.length === 0) { setMsg({ type: 'error', text: 'Vyber alespoň jednu platformu.' }); return; }
    setLoading(true); setMsg(null);
    try {
      for (const plat of selectedPlats) {
        const res = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platforma: PLATFORM_FULL[plat],
            caption,
            datum,
            cas,
            typ,
            mediaFile: mediaUrl,
            status: datum ? 'scheduled' : 'pending',
          }),
        });
        if (!res.ok) throw new Error('Chyba API');
      }
      setMsg({ type: 'success', text: `Příspěvek přidán do fronty pro: ${selectedPlats.map(p => PLATFORM_LABELS[p]).join(', ')}` });
      setCaption('');
      setSelectedPlats([]);
      setDatum('');
      setCas('');
      setMediaUrl('');
    } catch {
      setMsg({ type: 'error', text: 'Chyba při přidávání do fronty. Zkus to znovu.' });
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true); setAiResult('');
    try {
      const res = await fetch('/api/ai-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, platform: aiPlatform }),
      });
      const data = await res.json();
      setAiResult(data.caption || '');
    } catch { setAiResult('Chyba při generování. Zkus to znovu.'); }
    finally { setAiLoading(false); }
  };

  const charCount = caption.length;
  const charMax = 2200;
  const previewPlatColor = selectedPlats.length > 0 ? PLATFORM_COLORS[selectedPlats[0]] : 'var(--accent-indigo)';

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Nový příspěvek</h1>
      <p className="page-subtitle">Vyplň formulář nebo vygeneruj caption pomocí AI</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: COMPOSER ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Platform selector */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Platformy</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => {
                  const isSelected = selectedPlats.includes(p);
                  return (
                    <button
                      key={p}
                      className="platform-pill"
                      onClick={() => togglePlat(p)}
                      style={{
                        borderColor: isSelected ? PLATFORM_COLORS[p] : 'var(--card-border)',
                        color: isSelected ? PLATFORM_COLORS[p] : 'var(--text-secondary)',
                        background: isSelected ? `${PLATFORM_COLORS[p]}15` : 'transparent',
                        fontWeight: isSelected ? 600 : 500,
                      }}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date, time, type */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Plánování</div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Datum</label>
                  <input type="date" className="input" value={datum} onChange={e => setDatum(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Čas</label>
                  <input type="time" className="input" value={cas} onChange={e => setCas(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Typ příspěvku</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {POST_TYPES.map(t => (
                    <button
                      key={t}
                      className="filter-pill"
                      onClick={() => setTyp(t)}
                      style={typ === t ? {
                        background: 'var(--accent-indigo)',
                        color: '#fff',
                        borderColor: 'var(--accent-indigo)',
                      } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Caption</div>
              <span style={{ fontSize: 12, color: charCount > charMax * 0.9 ? '#ef4444' : 'var(--text-muted)' }}>
                {charCount} / {charMax}
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                className="input"
                rows={8}
                placeholder="Napiš text příspěvku…"
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
              <div className="form-group">
                <label className="form-label">Media URL (volitelné)</label>
                <input
                  className="input"
                  type="url"
                  placeholder="https://…"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Přidávám…' : '+ Přidat do fronty'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { setCaption(''); setSelectedPlats([]); setDatum(''); setCas(''); setMediaUrl(''); setMsg(null); }}
            >
              Zrušit
            </button>
          </div>

          {msg && (
            <div className={msg.type === 'success' ? 'msg-success' : 'msg-error'}>
              {msg.text}
            </div>
          )}
        </div>

        {/* ── RIGHT: AI + TEMPLATES + PREVIEW ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* AI Generator */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">AI Generátor</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gemini</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Platforma</label>
                <select className="input" value={aiPlatform} onChange={e => setAiPlatform(e.target.value)}>
                  {AI_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  placeholder="Téma příspěvku…"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateAI()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={generateAI} disabled={aiLoading} style={{ flexShrink: 0 }}>
                  {aiLoading ? '…' : '✨ Gen'}
                </button>
              </div>
              {aiResult && (
                <div>
                  <div className="ai-result-box">{aiResult}</div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 8, width: '100%' }}
                    onClick={() => setCaption(aiResult)}
                  >
                    ← Použít jako caption
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Templates */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Šablony OneFlow</div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.label}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCaption(tmpl.text)}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {caption && (
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">Preview</div>
                {selectedPlats.length > 0 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedPlats.map(p => (
                      <span
                        key={p}
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: `${PLATFORM_COLORS[p]}20`,
                          color: PLATFORM_COLORS[p],
                          fontWeight: 600,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-body">
                <div
                  className="preview-card"
                  style={{ borderLeft: `3px solid ${previewPlatColor}` }}
                >
                  {datum && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {datum}{cas ? ` · ${cas}` : ''}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {caption.slice(0, 200)}
                    {caption.length > 200 && <span style={{ color: 'var(--text-muted)' }}>… +{caption.length - 200} znaků</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
