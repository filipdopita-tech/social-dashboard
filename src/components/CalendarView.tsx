"use client";

import { getPlatformColor } from "./PlatformIcon";

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

interface CalendarViewProps {
  items: QueueItem[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const DAYS_CS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const MONTHS_CS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
];

export default function CalendarView({ items, currentMonth, onPrevMonth, onNextMonth }: CalendarViewProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();

  // First day of month (0=Sunday, adjust to Monday-first)
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay(); // 0=Sun
  // convert to Monday-first: Mon=0..Sun=6
  startDow = (startDow + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  // Group items by date
  const byDate: Record<string, QueueItem[]> = {};
  for (const item of items) {
    if (!item.datum) continue;
    if (!byDate[item.datum]) byDate[item.datum] = [];
    byDate[item.datum].push(item);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startDow + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }

  return (
    <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #1e1e22" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f0f0f0" }}>
          {MONTHS_CS[month]} {year}
        </h2>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={onPrevMonth}
            style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #1e1e22", background: "transparent", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={onNextMonth}
            style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #1e1e22", background: "transparent", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #1e1e22" }}>
        {DAYS_CS.map((d) => (
          <div key={d} style={{ padding: "8px 4px", textAlign: "center", fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.04em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={{ minHeight: 80, borderRight: (idx + 1) % 7 !== 0 ? "1px solid #1a1a1e" : "none", borderBottom: "1px solid #1a1a1e" }} />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayItems = byDate[dateStr] || [];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

          return (
            <div
              key={dateStr}
              style={{
                minHeight: 80,
                padding: "6px 6px 4px",
                borderRight: (idx + 1) % 7 !== 0 ? "1px solid #1a1a1e" : "none",
                borderBottom: "1px solid #1a1a1e",
                background: isToday ? "rgba(201, 169, 110, 0.04)" : "transparent",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: isToday ? 700 : 400,
                color: isToday ? "#c9a96e" : "#666",
                background: isToday ? "rgba(201, 169, 110, 0.12)" : "transparent",
                marginBottom: 3,
              }}>
                {day}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {dayItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    title={`${item.cas} – ${item.platforma}: ${item.caption}`}
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: getPlatformColor(item.platforma),
                      opacity: item.status === "posted" ? 0.4 : 0.85,
                    }}
                  />
                ))}
                {dayItems.length > 3 && (
                  <div style={{ fontSize: 9, color: "#555", textAlign: "center" }}>+{dayItems.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ padding: "12px 24px", borderTop: "1px solid #1e1e22", display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "Facebook", color: "#1877F2" },
          { label: "Instagram", color: "#E1306C" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "TikTok", color: "#FF0050" },
          { label: "YouTube", color: "#FF0000" },
        ].map((p) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
            <span style={{ fontSize: 11, color: "#555" }}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
