"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import CalendarView from "@/components/CalendarView";

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
    .sort((a, b) => {
      const dateA = `${a.datum} ${a.cas}`;
      const dateB = `${b.datum} ${b.cas}`;
      return dateA.localeCompare(dateB);
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-400">Načítám data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
        <p className="text-dark-400 mt-1">Přehled sociálních sítí OneFlow</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Celkem"
          value={stats?.total || 0}
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          color="purple"
        />
        <StatCard
          label="Čeká"
          value={stats?.pending || 0}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="amber"
          subtitle="K zpracování"
        />
        <StatCard
          label="Naplánováno"
          value={stats?.scheduled || 0}
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="blue"
          subtitle="Připraveno"
        />
        <StatCard
          label="Zveřejněno"
          value={stats?.posted || 0}
          icon="M5 13l4 4L19 7"
          color="emerald"
          subtitle="Hotovo"
        />
        <StatCard
          label="Dnes"
          value={stats?.todayPosts || 0}
          icon="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
          color="rose"
          subtitle="Dnešní příspěvky"
        />
        <StatCard
          label="Tento týden"
          value={stats?.weekPosts || 0}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          color="blue"
          subtitle="Nadcházejících 7 dní"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2">
          <CalendarView
            items={items}
            currentMonth={currentMonth}
            onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          />
        </div>

        {/* Upcoming */}
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Nadcházející příspěvky</h2>
          {upcomingItems.length === 0 ? (
            <p className="text-dark-500 text-sm">Žádné nadcházející příspěvky</p>
          ) : (
            <div className="space-y-3">
              {upcomingItems.map((item) => (
                <div key={item.id} className="bg-dark-800/50 border border-dark-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        item.platforma === "Instagram" ? "text-pink-400" :
                        item.platforma === "Facebook" ? "text-blue-400" : "text-purple-400"
                      }`}>
                        {item.platforma}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        item.status === "scheduled" ? "bg-blue-500/20 text-blue-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {item.status === "pending" ? "Čeká" : item.status === "scheduled" ? "Naplánováno" : "Zveřejněno"}
                      </span>
                    </div>
                    <span className="text-dark-500 text-xs">{item.datum} {item.cas}</span>
                  </div>
                  <p className="text-dark-300 text-sm line-clamp-2">{item.caption || "Bez popisku"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
