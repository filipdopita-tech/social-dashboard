'use client';

import { useState } from 'react';

const PLATFORMS = ['FB', 'IG', 'LI', 'TT', 'YT'];
const PLATFORM_FULL: Record<string, string> = {
  FB: 'Facebook', IG: 'Instagram', LI: 'LinkedIn', TT: 'TikTok', YT: 'YouTube'
};
const PLATFORM_COLORS: Record<string, string> = {
  FB: '#1877f2', IG: '#e1306c', LI: '#0077b5', TT: '#69c9d0', YT: '#ff0000',
};

const TEMPLATES: Array<{ label: string; text: string }> = [
  {
    label: '💡 INVESTIČNÍ TIP',
    text: 'Investiční tip dne:\n\n[Vaše investiční rada nebo insight pro české podnikatele]\n\nOneFlow pomáhá firmám získat kapitál pro růst. 🚀\n\n#investice #podnikání #OneFlow #business',
  },
  {
    label: '📈 TRŽNÍ UPDATE',
    text: 'Tržní update:\n\n[Aktuální situace na trhu – co to znamená pro české firmy?]\n\nBýt připraven na změny je klíč k úspěchu.\n\n#trh #investice #OneFlow',
  },
  {
    label: '🏆 KLIENTSKÝ PŘÍBĚH',
    text: 'Příběh úspěchu:\n\n[Jméno klienta / firma] dokázali s pomocí OneFlow [dosažený výsledek].\n\n„[Citát klienta]"\n\n#úspěch #OneFlow #investice',
  },
  {
    label: '⚠️ RIZIKO',
    text: 'Věděli jste, že?\n\n[Nejčastější investiční chyba nebo riziko]\n\nJak se chránit:\n✅ [Rada 1]\n✅ [Rada 2]\n\nOneFlow vás provede bezpečně.\n\n#riziko #investice #OneFlow',
  },
  {
    label: '🎯 ONEFLOW',
    text: 'OneFlow – vaša investiční platforma pro české firmy.\n\n✅ [Klíčová výhoda 1]\n✅ [Klíčová výhoda 2]\n✅ [Klíčová výhoda 3]\n\nZačněte dnes 👉 oneflow.cz\n\n#OneFlow #investice #české firmy',
  },
];

export default function NovyPage() {
  const [selectedPlats, setSelectedPlats] = useState<string[]>([]);
  const [datum, setDatum] = useState('');
  const [cas, setCas] = useState('');
  const [typ, setTyp] = useState('post');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [aiTopic, setAiTopic] = useState('');
  const [aiPlatform, setAiPlatform] = useState('LinkedIn');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const togglePlat = (p: string) => {
    setSelectedPlats(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const submit = async () => {
    if (!caption.trim()) { setMsg('! Vyplň caption'); return; }
    if (selectedPlats.length === 0) { setMsg('! Vyber alespoň jednu platformu'); return; }
    setLoading(true); setMsg('');
    try {
      for (const plat of selectedPlats) {
        const res = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platforma: PLATFORM_FULL[plat] || plat,
            caption,
            datum,
            cas,
            typ,
            mediaFile: mediaUrl,
            status: datum ? 'scheduled' : 'pending',
          }),
        });
        if (!res.ok) throw new Error('Chyba');
      }
      setMsg(`✓ Přidáno do fronty pro: ${selectedPlats.join(', ')}`);
      setCaption(''); setSelectedPlats([]); setDatum(''); setCas(''); setMediaUrl('');
    } catch { setMsg('! Chyba při přidávání do fronty'); }
    finally { setLoading(false); }
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
    } catch { setAiResult('! Chyba při generování'); }
    finally { setAiLoading(false); }
  };

  const charCount = caption.length;
  const charMax = 2200;

  const previewText = caption.slice(0, 100) + (caption.length > 100 ? '…' : '');
  const previewColor = selectedPlats.length > 0 ? PLATFORM_COLORS[selectedPlats[0]] : 'var(--border-primary)';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 1, background: 'var(--border-primary)', padding: 1 }}>

      {/* ── LEFT: COMPOSER ── */}
      <div style={{ flex: '0 0 55%', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Panel header */}
        <div className="panel-header">
          <div className="panel-accent" style={{ background: 'var(--accent-gold)' }} />
          <span className="panel-title">▶ Nový příspěvek</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Platform selector */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
              &gt; PLATFORMA
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  className={`btn-terminal ${selectedPlats.includes(p) ? 'active' : ''}`}
                  onClick={() => togglePlat(p)}
                  style={selectedPlats.includes(p) ? { borderColor: PLATFORM_COLORS[p], color: PLATFORM_COLORS[p], background: `${PLATFORM_COLORS[p]}11` } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Datum + Čas */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
              &gt; DATUM / ČAS
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="date" className="input-terminal" value={datum} onChange={e => setDatum(e.target.value)} style={{ flex: 2 }} />
              <input type="time" className="input-terminal" value={cas} onChange={e => setCas(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>

          {/* Typ */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
              &gt; TYP
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['post', 'reel', 'story', 'video'].map(t => (
                <button
                  key={t}
                  className={`btn-terminal ${typ === t ? 'active' : ''}`}
                  onClick={() => setTyp(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                &gt; CAPTION
              </div>
              <div style={{ fontSize: 9, color: charCount > charMax * 0.9 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                {charCount} / {charMax}
              </div>
            </div>
            <textarea
              className="input-terminal"
              style={{ resize: 'none', flex: 1, minHeight: 140, lineHeight: 1.6 }}
              rows={10}
              placeholder="> text příspěvku..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
          </div>

          {/* Media URL */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
              &gt; MEDIA URL
            </div>
            <input
              className="input-terminal"
              placeholder="> https://..."
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
            />
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-primary)', margin: '2px 0' }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-terminal primary" onClick={submit} disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="blink-cursor">PŘIDÁVÁM</span> : '+ PŘIDAT DO FRONTY'}
            </button>
            <button className="btn-terminal" onClick={() => { setCaption(''); setSelectedPlats([]); setDatum(''); setCas(''); setMediaUrl(''); setMsg(''); }}>
              ZRUŠIT
            </button>
          </div>

          {msg && (
            <div style={{ fontSize: 9, color: msg.startsWith('!') ? 'var(--accent-red)' : 'var(--accent-green)', letterSpacing: 0.5 }}>
              {msg}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: AI + TEMPLATES + PREVIEW ── */}
      <div style={{ flex: 1, background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 1 }}>

        {/* AI Generator */}
        <div style={{ flex: '0 0 auto', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-primary)' }}>
          <div className="panel-header">
            <div className="panel-accent" style={{ background: 'var(--accent-gold)' }} />
            <span className="panel-title">▶ AI Generátor</span>
            <span style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--text-muted)' }}>Gemini</span>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input-terminal"
                placeholder="> téma..."
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateAI()}
                style={{ flex: 1 }}
              />
              <select className="input-terminal" value={aiPlatform} onChange={e => setAiPlatform(e.target.value)} style={{ width: 110, flexShrink: 0 }}>
                {['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube Shorts'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button className="btn-terminal primary" onClick={generateAI} disabled={aiLoading} style={{ flexShrink: 0 }}>
                {aiLoading ? <span className="blink-cursor">GEN</span> : '✨ GEN'}
              </button>
            </div>

            {aiResult && (
              <div>
                <div style={{
                  background: 'rgba(201,169,110,0.04)',
                  border: '1px solid var(--border-primary)',
                  padding: '8px',
                  fontSize: 10,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  maxHeight: 140,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {aiResult}
                </div>
                <button
                  className="btn-terminal sm"
                  style={{ marginTop: 4 }}
                  onClick={() => setCaption(aiResult)}
                >
                  ← POUŽÍT V EDITORU
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Templates */}
        <div style={{ flex: '0 0 auto', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-primary)' }}>
          <div className="panel-header">
            <div className="panel-accent" style={{ background: 'var(--accent-blue)' }} />
            <span className="panel-title">▶ Šablony</span>
          </div>
          <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {TEMPLATES.map(tmpl => (
              <button
                key={tmpl.label}
                className="btn-terminal sm"
                onClick={() => setCaption(tmpl.text)}
                title={tmpl.text.slice(0, 80)}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, background: 'var(--bg-panel-alt)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="panel-header">
            <div className="panel-accent" style={{ background: previewColor }} />
            <span className="panel-title">▶ Preview</span>
            {selectedPlats.length > 0 && (
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                {selectedPlats.join(' + ')}
              </span>
            )}
          </div>
          <div style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
            {caption ? (
              <div style={{
                background: 'var(--bg-panel)',
                border: `1px solid ${previewColor}44`,
                borderLeft: `3px solid ${previewColor}`,
                padding: '10px 12px',
                animation: 'fadeIn 0.2s ease',
              }}>
                {selectedPlats.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {selectedPlats.map(p => (
                      <span key={p} style={{
                        fontSize: 8,
                        padding: '2px 6px',
                        background: `${PLATFORM_COLORS[p]}22`,
                        color: PLATFORM_COLORS[p],
                        borderRadius: 2,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}>
                        {p}
                      </span>
                    ))}
                    {datum && (
                      <span style={{ fontSize: 8, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {datum} {cas}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {previewText}
                </div>
                {caption.length > 100 && (
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                    + {caption.length - 100} znaků...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 10, opacity: 0.5 }}>
                — preview se zobrazí po zadání captionu —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
