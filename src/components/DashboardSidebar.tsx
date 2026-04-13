'use client';

import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  DollarSign,
  PiggyBank,
  MessageSquare,
  LogOut,
  Zap,
  Loader2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'founder', 'freelancer'] },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderOpen, roles: ['admin', 'founder', 'freelancer'] },
  { label: 'Members', href: '/dashboard/members', icon: Users, roles: ['admin'] },
  { label: 'Earnings', href: '/dashboard/earnings', icon: DollarSign, roles: ['admin', 'founder', 'freelancer'] },
  { label: 'Savings', href: '/dashboard/savings', icon: PiggyBank, roles: ['admin', 'founder'] },
  { label: 'Contacts', href: '/dashboard/contacts', icon: MessageSquare, roles: ['admin'] },
];

export default function DashboardSidebar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <aside className="w-64 bg-surface border-r border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </aside>
    );
  }

  const role = user?.role || 'freelancer';
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold">
            VOLTI<span className="text-primary">X</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NextLink>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-border">
        <div className="mb-3">
          <p className="text-sm font-medium truncate">{user?.full_name}</p>
          <p className="text-xs text-muted truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">
            {role}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
