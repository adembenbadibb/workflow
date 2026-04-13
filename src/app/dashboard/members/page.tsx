'use client';

import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { UserPlus, ArrowUpCircle, Trash2, Loader2 } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function MembersPage() {
  const { user, token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', full_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadMembers() {
    if (!token) return;
    try {
      const res = await api.get<{ users: Member[] }>('/users', token);
      setMembers(res.users);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadMembers(); }, [token]);

  if (user?.role !== 'admin') {
    return <div className="text-center py-16 text-muted">Access denied</div>;
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/users/invite', inviteData, token!);
      setShowInvite(false);
      setInviteData({ email: '', full_name: '' });
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite');
    }
    setSubmitting(false);
  }

  async function handlePromote(id: string) {
    if (!confirm('Promote this freelancer to founder?')) return;
    try {
      await api.patch(`/users/${id}/role`, {}, token!);
      await loadMembers();
    } catch { /* ignore */ }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove this freelancer? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`, token!);
      await loadMembers();
    } catch { /* ignore */ }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-muted animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="mb-6 p-6 rounded-xl border border-border bg-surface space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input required value={inviteData.full_name} onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
              {submitting ? 'Sending invite...' : 'Send Invite'}
            </button>
            <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-muted">Name</th>
              <th className="pb-3 font-medium text-muted">Email</th>
              <th className="pb-3 font-medium text-muted">Role</th>
              <th className="pb-3 font-medium text-muted">Joined</th>
              <th className="pb-3 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                <td className="py-3 font-medium">{m.full_name}</td>
                <td className="py-3 text-muted">{m.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    m.role === 'founder' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                  }`}>
                    {m.role}
                  </span>
                </td>
                <td className="py-3 text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {m.role === 'freelancer' && (
                      <>
                        <button onClick={() => handlePromote(m.id)} title="Promote to Founder" className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors">
                          <ArrowUpCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemove(m.id)} title="Remove" className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
