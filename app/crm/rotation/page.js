'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Repeat, Shield, Users, CheckCircle2, Save, Info, ArrowRight, Zap, Clock,
} from 'lucide-react';

function Spinner({ size = 14, color = 'white' }) {
  return <span style={{ width: size, height: size, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: color, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

export default function LeadRotation() {
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [pool, setPool] = useState([]);
  const [lastIndex, setLastIndex] = useState(-1);
  const [agents, setAgents] = useState([]);
  const [timeout, setTimeout_]       = useState(0); // nonAttendedTimeoutMinutes
  const [timeoutSaving, setTimeoutSaving] = useState(false);
  const [timeoutSaved,  setTimeoutSaved]  = useState(false);

  const load = useCallback(async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const d = await meRes.json();
        if (d.user.role !== 'admin') { setDenied(true); setLoading(false); return; }
      }
      const [rotRes, agentsRes] = await Promise.all([
        fetch('/api/rotation', { cache: 'no-store' }),
        fetch('/api/users?role=agent', { cache: 'no-store' }),
      ]);
      if (rotRes.status === 403) { setDenied(true); setLoading(false); return; }
      if (rotRes.ok) {
        const rot = await rotRes.json();
        setEnabled(rot.enabled);
        setLastIndex(typeof rot.lastIndex === 'number' ? rot.lastIndex : -1);
        setPool((rot.agents || []).map((a) => String(a._id)));
        setTimeout_(rot.nonAttendedTimeoutMinutes ?? 0);
      }
      if (agentsRes.ok) setAgents(await agentsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build the pool from the agent listing order so round-robin is deterministic.
  const togglePool = (id) =>
    setPool((prev) => (prev.includes(id)
      ? prev.filter((x) => x !== id)
      : agents.map((a) => String(a._id)).filter((x) => prev.includes(x) || x === id)));

  // Saves ONLY the timeout — called immediately when a timeout button is clicked
  // so the user never needs to remember to hit "Save Settings" for this field.
  const saveTimeout = async (value) => {
    setTimeout_(value);
    setTimeoutSaving(true);
    try {
      const res = await fetch('/api/rotation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonAttendedTimeoutMinutes: value }),
      });
      if (res.ok) {
        setTimeoutSaved(true);
        setTimeout(() => setTimeoutSaved(false), 2000);
      }
    } catch (e) { console.error(e); }
    finally { setTimeoutSaving(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/rotation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, agents: pool, nonAttendedTimeoutMinutes: timeout }),
      });
      if (res.ok) {
        const rot = await res.json();
        setEnabled(rot.enabled);
        setLastIndex(typeof rot.lastIndex === 'number' ? rot.lastIndex : -1);
        setPool((rot.agents || []).map((a) => String(a._id)));
        setTimeout_(rot.nonAttendedTimeoutMinutes ?? 0);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2200);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (denied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
        <Shield size={40} style={{ color: '#475569' }} />
        <h2 style={{ color: 'white', margin: 0 }}>Admin access required</h2>
        <p style={{ color: '#475569' }}>Lead rotation settings are restricted to administrators.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Spinner size={36} color="#14b8a6" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const activeAgents = agents.filter((a) => a.active !== false);
  const orderedPool = agents.map((a) => String(a._id)).filter((id) => pool.includes(id));
  const nextAgentId = enabled && orderedPool.length ? orderedPool[(lastIndex + 1) % orderedPool.length] : null;
  const nextAgent = agents.find((a) => String(a._id) === String(nextAgentId));

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Repeat size={26} style={{ color: '#2dd4bf' }} /> Lead Rotation
        </h1>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>Automatically distribute new incoming leads across a pool of agents, round-robin, for fair workload.</p>
      </div>

      {/* MASTER TOGGLE */}
      <div style={{ background: enabled ? 'rgba(20,184,166,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${enabled ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: enabled ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${enabled ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} style={{ color: enabled ? '#2dd4bf' : '#475569' }} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Automatic Rotation</div>
            <div style={{ color: enabled ? '#2dd4bf' : '#64748b', fontSize: 13, marginTop: 2 }}>
              {enabled ? 'On — new leads are auto-assigned to the pool' : 'Off — new leads arrive unassigned'}
            </div>
          </div>
        </div>
        <button onClick={() => setEnabled((v) => !v)} role="switch" aria-checked={enabled} style={{ width: 56, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', background: enabled ? '#14b8a6' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: enabled ? 29 : 3, width: 24, height: 24, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
        </button>
      </div>

      {/* NEXT-UP PREVIEW */}
      {enabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 20px', marginBottom: 16 }}>
          <Info size={16} style={{ color: '#64748b', flexShrink: 0 }} />
          {nextAgent ? (
            <div style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              Next incoming lead will go to <ArrowRight size={13} style={{ color: '#2dd4bf' }} />
              <span style={{ color: '#2dd4bf', fontWeight: 700 }}>{nextAgent.name}</span>
            </div>
          ) : (
            <div style={{ color: '#fbbf24', fontSize: 13 }}>Rotation is on but the pool is empty — select at least one agent below.</div>
          )}
        </div>
      )}

      {/* AGENT POOL */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Users size={16} style={{ color: '#0d9488' }} />
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: 0 }}>Rotation Pool</h3>
          <span style={{ marginLeft: 'auto', color: '#475569', fontSize: 12 }}>{orderedPool.length} of {activeAgents.length} agents selected</span>
        </div>
        <p style={{ color: '#475569', fontSize: 12, margin: '0 0 16px' }}>Leads are handed out in turn to each selected agent, looping back to the first.</p>

        {activeAgents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <Users size={30} style={{ color: '#1e3a3a', margin: '0 auto 10px' }} />
            <div style={{ color: '#475569', fontSize: 14 }}>No active agents yet.</div>
            <div style={{ color: '#334155', fontSize: 12, marginTop: 4 }}>Create agents in Users &amp; Roles first.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
            {activeAgents.map((a) => {
              const id = String(a._id);
              const checked = pool.includes(id);
              const order = orderedPool.indexOf(id);
              return (
                <button key={id} onClick={() => togglePool(id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', background: checked ? 'rgba(20,184,166,0.08)' : 'rgba(0,0,0,0.2)', border: `1px solid ${checked ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: checked ? '#14b8a6' : 'transparent', border: `1px solid ${checked ? '#14b8a6' : 'rgba(255,255,255,0.2)'}` }}>
                    {checked && <CheckCircle2 size={13} color="white" />}
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#60a5fa' }}>
                    {a.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                    <div style={{ color: '#475569', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.email}</div>
                  </div>
                  {checked && order >= 0 && (
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, color: '#2dd4bf', background: 'rgba(20,184,166,0.12)', borderRadius: 6, padding: '2px 7px' }}>#{order + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* NON-ATTENDED TIMEOUT */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Clock size={16} style={{ color: '#fbbf24' }} />
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: 0 }}>Non-Attended Lead Timeout</h3>
          {timeoutSaving && (
            <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Spinner size={10} color="#94a3b8" /> Saving…
            </span>
          )}
          {!timeoutSaving && timeoutSaved && (
            <span style={{ marginLeft: 8, fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} /> Saved
            </span>
          )}
        </div>
        <p style={{ color: '#475569', fontSize: 12, margin: '0 0 20px' }}>
          If an agent doesn't mark a lead as <strong style={{ color: '#94a3b8' }}>Attended</strong> within the set time, the lead is automatically reassigned to the next agent in the pool.
          Set to <strong style={{ color: '#94a3b8' }}>Disabled</strong> to turn this off.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'Disabled', value: 0 },
            { label: '10 min',   value: 10 },
            { label: '15 min',   value: 15 },
            { label: '20 min',   value: 20 },
            { label: '30 min',   value: 30 },
            { label: '45 min',   value: 45 },
            { label: '60 min',   value: 60 },
          ].map(({ label, value }) => {
            const active = timeout === value;
            return (
              <button key={value} onClick={() => saveTimeout(value)}
                style={{ padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: `1px solid ${active ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`, background: active ? 'rgba(251,191,36,0.12)' : 'rgba(0,0,0,0.2)', color: active ? '#fbbf24' : '#64748b', transition: 'all 0.15s' }}>
                {label}
              </button>
            );
          })}
        </div>

        {timeout > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 14px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12 }}>
            <Info size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
              Unattended leads assigned to an agent for more than <strong style={{ color: '#fbbf24' }}>{timeout} minutes</strong> will be reassigned automatically.
              Requires at least 2 agents in the pool.
            </span>
          </div>
        )}
      </div>

      {/* SAVE — covers all settings above */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: 'white', background: savedFlash ? 'linear-gradient(135deg,#166534,#15803d)' : 'linear-gradient(135deg,#0f766e,#0d9488)', opacity: saving ? 0.75 : 1, boxShadow: '0 4px 20px rgba(13,148,136,0.25)' }}>
          {saving ? <><Spinner /> Saving…</> : savedFlash ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}