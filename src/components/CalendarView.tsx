"use client";

import { useMemo } from "react";

interface CalendarItem {
  id: string;
  datum: string;
  cas: string;
  platforma: string;
  caption: string;
  status: string;
}

interface CalendarViewProps {
  items: CalendarItem[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarView({ items, currentMonth, onPrevMonth, onNextMonth }: CalendarViewProps) {
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Monday = 0 adjustment for Czech calendar
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const result: Array<{ date: Date | null; items: CalendarItem[] }> = [];

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      result.push({ date: null, items: [] });
    }

    // Days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayItems = items.filter((i) => i.datum === dateStr);
      result.push({ date, items: dayItems });
    }

    return result;
  }, [items, currentMonth]);

  const monthNames = [
    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
    "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
  ];

  const dayNames = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
  const today = new Date();
  const isToday = (date: Date | null) =>
    date !== null &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500",
    scheduled: "bg-blue-500",
    posted: "bg-emerald-500",
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark-100">Kalendář příspěvků</h2>
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="btn-secondary !py-1.5 !px-3 text-sm">
            &larr;
          </button>
          <span className="text-dark-200 font-medium min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={onNextMonth} className="btn-secondary !py-1.5 !px-3 text-sm">
            &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-dark-500 text-xs font-medium py-2">
            {d}
          </div>
        ))}
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-[80px] p-1.5 rounded-lg text-sm ${
              day.date === null
                ? "bg-transparent"
                : isToday(day.date)
                ? "bg-primary-600/10 border border-primary-500/30"
                : "bg-dark-800/50 border border-dark-700/50"
            }`}
          >
            {day.date && (
              <>
                <div className={`text-xs mb-1 ${isToday(day.date) ? "text-primary-400 font-bold" : "text-dark-400"}`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {day.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-1"
                      title={`${item.platforma}: ${item.caption.substring(0, 50)}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[item.status] || "bg-gray-500"}`} />
                      <span className="text-[10px] text-dark-300 truncate">
                        {item.cas} {item.platforma}
                      </span>
                    </div>
                  ))}
                  {day.items.length > 3 && (
                    <span className="text-[10px] text-dark-500">+{day.items.length - 3} dalších</span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
