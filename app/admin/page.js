'use client';

import { useState, useEffect } from 'react';
import {
  Users, TrendingUp, Activity, Clock, Zap, Target, DollarSign,
  RefreshCw, ChevronRight, UserCog, Repeat, FileText, Briefcase, Layers,
  CalendarClock, CheckCircle2, Hourglass, Award,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { canAccessModule, ROLE_LABELS } from '../../lib/permissions';

const POLL = 30000;
const STATUS_CFG = {
  New:       { color: '#60a5fa', dot: '#3b82f6' },
  Contacted: { color: '#fbbf24', dot: '#f59e0b' },
  Qualified: { color: '#c084fc', dot: '#a855f7' },
  Closed:    { color: '#4ade80', dot: '#22c55e' },
  Lost:      { color: '#f87171', dot: '#ef4444' },
};

function isToday(d) {
  if (!d) return false;
  const x = new Date(d), n = new Date();
  return x.getFullYear() === n.getFullYear() && x.getMonth() === n.getMonth() && x.getDate() === n.getDate();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: bg, filter: 'blur(24px)', opacity: 0.6 }} />
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon size={19} style={{ color }} />
      </div>
      <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'white', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: '#475569', fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d2226', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noLeadAccess, setNoLeadAccess] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.status === 403) { setNoLeadAccess(true); return; }
      if (res.ok) setLeads(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const d = await meRes.json();
          setUser(d.user);
          if (canAccessModule(d.user, 'leads')) {
            await fetchLeads();
          } else {
            setNoLeadAccess(true);
          }
          if (d.user.role === 'admin') {
            try { const u = await fetch('/api/users'); if (u.ok) setUserCount((await u.json()).length); } catch { /* ignore */ }
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
    const t = setInterval(() => { fetchLeads(); }, POLL);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14b8a6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#475569', fontSize: 14 }}>Loading dashboard…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const roleLabel = ROLE_LABELS[user?.role] || '';

  // ── Content-only roles with no lead access: show a modules landing ──
  if (noLeadAccess) {
    const tiles = [
      { key: 'blogs', label: 'Blogs', desc: 'Write and manage blog posts', icon: FileText, path: '/admin/blogs' },
      { key: 'services', label: 'Services', desc: 'Manage service content', icon: Briefcase, path: '/admin/services' },
    ].filter((t) => canAccessModule(user, t.key));

    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 4, marginBottom: 28 }}>{roleLabel} workspace · here are the modules you can access.</p>
        {tiles.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 48, textAlign: 'center', color: '#475569' }}>
            <Layers size={34} style={{ color: '#1e3a3a', margin: '0 auto 12px' }} />
            No modules have been assigned to your account yet. Please contact your administrator.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {tiles.map((t) => (
              <a key={t.key} href={t.path} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, display: 'block', transition: 'all 0.15s' }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <t.icon size={22} style={{ color: '#2dd4bf' }} />
                </div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{t.label}</div>
                <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{t.desc}</div>
                <div style={{ color: '#2dd4bf', fontSize: 12, fontWeight: 700, marginTop: 14, display: 'flex', alignItems: 'center', gap: 4 }}>Open <ChevronRight size={13} /></div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Lead-driven dashboard (admin / agent / back office) ──
  const total = leads.length;
  const counts = leads.reduce((a, l) => { a[l.status] = (a[l.status] || 0) + 1; return a; }, {});
  const closed = counts.Closed || 0;
  const convRate = total ? Math.round((closed / total) * 100) : 0;
  const pending = (counts.New || 0) + (counts.Contacted || 0) + (counts.Qualified || 0);
  const todayFollowUps = leads.filter((l) => isToday(l.callbackDate)).length;
  const recent = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  // Leads-by-agent distribution (admin / back office only)
  const byAgent = {};
  leads.forEach((l) => {
    const key = l.assignedTo?.name || 'Unassigned';
    byAgent[key] = (byAgent[key] || 0) + 1;
  });
  const agentData = Object.entries(byAgent).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  // Per-agent performance (admin) — assigned / won / conversion %
  const perfMap = {};
  leads.forEach((l) => {
    const name = l.assignedTo?.name;
    if (!name) return;
    if (!perfMap[name]) perfMap[name] = { name, total: 0, won: 0, pending: 0 };
    perfMap[name].total += 1;
    if (l.status === 'Closed') perfMap[name].won += 1;
    else if (l.status !== 'Lost') perfMap[name].pending += 1;
  });
  const perAgent = Object.values(perfMap)
    .map((a) => ({ ...a, conv: a.total ? Math.round((a.won / a.total) * 100) : 0 }))
    .sort((a, b) => b.won - a.won || b.total - a.total);

  return (
    <div style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>
            {isAgent ? 'My Dashboard' : 'Dashboard Overview'}
          </h1>
          <div style={{ color: '#334155', fontSize: 12, marginTop: 4 }}>
            {isAgent ? 'Your assigned leads and performance' : `${roleLabel} · full pipeline view`}
          </div>
        </div>
        <button onClick={fetchLeads} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
        {isAgent ? (
          <>
            <StatCard label="Assigned Leads"   value={total}          icon={Users}        color="#60a5fa" bg="rgba(96,165,250,0.15)" />
            <StatCard label="Pending Leads"    value={pending}        icon={Hourglass}    color="#fbbf24" bg="rgba(251,191,36,0.12)" />
            <StatCard label="Today's Follow-ups" value={todayFollowUps} icon={CalendarClock} color="#c084fc" bg="rgba(192,132,252,0.12)" />
            <StatCard label="Won Leads"        value={closed}         icon={CheckCircle2} color="#4ade80" bg="rgba(74,222,128,0.12)" />
            <StatCard label="Conversion Rate"  value={`${convRate}%`} icon={TrendingUp}   color="#2dd4bf" bg="rgba(20,184,166,0.12)" sub={`${closed} of ${total}`} />
          </>
        ) : (
          <>
            <StatCard label="Total Leads"     value={total}          icon={Users}        color="#60a5fa" bg="rgba(96,165,250,0.15)" />
            <StatCard label="New"             value={counts.New || 0} icon={Zap}         color="#60a5fa" bg="rgba(96,165,250,0.12)" />
            <StatCard label="Contacted"       value={counts.Contacted || 0} icon={Activity} color="#fbbf24" bg="rgba(251,191,36,0.12)" />
            <StatCard label="Qualified"       value={counts.Qualified || 0} icon={Target} color="#c084fc" bg="rgba(192,132,252,0.12)" />
            <StatCard label="Won (Closed)"    value={closed}         icon={CheckCircle2} color="#4ade80" bg="rgba(74,222,128,0.12)" />
            <StatCard label="Conversion Rate" value={`${convRate}%`} icon={TrendingUp}   color="#2dd4bf" bg="rgba(20,184,166,0.12)" sub={`${closed} of ${total}`} />
            {isAdmin && userCount !== null && (
              <StatCard label="Team Members"  value={userCount}      icon={UserCog}      color="#a855f7" bg="rgba(168,85,247,0.12)" />
            )}
          </>
        )}
      </div>

      {/* ADMIN QUICK LINKS */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <a href="/admin/users" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
            <UserCog size={16} style={{ color: '#a855f7' }} /> Manage Users <ChevronRight size={14} style={{ color: '#475569' }} />
          </a>
          <a href="/admin/rotation" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
            <Repeat size={16} style={{ color: '#2dd4bf' }} /> Lead Rotation <ChevronRight size={14} style={{ color: '#475569' }} />
          </a>
          <a href="/admin/reports" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
            <Award size={16} style={{ color: '#fbbf24' }} /> Reports <ChevronRight size={14} style={{ color: '#475569' }} />
          </a>
        </div>
      )}

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: isAgent ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Status pie */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Status Split</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={STATUS_CFG[d.name]?.dot || '#64748b'} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: STATUS_CFG[d.name]?.dot || '#64748b' }} />
                    {d.name} <span style={{ color: 'white', fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: 13 }}>No leads yet</div>
          )}
        </div>

        {/* Leads by agent (admin / back office) */}
        {!isAgent && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Leads by Agent</div>
            {agentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={agentData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" name="Leads" radius={[6, 6, 0, 0]}>
                    {agentData.map((d, i) => (
                      <Cell key={i} fill={d.name === 'Unassigned' ? '#475569' : ['#14b8a6', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#f43f5e'][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: 13 }}>No data</div>
            )}
          </div>
        )}
      </div>

      {/* AGENT PERFORMANCE (admin) */}
      {isAdmin && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Award size={16} style={{ color: '#fbbf24' }} />
            <div style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>Agent Performance</div>
          </div>
          {perAgent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#334155', fontSize: 13 }}>No assigned leads yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Agent', 'Assigned', 'Won', 'Pending', 'Conversion'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Agent' ? 'left' : 'center', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {perAgent.map((a) => (
                    <tr key={a.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#60a5fa' }}>
                            {a.name[0]?.toUpperCase()}
                          </span>
                          <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#cbd5e1', fontWeight: 700 }}>{a.total}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>{a.won}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#fbbf24', fontWeight: 700 }}>{a.pending}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                          <div style={{ width: 80, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ width: `${a.conv}%`, height: '100%', background: a.conv >= 50 ? '#22c55e' : a.conv >= 25 ? '#f59e0b' : '#64748b' }} />
                          </div>
                          <span style={{ color: 'white', fontWeight: 700, fontSize: 13, minWidth: 36, textAlign: 'right' }}>{a.conv}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RECENT LEADS */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>{isAgent ? 'My Recent Leads' : 'Recent Leads'}</div>
          <a href="/admin/leads" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#14b8a6', textDecoration: 'none' }}>View all <ChevronRight size={13} /></a>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155', fontSize: 14 }}>No leads yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
            {recent.map((lead) => {
              const cfg = STATUS_CFG[lead.status] || STATUS_CFG.New;
              return (
                <div key={lead._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: `${cfg.dot}22`, border: `1px solid ${cfg.dot}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: cfg.color }}>
                    {lead.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                      {lead.service || lead.businessType || '—'}{!isAgent && lead.assignedTo?.name ? ` · ${lead.assignedTo.name}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: `${cfg.dot}22`, color: cfg.color, border: `1px solid ${cfg.dot}55` }}>{lead.status}</span>
                    <span style={{ color: '#334155', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {timeAgo(lead.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}