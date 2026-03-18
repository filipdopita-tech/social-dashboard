'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/',          icon: '◈' },
  { label: 'Fronta',      path: '/fronta',    icon: '☰' },
  { label: 'Integrace',   path: '/integrace', icon: '⬡' },
];

const PLATFORMS = [
  { id: 'fb',  label: 'Facebook',   color: '#1877f2', status: 'connected' },
  { id: 'ig',  label: 'Instagram',  color: '#e1306c', status: 'connected' },
  { id: 'li',  label: 'LinkedIn',   color: '#0077b5', status: 'connected' },
  { id: 'tt',  label: 'TikTok',     color: '#f59e0b', status: 'pending'   },
  { id: 'yt',  label: 'YouTube',    color: '#ff0000', status: 'connected' },
];

function Sidebar({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-circle">OF</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">OneFlow</div>
          <div className="sidebar-logo-sub">Social Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`nav-item${pathname === item.path ? ' active' : ''}`}
            onClick={() => router.push(item.path)}
          >
            {pathname === item.path && <span className="nav-item-dot" />}
            {item.label}
          </button>
        ))}

        <button
          className="nav-item-add"
          onClick={() => router.push('/novy')}
          style={{ marginTop: 10 }}
        >
          <span style={{ fontSize: 16, color: '#6b7a99', lineHeight: 1 }}>+</span>
          Nový příspěvek
        </button>
      </nav>

      {/* Platform status mini-list */}
      <div style={{
        margin: '16px 0',
        padding: '14px 16px',
        borderTop: '1px solid var(--sidebar-border)',
        borderBottom: '1px solid var(--sidebar-border)',
      }}>
        <div style={{
          fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.2,
          textTransform: 'uppercase', marginBottom: 10, fontWeight: 600,
        }}>
          Propojené sítě
        </div>
        {PLATFORMS.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 7, cursor: 'pointer',
          }}
          onClick={() => router.push('/integrace')}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: p.status === 'connected' ? p.color : '#f59e0b',
              flexShrink: 0,
              boxShadow: p.status === 'connected' ? `0 0 6px ${p.color}88` : 'none',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>{p.label}</span>
            <span style={{
              fontSize: 9, fontWeight: 600,
              color: p.status === 'connected' ? '#10b981' : '#f59e0b',
              letterSpacing: 0.5,
            }}>
              {p.status === 'connected' ? '✓' : '…'}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="theme-toggle" onClick={toggleTheme}>
          <span style={{ fontSize: 14 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
          {theme === 'dark' ? 'Světlý režim' : 'Tmavý režim'}
        </button>
        <div className="sidebar-version">OneFlow Social Manager v1.0</div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  }, [theme]);

  return (
    <html lang="cs" data-theme="dark" className={inter.variable}>
      <head>
        <title>Social Dashboard — OneFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.png" />
      </head>
      <body style={{ fontFamily: 'Inter, sans-serif' }}>
        {mounted && (
          <>
            <Sidebar theme={theme} toggleTheme={toggleTheme} />
            <div className="main-content">
              {children}
            </div>
          </>
        )}
      </body>
    </html>
  );
}
