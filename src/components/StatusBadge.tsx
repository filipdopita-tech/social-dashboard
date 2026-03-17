interface StatusBadgeProps {
  status: string;
  onClick?: () => void;
}

export default function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const labels: Record<string, string> = {
    pending: "Čeká",
    scheduled: "Naplánováno",
    posted: "Zveřejněno",
    error: "Chyba",
  };

  const classMap: Record<string, string> = {
    pending: "badge-pending",
    scheduled: "badge-scheduled",
    posted: "badge-posted",
    error: "badge-error",
  };

  return (
    <span
      className={classMap[status] || "badge-pending"}
      style={{ cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap" }}
      onClick={onClick}
      title={onClick ? "Klikni pro změnu statusu" : undefined}
    >
      {labels[status] || status}
    </span>
  );
}
