'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Briefcase,
  UserCog, Repeat, LogOut, BarChart3,
} from 'lucide-react';
import { canAccessModule, ROLE_LABELS, ROLE_COLORS } from '../../lib/permissions';
import NotificationBell from '../../components/NotificationBell';

// Master navigation. Visibility is decided per item:
//  - adminOnly: only the admin role
//  - module:   any user whose module list includes it (admin always)
//  - neither:  shown to everyone (the dashboard)
const NAV = [
  { name: 'Dashboard',     path: '/admin',          icon: LayoutDashboard },
  { name: 'Leads CRM',     path: '/admin/leads',    icon: Users,     module: 'leads' },
  { name: 'Services',      path: '/admin/services', icon: Briefcase, module: 'services' },
  { name: 'Blogs',         path: '/admin/blogs',    icon: FileText,  module: 'blogs' },
  { name: 'Users',         path: '/admin/users',    icon: UserCog,   adminOnly: true },
  { name: 'Lead Rotation', path: '/admin/rotation', icon: Repeat,    adminOnly: true },
  { name: 'Reports',       path: '/admin/reports',  icon: BarChart3, adminOnly: true },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (active) setUser(data.user);
      } catch {
        router.replace('/admin/login');
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [isLogin, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    router.replace('/admin/login');
    router.refresh();
  };

  // Login page renders without the admin shell.
  if (isLogin) return children;

  // Brief loader while we resolve the session.
  if (!loaded || !user) {
    return (
      <div className="min-h-screen bg-[#021a1a] flex items-center justify-center">
        <div style={{ width: 38, height: 38, border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14b8a6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const links = NAV.filter((link) => {
    if (link.adminOnly) return user.role === 'admin';
    if (link.module) return canAccessModule(user, link.module);
    return true;
  });

  const roleColor = ROLE_COLORS[user.role] || '#2dd4bf';

  return (
    <div className="min-h-screen bg-[#021a1a] flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold text-white text-lg tracking-tight">Admin<span className="text-teal-400">Panel</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-teal-500 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Identity + logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}55`, color: roleColor }}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="text-white text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: roleColor }}>
                {ROLE_LABELS[user.role] || user.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(2,26,26,0.85)', backdropFilter: 'blur(8px)', zIndex: 30 }}>
          <NotificationBell />
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}