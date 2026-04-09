"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/projects", label: "Projects", icon: "📋" },
  { href: "/projects/new", label: "New Project", icon: "➕" },
  { href: "/members", label: "Members", icon: "👥" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1e293b] text-[#e2e8f0] flex flex-col z-50">
      <div className="p-6 border-b border-[#334155]">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-blue-400">Team</span>Flow
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">Dynamic Growth Model</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-[#94a3b8] hover:bg-[#334155] hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#334155]">
        <div className="text-xs text-[#64748b]">
          7 Members &middot; 50/40/10 Split
        </div>
      </div>
    </aside>
  );
}
