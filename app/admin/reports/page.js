'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, TrendingUp, CalendarClock, Tag, Download,
  RefreshCw, Shield, Award, AlertTriangle, Clock, Target,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const STATUS_ORDER = ['New', 'Contacted', 'Qualified', 'Closed'];
const STATUS_COLOR = { New: '#60a5fa', Contacted: '#fbbf24', Qualified: '#c084fc', Closed: '#4ade80', Lost: '#f87171' };
const PALETTE = ['#14b8a6', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#f43f5e', '#06b6d4', '#eab308'];

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

function Spinner({ size = 16 }) {
  return <span style={{ width: size, height: size, border: '2px solid rgba(20,184,166,0.2)', borderTopColor: '#14b8a6', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

function Section({ title, icon: Icon, children, right }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        {Icon && <Icon size={16} style={{ color: '#0d9488' }} />}
        <h3 style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: 0 }}>{title}</h3>
        {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
      </div>
      {children}
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

export default function Reports() {
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [period, setPeriod] = useState('daily'); // daily | monthly

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const d = await meRes.json();
        if (d.user.role !== 'admin') { setDenied(true); setLoading(false); return; }
      }
      const res = await fetch('/api/leads');
      if (res.status === 403) { setDenied(true); setLoading(false); return; }
      if (res.ok) setLeads(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (denied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
        <Shield size={40} style={{ color: '#475569' }} />
        <h2 style={{ color: 'white', margin: 0 }}>Admin access required</h2>
        <p style={{ color: '#475569' }}>Reports are restricted to administrators.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Spinner size={36} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const total = leads.length;
  const counts = leads.reduce((a, l) => { a[l.status] = (a[l.status] || 0) + 1; return a; }, {});
  const won = counts.Closed || 0;
  const overallConv = total ? Math.round((won / total) * 100) : 0;

  // 1 — Lead Source (by service, the closest available dimension)
  const srcMap = {};
  leads.forEach((l) => {
    const k = (l.service || l.businessType || 'Unknown').trim() || 'Unknown';
    if (!srcMap[k]) srcMap[k] = { source: k, total: 0, won: 0 };
    srcMap[k].total += 1;
    if (l.status === 'Closed') srcMap[k].won += 1;
  });
  const sources = Object.values(srcMap)
    .map((s) => ({ ...s, conv: s.total ? Math.round((s.won / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
  const sourceChart = sources.slice(0, 8);

  // 2 — Agent Performance
  const agMap = {};
  leads.forEach((l) => {
    const name = l.assignedTo?.name;
    if (!name) return;
    if (!agMap[name]) agMap[name] = { name, total: 0, won: 0, pending: 0 };
    agMap[name].total += 1;
    if (l.status === 'Closed') agMap[name].won += 1;
    else if (l.status !== 'Lost') agMap[name].pending += 1;
  });
  const agents = Object.values(agMap)
    .map((a) => ({ ...a, conv: a.total ? Math.round((a.won / a.total) * 100) : 0 }))
    .sort((a, b) => b.won - a.won || b.total - a.total);

  // 3 — Conversion funnel
  const funnel = STATUS_ORDER.map((s) => ({ stage: s, count: counts[s] || 0, pct: total ? Math.round(((counts[s] || 0) / total) * 100) : 0 }));

  // 4 — Daily / Monthly time series
  let series = [];
  if (period === 'daily') {
    const today = startOfDay(new Date());
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      series.push({ key: d.toISOString().slice(0, 10), label, count: 0 });
    }
    const idx = Object.fromEntries(series.map((s, i) => [s.key, i]));
    leads.forEach((l) => {
      const k = startOfDay(l.createdAt).toISOString().slice(0, 10);
      if (idx[k] !== undefined) series[idx[k]].count += 1;
    });
  } else {
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      series.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label, count: 0 });
    }
    const idx = Object.fromEntries(series.map((s, i) => [s.key, i]));
    leads.forEach((l) => {
      const d = new Date(l.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (idx[k] !== undefined) series[idx[k]].count += 1;
    });
  }

  // 5 — Follow-up report
  const todayStart = startOfDay(new Date());
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const fu = { overdue: [], today: [], upcoming: [] };
  leads.forEach((l) => {
    if (!l.callbackDate || l.status === 'Closed' || l.status === 'Lost') return;
    const c = new Date(l.callbackDate);
    if (c < todayStart) fu.overdue.push(l);
    else if (c < tomorrowStart) fu.today.push(l);
    else fu.upcoming.push(l);
  });
  const fuSorted = [...fu.overdue, ...fu.today, ...fu.upcoming]
    .sort((a, b) => new Date(a.callbackDate) - new Date(b.callbackDate))
    .slice(0, 20);

  const exportCSV = () => {
    const rows = [['Agent', 'Assigned', 'Won', 'Pending', 'Conversion %']];
    agents.forEach((a) => rows.push([a.name, a.total, a.won, a.pending, a.conv]));
    rows.push([]);
    rows.push(['Source', 'Total', 'Won', 'Conversion %']);
    sources.forEach((s) => rows.push([s.source, s.total, s.won, s.conv]));
    const csv = rows.map((r) => r.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'reports_summary.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const th = { padding: '10px 14px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' };

  return (
    <div style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={26} style={{ color: '#2dd4bf' }} /> Reports
          </h1>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>Lead source, agent performance, conversion, trends and follow-ups across the whole pipeline.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Headline stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 16 }}>
        {[
          { label: 'Total Leads', value: total, color: '#60a5fa' },
          { label: 'Won', value: won, color: '#4ade80' },
          { label: 'Conversion Rate', value: `${overallConv}%`, color: '#2dd4bf' },
          { label: 'Follow-ups Due', value: fu.overdue.length + fu.today.length, color: '#fbbf24' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '18px 22px' }}>
            <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 1 — LEAD SOURCE */}
      <Section title="Lead Source Report" icon={Tag}>
        {sources.length === 0 ? <Empty /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            <ResponsiveContainer width="100%" height={Math.max(180, sourceChart.length * 38)}>
              <BarChart data={sourceChart} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="source" width={110} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="total" name="Leads" radius={[0, 6, 6, 0]}>
                  {sourceChart.map((d, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ ...th, textAlign: 'left' }}>Source</th><th style={{ ...th, textAlign: 'center' }}>Leads</th><th style={{ ...th, textAlign: 'center' }}>Won</th><th style={{ ...th, textAlign: 'center' }}>Conv.</th>
                </tr></thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.source} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 14px', color: 'white', fontSize: 13, fontWeight: 600 }}>{s.source}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#cbd5e1', fontWeight: 700 }}>{s.total}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>{s.won}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#2dd4bf', fontWeight: 700 }}>{s.conv}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* 2 — AGENT PERFORMANCE */}
      <Section title="Agent Performance Report" icon={Award}>
        {agents.length === 0 ? <Empty msg="No assigned leads yet." /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Agent', 'Assigned', 'Won', 'Pending', 'Conversion'].map((h) => <th key={h} style={{ ...th, textAlign: h === 'Agent' ? 'left' : 'center' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#60a5fa' }}>{a.name[0]?.toUpperCase()}</span>
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
      </Section>

      {/* 3 — CONVERSION */}
      <Section title="Conversion Report" icon={Target}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {funnel.map((f, i) => (
            <div key={f.stage} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 90, color: STATUS_COLOR[f.stage], fontSize: 13, fontWeight: 700 }}>{f.stage}</div>
              <div style={{ flex: 1, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${f.pct}%`, height: '100%', background: `${STATUS_COLOR[f.stage]}55`, borderRight: `2px solid ${STATUS_COLOR[f.stage]}`, transition: 'width 0.4s' }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'white', fontSize: 12, fontWeight: 700 }}>{f.count} · {f.pct}%</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '14px 18px', borderRadius: 12, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={18} style={{ color: '#2dd4bf' }} />
            <span style={{ color: '#cbd5e1', fontSize: 14 }}>Overall conversion (Closed ÷ Total):</span>
            <span style={{ color: '#2dd4bf', fontSize: 18, fontWeight: 800, marginLeft: 'auto' }}>{overallConv}%</span>
          </div>
        </div>
      </Section>

      {/* 4 — DAILY / MONTHLY */}
      <Section
        title={period === 'daily' ? 'Daily Report (last 30 days)' : 'Monthly Report (last 12 months)'}
        icon={BarChart3}
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            {['daily', 'monthly'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', textTransform: 'capitalize', background: period === p ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.04)', color: period === p ? '#2dd4bf' : '#64748b' }}>{p}</button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          {period === 'daily' ? (
            <LineChart data={series} margin={{ top: 6, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Leads" stroke="#14b8a6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2dd4bf' }} />
            </LineChart>
          ) : (
            <BarChart data={series} margin={{ top: 6, right: 12, left: -20, bottom: 0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" name="Leads" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Section>

      {/* 5 — FOLLOW-UPS */}
      <Section title="Follow-up Report" icon={CalendarClock}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Overdue', value: fu.overdue.length, color: '#f87171', icon: AlertTriangle },
            { label: 'Due Today', value: fu.today.length, color: '#fbbf24', icon: CalendarClock },
            { label: 'Upcoming', value: fu.upcoming.length, color: '#60a5fa', icon: Clock },
          ].map((s) => (
            <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}33`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <s.icon size={20} style={{ color: s.color }} />
              <div>
                <div style={{ color: s.color, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        {fuSorted.length === 0 ? <Empty msg="No scheduled follow-ups." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fuSorted.map((l) => {
              const c = new Date(l.callbackDate);
              const overdue = c < todayStart;
              const due = !overdue && c < tomorrowStart;
              const tone = overdue ? '#f87171' : due ? '#fbbf24' : '#60a5fa';
              return (
                <div key={l._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: tone, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                    <div style={{ color: '#475569', fontSize: 11 }}>{l.assignedTo?.name || 'Unassigned'} · {l.status}</div>
                  </div>
                  <div style={{ color: tone, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {c.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {c.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Empty({ msg = 'No data yet.' }) {
  return <div style={{ textAlign: 'center', padding: '28px 0', color: '#334155', fontSize: 13 }}>{msg}</div>;
}