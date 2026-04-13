'use client';

import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { FolderOpen, Users, DollarSign, PiggyBank, Loader2 } from 'lucide-react';

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalEarnings: number;
  totalSavings: number;
  takeHome: number;
  activeMembers: number;
}

function StatCard({ label, value, icon: Icon, format }: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: 'currency' | 'number';
}) {
  const display = format === 'currency'
    ? `${value.toLocaleString()} DA`
    : value.toString();

  return (
    <div className="p-6 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold">{display}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    async function loadStats() {
      try {
        if (user!.role === 'admin') {
          const [projectsRes, earningsRes, savingsRes, usersRes] = await Promise.all([
            api.get<{ projects: { status: string }[] }>('/projects', token!),
            api.get<{ earnings: { gross_amount: number }[] }>('/earnings', token!),
            api.get<{ total_savings: number }>('/savings', token!),
            api.get<{ users: unknown[] }>('/users', token!),
          ]);

          setStats({
            totalProjects: projectsRes.projects.length,
            activeProjects: projectsRes.projects.filter((p) => p.status === 'active').length,
            totalEarnings: projectsRes.projects.reduce((sum, p: Record<string, unknown>) => sum + Number((p as { total_revenue?: number }).total_revenue || 0), 0),
            totalSavings: savingsRes.total_savings,
            takeHome: 0,
            activeMembers: usersRes.users.length,
          });
        } else if (user!.role === 'founder') {
          const [projectsRes, earningsRes, savingsRes] = await Promise.all([
            api.get<{ projects: { status: string }[] }>('/projects', token!),
            api.get<{ earnings: unknown[]; totals: { gross: number; takeHome: number; savings: number } }>('/earnings/me', token!),
            api.get<{ total_savings: number }>('/savings/me', token!),
          ]);

          setStats({
            totalProjects: projectsRes.projects.length,
            activeProjects: projectsRes.projects.filter((p) => p.status === 'active').length,
            totalEarnings: earningsRes.totals.gross,
            totalSavings: savingsRes.total_savings,
            takeHome: earningsRes.totals.takeHome,
            activeMembers: 0,
          });
        } else {
          // Freelancer
          const [projectsRes, earningsRes] = await Promise.all([
            api.get<{ projects: { status: string }[] }>('/projects', token!),
            api.get<{ earnings: unknown[]; totals: { gross: number; takeHome: number; savings: number } }>('/earnings/me', token!),
          ]);

          setStats({
            totalProjects: projectsRes.projects.length,
            activeProjects: projectsRes.projects.filter((p) => p.status === 'active').length,
            totalEarnings: earningsRes.totals.gross,
            totalSavings: earningsRes.totals.savings,
            takeHome: earningsRes.totals.takeHome,
            activeMembers: 0,
          });
        }
      } catch {
        // Silently fail — show zeros
        setStats({ totalProjects: 0, activeProjects: 0, totalEarnings: 0, totalSavings: 0, takeHome: 0, activeMembers: 0 });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token, user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-muted animate-spin" />
      </div>
    );
  }

  if (!user || !stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {user.role === 'admin' ? 'Admin Dashboard' : `Welcome, ${user.full_name}`}
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderOpen} />
        <StatCard label="Active Projects" value={stats.activeProjects} icon={FolderOpen} />

        {user.role === 'admin' ? (
          <>
            <StatCard label="Active Members" value={stats.activeMembers} icon={Users} />
            <StatCard label="Total Savings" value={stats.totalSavings} icon={PiggyBank} format="currency" />
          </>
        ) : (
          <>
            <StatCard label="Total Earnings" value={stats.totalEarnings} icon={DollarSign} format="currency" />
            <StatCard label="Take Home" value={stats.takeHome} icon={DollarSign} format="currency" />
          </>
        )}
      </div>
    </div>
  );
}
