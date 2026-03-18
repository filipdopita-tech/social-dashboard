'use client';

import { useState, useCallback } from 'react';

interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
  status: 'connected' | 'pending' | 'error';
  statusLabel: string;
  account: string;
  detail: string;
  expiresLabel?: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877f2',
    icon: 'f',
    status: 'connected',
    statusLabel: 'Připojeno',
    account: 'OneFlow s.r.o.',
    detail: 'Page ID: 593007390561591 · System User token (trvalý, bez expirace)',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#e1306c',
    icon: '◎',
    status: 'connected',
    statusLabel: 'Připojeno',
    account: '@oneflow.cz',
    detail: 'Account ID: 17841475523157725 · Meta System User',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0077b5',
    icon: 'in',
    status: 'connected',
    statusLabel: 'Připojeno',
    account: 'Filip Dopita',
    detail: 'URN: urn:li:person:3116dkXvat · OAuth 2.0 (w_member_social)',
    expiresLabel: 'Token platí do 16. 5. 2026',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#ff2d55',
    icon: '♪',
    status: 'pending',
    statusLabel: 'Čeká na schválení',
    account: 'OneFlow Posting',
    detail: 'App odeslána ke schválení TikTok · Client Key: awwt82nd95fifsli',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#ff0000',
    icon: '▶',
    status: 'connected',
    statusLabel: 'Připojeno',
    account: 'OneFlow channel',
    detail: 'OAuth 2.0 · youtube.upload scope · Token se auto-obnovuje',
  },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  connected: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' },
  pending:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' },
  error:     { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', dot: '#ef4444' },
};

export default function IntegracePage() {
  const [testing, setTesting] = useState<string | null>(null);
  const [tested, setTested] = useState<Record<string, boolean>>({});

  const connected = PLATFORMS.filter(p => p.status === 'connected').length;

  const test = useCallback(async (id: string) => {
    setTesting(id);
    await new Promise(r => setTimeout(r, 1100));
    setTested(prev => ({ ...prev, [id]: true }));
    setTesting(null);
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrace</h1>
          <p className="page-subtitle">Správa připojených sociálních sítí</p>
        </div>
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 8, padding: '8px 18px',
          color: '#10b981', fontSize: 13, fontWeight: 700,
        }}>
          {connected} / {PLATFORMS.length} připojeno
        </div>
      </div>

      {/* Quick status bar */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 12, padding: '14px 20px', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginRight: 6 }}>
          Stav platforem:
        </span>
        {PLATFORMS.map(p => {
          const s = STATUS_STYLE[p.status];
          return (
            <span key={p.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 20, background: s.bg,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: s.dot,
                boxShadow: p.status === 'connected' ? `0 0 7px ${s.dot}` : 'none',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{p.name}</span>
            </span>
          );
        })}
      </div>

      {/* Platform cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PLATFORMS.map(p => {
          const s = STATUS_STYLE[p.status];
          const isTesting = testing === p.id;
          const wasTested = tested[p.id];
          return (
            <div
              key={p.id}
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: 12, padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: 18,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = p.color + '55';
                e.currentTarget.style.boxShadow = `0 2px 20px ${p.color}0e`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Platform icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: p.color + '18', border: `1px solid ${p.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: p.icon.length > 1 ? 13 : 20, fontWeight: 800, color: p.color,
              }}>
                {p.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                    background: s.bg, color: s.color,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
                    {p.statusLabel}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
                  {p.account}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {p.detail}
                </div>
                {p.expiresLabel && (
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 3 }}>
                    ⚠ {p.expiresLabel}
                  </div>
                )}
              </div>

              {/* Action */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                {p.status !== 'pending' ? (
                  <button
                    onClick={() => test(p.id)}
                    disabled={isTesting}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      border: `1px solid ${wasTested ? '#10b98155' : 'var(--card-border)'}`,
                      background: wasTested ? 'rgba(16,185,129,0.08)' : 'transparent',
                      cursor: isTesting ? 'wait' : 'pointer',
                      fontSize: 12, color: wasTested ? '#10b981' : 'var(--text-secondary)',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                      opacity: isTesting ? 0.6 : 1, whiteSpace: 'nowrap',
                    }}
                  >
                    {isTesting ? 'Testuju...' : wasTested ? '✓ Připojeno' : 'Otestovat'}
                  </button>
                ) : (
                  <span style={{
                    fontSize: 11, color: '#f59e0b', padding: '7px 16px', borderRadius: 8,
                    border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)',
                    whiteSpace: 'nowrap',
                  }}>
                    Čeká na TikTok
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div style={{
        marginTop: 24, background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12,
        padding: '16px 20px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.9,
      }}>
        <div style={{ fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: 6, fontSize: 13 }}>
          ℹ Informace o propojení
        </div>
        <div>• <strong style={{ color: 'var(--text-primary)' }}>Facebook &amp; Instagram</strong> — Meta Business Suite System User (trvalý token)</div>
        <div>• <strong style={{ color: 'var(--text-primary)' }}>LinkedIn</strong> — OAuth 2.0 personal profile, token do 16. 5. 2026</div>
        <div>• <strong style={{ color: 'var(--text-primary)' }}>YouTube</strong> — Google OAuth 2.0, token se automaticky obnovuje</div>
        <div>• <strong style={{ color: 'var(--text-primary)' }}>TikTok</strong> — App čeká na schválení TikTok, po schválení bude automaticky aktivní</div>
      </div>
    </div>
  );
}
