interface StatusBadgeProps {
  status: string;
  onClick?: () => void;
}

export default function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const classes: Record<string, string> = {
    pending: "badge-pending",
    scheduled: "badge-scheduled",
    posted: "badge-posted",
  };

  const labels: Record<string, string> = {
    pending: "Čeká",
    scheduled: "Naplánováno",
    posted: "Zveřejněno",
  };

  return (
    <button
      onClick={onClick}
      className={`${classes[status] || "badge-pending"} ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-opacity`}
    >
      {labels[status] || status}
    </button>
  );
}
