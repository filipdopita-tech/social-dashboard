'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

interface Stats {
  total: number;
  pending: number;
  scheduled: number;
  posted: number;
  todayPosts: number;
  weekPosts: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: '#1877f2', FB: '#1877f2',
  Instagram: '#e1306c', IG: '#e1306c',
  LinkedIn: '#0077b5', LI: '#0077b5',
  TikTok: '#010101', TT: '#010101',
  YouTube: '#ff0000', YT: '#ff0000',
};

function Sidebar({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '◈' },
    { label: 'Fronta', path: '/fronta', icon: '☰' },
  ];

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
        {navItems.map(item => (
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
          style={{ marginTop: 8 }}
        >
          <span style={{ fontSize: 16, color: '#6b7a99', lineHeight: 1 }}>+</span>
          Nový příspěvek
        </button>
      </nav>

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
