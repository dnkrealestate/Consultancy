'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CalendarClock, UserCheck, Zap, Plus, Clock, Volume2, VolumeX } from 'lucide-react';

const POLL = 25000;

const TYPE_META = {
  lead_assigned: { icon: UserCheck,    color: '#2dd4bf' },
  new_lead:      { icon: Plus,         color: '#60a5fa' },
  status_change: { icon: Zap,          color: '#c084fc' },
  follow_up:     { icon: CalendarClock, color: '#fbbf24' },
};

function ago(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Pleasant two-note chime via the Web Audio API (no audio file needed).
function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === 'suspended') ctx.resume();
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.5);
    });
    setTimeout(() => { try { ctx.close(); } catch { /* ignore */ } }, 1300);
  } catch { /* ignore */ }
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [unread, setUnread] = useState(0);
  const [muted, setMuted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const ref = useRef(null);

  const seenIdsRef = useRef(new Set());   // notification ids we've already shown
  const initializedRef = useRef(false);   // skip the chime on first load
  const mutedRef = useRef(false);

  // Restore mute preference.
  useEffect(() => {
    try {
      const m = localStorage.getItem('notif_muted') === '1';
      setMuted(m); mutedRef.current = m;
    } catch { /* ignore */ }
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try { localStorage.setItem('notif_muted', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const d = await res.json();
      const notes = d.notifications || [];

      // Detect genuinely new notifications → chime + pulse (not on first load).
      if (initializedRef.current) {
        const fresh = notes.some((n) => !seenIdsRef.current.has(n._id));
        if (fresh) {
          if (!mutedRef.current) playChime();
          setPulse(true);
          setTimeout(() => setPulse(false), 1600);
        }
      }
      notes.forEach((n) => seenIdsRef.current.add(n._id));
      initializedRef.current = true;

      setItems(notes);
      setUnread(d.unreadCount || 0);
      setFollowUps(d.followUps || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markAll = async () => {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }); } catch { /* ignore */ }
  };

  const openNotification = async (n) => {
    if (!n.read) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      try { await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n._id }) }); } catch { /* ignore */ }
    }
    setOpen(false);
    router.push('/crm/leads');
  };

  const badge = unread + followUps.length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} aria-label="Notifications" style={{ position: 'relative', width: 40, height: 40, borderRadius: 11, background: open ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${open ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)'}`, color: open ? '#2dd4bf' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: pulse ? 'bellShake 0.5s ease' : 'none' }}>
        <Bell size={18} />
        {badge > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #021a1a', animation: pulse ? 'badgePop 0.5s ease' : 'none' }}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 360, maxWidth: '90vw', maxHeight: 460, overflowY: 'auto', background: 'linear-gradient(160deg,#0d2226,#091a1e)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,0.7)', zIndex: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: '#0d2226' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Notifications</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {unread > 0 && (
                <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#2dd4bf', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <Check size={13} /> Mark all read
                </button>
              )}
              <button onClick={toggleMute} title={muted ? 'Unmute sound' : 'Mute sound'} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: muted ? '#475569' : '#94a3b8', cursor: 'pointer', padding: 0 }}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* Follow-ups due today */}
          {followUps.length > 0 && (
            <div style={{ padding: '12px 18px 4px' }}>
              <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarClock size={12} /> Follow-ups due today
              </div>
              {followUps.map((f) => (
                <button key={f._id} onClick={() => { setOpen(false); router.push('/crm/leads'); }} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', marginBottom: 6, borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', cursor: 'pointer' }}>
                  <CalendarClock size={15} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>
                      {new Date(f.callbackDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      {f.assignedTo?.name ? ` · ${f.assignedTo.name}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Event notifications */}
          <div style={{ padding: '8px 10px 12px' }}>
            {items.length === 0 && followUps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#334155' }}>
                <Bell size={28} style={{ color: '#1e3a3a', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13 }}>You're all caught up.</div>
              </div>
            ) : (
              items.map((n) => {
                const meta = TYPE_META[n.type] || { icon: Bell, color: '#94a3b8' };
                const Icon = meta.icon;
                return (
                  <button key={n._id} onClick={() => openNotification(n)} style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 11, padding: '11px 10px', borderRadius: 10, background: n.read ? 'transparent' : 'rgba(20,184,166,0.06)', border: '1px solid ' + (n.read ? 'transparent' : 'rgba(20,184,166,0.15)'), cursor: 'pointer', marginBottom: 2 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `${meta.color}1f`, border: `1px solid ${meta.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} style={{ color: meta.color }} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                      {n.message && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>}
                      <div style={{ color: '#475569', fontSize: 10, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={9} /> {ago(n.createdAt)} ago</div>
                    </div>
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf', flexShrink: 0, marginTop: 4 }} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellShake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-6deg)} 80%{transform:rotate(4deg)} }
        @keyframes badgePop  { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
}