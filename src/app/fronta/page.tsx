"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";

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

export default function FrontaPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<QueueItem>>({});
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");

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

  const startEdit = (item: QueueItem) => {
    setEditingId(item.id);
    setEditData({
      caption: item.caption,
      datum: item.datum,
      cas: item.cas,
      platforma: item.platforma,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await fetch(`/api/queue/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      setEditingId(null);
      setEditData({});
      await fetchItems();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

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
    try {
      await fetch(`/api/queue/${id}`, { method: "DELETE" });
      await fetchItems();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const filteredItems = filter === "all" ? items : items.filter((i) => i.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-400">Načítám frontu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Fronta příspěvků</h1>
          <p className="text-dark-400 mt-1">{items.length} příspěvků celkem</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Vše" },
            { key: "pending", label: "Čeká" },
            { key: "scheduled", label: "Naplánováno" },
            { key: "posted", label: "Zveřejněno" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary-600 text-white"
                  : "bg-dark-800 text-dark-400 hover:text-dark-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">ID</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Datum</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Čas</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Platforma</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Typ</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3 max-w-xs">Caption</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Media</th>
                <th className="text-left text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-dark-400 text-xs font-medium uppercase tracking-wider px-4 py-3">Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3 text-dark-300 text-sm font-mono">{item.id}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === item.id ? (
                      <input
                        type="date"
                        value={editData.datum || ""}
                        onChange={(e) => setEditData({ ...editData, datum: e.target.value })}
                        className="input-field !py-1 !px-2 text-sm w-36"
                      />
                    ) : (
                      <span className="text-dark-200">{item.datum}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === item.id ? (
                      <input
                        type="time"
                        value={editData.cas || ""}
                        onChange={(e) => setEditData({ ...editData, cas: e.target.value })}
                        className="input-field !py-1 !px-2 text-sm w-28"
                      />
                    ) : (
                      <span className="text-dark-200">{item.cas}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === item.id ? (
                      <select
                        value={editData.platforma || ""}
                        onChange={(e) => setEditData({ ...editData, platforma: e.target.value })}
                        className="input-field !py-1 !px-2 text-sm"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Obě">Obě</option>
                      </select>
                    ) : (
                      <span className={`text-sm font-medium ${
                        item.platforma === "Instagram" ? "text-pink-400" :
                        item.platforma === "Facebook" ? "text-blue-400" : "text-purple-400"
                      }`}>
                        {item.platforma}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-dark-300 text-sm">{item.typ}</td>
                  <td className="px-4 py-3 text-sm max-w-xs">
                    {editingId === item.id ? (
                      <textarea
                        value={editData.caption || ""}
                        onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                        className="input-field !py-1 !px-2 text-sm w-full min-h-[60px]"
                        rows={2}
                      />
                    ) : (
                      <span className="text-dark-200 line-clamp-2">{item.caption}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-dark-400 text-sm truncate max-w-[120px]">{item.mediaFile || "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} onClick={() => cycleStatus(item)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                            title="Uložit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditData({}); }}
                            className="text-dark-400 hover:text-dark-200 p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                            title="Zrušit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="text-dark-400 hover:text-primary-400 p-1.5 rounded-lg hover:bg-primary-500/10 transition-colors"
                            title="Upravit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-dark-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Smazat"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-dark-500">
            Žádné příspěvky k zobrazení
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="card !p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-dark-500 text-xs font-mono">#{item.id}</span>
                <span className={`text-xs font-medium ${
                  item.platforma === "Instagram" ? "text-pink-400" :
                  item.platforma === "Facebook" ? "text-blue-400" : "text-purple-400"
                }`}>
                  {item.platforma}
                </span>
              </div>
              <StatusBadge status={item.status} onClick={() => cycleStatus(item)} />
            </div>
            <p className="text-dark-200 text-sm">{item.caption || "Bez popisku"}</p>
            <div className="flex items-center justify-between text-xs text-dark-400">
              <span>{item.datum} {item.cas}</span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="text-primary-400 hover:text-primary-300">
                  Upravit
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300">
                  Smazat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
