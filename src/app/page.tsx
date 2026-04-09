"use client";

import { useEffect, useState } from "react";
import { DashboardData, DealStatus, STAGE_LABELS, STAGE_COLORS, formatDZD, EQUITY_BASE_PCT, EQUITY_PERFORMANCE_PCT } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";

const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4",
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  const equityChartData = data.members.map((m) => ({
    name: m.name,
    value: m.equity_pct,
  }));

  const stages: DealStatus[] = ["idea", "talked", "dealed", "convinced", "done"];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Pipeline Summary */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline</h2>
        <div className="grid grid-cols-5 gap-3">
          {stages.map((s) => (
            <Link
              key={s}
              href={`/projects?status=${s}`}
              className={`rounded-xl border-2 p-4 text-center transition-shadow hover:shadow-md ${STAGE_COLORS[s]}`}
            >
              <div className="text-3xl font-bold">{data.pipelineCounts[s]}</div>
              <div className="text-sm font-medium mt-1">{STAGE_LABELS[s]}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cash Flow Summary */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Cash Flow</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatDZD(data.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500">Treasury (50%)</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{formatDZD(data.treasury)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500">Paid Out (50%)</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{formatDZD(data.totalPaidOut)}</div>
          </div>
        </div>
      </section>

      {/* Equity + Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Equity Chart */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Equity Split</h2>
          <p className="text-xs text-gray-400 mb-4">{EQUITY_BASE_PCT}% base (equal) + {EQUITY_PERFORMANCE_PCT}% performance (earned)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equityChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {equityChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.members
              .sort((a, b) => b.equity_pct - a.equity_pct)
              .map((m) => (
                <div key={m.member_id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[data.members.findIndex(x => x.member_id === m.member_id) % CHART_COLORS.length] }}
                    />
                    <span className="font-medium">{m.name}</span>
                  </div>
                  <span className="font-mono">{m.equity_pct}%</span>
                </div>
              ))}
          </div>
        </section>

        {/* Activity Monitor */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Activity</h2>
          <div className="space-y-3">
            {data.members.map((m) => {
              let badge = "bg-green-100 text-green-700";
              let label = "Active";
              if (m.is_decaying) {
                badge = "bg-red-100 text-red-700";
                label = "Decaying";
              } else if (m.days_inactive >= 60) {
                badge = "bg-yellow-100 text-yellow-700";
                label = "Warning";
              } else if (!m.last_active) {
                badge = "bg-gray-100 text-gray-500";
                label = "No activity";
              }

              return (
                <div key={m.member_id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">
                      {m.last_active
                        ? `Last active ${m.days_inactive}d ago`
                        : "Never active"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-600">
                      {formatDZD(m.total_cash)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Completed Deals */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recent Completed Deals</h2>
        {data.recentDeals.length === 0 ? (
          <p className="text-gray-400 text-sm">No completed deals yet</p>
        ) : (
          <div className="space-y-2">
            {data.recentDeals.map((d) => (
              <Link
                key={d.id}
                href={`/projects/${d.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-gray-400">
                    Closed by {d.closer?.name || "Unknown"}
                  </div>
                </div>
                <span className="font-mono text-sm font-medium text-green-600">
                  {formatDZD(d.value || 0)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
