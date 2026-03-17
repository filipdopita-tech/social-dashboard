'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';

interface Stats {
  total: number;
  pending: number;
  scheduled: number;
  posted: number;
  todayPosts: number;
  weekPosts: number;
}

function TopBar({ stats }: { stats: Stats | null }) {
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const ss = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const d = now.getDate().toString().padStart(2, '0');
      setDateStr(`${days[now.getDay()]} ${d} ${months[now.getMonth()]}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: '1 DASHBOARD', path: '/' },
    { label: '2 FRONTA', path: '/fronta' },
    { label: '3 NOVÝ POST', path: '/novy' },
  ];

  // next post
  const nextPost = stats ? (() => {
    // placeholder — no date in stats, show scheduled count
    if (stats.scheduled > 0) return `${stats.scheduled} SCHED`;
    return '—';
  })() : '—';

  return (
    <>
      <div className="topbar">
        {/* LEFT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 220 }}>
          <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: 13, letterSpacing: 1, animation: 'glowGold 4s ease-in-out infinite' }}>
            ◆ SOCIAL PLANNER
          </span>
          <span className="sep">|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent-green)', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
            <div className="live-dot" />
            LIVE
          </div>
          <span className="sep">|</span>
        </div>

        {/* CENTER — nav tabs */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-tab ${pathname === item.path ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, minWidth: 200, justifyContent: 'flex-end' }}>
          <span style={{ color: 'var(--accent-gold)', fontSize: 14, fontWeight: 600, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>
            {time}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{dateStr}</span>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stat-box">
          <div className="stat-label">CELKEM</div>
          <div className="stat-value gold">{stats?.total ?? '—'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">NAPLÁNOVÁNO</div>
          <div className="stat-value amber">{stats?.scheduled ?? '—'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">PENDING</div>
          <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>{stats?.pending ?? '—'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">ZVEŘEJNĚNO</div>
          <div className="stat-value green">{stats?.posted ?? '—'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">DNES</div>
          <div className="stat-value blue">{stats?.todayPosts ?? '—'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">TENTO TÝDEN</div>
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{stats?.weekPosts ?? '—'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">PŘÍŠTÍ POST</div>
          <div className="stat-value" style={{ fontSize: 13 }}>{nextPost}</div>
        </div>
      </div>
    </>
  );
}

function StatusBar({ stats }: { stats: Stats | null }) {
  const platforms = [
    { id: 'FB', on: true, color: '#1877f2' },
    { id: 'IG', on: true, color: '#e1306c' },
    { id: 'LI', on: true, color: '#0077b5' },
    { id: 'TT', on: false, color: '#69c9d0' },
    { id: 'YT', on: true, color: '#ff0000' },
  ];
  return (
    <div className="statusbar">
      {/* LEFT — platform statuses */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {platforms.map(p => (
          <div key={p.id} className="status-indicator">
            <div className="dot" style={{ background: p.on ? p.color : 'var(--text-muted)', boxShadow: p.on ? `0 0 4px ${p.color}` : 'none' }} />
            <span style={{ color: p.on ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{p.id}</span>
          </div>
        ))}
      </div>

      {/* CENTER */}
      <div style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', flex: 1 }}>
        ONEFLOW SOCIAL PLANNER v2.0
        <span className="sep">|</span>
        Fronta: {stats?.total ?? '?'} příspěvků
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 1 }}>? SHORTCUTS</span>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <html lang="cs">
      <head>
        <title>Social Planner — OneFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <TopBar stats={stats} />
        <StatusBar stats={stats} />
        <main style={{
          position: 'fixed',
          top: 'calc(var(--topbar-h) + var(--stats-h))',
          left: 0,
          right: 0,
          bottom: 'var(--statusbar-h)',
          overflow: 'hidden',
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
