"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
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

const PLATFORM_GROUPS = [
  { name: "Facebook", color: "#1877F2", connected: true },
  { name: "Instagram", color: "#E1306C", connected: true },
  { name: "LinkedIn", color: "#0A66C2", connected: true },
  { name: "TikTok", color: "#FF0050", connected: false },
  { name: "YouTube Shorts", color: "#FF0000", connected: true },
];

const DAYS_CZ = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
const DAYS_CZ_FULL = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];

function getWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  // Start from Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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

  const weekDays = getWeekDays();
  const todayKey = formatDateKey(new Date());

  const getItemsForDay = (d: Date) => {
    const key = formatDateKey(d);
    return items.filter((i) => i.datum === key).sort((a, b) => a.cas.localeCompare(b.cas));
  };

  const upcomingItems = items
    .filter((i) => i.status !== "posted")
    .sort((a, b) => `${a.datum} ${a.cas}`.localeCompare(`${b.datum} ${b.cas}`))
    .slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2px solid #c9a96e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#555", fontSize: 14 }}>Načítám data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const platformStats = PLATFORM_GROUPS.map((p) => ({
    ...p,
    count: items.filter((i) => i.platforma === p.name).length,
  }));

  const selectedDayItems = selectedDay ? items.filter((i) => i.datum === selectedDay).sort((a, b) => a.cas.localeCompare(b.cas)) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: "#555", fontSize: 14 }}>Přehled sociálních sítí OneFlow</p>
        </div>
        <button
          onClick={() => router.push("/novy")}
          className="btn-gold"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nový příspěvek
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="stats-grid">
        <StatCard label="Celkem" value={stats?.total ?? 0} accent />
        <StatCard label="Naplánováno" value={stats?.scheduled ?? 0} subtitle="Připraveno" />
        <StatCard label="Zveřejněno" value={stats?.posted ?? 0} subtitle="Hotovo" />
        <StatCard label="Dnes" value={stats?.todayPosts ?? 0} subtitle="Dnešní příspěvky" />
      </div>

      {/* Weekly timeline */}
      <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0" }}>Plán na tento týden</h2>
          <span style={{ fontSize: 12, color: "#555" }}>
            {weekDays[0].toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })} – {weekDays[6].toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }} className="week-grid">
          {weekDays.map((day, idx) => {
            const key = formatDateKey(day);
            const isToday = key === todayKey;
            const dayItems = getItemsForDay(day);
            const isSelected = selectedDay === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                style={{
                  background: isToday ? "rgba(201,169,110,0.06)" : isSelected ? "rgba(255,255,255,0.03)" : "#0a0a0b",
                  border: isToday ? "1px solid rgba(201,169,110,0.3)" : isSelected ? "1px solid #2a2a2e" : "1px solid #1e1e22",
                  borderRadius: 10, padding: "10px 8px", cursor: "pointer",
                  transition: "all 0.15s", minHeight: 100,
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: isToday ? "#c9a96e" : "#555", fontWeight: 600, textTransform: "uppercase" }}>
                    {DAYS_CZ[(idx + 1) % 7]}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: isToday ? "#c9a96e" : "#f0f0f0" }}>
                    {day.getDate()}
                  </div>
                </div>
                {dayItems.length === 0 ? (
                  <div style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); router.push(`/novy?datum=${key}`); }}
                      style={{ width: 24, height: 24, borderRadius: "50%", border: "1px dashed #2a2a2e", background: "transparent", color: "#444", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}
                    >+</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: getPlatformColor(item.platforma) + "22",
                          borderLeft: `2px solid ${getPlatformColor(item.platforma)}`,
                          borderRadius: 4, padding: "3px 5px",
                        }}
                      >
                        <div style={{ fontSize: 10, color: getPlatformColor(item.platforma), fontWeight: 600 }}>{item.platforma.slice(0, 2).toUpperCase()}</div>
                        <div style={{ fontSize: 9, color: "#666" }}>{item.cas}</div>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div style={{ fontSize: 10, color: "#555", textAlign: "center" }}>+{dayItems.length - 3}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Day detail panel */}
        {selectedDay && selectedDayItems.length > 0 && (
          <div style={{ marginTop: 16, background: "#0a0a0b", border: "1px solid #1e1e22", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0", marginBottom: 12 }}>
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
              <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>({selectedDayItems.length} příspěvků)</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedDayItems.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "#111113", borderRadius: 8 }}>
                  <PlatformIcon platform={item.platforma} size={16} />
                  <span style={{ fontSize: 12, color: getPlatformColor(item.platforma), fontWeight: 600, minWidth: 80 }}>{item.platforma}</span>
                  <span style={{ fontSize: 12, color: "#555", minWidth: 40 }}>{item.cas}</span>
                  <p style={{ fontSize: 12, color: "#aaa", flex: 1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.caption || "Bez popisku"}</p>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom row: upcoming + platforms */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="bottom-grid">
        {/* Upcoming */}
        <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", marginBottom: 14 }}>Nadcházející příspěvky</h2>
          {upcomingItems.length === 0 ? (
            <p style={{ color: "#444", fontSize: 13 }}>Žádné naplánované příspěvky</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcomingItems.map((item) => (
                <div key={item.id} style={{ background: "#0a0a0b", border: "1px solid #1e1e22", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <PlatformIcon platform={item.platforma} size={14} />
                      <span style={{ fontSize: 11, color: getPlatformColor(item.platforma), fontWeight: 500 }}>{item.platforma}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StatusBadge status={item.status} />
                    </div>
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

        {/* Platforms status */}
        <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", marginBottom: 14 }}>Platformy</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {platformStats.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlatformIcon platform={p.name} size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: p.connected ? "#f0f0f0" : "#555", fontWeight: 500 }}>{p.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.count}</span>
                      <span style={{ fontSize: 11, color: p.connected ? "#4ade80" : "#555" }}>
                        {p.connected ? "● Připojeno" : "○ Nepřipojeno"}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 4, height: 3, background: "#1e1e22", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${stats?.total ? (p.count / stats.total) * 100 : 0}%`, background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .week-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
          .week-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
