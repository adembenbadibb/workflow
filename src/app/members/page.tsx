"use client";

import { useEffect, useState } from "react";
import { MemberStats, formatDZD, EQUITY_BASE_PCT, EQUITY_PERFORMANCE_PCT } from "@/lib/types";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [decayMessage, setDecayMessage] = useState<string | null>(null);
  const [decaying, setDecaying] = useState(false);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDecay = async () => {
    setDecaying(true);
    setDecayMessage(null);

    try {
      const res = await fetch("/api/decay", { method: "POST" });
      const data = await res.json();
      setDecayMessage(data.message);

      // Refresh members
      const updated = await fetch("/api/members").then((r) => r.json());
      if (Array.isArray(updated)) setMembers(updated);
    } catch {
      setDecayMessage("Failed to run decay check");
    } finally {
      setDecaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const sorted = [...members].sort((a, b) => b.equity_pct - a.equity_pct);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        <button
          onClick={handleDecay}
          disabled={decaying}
          className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {decaying ? "Running..." : "Run Decay Check"}
        </button>
      </div>

      {decayMessage && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
          {decayMessage}
        </div>
      )}

      {/* Equity Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Equity & Earnings
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {EQUITY_BASE_PCT}% split equally (base) + {EQUITY_PERFORMANCE_PCT}% by contribution (performance)
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {sorted.map((m, rank) => {
            let statusBadge = "bg-green-100 text-green-700";
            let statusLabel = "Active";
            if (m.is_decaying) {
              statusBadge = "bg-red-100 text-red-700";
              statusLabel = "Decaying";
            } else if (m.days_inactive >= 60) {
              statusBadge = "bg-yellow-100 text-yellow-700";
              statusLabel = `${m.days_inactive}d inactive`;
            } else if (!m.last_active) {
              statusBadge = "bg-gray-100 text-gray-500";
              statusLabel = "No activity";
            }

            return (
              <div key={m.member_id} className="px-5 py-4 flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                  {rank + 1}
                </div>

                {/* Name + Status */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{m.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                      {statusLabel}
                    </span>
                    {m.last_active && (
                      <span className="text-xs text-gray-400">
                        Last active{" "}
                        {new Date(m.last_active).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Equity Bar */}
                <div className="w-40">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Equity</span>
                    <span className="font-mono font-bold text-blue-600">{m.equity_pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2 transition-all"
                      style={{ width: `${Math.min(m.equity_pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cash Earned */}
                <div className="text-right w-36">
                  <div className="text-xs text-gray-500">Total Earned</div>
                  <div className="font-mono text-sm font-medium">{formatDZD(m.total_cash)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decay Rules Info */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">How Equity Works</h3>
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          <li><strong>{EQUITY_BASE_PCT}% base equity</strong> — split equally among all {sorted.length} members (~{(EQUITY_BASE_PCT / sorted.length).toFixed(1)}% each)</li>
          <li><strong>{EQUITY_PERFORMANCE_PCT}% performance equity</strong> — earned by closing deals (finder) and working on deals (worker)</li>
          <li>Everyone always has a guaranteed base share, active members earn more on top</li>
          <li>Members must earn at least 1 point every 90 days to avoid decay</li>
          <li>After 90 days of inactivity, 5% of performance points are burned each decay run</li>
        </ul>
      </div>
    </div>
  );
}
