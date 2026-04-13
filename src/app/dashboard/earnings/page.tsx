'use client';

import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Earning {
  id: string;
  gross_amount: number;
  take_home: number;
  savings: number;
  created_at: string;
  projects?: { id: string; name: string };
  users?: { id: string; full_name: string; email: string };
}

interface Project {
  id: string;
  name: string;
}

interface Member {
  id: string;
  full_name: string;
  email: string;
}

export default function EarningsPage() {
  const { user, token } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totals, setTotals] = useState({ gross: 0, takeHome: 0, savings: 0 });
  const [loading, setLoading] = useState(true);

  // Admin: enter earnings form
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [earningEntries, setEarningEntries] = useState<{ userId: string; amount: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadEarnings() {
    if (!token || !user) return;
    try {
      if (user.role === 'admin') {
        const res = await api.get<{ earnings: Earning[] }>('/earnings', token);
        setEarnings(res.earnings);
        const t = res.earnings.reduce(
          (acc, e) => ({
            gross: acc.gross + Number(e.gross_amount),
            takeHome: acc.takeHome + Number(e.take_home),
            savings: acc.savings + Number(e.savings),
          }),
          { gross: 0, takeHome: 0, savings: 0 }
        );
        setTotals(t);

        const [projectsRes, membersRes] = await Promise.all([
          api.get<{ projects: Project[] }>('/projects', token),
          api.get<{ users: Member[] }>('/users', token),
        ]);
        setProjects(projectsRes.projects);
        setMembers(membersRes.users);
      } else {
        const res = await api.get<{ earnings: Earning[]; totals: typeof totals }>('/earnings/me', token);
        setEarnings(res.earnings);
        setTotals(res.totals);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadEarnings(); }, [token, user]);

  function addEntry() {
    setEarningEntries([...earningEntries, { userId: '', amount: '' }]);
  }

  function removeEntry(i: number) {
    setEarningEntries(earningEntries.filter((_, idx) => idx !== i));
  }

  async function handleSubmitEarnings(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = earningEntries
      .filter((en) => en.userId && Number(en.amount) > 0)
      .map((en) => ({ userId: en.userId, amount: Number(en.amount) }));

    if (payload.length === 0) {
      setError('Add at least one earning entry');
      setSubmitting(false);
      return;
    }

    try {
      await api.post(`/earnings/projects/${selectedProject}/earnings`, { earnings: payload }, token!);
      setShowForm(false);
      setEarningEntries([]);
      setSelectedProject('');
      await loadEarnings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-muted animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Earnings</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => { setShowForm(!showForm); if (!showForm) addEntry(); }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Enter Earnings
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted mb-1">Total Gross</p>
          <p className="text-xl font-bold">{totals.gross.toLocaleString()} DA</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted mb-1">Take Home</p>
          <p className="text-xl font-bold text-accent">{totals.takeHome.toLocaleString()} DA</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted mb-1">Savings (50%)</p>
          <p className="text-xl font-bold text-primary">{totals.savings.toLocaleString()} DA</p>
        </div>
      </div>

      {/* Admin: enter earnings form */}
      {showForm && user?.role === 'admin' && (
        <form onSubmit={handleSubmitEarnings} className="mb-6 p-6 rounded-xl border border-border bg-surface space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select
              required
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Earnings per person</label>
            {earningEntries.map((entry, i) => (
              <div key={i} className="flex gap-3 items-center">
                <select
                  value={entry.userId}
                  onChange={(e) => {
                    const updated = [...earningEntries];
                    updated[i].userId = e.target.value;
                    setEarningEntries(updated);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
                >
                  <option value="">Select member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Amount (DA)"
                  value={entry.amount}
                  onChange={(e) => {
                    const updated = [...earningEntries];
                    updated[i].amount = e.target.value;
                    setEarningEntries(updated);
                  }}
                  className="w-40 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
                />
                <button type="button" onClick={() => removeEntry(i)} className="text-red-400 hover:text-red-300 text-sm">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addEntry} className="text-sm text-primary hover:text-primary-hover">
              + Add person
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Earnings'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEarningEntries([]); }} className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>

          {earningEntries.length > 0 && earningEntries.some((e) => Number(e.amount) > 0) && (
            <div className="mt-4 p-4 rounded-lg bg-background border border-border">
              <p className="text-sm text-muted mb-2">Preview (50/50 split):</p>
              {earningEntries.filter((e) => Number(e.amount) > 0).map((entry, i) => {
                const amount = Number(entry.amount);
                const member = members.find((m) => m.id === entry.userId);
                return (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{member?.full_name || 'Unknown'}</span>
                    <span>
                      <span className="text-muted">{amount.toLocaleString()} DA</span>
                      {' → '}
                      <span className="text-accent">{(amount / 2).toLocaleString()} DA take-home</span>
                      {' + '}
                      <span className="text-primary">{(amount / 2).toLocaleString()} DA savings</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      )}

      {/* Earnings table */}
      {earnings.length === 0 ? (
        <div className="text-center py-16 text-muted">No earnings recorded yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {user?.role === 'admin' && <th className="pb-3 font-medium text-muted">Person</th>}
                <th className="pb-3 font-medium text-muted">Project</th>
                <th className="pb-3 font-medium text-muted">Gross</th>
                <th className="pb-3 font-medium text-muted">Take Home</th>
                <th className="pb-3 font-medium text-muted">Savings</th>
                <th className="pb-3 font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  {user?.role === 'admin' && <td className="py-3 font-medium">{e.users?.full_name}</td>}
                  <td className="py-3 text-muted">{e.projects?.name}</td>
                  <td className="py-3">{Number(e.gross_amount).toLocaleString()} DA</td>
                  <td className="py-3 text-accent">{Number(e.take_home).toLocaleString()} DA</td>
                  <td className="py-3 text-primary">{Number(e.savings).toLocaleString()} DA</td>
                  <td className="py-3 text-muted">{new Date(e.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
