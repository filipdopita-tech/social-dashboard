'use client';

import { useState, useEffect, useCallback } from 'react';

interface QueueItem {
  id: string;
  datum: string;
  cas: string;
  platforma: string;
  typ: string;
  caption: string;
  mediaFile: string;
  status: string;
  rowIndex: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: '#1877f2',
  Instagram: '#e1306c',
  LinkedIn: '#0077b5',
  TikTok: '#69c9d0',
  YouTube: '#ff0000',
  FB: '#1877f2', IG: '#e1306c', LI: '#0077b5', TT: '#69c9d0', YT: '#ff0000',
};

function platColor(p: string) {
  return PLATFORM_COLORS[p] || '#6a7a8a';
}

function platShort(p: string) {
  if (!p) return '?';
  if (p.length <= 3) return p.toUpperCase();
  return p.slice(0, 2).toUpperCase();
}

function StatusTag({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const cls = s === 'scheduled' ? 'tag tag-sched' :
              s === 'posted' ? 'tag tag-posted' :
              s === 'error' || s === 'err' ? 'tag tag-err' :
              'tag tag-pend';
  const label = s === 'scheduled' ? 'SCHED' :
                s === 'posted' ? 'POSTED' :
                s === 'error' || s === 'err' ? 'ERR' :
                'PEND';
  return <span className={cls}>{label}</span>;
}

// ── PANEL 1: FRONTA ──────────────────────────────────────────────
function FrameQueue({ items }: { items: QueueItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const upcoming = items.filter(i => i.status !== 'posted').slice(0, 40);

  return (
    <div className="panel" style={{ gridColumn: 1, gridRow: '1 / 4' }}>
      <div className="panel-header">
        <div className="panel-accent" style={{ background: 'var(--accent-gold)' }} />
        <span className="panel-title">▶ Fronta</span>
        <span className="panel-count">{upcoming.length}</span>
      </div>
      <div className="panel-content">
        {upcoming.length === 0 && (
          <div style={{ padding: '16px 10px', color: 'var(--text-muted)', fontSize: 10 }}>
            — žádné čekající příspěvky —
          </div>
        )}
        {upcoming.map(item => (
          <div key={item.id}>
            <div
              className="queue-row"
              style={{ borderLeftColor: platColor(item.platforma) }}
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="platform-dot" style={{ background: platColor(item.platforma) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 1 }}>
                  {item.datum} {item.cas && `· ${item.cas}`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.caption || '— bez textu —'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{platShort(item.platforma)}</span>
                <StatusTag status={item.status} />
              </div>
            </div>
            {expanded === item.id && (
              <div style={{ padding: '8px 10px 8px 21px', background: 'rgba(201,169,110,0.03)', borderBottom: '1px solid var(--border-primary)', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {item.caption}
                </div>
                {item.mediaFile && (
                  <div style={{ marginTop: 4, fontSize: 9, color: 'var(--text-muted)' }}>
                    🖼 {item.mediaFile}
                  </div>
                )}
                <div style={{ marginTop: 4, fontSize: 9, color: 'var(--text-muted)' }}>
                  Typ: {item.typ} | ID: #{item.id}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PANEL 2: KALENDÁŘ ────────────────────────────────────────────
function FrameCalendar({ items }: { items: QueueItem[] }) {
  const today = new Date();
  // Get Mon–Sun of current week
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayNames = ['PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO', 'NE'];
  const todayStr = today.toISOString().split('T')[0];

  function isoDate(d: Date) {
    return d.toISOString().split('T')[0];
  }

  function itemsForDay(d: Date) {
    const ds = isoDate(d);
    return items.filter(i => i.datum === ds);
  }

  return (
    <div className="panel" style={{ gridColumn: 2, gridRow: '1 / 4' }}>
      <div className="panel-header">
        <div className="panel-accent" style={{ background: 'var(--accent-blue)' }} />
        <span className="panel-title">▶ Kalendář</span>
        <span className="panel-count" style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-muted)' }}>
          tento týden
        </span>
      </div>
      <div className="panel-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', height: '100%', gap: 0 }}>
          {days.map((d, i) => {
            const ds = isoDate(d);
            const isToday = ds === todayStr;
            const dayItems = itemsForDay(d);
            return (
              <div
                key={ds}
                style={{
                  borderRight: i < 6 ? '1px solid var(--border-primary)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: isToday ? 'rgba(201,169,110,0.04)' : 'transparent',
                  borderTop: isToday ? '2px solid var(--accent-gold)' : '2px solid transparent',
                }}
              >
                {/* Day header */}
                <div style={{
                  padding: '5px 4px',
                  borderBottom: '1px solid var(--border-primary)',
                  textAlign: 'center',
                  background: 'var(--bg-header)',
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: 9, color: isToday ? 'var(--accent-gold)' : 'var(--text-muted)', letterSpacing: 1, fontWeight: 600 }}>
                    {dayNames[i]}
                  </div>
                  <div style={{ fontSize: 12, color: isToday ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: isToday ? 700 : 400 }}>
                    {d.getDate()}
                  </div>
                </div>
                {/* Posts */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2px' }}>
                  {dayItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '2px 3px',
                        marginBottom: 2,
                        borderLeft: `2px solid ${platColor(item.platforma)}`,
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: 9,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'default',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>{item.cas || '--:--'}</span>
                      {' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{item.caption?.slice(0, 20) || '…'}</span>
                    </div>
                  ))}
                  {dayItems.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 9, marginTop: 8, opacity: 0.5 }}>—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PANEL 3: PLATFORMY ───────────────────────────────────────────
function FramePlatforms({ items }: { items: QueueItem[] }) {
  const platforms = [
    { id: 'Facebook', short: 'FB', color: '#1877f2', connected: true },
    { id: 'Instagram', short: 'IG', color: '#e1306c', connected: true },
    { id: 'LinkedIn', short: 'LI', color: '#0077b5', connected: true },
    { id: 'TikTok', short: 'TT', color: '#69c9d0', connected: false },
    { id: 'YouTube', short: 'YT', color: '#ff0000', connected: true },
  ];

  function countFor(name: string, status?: string) {
    return items.filter(i => {
      const match = i.platforma?.toLowerCase().includes(name.toLowerCase()) ||
                    i.platforma?.toLowerCase().includes(name.slice(0,2).toLowerCase());
      if (status) return match && i.status === status;
      return match;
    }).length;
  }

  return (
    <div className="panel" style={{ gridColumn: 3, gridRow: '1 / 4' }}>
      <div className="panel-header">
        <div className="panel-accent" style={{ background: 'var(--accent-green)' }} />
        <span className="panel-title">▶ Platformy</span>
      </div>
      <div className="panel-content">
        {platforms.map(p => {
          const total = countFor(p.short) + countFor(p.id);
          const sched = countFor(p.short, 'scheduled') + countFor(p.id, 'scheduled');
          const posted = countFor(p.short, 'posted') + countFor(p.id, 'posted');
          const pct = total > 0 ? Math.min(100, Math.round((posted / (total || 1)) * 100)) : 0;
          return (
            <div key={p.id} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.connected ? p.color : 'var(--text-muted)', boxShadow: p.connected ? `0 0 6px ${p.color}66` : 'none', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600, flex: 1 }}>{p.id}</span>
                <span className={`tag ${p.connected ? 'tag-posted' : 'tag-pend'}`}>
                  {p.connected ? 'CONNECTED' : 'PENDING'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 9, color: 'var(--text-muted)', marginBottom: 5 }}>
                <span>CELKEM: <span style={{ color: 'var(--text-secondary)' }}>{total}</span></span>
                <span>SCHED: <span style={{ color: 'var(--accent-amber)' }}>{sched}</span></span>
                <span>POSTED: <span style={{ color: 'var(--accent-green)' }}>{posted}</span></span>
              </div>
              {/* Mini bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: p.connected ? p.color : 'var(--text-muted)',
                  borderRadius: 1,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PANEL 4: RYCHLÝ POST ─────────────────────────────────────────
function FrameQuickPost({ onAdded }: { onAdded: () => void }) {
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [datum, setDatum] = useState('');
  const [cas, setCas] = useState('');
  const [typ, setTyp] = useState('post');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const togglePlat = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const submit = async () => {
    if (!caption || platforms.length === 0) { setMsg('! Vyplň caption a vyber platformu'); return; }
    setLoading(true); setMsg('');
    try {
      for (const plat of platforms) {
        await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platforma: plat, caption, datum, cas, typ, status: datum ? 'scheduled' : 'pending' }),
        });
      }
      setMsg('✓ Přidáno do fronty');
      setCaption(''); setPlatforms([]); setDatum(''); setCas('');
      onAdded();
    } catch { setMsg('! Chyba při přidávání'); }
    finally { setLoading(false); }
  };

  const platOptions = ['FB', 'IG', 'LI', 'TT', 'YT'];
  const platFull: Record<string, string> = { FB: 'Facebook', IG: 'Instagram', LI: 'LinkedIn', TT: 'TikTok', YT: 'YouTube' };

  return (
    <div className="panel" style={{ gridColumn: 1, gridRow: '4 / 5' }}>
      <div className="panel-header">
        <div className="panel-accent" style={{ background: 'var(--accent-amber)' }} />
        <span className="panel-title">▶ Rychlý Post</span>
      </div>
      <div className="panel-content" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Platforms */}
        <div style={{ display: 'flex', gap: 4 }}>
          {platOptions.map(p => (
            <button
              key={p}
              className={`btn-terminal sm ${platforms.includes(platFull[p]) ? 'active' : ''}`}
              onClick={() => togglePlat(platFull[p])}
              style={platforms.includes(platFull[p]) ? { borderColor: platColor(p), color: platColor(p) } : {}}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Date + time */}
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="date"
            className="input-terminal"
            value={datum}
            onChange={e => setDatum(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            type="time"
            className="input-terminal"
            value={cas}
            onChange={e => setCas(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        {/* Typ */}
        <select className="input-terminal" value={typ} onChange={e => setTyp(e.target.value)}>
          <option value="post">post</option>
          <option value="reel">reel</option>
          <option value="story">story</option>
          <option value="video">video</option>
        </select>

        {/* Caption */}
        <textarea
          className="input-terminal"
          style={{ resize: 'none', flex: 1, minHeight: 60 }}
          rows={4}
          placeholder="> caption..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />

        {/* Submit */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn-terminal primary" onClick={submit} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'PŘIDÁVÁM_' : '+ PŘIDAT DO FRONTY'}
          </button>
        </div>

        {msg && (
          <div style={{ fontSize: 9, color: msg.startsWith('!') ? 'var(--accent-red)' : 'var(--accent-green)', letterSpacing: 0.5 }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PANEL 5: VÝKON / HEATMAP ─────────────────────────────────────
function FrameHeatmap({ items }: { items: QueueItem[] }) {
  const days = 30;
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const ds = d.toISOString().split('T')[0];
    const count = items.filter(it => it.datum === ds && it.status === 'posted').length;
    return { date: ds, count, day: d.getDate() };
  });

  function heatClass(n: number) {
    if (n === 0) return 'heatmap-cell h0';
    if (n === 1) return 'heatmap-cell h1';
    if (n === 2) return 'heatmap-cell h2';
    return 'heatmap-cell h3';
  }

  // Platforms bar chart
  const platStats = [
    { name: 'FB', color: '#1877f2' },
    { name: 'IG', color: '#e1306c' },
    { name: 'LI', color: '#0077b5' },
    { name: 'TT', color: '#69c9d0' },
    { name: 'YT', color: '#ff0000' },
  ].map(p => {
    const count = items.filter(i => {
      const pl = (i.platforma || '').toLowerCase();
      return pl.includes(p.name.toLowerCase()) || pl.startsWith(p.name.toLowerCase());
    }).length;
    return { ...p, count };
  });
  const maxCount = Math.max(1, ...platStats.map(p => p.count));

  return (
    <div className="panel" style={{ gridColumn: 2, gridRow: '4 / 5' }}>
      <div className="panel-header">
        <div className="panel-accent" style={{ background: 'var(--accent-amber)' }} />
        <span className="panel-title">▶ Výkon</span>
        <span className="panel-count">posledních {days} dní</span>
      </div>
      <div className="panel-content" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
          {cells.map(c => (
            <div
              key={c.date}
              className={heatClass(c.count)}
              title={`${c.date}: ${c.count} postů`}
              style={{ height: 16 }}
            />
          ))}
        </div>

        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-muted)' }}>
          <span>-30d</span>
          <span>-20d</span>
          <span>-10d</span>
          <span>dnes</span>
        </div>

        {/* Platform bars */}
        <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8 }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>
            Celkem dle platformy
          </div>
          {platStats.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', width: 22 }}>{p.name}</span>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(p.count / maxCount) * 100}%`,
                  background: p.color,
                  borderRadius: 1,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: 9, color: 'var(--text-secondary)', width: 16, textAlign: 'right' }}>{p.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PANEL 6: AI NÁPADY ────────────────────────────────────────────
function FrameAI() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!topic) return;
    setLoading(true); setResult('');
    try {
      const res = await fetch('/api/ai-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform }),
      });
      const data = await res.json();
      setResult(data.caption || '');
    } catch { setResult('! Chyba při generování'); }
    finally { setLoading(false); }
  };

  const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube Shorts'];

  return (
    <div className="panel" style={{ gridColumn: 3, gridRow: '4 / 5' }}>
      <div className="panel-header">
        <div className="panel-accent" style={{ background: 'var(--accent-gold)' }} />
        <span className="panel-title">▶ AI Nápady</span>
        <span className="panel-count" style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--text-muted)' }}>Gemini</span>
      </div>
      <div className="panel-content" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input
          className="input-terminal"
          placeholder="> téma..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          <select className="input-terminal" value={platform} onChange={e => setPlatform(e.target.value)} style={{ flex: 1 }}>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn-terminal primary" onClick={generate} disabled={loading} style={{ flexShrink: 0 }}>
            {loading ? <span className="blink-cursor">GENERATING</span> : '✨ GENEROVAT'}
          </button>
        </div>

        {result && (
          <div style={{
            flex: 1,
            background: 'rgba(201,169,110,0.04)',
            border: '1px solid var(--border-primary)',
            padding: '8px',
            fontSize: 10,
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            animation: 'fadeIn 0.3s ease',
          }}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────
export default function DashboardPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 60000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 12, letterSpacing: 2 }}>
        NAČÍTÁM DATA_
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1.4fr 1fr',
      gridTemplateRows: '1fr 1fr 1fr 1fr',
      gap: 1,
      background: 'var(--border-primary)',
      padding: 1,
    }}>
      <FrameQueue items={items} />
      <FrameCalendar items={items} />
      <FramePlatforms items={items} />
      <FrameQuickPost onAdded={fetchItems} />
      <FrameHeatmap items={items} />
      <FrameAI />
    </div>
  );
}
