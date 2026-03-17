"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/fronta",
    label: "Fronta",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/novy",
    label: "Nový příspěvek",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
];

const platforms = [
  { name: "Facebook", color: "#1877F2", connected: true },
  { name: "Instagram", color: "#E1306C", connected: true },
  { name: "LinkedIn", color: "#0A66C2", connected: true },
  { name: "TikTok", color: "#FF0050", connected: false },
  { name: "YouTube", color: "#FF0000", connected: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ background: "#111113", borderBottom: "1px solid #1e1e22" }}>
        <div className="flex items-center gap-2.5">
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #c9a96e, #a88854)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-semibold text-base" style={{ color: "#f0f0f0" }}>OneFlow <span style={{ color: "#c9a96e" }}>Social</span></span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "#888", padding: 8 }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ width: 256, background: "#111113", borderRight: "1px solid #1e1e22", display: "flex", flexDirection: "column" }}
      >
        {/* Logo */}
        <div style={{ padding: "28px 24px 20px" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #c9a96e 0%, #a88854 100%)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L3 8.5l9 5 9-5L12 3z" fill="white" fillOpacity="0.9" />
                <path d="M3 15.5l9 5 9-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 12l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#f0f0f0", letterSpacing: "-0.01em" }}>OneFlow</div>
              <div style={{ fontSize: 11, color: "#c9a96e", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Social Planner</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "0 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 12 }}>
            Navigace
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 8, transition: "all 0.15s",
                    textDecoration: "none",
                    background: isActive ? "rgba(201, 169, 110, 0.1)" : "transparent",
                    color: isActive ? "#c9a96e" : "#888",
                    borderLeft: isActive ? "2px solid #c9a96e" : "2px solid transparent",
                  }}
                >
                  <span style={{ color: isActive ? "#c9a96e" : "#555" }}>{item.icon}</span>
                  <span style={{ fontWeight: isActive ? 600 : 400, fontSize: 14 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 12 }}>
              Rychlé akce
            </div>
            <button
              onClick={() => { router.push("/novy"); setMobileOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                background: "linear-gradient(135deg, #c9a96e, #a88854)",
                border: "none", color: "#0a0a0b", fontWeight: 700, fontSize: 13,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              + Nový příspěvek
            </button>
          </div>

          {/* Platforms */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 12 }}>
              Připojené platformy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {platforms.map((p) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, opacity: p.connected ? 1 : 0.3 }} />
                    <span style={{ fontSize: 13, color: p.connected ? "#aaa" : "#555" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: p.connected ? "#4ade80" : "#555" }}>
                    {p.connected ? "✓" : "○"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1e1e22" }}>
          <div style={{ fontSize: 11, color: "#444", textAlign: "center" }}>OneFlow Social Manager v2.0</div>
        </div>
      </aside>

      <div className="md:hidden" style={{ height: 56 }} />
    </>
  );
}
