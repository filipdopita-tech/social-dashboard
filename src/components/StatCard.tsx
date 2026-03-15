interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: "blue" | "amber" | "emerald" | "purple" | "rose";
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    iconBg: "bg-rose-500/20",
  },
};

export default function StatCard({ label, value, icon, color, subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-dark-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`${c.iconBg} rounded-lg p-2.5`}>
          <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}
