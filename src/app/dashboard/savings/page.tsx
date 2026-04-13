'use client';

import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Loader2, PiggyBank } from 'lucide-react';

interface SavingsBreakdown {
  user_id: string;
  full_name: string;
  email: string;
  total_savings: number;
  percentage: number;
}

interface SavingsTransaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  created_at: string;
  users?: { full_name: string };
  projects?: { name: string };
}

export default function SavingsPage() {
  const { user, token } = useAuth();
  const [totalSavings, setTotalSavings] = useState(0);
  const [breakdown, setBreakdown] = useState<SavingsBreakdown[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    async function load() {
      try {
        if (user!.role === 'admin') {
          const [savingsRes, txRes] = await Promise.all([
            api.get<{ total_savings: number; breakdown: SavingsBreakdown[] }>('/savings', token!),
            api.get<{ transactions: SavingsTransaction[] }>('/savings/transactions', token!),
          ]);
          setTotalSavings(savingsRes.total_savings);
          setBreakdown(savingsRes.breakdown);
          setTransactions(txRes.transactions);
        } else if (user!.role === 'founder') {
          const [savingsRes, overviewRes] = await Promise.all([
            api.get<{ total_savings: number }>('/savings/me', token!),
            api.get<{ total_savings: number; breakdown: SavingsBreakdown[] }>('/savings', token!),
          ]);
          setTotalSavings(overviewRes.total_savings);
          setBreakdown(overviewRes.breakdown);
          // Show personal savings prominently
          setTotalSavings(overviewRes.total_savings);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }

    load();
  }, [token, user]);

  if (user?.role === 'freelancer') {
    return <div className="text-center py-16 text-muted">Access denied</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-muted animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Savings Fund</h1>

      {/* Total */}
      <div className="p-6 rounded-xl border border-border bg-surface mb-6">
        <div className="flex items-center gap-3 mb-2">
          <PiggyBank className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted">Total Savings Fund</span>
        </div>
        <p className="text-3xl font-bold">{totalSavings.toLocaleString()} DA</p>
      </div>

      {/* Per-person breakdown */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Per-Person Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted">Name</th>
                <th className="pb-3 font-medium text-muted">Savings</th>
                <th className="pb-3 font-medium text-muted">% of Total</th>
                <th className="pb-3 font-medium text-muted">Visual</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((b) => (
                <tr key={b.user_id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-3 font-medium">{b.full_name}</td>
                  <td className="py-3">{b.total_savings.toLocaleString()} DA</td>
                  <td className="py-3 text-primary font-medium">{b.percentage}%</td>
                  <td className="py-3">
                    <div className="w-full max-w-32 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions (admin only) */}
      {user?.role === 'admin' && transactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted">Person</th>
                  <th className="pb-3 font-medium text-muted">Project</th>
                  <th className="pb-3 font-medium text-muted">Amount</th>
                  <th className="pb-3 font-medium text-muted">Type</th>
                  <th className="pb-3 font-medium text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-3">{tx.users?.full_name || '—'}</td>
                    <td className="py-3 text-muted">{tx.projects?.name || '—'}</td>
                    <td className="py-3 font-medium">
                      <span className={tx.type === 'deposit' ? 'text-accent' : 'text-red-400'}>
                        {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toLocaleString()} DA
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'deposit' ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-muted">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
