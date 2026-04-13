'use client';

import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function ContactsPage() {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const res = await api.get<{ submissions: Contact[] }>('/contact', token!);
        setContacts(res.submissions);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [token]);

  if (user?.role !== 'admin') {
    return <div className="text-center py-16 text-muted">Access denied</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-muted animate-spin" /></div>;
  }

  const statusColors: Record<string, string> = {
    new: 'bg-primary/10 text-primary',
    read: 'bg-yellow-500/10 text-yellow-400',
    replied: 'bg-accent/10 text-accent',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contact Submissions</h1>

      {contacts.length === 0 ? (
        <div className="text-center py-16 text-muted">No submissions yet</div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div key={c.id} className="p-6 rounded-xl border border-border bg-surface">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{c.name}</h3>
                  <p className="text-sm text-muted">{c.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>
                    {c.status}
                  </span>
                  <span className="text-xs text-muted">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
