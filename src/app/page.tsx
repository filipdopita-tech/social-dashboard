'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Stats {
  total: number;
  pending: number;
  scheduled: number;
  posted: number;
  todayPosts: number;
  weekPosts: number;
}

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

const CZECH_MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];
const CZECH_DAY_NAMES = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

function statCards(stats: Stats | null) {
  return [
    {
      label: 'Celkem',
      value: stats?.total ?? 0,
      sub: 'Všechny příspěvky',
      icon: '📦',
      iconBg: 'rgba(139,92,246,0.15)',
      iconColor: '#8b5cf6',
    },
    {
      label: 'Čeká',
      value: stats?.pending ?? 0,
      sub: 'K zpracování',
      icon: '⏰',
      iconBg: 'rgba(245,158,11,0.15)',
      iconColor: '#f59e0b',
    },
    {
      label: 'Naplánováno',
      value: stats?.scheduled ?? 0,
      sub: 'Připraveno',
      icon: '📅',
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#3b82f6',
    },
    {
      label: 'Zveřejněno',
      value: stats?.posted ?? 0,
      sub: 'Hotovo',
      icon: '✓',
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#10b981',
    },
    {
      label: 'Dnes',
      value: stats?.todayPosts ?? 0,
      sub: 'Denní posts',
      icon: '⚡',
      iconBg: 'rgba(99,102,241,0.15)',
      iconColor: '#6366f1',
    },
    {
      label: 'Tento týden',
      value: stats?.weekPosts ?? 0,
      sub: 'Nadcházejících',
      icon: '📈',
      iconBg: 'rgba(14,165,233,0.15)',
      iconColor: '#0ea5e9',
    },
  ];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    fetchItems();
    const interval = setInterval(() => { fetchStats(); fetchItems(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchItems]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Monday-based week: Mon=0, Tue=1...Sun=6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{ date: Date; currentMonth: boolean }> = [];
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ date: new Date(currentYear, currentMonth - 1, prevMonthDays - i), currentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(currentYear, currentMonth, d), currentMonth: true });
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(currentYear, currentMonth + 1, d), currentMonth: false });
    }
    return cells;
  }, [currentYear, currentMonth]);

  function isoDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const todayStr = isoDateStr(today);

  function dotsForDay(d: Date) {
    const ds = isoDateStr(d);
    return items.filter(i => i.datum === ds).map(i => platColor(i.platforma));
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  // Upcoming posts: future or today, sorted by date+time
  const upcoming = useMemo(() => {
    return items
      .filter(i => {
        if (!i.datum) return false;
        const d = new Date(`${i.datum}T${i.cas || '00:00'}:00`);
        return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
      })
      .sort((a, b) => {
        const da = new Date(`${a.datum}T${a.cas || '00:00'}:00`);
        const db = new Date(`${b.datum}T${b.cas || '00:00'}:00`);
        return da.getTime() - db.getTime();
      })
      .slice(0, 8);
  }, [items]);

  const cards = statCards(stats);

  return (
    <div className="page-container fade-in">
      {/* Page header */}
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Přehled sociálních sítí</p>

      {/* Stat cards */}
      <div className="stats-grid">
        {cards.map(card => (
          <div key={card.label} className="stat-card">
            <div style={{ flex: 1 }}>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-sub">{card.sub}</div>
            </div>
            <div
              className="stat-card-icon"
              style={{ background: card.iconBg, color: card.iconColor, fontSize: 20 }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid: Calendar + Upcoming */}
      <div className="bottom-grid">
        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Kalendář příspěvků</div>
            <div className="calendar-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>←</button>
              <span className="cal-month-label">
                {CZECH_MONTHS[currentMonth]} {currentYear}
              </span>
              <button className="cal-nav-btn" onClick={nextMonth}>→</button>
            </div>
          </div>
          <div className="card-body">
            {/* Day names */}
            <div className="calendar-grid" style={{ marginBottom: 4 }}>
              {CZECH_DAY_NAMES.map(d => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div className="calendar-grid">
              {calendarDays.map((cell, idx) => {
                const ds = isoDateStr(cell.date);
                const isToday = ds === todayStr;
                const dots = dotsForDay(cell.date);
                return (
                  <div
                    key={idx}
                    className={`cal-cell${isToday ? ' today' : ''}${!cell.currentMonth ? ' other-month' : ''}`}
                  >
                    <div className="cal-day-num">{cell.date.getDate()}</div>
                    {dots.length > 0 && (
                      <div className="cal-dots">
                        {dots.slice(0, 4).map((color, i) => (
                          <div key={i} className="cal-dot" style={{ background: color }} />
                        ))}
                        {dots.length > 4 && (
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1 }}>
                            +{dots.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Nadcházející příspěvky</div>
          </div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            {upcoming.length === 0 ? (
              <div className="upcoming-empty">Žádné nadcházející příspěvky</div>
            ) : (
              upcoming.map(item => (
                <div key={item.id} className="upcoming-item">
                  <div
                    className="upcoming-dot"
                    style={{ background: platColor(item.platforma) }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="upcoming-time">
                      {item.datum}{item.cas ? ` · ${item.cas}` : ''}
                    </div>
                    <div className="upcoming-caption">
                      {item.caption || '— bez textu —'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
