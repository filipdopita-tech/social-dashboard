"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";
import { PlatformIcon, getPlatformColor } from "@/components/PlatformIcon";

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

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube Shorts"];
const STATUSES = ["pending", "scheduled", "posted", "error"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Čeká",
  scheduled: "Naplánováno",
  posted: "Zveřejněno",
  error: "Chyba",
};

export default function FrontaPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/queue");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const cycleStatus = async (item: QueueItem) => {
    const order = ["pending", "scheduled", "posted"];
    const currentIdx = order.indexOf(item.status);
    const nextStatus = order[(currentIdx + 1) % order.length];
    try {
      await fetch(`/api/queue/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchItems();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Opravdu smazat tento příspěvek?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/queue/${id}`, { method: "DELETE" });
      await fetchItems();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(null);
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Smazat ${selectedIds.size} příspěvků?`)) return;
    for (const id of Array.from(selectedIds)) {
      await fetch(`/api/queue/${id}`, { method: "DELETE" });
    }
    setSelectedIds(new Set());
    await fetchItems();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredItems = items.filter((i) => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterPlatform !== "all" && i.platforma !== filterPlatform) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "2px solid #c9a96e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#555", fontSize: 14 }}>Načítám frontu...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>Fronta příspěvků</h1>
          <p style={{ color: "#555", fontSize: 14 }}>{items.length} příspěvků celkem • {filteredItems.length} zobrazeno</p>
        </div>
        {selectedIds.size > 0 && (
          <button onClick={deleteSelected} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            Smazat vybrané ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "#111113", border: "1px solid #1e1e22", borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setFilterStatus("all")}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500,
              background: filterStatus === "all" ? "#c9a96e" : "transparent",
              color: filterStatus === "all" ? "#0a0a0b" : "#888",
              border: "none",
            }}
          >
            Vše
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500,
                background: filterStatus === s ? "#c9a96e" : "transparent",
                color: filterStatus === s ? "#0a0a0b" : "#888",
                border: "none",
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "#111113", border: "1px solid #1e1e22", borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setFilterPlatform("all")}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500,
              background: filterPlatform === "all" ? "#1e1e22" : "transparent",
              color: filterPlatform === "all" ? "#f0f0f0" : "#888",
              border: "none",
            }}
          >
            Všechny
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlatform(p)}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500,
                background: filterPlatform === p ? "#1e1e22" : "transparent",
                color: filterPlatform === p ? getPlatformColor(p) : "#888",
                border: "none",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 12, overflow: "hidden" }}>
        {/* Desktop table */}
        <div className="queue-table-wrap" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e22" }}>
                <th style={thStyle}>
                  <input type="checkbox" style={{ accentColor: "#c9a96e" }}
                    checked={filteredItems.length > 0 && filteredItems.every((i) => selectedIds.has(i.id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(filteredItems.map((i) => i.id)));
                      else setSelectedIds(new Set());
                    }}
                  />
                </th>
                <th style={thStyle}>Platforma</th>
                <th style={thStyle}>Datum &amp; Čas</th>
                <th style={thStyle}>Caption</th>
                <th style={thStyle}>Typ</th>
                <th style={thStyle}>Media</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #16161a",
                    transition: "background 0.15s",
                    background: selectedIds.has(item.id) ? "rgba(201,169,110,0.04)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!selectedIds.has(item.id)) (e.currentTarget as HTMLTableRowElement).style.background = "#16161a"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = selectedIds.has(item.id) ? "rgba(201,169,110,0.04)" : "transparent"; }}
                >
                  <td style={tdStyle}>
                    <input type="checkbox" style={{ accentColor: "#c9a96e" }}
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PlatformIcon platform={item.platforma} size={18} />
                      <span style={{ fontSize: 13, color: getPlatformColor(item.platforma), fontWeight: 500 }}>
                        {item.platforma}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13, color: "#f0f0f0", fontWeight: 500 }}>{item.datum}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{item.cas}</div>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 280 }}>
                    <p style={{ fontSize: 13, color: "#aaa", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {item.caption || <span style={{ color: "#444", fontStyle: "italic" }}>Bez popisku</span>}
                    </p>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: "#555" }}>{item.typ || "—"}</span>
                  </td>
                  <td style={tdStyle}>
                    {item.mediaFile ? (
                      <a href={item.mediaFile} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#c9a96e", textDecoration: "none" }}>
                        Link
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "#444" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={item.status} onClick={() => cycleStatus(item)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={deleting === item.id}
                      style={{
                        width: 30, height: 30, borderRadius: 6, border: "1px solid transparent",
                        background: "transparent", color: "#555", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#555"; (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; }}
                      title="Smazat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#444", fontSize: 14 }}>
              Žádné příspěvky k zobrazení
            </div>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="queue-mobile">
        {filteredItems.map((item) => (
          <div key={item.id} style={{ background: "#111113", border: "1px solid #1e1e22", borderRadius: 10, padding: 16, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PlatformIcon platform={item.platforma} size={16} />
                <span style={{ fontSize: 13, color: getPlatformColor(item.platforma), fontWeight: 500 }}>{item.platforma}</span>
              </div>
              <StatusBadge status={item.status} onClick={() => cycleStatus(item)} />
            </div>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>{item.caption || "Bez popisku"}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#555" }}>{item.datum} {item.cas}</span>
              <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                Smazat
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .queue-mobile { display: none; }
        @media (max-width: 768px) {
          .queue-table-wrap { display: none; }
          .queue-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 600,
  color: "#555",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};
