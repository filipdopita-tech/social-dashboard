interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, subtitle, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: "#111113",
        border: accent ? "1px solid rgba(201,169,110,0.3)" : "1px solid #1e1e22",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 2,
          background: "linear-gradient(90deg, #c9a96e, #a88854)",
        }} />
      )}
      <div style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent ? "#c9a96e" : "#f0f0f0", lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#555" }}>{subtitle}</div>
      )}
    </div>
  );
}
