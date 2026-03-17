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
  Facebook: '#1877f2', FB: '#1877f2',
  Instagram: '#e1306c', IG: '#e1306c',
  LinkedIn: '#0077b5', LI: '#0077b5',
  TikTok: '#69c9d0', TT: '#69c9d0',
  YouTube: '#ff0000', YT: '#ff0000',
};

function platColor(p: string) { return PLATFORM_COLORS[p] || '#6a7a8a'; }
function platShort(p: string) {
  if (!p) return '?';
  const map: Record<string, string> = { Facebook: 'FB', Instagram: 'IG', LinkedIn: 'LI', TikTok: 'TT', YouTube: 'YT' };
  return map[p] || (p.length <= 3 ? p.toUpperCase() : p.slice(0,2).toUpperCase());
}

function StatusTag({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const cls = s === 'scheduled' ? 'tag tag-sched' :
              s === 'posted' ? 'tag tag-posted' :
              s === 'error' || s === 'err' ? 'tag tag-err' :
              'tag tag-pend';
  const label = s === 'scheduled' ? 'SCHED' : s === 'posted' ? 'POSTED' : (s === 'error' || s === 'err') ? 'ERR' : 'PEND';
  return <span className={cls}>{label}</span>;
}

export default function FrontaPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platFilter, setPlatFilter] = useState<string>('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) { const data = await res.json(); setItems(data.items || []); }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateStatus = async (item: QueueItem, newStatus: string) => {
    try {
      await fetch(`/api/queue?id=${item.id}&rowIndex=${item.rowIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchItems();
    } catch {}
  };

  const deleteItem = async (item: QueueItem) => {
    if (!confirm(`Smazat #${item.id}?`)) return;
    setDeleting(item.id);
    try {
      await fetch(`/api/queue?id=${item.id}&rowIndex=${item.rowIndex}`, { method: 'DELETE' });
      fetchItems();
    } catch {}
    finally { setDeleting(null); }
  };

  const statusFilters = ['ALL', 'PEND', 'SCHED', 'POSTED', 'ERR'];
  const platFilters = ['ALL', 'FB', 'IG', 'LI', 'TT', 'YT'];

  const filtered = items.filter(item => {
    const s = (item.status || '').toLowerCase();
    const statusOk = statusFilter === 'ALL' ||
      (statusFilter === 'PEND' && s === 'pending') ||
      (statusFilter === 'SCHED' && s === 'scheduled') ||
      (statusFilter === 'POSTED' && s === 'posted') ||
      (statusFilter === 'ERR' && (s === 'error' || s === 'err'));
    const pl = (item.platforma || '').toLowerCase();
    const platOk = platFilter === 'ALL' || pl.includes(platFilter.toLowerCase()) ||
      (platFilter === 'FB' && pl.includes('facebook')) ||
      (platFilter === 'IG' && pl.includes('instagram')) ||
      (platFilter === 'LI' && pl.includes('linkedin')) ||
      (platFilter === 'TT' && pl.includes('tiktok')) ||
      (platFilter === 'YT' && pl.includes('youtube'));
    return statusOk && platOk;
  });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: 36,
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-primary)',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{ width: 3, height: 14, background: 'var(--accent-gold)', borderRadius: 1 }} />
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-secondary)' }}>
          Fronta příspěvků
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 2 }}>
          {filtered.length}/{items.length}
        </span>

        <span className="sep" style={{ marginLeft: 8 }}>|</span>

        {/* Status filter */}
        {statusFilters.map(f => (
          <button key={f} className={`btn-terminal sm ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
            {f}
          </button>
        ))}

        <span className="sep">|</span>

        {/* Platform filter */}
        {platFilters.map(f => (
          <button
            key={f}
            className={`btn-terminal sm ${platFilter === f ? 'active' : ''}`}
            onClick={() => setPlatFilter(f)}
            style={platFilter === f && f !== 'ALL' ? { borderColor: platColor(f), color: platColor(f) } : {}}
          >
            {f}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <button className="btn-terminal sm" onClick={fetchItems}>↻ OBNOVIT</button>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 70px 90px 55px 60px 1fr 120px 70px 100px',
        gap: 0,
        padding: '4px 12px',
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-primary)',
        flexShrink: 0,
      }}>
        {['#', 'PLATFORMA', 'DATUM', 'ČAS', 'TYP', 'CAPTION', 'MEDIA', 'STATUS', 'AKCE'].map(col => (
          <div key={col} style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, padding: '0 4px' }}>
            {col}
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, letterSpacing: 2 }}>
            NAČÍTÁM_
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 10 }}>
            — žádné příspěvky odpovídají filtru —
          </div>
        )}
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 70px 90px 55px 60px 1fr 120px 70px 100px',
              gap: 0,
              padding: '5px 12px',
              borderBottom: '1px solid rgba(19,30,42,0.5)',
              background: idx % 2 === 1 ? 'rgba(255,255,255,0.006)' : 'transparent',
              alignItems: 'center',
              transition: 'background 0.1s ease',
              opacity: deleting === item.id ? 0.4 : 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,169,110,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 1 ? 'rgba(255,255,255,0.006)' : 'transparent')}
          >
            {/* # */}
            <div style={{ fontSize: 9, color: 'var(--text-muted)', padding: '0 4px' }}>#{idx + 1}</div>

            {/* Platform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: platColor(item.platforma), flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{platShort(item.platforma)}</span>
            </div>

            {/* Datum */}
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', padding: '0 4px', fontVariantNumeric: 'tabular-nums' }}>
              {item.datum || '—'}
            </div>

            {/* Čas */}
            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '0 4px', fontVariantNumeric: 'tabular-nums' }}>
              {item.cas || '—'}
            </div>

            {/* Typ */}
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, padding: '0 4px' }}>
              {item.typ || 'post'}
            </div>

            {/* Caption */}
            <div style={{ fontSize: 11, color: 'var(--text-primary)', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.caption || '—'}
            </div>

            {/* Media */}
            <div style={{ fontSize: 9, color: 'var(--text-muted)', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.mediaFile || '—'}
            </div>

            {/* Status */}
            <div style={{ padding: '0 4px' }}>
              <StatusTag status={item.status} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 3, padding: '0 4px' }}>
              <button
                className="btn-terminal sm"
                title="Změnit status"
                onClick={() => {
                  const s = (item.status || '').toLowerCase();
                  const next = s === 'pending' ? 'scheduled' : s === 'scheduled' ? 'posted' : 'pending';
                  updateStatus(item, next);
                }}
              >
                ↺
              </button>
              <button
                className="btn-terminal sm danger"
                title="Smazat"
                onClick={() => deleteItem(item)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
