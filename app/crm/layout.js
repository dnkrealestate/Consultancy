'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, Briefcase,
  UserCog, Repeat, LogOut, BarChart3, Globe, CalendarDays,
  Bell, BellOff, BellRing,
} from 'lucide-react';
import { canAccessModule, ROLE_LABELS, ROLE_COLORS } from '../../lib/permissions';
import NotificationBell from '../../components/NotificationBell';

const NAV = [
  { name: 'Dashboard',     path: '/crm',          icon: LayoutDashboard },
  { name: 'Leads CRM',     path: '/crm/leads',    icon: Users,        module: 'leads' },
  { name: 'Calendar',      path: '/crm/calendar', icon: CalendarDays, module: 'leads' },
  { name: 'Services',      path: '/crm/services', icon: Briefcase, module: 'services' },
  { name: 'Blogs',         path: '/crm/blogs',    icon: FileText,  module: 'blogs' },
  { name: 'SEO',           path: '/crm/seo',      icon: Globe,     module: 'seo' },
  { name: 'Users',         path: '/crm/users',    icon: UserCog,   adminOnly: true },
  { name: 'Lead Rotation', path: '/crm/rotation', icon: Repeat,    adminOnly: true },
  { name: 'Reports',       path: '/crm/reports',  icon: BarChart3, adminOnly: true },
];

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function toLocalDateStr(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function toLocalTimeStr(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── Push notification status indicator + enable button ────────────────────────
function PushSetupButton() {
  // 'checking' | 'unsupported' | 'denied' | 'prompt' | 'subscribing' | 'active' | 'error'
  const [status, setStatus] = useState('checking');
  const [tooltip, setTooltip] = useState(false);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return;
    }
    try {
      setStatus('subscribing');

      // Register + wait for SW activation
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;

      // Permission — request only when user explicitly clicked the button
      let perm = Notification.permission;
      if (perm === 'default') perm = await Notification.requestPermission();
      if (perm === 'denied')  { setStatus('denied'); return; }
      if (perm !== 'granted') { setStatus('prompt'); return; }

      // Fetch VAPID public key from server (avoids NEXT_PUBLIC_ env issues)
      const keyRes = await fetch('/api/push/vapid-key');
      if (!keyRes.ok) throw new Error('Could not load VAPID key');
      const { publicKey } = await keyRes.json();

      // Subscribe or reuse
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // Save to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error('Server failed to save subscription');

      setStatus('active');
    } catch (err) {
      console.error('[push] Setup error:', err);
      setStatus('error');
    }
  }, []);

  // On mount: check existing permission/subscription state silently
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return;
    }

    const perm = Notification.permission;
    if (perm === 'denied') { setStatus('denied'); return; }

    // If already granted, auto-subscribe in the background
    if (perm === 'granted') {
      subscribe();
    } else {
      setStatus('prompt'); // show the button
    }
  }, [subscribe]);

  if (status === 'unsupported') return null;

  // Styles
  const base = { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.2s', position: 'relative' };

  if (status === 'active') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          style={{ ...base, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', cursor: 'default' }}
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
        >
          <BellRing size={13} /> Notifications On
        </button>
        {tooltip && (
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#0d2226', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', zIndex: 999 }}>
            Push notifications active on this device
          </div>
        )}
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          style={{ ...base, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'default' }}
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
        >
          <BellOff size={13} /> Blocked
        </button>
        {tooltip && (
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#0d2226', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', zIndex: 999 }}>
            Notifications blocked in browser — go to Site Settings to allow
          </div>
        )}
      </div>
    );
  }

  if (status === 'subscribing' || status === 'checking') {
    return (
      <button style={{ ...base, background: 'rgba(20,184,166,0.08)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' }}>
        <span style={{ width: 10, height: 10, border: '2px solid rgba(20,184,166,0.3)', borderTopColor: '#14b8a6', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        {status === 'checking' ? 'Checking…' : 'Enabling…'}
      </button>
    );
  }

  if (status === 'error') {
    return (
      <button onClick={subscribe} style={{ ...base, background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
        <Bell size={13} /> Retry
      </button>
    );
  }

  // status === 'prompt' — show enable button
  return (
    <button onClick={subscribe} style={{ ...base, background: 'rgba(20,184,166,0.12)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)' }}>
      <Bell size={13} /> Enable Notifications
    </button>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]     = useState(null);
  const [loaded, setLoaded] = useState(false);

  const isLogin = pathname === '/crm/login';

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLogin) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.replace('/crm/login'); return; }
        const data = await res.json();
        if (active) setUser(data.user);
      } catch {
        router.replace('/crm/login');
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [isLogin, router]);

  // ── Auto-reassign unattended leads (client-side trigger) ─────────────────
  useEffect(() => {
    if (!user || isLogin) return;
    const run = () => fetch('/api/cron/reassign-unattended', { method: 'POST' }).catch(() => {});
    run();
    const t = setInterval(run, 60_000);
    return () => clearInterval(t);
  }, [user, isLogin]);

  // ── 30-minute callback reminder (client-side polling) ─────────────────────
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!user || isLogin) return;

    const check = async () => {
      if (Notification.permission !== 'granted') return;
      try {
        const res = await fetch('/api/leads');
        if (!res.ok) return;
        const leads = await res.json();

        const now         = Date.now();
        const windowStart = now + 25 * 60 * 1000;
        const windowEnd   = now + 35 * 60 * 1000;

        for (const lead of leads) {
          if (!lead.callbackDate) continue;
          const cb  = new Date(lead.callbackDate).getTime();
          const key = `${lead._id}|${lead.callbackDate}`;

          if (cb >= windowStart && cb <= windowEnd && !notifiedRef.current.has(key)) {
            notifiedRef.current.add(key);
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification('📅 Callback in ~30 minutes', {
              body: `${lead.name}${lead.phone ? ` · ${lead.phone}` : ''} · ${toLocalDateStr(lead.callbackDate)} ${toLocalTimeStr(lead.callbackDate)}`,
              icon: '/logo.png', badge: '/logo.png',
              tag: key, data: { url: '/crm/leads' },
              vibrate: [200, 100, 200], requireInteraction: true,
            });
          }
        }
      } catch { /* ignore */ }
    };

    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [user, isLogin]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
          await sub.unsubscribe();
        }
      }
    } catch { /* ignore */ }
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    router.replace('/crm/login');
    router.refresh();
  };

  if (isLogin) return children;

  if (!loaded || !user) {
    return (
      <div className="min-h-screen bg-[#021a1a] flex items-center justify-center">
        <div style={{ width: 38, height: 38, border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14b8a6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const links = NAV.filter(link => {
    if (link.adminOnly) return user.role === 'admin';
    if (link.module)    return canAccessModule(user, link.module);
    return true;
  });

  const roleColor = ROLE_COLORS[user.role] || '#2dd4bf';

  return (
    <div className="min-h-screen bg-[#021a1a] flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <Link href="/crm" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold text-white text-lg tracking-tight">Admin<span className="text-teal-400">Panel</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map(link => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-teal-500 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <link.icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}55`, color: roleColor }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="text-white text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: roleColor }}>
                {ROLE_LABELS[user.role] || user.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(2,26,26,0.85)', backdropFilter: 'blur(8px)', zIndex: 30 }}>
          <PushSetupButton />
          <NotificationBell />
        </div>
        <div className="p-8">{children}</div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
