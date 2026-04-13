'use client';

import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client_name: string;
  status: string;
  total_revenue: number;
  created_at: string;
  project_members?: { user_id: string; role_in_project: string; users: { full_name: string } }[];
}

export default function ProjectsPage() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', client_name: '', client_email: '' });
  const [submitting, setSubmitting] = useState(false);

  async function loadProjects() {
    if (!token) return;
    try {
      const res = await api.get<{ projects: Project[] }>('/projects', token);
      setProjects(res.projects);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadProjects(); }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await api.post('/projects', formData, token);
      setShowForm(false);
      setFormData({ name: '', description: '', client_name: '', client_email: '' });
      await loadProjects();
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    active: 'bg-primary/10 text-primary',
    completed: 'bg-accent/10 text-accent',
    cancelled: 'bg-red-500/10 text-red-400',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-muted animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role !== 'freelancer' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-6 rounded-xl border border-border bg-surface space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <input required value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Email</label>
              <input type="email" value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 text-muted">No projects yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted">Name</th>
                <th className="pb-3 font-medium text-muted">Client</th>
                <th className="pb-3 font-medium text-muted">Status</th>
                <th className="pb-3 font-medium text-muted">Revenue</th>
                <th className="pb-3 font-medium text-muted">Members</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3 text-muted">{p.client_name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3">{Number(p.total_revenue).toLocaleString()} DA</td>
                  <td className="py-3 text-muted">{p.project_members?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
