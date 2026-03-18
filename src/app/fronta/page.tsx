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
  TikTok: '#010101', TT: '#010101',
  YouTube: '#ff0000', YT: '#ff0000',
};

function platColor(p: string): string {
  return PLATFORM_COLORS[p] || '#6b7a99';
}

function platShort(p: string): string {
  if (!p) return '?';
  const map: Record<string, string> = {
    Facebook: 'FB', Instagram: 'IG', LinkedIn: 'LI', TikTok: 'TT', YouTube: 'YT',
  };
  return map[p] || (p.length <= 3 ? p.toUpperCase() : p.slice(0, 2).toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const cls =
    s === 'scheduled' ? 'badge badge-scheduled' :
    s === 'posted' ? 'badge badge-posted' :
    s === 'error' || s === 'err' ? 'badge badge-error' :
    'badge badge-pending';
  const label =
    s === 'scheduled' ? 'Naplánováno' :
    s === 'posted' ? 'Zveřejněno' :
    s === 'error' || s === 'err' ? 'Chyba' :
    'Čeká';
  return <span className={cls}>{label}</span>;
}

export default function FrontaPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

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
    if (!confirm(`Opravdu smazat příspěvek #${item.id}?`)) return;
    setDeleting(item.id);
    try {
      await fetch(`/api/queue?id=${item.id}&rowIndex=${item.rowIndex}`, { method: 'DELETE' });
      fetchItems();
    } catch {}
    finally { setDeleting(null); }
  };

  const STATUS_FILTERS = [
    { id: 'all', label: 'Vše' },
    { id: 'pending', label: 'Pending' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'posted', label: 'Posted' },
    { id: 'error', label: 'Error' },
  ];

  const filtered = items.filter(item => {
    if (statusFilter === 'all') return true;
    const s = (item.status || '').toLowerCase();
    if (statusFilter === 'error') return s === 'error' || s === 'err';
    return s === statusFilter;
  });

  const getNextStatus = (current: string) => {
    const s = (current || '').toLowerCase();
    if (s === 'pending') return 'scheduled';
    if (s === 'scheduled') return 'posted';
    return 'pending';
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Fronta příspěvků</h1>
          <p className="page-subtitle">
            {filtered.length} z {items.length} příspěvků
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchItems}>
          ↻ Obnovit
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-pill${statusFilter === f.id ? ' active' : ''}`}
            onClick={() => setStatusFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Načítám…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Žádné příspěvky odpovídají filtru.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Platforma</th>
                  <th>Datum</th>
                  <th>Čas</th>
                  <th>Caption</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Akce</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ opacity: deleting === item.id ? 0.4 : 1, transition: 'opacity 0.2s' }}
                  >
                    {/* # */}
                    <td style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {idx + 1}
                    </td>

                    {/* Platform */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span
                          className="plat-dot"
                          style={{ background: platColor(item.platforma) }}
                        />
                        <span style={{ fontWeight: 500 }}>{platShort(item.platforma)}</span>
                      </div>
                    </td>

                    {/* Datum */}
                    <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {item.datum || '—'}
                    </td>

                    {/* Čas */}
                    <td style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {item.cas || '—'}
                    </td>

                    {/* Caption */}
                    <td>
                      <div className="caption-cell" title={item.caption}>
                        {item.caption || '—'}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Akce */}
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          title={`Změnit na: ${getNextStatus(item.status)}`}
                          onClick={() => updateStatus(item, getNextStatus(item.status))}
                        >
                          ↺
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Smazat"
                          onClick={() => deleteItem(item)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
