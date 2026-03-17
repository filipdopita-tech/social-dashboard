"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import CalendarView from "@/components/CalendarView";
import { PlatformIcon, getPlatformColor } from "@/components/PlatformIcon";
import StatusBadge from "@/components/StatusBadge";

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
}

const PLATFORM_GROUPS = ["Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube Shorts"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, queueRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/queue"),
      ]);
      const statsData = await statsRes.json();
      const queueData = await queueRes.json();
      setStats(statsData);
      setItems(queueData.items || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const upcomingItems = items
    .filter((i) => i.status !== "posted")
    .sort((a, b) => `${a.datum} ${a.cas}`.localeCompare(`${b.datum} ${b.cas}`))
    .slice(0, 7);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "2px solid #c9a96e",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#555", fontSize: 14 }}>Načítám data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const platformStats = PLATFORM_GROUPS.map((p) => ({
    name: p,
    count: items.filter((i) => i.platforma === p).length,
    color: getPlatformColor(p),
  })).filter((p) => p.count > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 8 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "#555", fontSize: 14 }}>Přehled sociálních sítí OneFlow</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        <StatCard label="Celkem" value={stats?.total ?? 0} accent />
        <StatCard label="Čeká" value={stats?.pending ?? 0} subtitle="Ke zpracování" />
        <StatCard label="Naplánováno" value={stats?.scheduled ?? 0} subtitle="Připraveno" />
        <StatCard label="Zveřejněno" value={stats?.posted ?? 0} subtitle="Hotovo" />
        <StatCard label="Dnes" value={stats?.todayPosts ?? 0} subtitle="Dnešní příspěvky" />
        <StatCard label="Tento týden" value={stats?.weekPosts ?? 0} subtitle="Nadcházejících 7 dní" />
      </div>

      {/* Calendar + Upcoming */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }} className="calendar-grid">
        <CalendarView
          items={items}
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
        />

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upcoming */}
          <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20, flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", marginBottom: 14 }}>
              Nadcházející příspěvky
            </h2>
            {upcomingItems.length === 0 ? (
              <p style={{ color: "#444", fontSize: 13 }}>Žádné naplánované příspěvky</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcomingItems.map((item) => (
                  <div key={item.id} style={{
                    background: "#0a0a0b",
                    border: "1px solid #1e1e22",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <PlatformIcon platform={item.platforma} size={14} />
                        <span style={{ fontSize: 11, color: getPlatformColor(item.platforma), fontWeight: 500 }}>
                          {item.platforma}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 4px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {item.caption || "Bez popisku"}
                    </p>
                    <div style={{ fontSize: 11, color: "#444" }}>{item.datum} {item.cas}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform breakdown */}
          {platformStats.length > 0 && (
            <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", marginBottom: 14 }}>
                Platformy
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {platformStats.map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PlatformIcon platform={p.name} size={16} />
                      <span style={{ fontSize: 13, color: "#aaa" }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .calendar-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
