'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Calendar, Download, FileText, X, Save, Phone, Mail,
  Building2, DollarSign, Tag, Clock, ChevronRight, User, Plus,
  StickyNote, CheckCircle2, Filter, Bell, UserPlus, Trash2,
  CheckSquare, Square, AlertCircle, TrendingUp, Users, Star,
  ChevronDown, Zap, RefreshCw, Globe, MapPin,
  Briefcase, Home, Video, Flag, Target, LayoutGrid,
  History, UserCheck, UserMinus, ArrowLeftRight, UserCog,
} from 'lucide-react';
import * as ics from 'ics';
import Button from '../../../components/ui/Button';
import GlassCard from '../../../components/ui/GlassCard';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const POLL_INTERVAL       = 5000;
const NOTES_POLL_INTERVAL = 3000;

const STATUS_CFG = {
  New:       { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   border: 'rgba(96,165,250,0.3)',   dot: '#3b82f6' },
  Contacted: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',   dot: '#f59e0b' },
  Qualified: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)',  dot: '#a855f7' },
  Closed:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',   dot: '#22c55e' },
  Lost:      { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)',  dot: '#ef4444' },
};

const BUSINESS_TYPES    = ['All Types', 'Retail', 'F&B', 'Real Estate', 'Tech', 'Healthcare', 'Finance', 'Other'];
const INVESTMENT_RANGES = ['All Ranges', 'Under 100K', '100K–500K', '500K–1M', '1M–5M', '5M+'];

// Pipeline-history action metadata: label, accent colour, icon.
const ACTION_META = {
  created:        { label: 'Lead created',    color: '#60a5fa', icon: Plus },
  assigned:       { label: 'Assigned',        color: '#2dd4bf', icon: UserCheck },
  transferred:    { label: 'Transferred',     color: '#fbbf24', icon: ArrowLeftRight },
  unassigned:     { label: 'Unassigned',      color: '#f87171', icon: UserMinus },
  status_changed: { label: 'Status changed',  color: '#c084fc', icon: Zap },
  note_added:     { label: 'Note added',      color: '#94a3b8', icon: StickyNote },
  follow_up:      { label: 'Follow-up set',   color: '#2dd4bf', icon: Calendar },
  field_updated:  { label: 'Details updated', color: '#64748b', icon: FileText },
  closed:         { label: 'Lead closed',     color: '#4ade80', icon: CheckCircle2 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
  } catch (e) { /* no-op */ }
}

function Spinner({ color = 'white', size = 14 }) {
  return (
    <span style={{
      width: size, height: size,
      border: '2px solid rgba(255,255,255,0.15)',
      borderTopColor: color, borderRadius: '50%',
      display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

function LiveDot() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4ade80' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite' }} />
      Live
    </span>
  );
}

// ─── SECTION HEADING ──────────────────────────────────────────────────────────
function SectionHeading({ label, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      {Icon && <Icon size={13} style={{ color: '#0d9488' }} />}
      <span style={{ color: '#0d9488', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    </div>
  );
}

// ─── EDIT FIELD ───────────────────────────────────────────────────────────────
function EditField({ label, fieldKey, Icon, type = 'text', value, onChange, span = false }) {
  return (
    <div style={span ? { gridColumn: '1 / -1' } : {}}>
      <label style={{ display: 'block', color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />}
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(fieldKey, e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            padding: Icon ? '10px 14px 10px 36px' : '10px 14px',
            color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#14b8a6'; e.target.style.background = 'rgba(20,184,166,0.06)'; }}
          onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
        />
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => dismiss(t.id)} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'linear-gradient(135deg,#0d2b2e,#091c1e)',
          border: '1px solid rgba(20,184,166,0.35)', borderLeft: '3px solid #14b8a6',
          borderRadius: 14, padding: '14px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          cursor: 'pointer', minWidth: 280, maxWidth: 360,
          animation: 'slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <Bell size={16} style={{ color: '#14b8a6', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: '#2dd4bf', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>New Lead</div>
            <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{t.name}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{t.service || t.company}</div>
          </div>
          <X size={13} style={{ color: '#475569', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
        <div style={{ color: 'white', fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── ADD LEAD DRAWER ──────────────────────────────────────────────────────────
const EMPTY_LEAD = { name: '', email: '', phone: '', companyName: '', businessType: '', investmentRange: '', status: 'New' };

function AddLeadDrawer({ open, onClose, onCreated }) {
  const [form, setForm]     = useState(EMPTY_LEAD);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => { if (open) { setForm(EMPTY_LEAD); setError(''); } }, [open]);
  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { onCreated(await res.json()); onClose(); }
      else setError('Failed to create lead.');
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  };

  const sc = STATUS_CFG[form.status] || STATUS_CFG.New;

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 48 }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        width: open ? 480 : 0, maxWidth: '95vw', zIndex: 49,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(160deg,#0d2226 0%,#091a1e 60%,#060e10 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 60px rgba(0,0,0,0.8)', overflow: 'hidden',
      }}>
        <div style={{ flexShrink: 0, padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={18} style={{ color: '#2dd4bf' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Add New Lead</div>
            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Manually enter lead details</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</span>
            <select value={form.status} onChange={e => change('status', e.target.value)} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none', color: sc.color }}>
              {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <EditField label="Full Name *"    fieldKey="name"            Icon={User}       value={form.name}            onChange={change} />
          <EditField label="Phone *"        fieldKey="phone"           Icon={Phone}      value={form.phone}           onChange={change} type="tel" />
          <EditField label="Email"          fieldKey="email"           Icon={Mail}       value={form.email}           onChange={change} type="email" />
          <EditField label="Company Name"   fieldKey="companyName"     Icon={Building2}  value={form.companyName}     onChange={change} />
          <EditField label="Business Type"  fieldKey="businessType"    Icon={Tag}        value={form.businessType}    onChange={change} />
          <EditField label="Investment Range" fieldKey="investmentRange" Icon={DollarSign} value={form.investmentRange} onChange={change} />
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, padding: '18px 28px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ flex: 2, padding: 13, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#0f766e,#0d9488)', color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
            {saving ? <><Spinner /> Creating…</> : <><Plus size={15} /> Create Lead</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── BULK BAR ─────────────────────────────────────────────────────────────────
function BulkBar({ count, onStatusChange, onDelete, onClear, canDelete = true }) {
  const [showStatus, setShowStatus] = useState(false);
  return (
    <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,#0d2b2e,#091c1e)', border: '1px solid rgba(20,184,166,0.4)', borderRadius: 20, padding: '12px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.8)', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckSquare size={14} style={{ color: '#2dd4bf' }} />
        </div>
        <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: 14 }}>{count} selected</span>
      </div>
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowStatus(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Zap size={13} /> Set Status <ChevronDown size={12} />
        </button>
        {showStatus && (
          <div style={{ position: 'absolute', bottom: '110%', left: 0, background: '#0d2226', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            {Object.entries(STATUS_CFG).map(([s, cfg]) => (
              <button key={s} onClick={() => { onStatusChange(s); setShowStatus(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: cfg.color, fontSize: 13, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              ><span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot }} />{s}</button>
            ))}
          </div>
        )}
      </div>
      {canDelete && (
        <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Trash2 size={13} /> Delete
        </button>
      )}
      <button onClick={onClear} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminLeads() {
  const [leads, setLeads]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('All');
  const [filterBizType, setFilterBizType] = useState('All Types');
  const [filterInvest, setFilterInvest]   = useState('All Ranges');

  const [selectedLead, setSelectedLead] = useState(null);
  const [editForm, setEditForm]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [saveSuccess, setSaveSuccess]   = useState(false);
  const [activeTab, setActiveTab]       = useState('edit');

  const [newNote, setNewNote]         = useState('');
  const [addingNote, setAddingNote]   = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const [showCallback, setShowCallback] = useState(false);
  const [callbackLead, setCallbackLead] = useState(null);
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');

  const [selected, setSelected]       = useState(new Set());
  const [showAddLead, setShowAddLead] = useState(false);
  const [toasts, setToasts]           = useState([]);

  // Role gating + assignment + pipeline history
  const [me, setMe]                       = useState(null);
  const [agents, setAgents]               = useState([]);
  const [history, setHistory]             = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const prevLeadIdsRef    = useRef(null);
  const leadsTimerRef     = useRef(null);
  const notesTimerRef     = useRef(null);
  const selectedLeadIdRef = useRef(null);

  const pushToast = (lead) => {
    const id = Date.now();
    setToasts(p => [...p, { id, name: lead.name, company: lead.companyName, service: lead.service }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 6000);
    playNotificationSound();
  };
  const dismissToast = id => setToasts(p => p.filter(t => t.id !== id));

  // ── Resolve current user (for role gating) + load agents for assignment ──
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        if (r.ok) {
          const d = await r.json();
          setMe(d.user);
          if (d.user?.role === 'admin') {
            const a = await fetch('/api/users?role=agent');
            if (a.ok) setAgents(await a.json());
          }
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // ── Load the pipeline history for a lead ──
  const fetchHistory = useCallback(async (id) => {
    if (!id) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/leads/${id}/history`);
      setHistory(res.ok ? await res.json() : []);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  }, []);

  const fetchLeads = useCallback(async (silent = false) => {
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) return;
      const fresh = await res.json();
      if (prevLeadIdsRef.current !== null) {
        const prevIds = prevLeadIdsRef.current;
        fresh.filter(l => !prevIds.has(l._id)).forEach(l => pushToast(l));
      }
      prevLeadIdsRef.current = new Set(fresh.map(l => l._id));
      setLeads(prev => JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh);
      setSelectedLead(prev => {
        if (!prev) return prev;
        const u = fresh.find(l => l._id === prev._id);
        if (!u || JSON.stringify(u) === JSON.stringify(prev)) return prev;
        return u;
      });
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, []);

  const fetchNotes = useCallback(async () => {
    const id = selectedLeadIdRef.current;
    if (!id) return;
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (!res.ok) return;
      const updated = await res.json();
      setSelectedLead(prev => {
        if (!prev || prev._id !== id) return prev;
        if (JSON.stringify(prev.notes) === JSON.stringify(updated.notes)) return prev;
        return { ...prev, notes: updated.notes };
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchLeads(false);
    leadsTimerRef.current = setInterval(() => fetchLeads(true), POLL_INTERVAL);
    return () => clearInterval(leadsTimerRef.current);
  }, [fetchLeads]);

  useEffect(() => {
    clearInterval(notesTimerRef.current);
    if (selectedLead) {
      selectedLeadIdRef.current = selectedLead._id;
      notesTimerRef.current = setInterval(fetchNotes, NOTES_POLL_INTERVAL);
    } else {
      selectedLeadIdRef.current = null;
    }
    return () => clearInterval(notesTimerRef.current);
  }, [selectedLead?._id, fetchNotes]);

  // Sync notes changes into editForm without resetting the whole form
  useEffect(() => {
    if (!selectedLead) return;
    setEditForm(prev => prev ? { ...prev, notes: selectedLead.notes } : { ...selectedLead });
  }, [selectedLead?.notes]);

  // Full reset only when a different lead is selected
  useEffect(() => {
    if (selectedLead) {
      setEditForm({ ...selectedLead });
      setSaveSuccess(false);
      setNewNote('');
      setNoteSuccess(false);
      setActiveTab('edit');
      setHistory([]);
    }
  }, [selectedLead?._id]);

  useEffect(() => {
    document.body.style.overflow = (selectedLead || showAddLead) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedLead, showAddLead]);

  // Live-refresh the pipeline history while the History tab is open.
  useEffect(() => {
    if (!selectedLead || activeTab !== 'history') return;
    fetchHistory(selectedLead._id);
    const t = setInterval(() => fetchHistory(selectedLead._id), 4000);
    return () => clearInterval(t);
  }, [selectedLead?._id, activeTab, fetchHistory]);

  const openDetail  = lead => setSelectedLead(lead);
  const closeDetail = () => { setSelectedLead(null); setEditForm(null); };

  const handleEditChange = (field, value) => setEditForm(prev => ({ ...prev, [field]: value }));

  // Save ALL schema fields
  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${editForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Contact
          name:                 editForm.name,
          email:                editForm.email,
          phone:                editForm.phone,
          whatsapp:             editForm.whatsapp,
          nationality:          editForm.nationality,
          // Service
          service:              editForm.service,
          freezone:             editForm.freezone,
          offshoreJurisdiction: editForm.offshoreJurisdiction,
          purpose:              editForm.purpose,
          // Business
          companyName:          editForm.companyName,
          businessCategory:     editForm.businessCategory,
          businessActivity:     editForm.businessActivity,
          businessType:         editForm.businessType,
          shareholders:         editForm.shareholders,
          officeSpace:          editForm.officeSpace,
          startLocation:        editForm.startLocation,
          investmentRange:      editForm.investmentRange,
          timeline:             editForm.timeline,
          expertCall:           editForm.expertCall,
          // Misc
          status:               editForm.status,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id === updated._id ? updated : l));
        setSelectedLead(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    setAddingNote(true);
    const noteEntry     = { text: newNote.trim(), createdAt: new Date().toISOString() };
    const existingNotes = Array.isArray(selectedLead.notes) ? selectedLead.notes : [];
    try {
      const res = await fetch(`/api/leads/${selectedLead._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: [noteEntry, ...existingNotes] }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id === updated._id ? updated : l));
        setSelectedLead(updated);
        setNewNote('');
        setNoteSuccess(true);
        setTimeout(() => setNoteSuccess(false), 2000);
      }
    } catch (e) { console.error(e); }
    finally { setAddingNote(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      if (selectedLead?._id === id) {
        setSelectedLead(p => ({ ...p, status }));
        setEditForm(p => p ? { ...p, status } : p);
      }
    } catch (e) { console.error(e); }
  };

  // ── Manually (re)assign a lead to an agent (admin only) ──
  const assignLead = async (leadId, agentId) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agentId || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id === updated._id ? updated : l));
        if (selectedLead?._id === updated._id) {
          setSelectedLead(updated);
          if (activeTab === 'history') fetchHistory(updated._id);
        }
      }
    } catch (e) { console.error(e); }
  };

  const toggleSelect = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll    = () => selected.size === filteredLeads.length ? setSelected(new Set()) : setSelected(new Set(filteredLeads.map(l => l._id)));

  const bulkStatusChange = async status => {
    await Promise.all([...selected].map(id => fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })));
    setLeads(prev => prev.map(l => selected.has(l._id) ? { ...l, status } : l));
    setSelected(new Set());
  };
  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} lead(s)? This cannot be undone.`)) return;
    await Promise.all([...selected].map(id => fetch(`/api/leads/${id}`, { method: 'DELETE' })));
    setLeads(prev => prev.filter(l => !selected.has(l._id)));
    setSelected(new Set());
  };

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ['Name','Email','Phone','WhatsApp','Nationality','Service','Free Zone','Offshore Jurisdiction','Purpose','Company','Business Category','Business Activity','Business Type','Shareholders','Office Space','Location','Investment','Timeline','Expert Call','Status','Date'];
    const rows = leads.map(l => [
      l.name, l.email, l.phone, l.whatsapp, l.nationality,
      l.service, l.freezone, l.offshoreJurisdiction, l.purpose,
      l.companyName, l.businessCategory, l.businessActivity, l.businessType,
      l.shareholders, l.officeSpace, l.startLocation, l.investmentRange,
      l.timeline, l.expertCall, l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ].map(v => `"${v || ''}"`).join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'dnk_leads.csv');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const scheduleCallback = () => {
    if (!callbackDate || !callbackTime || !callbackLead) return;
    const [year, month, day] = callbackDate.split('-').map(Number);
    const [hours, minutes]   = callbackTime.split(':').map(Number);
    const notesText = Array.isArray(callbackLead.notes) ? callbackLead.notes.map(n => n.text).join('; ') : '';
    ics.createEvent({
      start: [year, month, day, hours, minutes], duration: { hours: 1 },
      title: `Consultation Call with ${callbackLead.name} (DNK Consultancy)`,
      description: `Phone: ${callbackLead.phone}\nService: ${callbackLead.service || callbackLead.businessType || ''}\nNotes: ${notesText}`,
      location: 'Phone Call', status: 'CONFIRMED', busyStatus: 'BUSY',
      organizer: { name: 'DNK Consultancy', email: 'dnkrealestate2022@gmail.com' },
      attendees: [{ name: callbackLead.name, email: callbackLead.email, rsvp: true }],
    }, (err, value) => {
      if (err) return;
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.setAttribute('download', `callback_${callbackLead.name.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    setShowCallback(false);
  };

  // ── Filters
  const filteredLeads = leads.filter(l => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q
      || l.name?.toLowerCase().includes(q)
      || l.email?.toLowerCase().includes(q)
      || l.companyName?.toLowerCase().includes(q)
      || l.service?.toLowerCase().includes(q)
      || l.businessActivity?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    const matchBiz    = filterBizType === 'All Types' || l.businessType === filterBizType;
    const matchInvest = filterInvest === 'All Ranges' || l.investmentRange === filterInvest;
    return matchSearch && matchStatus && matchBiz && matchInvest;
  });

  const counts = leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});

  // ── Role-derived UI flags ──
  const isAdmin            = me?.role === 'admin';
  const canAdd             = !!me && (me.role === 'admin' || me.role === 'back_office');
  const showAssignedColumn = !!me && me.role !== 'agent';
  const agentLookup = {};
  agents.forEach(a => { agentLookup[String(a._id)] = a.name; });
  const cols = showAssignedColumn
    ? ['Client', 'Activity / Service', 'Contact', 'Status', 'Assigned', 'Actions']
    : ['Client', 'Activity / Service', 'Contact', 'Status', 'Actions'];
  const colSpan = cols.length + 1;

  const parsedNotes = selectedLead
    ? Array.isArray(selectedLead.notes)
      ? selectedLead.notes
      : selectedLead.notes ? [{ text: selectedLead.notes, createdAt: selectedLead.createdAt }] : []
    : [];

  const sc = editForm ? (STATUS_CFG[editForm.status] || STATUS_CFG.New) : STATUS_CFG.New;

  const FilterChip = ({ label, value, active, onClick, color }) => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: active ? (color ? `${color}22` : 'rgba(20,184,166,0.2)') : 'rgba(255,255,255,0.04)', color: active ? (color || '#2dd4bf') : '#475569', boxShadow: active ? `0 0 0 1px ${color || '#14b8a6'}55` : '0 0 0 1px rgba(255,255,255,0.07)' }}>
      {label}{value !== undefined ? ` (${value})` : ''}
    </button>
  );

  // ── Shared input style for EditField
  const GRID2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

  return (
    <>
      <Toast toasts={toasts} dismiss={dismissToast} />

      <div style={{ paddingBottom: selected.size > 0 ? 100 : 0 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0 }}>CRM / Leads</h1>
            <LiveDot />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => fetchLeads(true)} title="Refresh" style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={15} />
            </button>
            <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Download size={15} /> Export CSV
            </button>
            {canAdd && (
              <button onClick={() => setShowAddLead(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#0f766e,#0d9488)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(13,148,136,0.3)' }}>
                <UserPlus size={15} /> Add Lead
              </button>
            )}
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total"     value={leads.length}          icon={Users}      color="#60a5fa" bg="rgba(96,165,250,0.12)"   />
          <StatCard label="New"       value={counts.New || 0}        icon={Bell}       color="#60a5fa" bg="rgba(96,165,250,0.12)"   />
          <StatCard label="Contacted" value={counts.Contacted || 0}  icon={Phone}      color="#fbbf24" bg="rgba(251,191,36,0.12)"  />
          <StatCard label="Qualified" value={counts.Qualified || 0}  icon={Star}       color="#c084fc" bg="rgba(192,132,252,0.12)" />
          <StatCard label="Closed"    value={counts.Closed || 0}     icon={TrendingUp} color="#4ade80" bg="rgba(74,222,128,0.12)"  />
        </div>

        {/* FILTERS */}
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Filter size={14} style={{ color: '#475569', flexShrink: 0 }} />
          <FilterChip label="All" active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} />
          {Object.entries(STATUS_CFG).map(([s, cfg]) => (
            <FilterChip key={s} label={s} value={counts[s] || 0} active={filterStatus === s} onClick={() => setFilterStatus(s)} color={cfg.dot} />
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
          <select value={filterBizType} onChange={e => setFilterBizType(e.target.value)} style={{ background: filterBizType !== 'All Types' ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (filterBizType !== 'All Types' ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.08)'), borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: filterBizType !== 'All Types' ? '#2dd4bf' : '#64748b', cursor: 'pointer', outline: 'none' }}>
            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterInvest} onChange={e => setFilterInvest(e.target.value)} style={{ background: filterInvest !== 'All Ranges' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (filterInvest !== 'All Ranges' ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.08)'), borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: filterInvest !== 'All Ranges' ? '#fbbf24' : '#64748b', cursor: 'pointer', outline: 'none' }}>
            {INVESTMENT_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {(filterStatus !== 'All' || filterBizType !== 'All Types' || filterInvest !== 'All Ranges' || searchTerm) && (
            <button onClick={() => { setFilterStatus('All'); setFilterBizType('All Types'); setFilterInvest('All Ranges'); setSearchTerm(''); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              <X size={11} /> Clear
            </button>
          )}
          <div style={{ marginLeft: 'auto', color: '#334155', fontSize: 12 }}>{filteredLeads.length} of {leads.length} leads</div>
        </div>

        {/* TABLE */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input type="text" placeholder="Search name, email, company, service…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px 9px 38px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', width: 40 }}>
                    <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.size === filteredLeads.length && filteredLeads.length > 0 ? '#2dd4bf' : '#334155', display: 'flex' }}>
                      {selected.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                  </th>
                  {cols.map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={colSpan} style={{ padding: 48, textAlign: 'center', color: '#334155' }}>Loading leads…</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan={colSpan} style={{ padding: 48, textAlign: 'center', color: '#334155' }}>No leads match your filters.</td></tr>
                ) : filteredLeads.map(lead => {
                  const cfg  = STATUS_CFG[lead.status] || STATUS_CFG.New;
                  const isSel = selected.has(lead._id);
                  return (
                    <tr key={lead._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isSel ? 'rgba(20,184,166,0.06)' : selectedLead?._id === lead._id ? 'rgba(20,184,166,0.04)' : 'transparent', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(20,184,166,0.06)' : selectedLead?._id === lead._id ? 'rgba(20,184,166,0.04)' : 'transparent'; }}
                      onClick={() => openDetail(lead)}
                    >
                      <td style={{ padding: '14px 16px' }} onClick={e => { e.stopPropagation(); toggleSelect(lead._id); }}>
                        <div style={{ color: isSel ? '#2dd4bf' : '#334155', display: 'flex' }}>
                          {isSel ? <CheckSquare size={15} /> : <Square size={15} />}
                        </div>
                      </td>
                      {/* Client */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${cfg.dot}22`, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: cfg.color }}>
                            {lead.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{lead.name}</div>
                            <div style={{ color: '#475569', fontSize: 11 }}>{lead.nationality || new Date(lead.createdAt).toLocaleDateString()}</div>
                          </div>
                          <ChevronRight size={13} style={{ color: '#334155' }} />
                        </div>
                      </td>
                      {/* Activity / Service */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'white', fontSize: 13 }}>{lead.businessActivity || lead.companyName || '—'}</div>
                        <div style={{ color: '#2dd4bf', fontSize: 11, fontWeight: 700, marginTop: 2 }}>{lead.service || lead.businessType || ''}</div>
                      </td>
                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#cbd5e1', fontSize: 13 }}>{lead.email}</div>
                        <div style={{ color: '#cbd5e1', fontSize: 13 }}>{lead.phone}</div>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                        <select value={lead.status} onChange={e => updateStatus(lead._id, e.target.value)}
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: cfg.color, cursor: 'pointer', outline: 'none' }}>
                          {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* Assigned */}
                      {showAssignedColumn && (
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          {isAdmin ? (
                            <select
                              value={lead.assignedTo?._id || ''}
                              onChange={e => assignLead(lead._id, e.target.value)}
                              title="Assign / reassign agent"
                              style={{ background: lead.assignedTo ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (lead.assignedTo ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.1)'), borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, color: lead.assignedTo ? '#2dd4bf' : '#64748b', cursor: 'pointer', outline: 'none', maxWidth: 160 }}
                            >
                              <option value="">Unassigned</option>
                              {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                            </select>
                          ) : lead.assignedTo?.name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#60a5fa' }}>
                                {lead.assignedTo.name[0]?.toUpperCase()}
                              </span>
                              <span style={{ color: '#cbd5e1', fontSize: 13 }}>{lead.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#475569', fontSize: 13 }}>—</span>
                          )}
                        </td>
                      )}
                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setCallbackLead(lead); setShowCallback(true); }}
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.2)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Schedule Callback"><Calendar size={14} /></button>
                          <button onClick={() => openDetail(lead)}
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="View Details"><FileText size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected.size > 0 && <BulkBar count={selected.size} onStatusChange={bulkStatusChange} onDelete={bulkDelete} onClear={() => setSelected(new Set())} canDelete={isAdmin} />}
      <AddLeadDrawer open={showAddLead} onClose={() => setShowAddLead(false)} onCreated={lead => { setLeads(prev => [lead, ...prev]); pushToast(lead); }} />

      {/* Backdrop */}
      {selectedLead && <div onClick={closeDetail} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 40 }} />}

      {/* ─── DETAIL / EDIT DRAWER ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        width: selectedLead ? 860 : 0, maxWidth: '97vw', zIndex: 50,
        transform: selectedLead ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(160deg,#0b1e20 0%,#091819 60%,#060f10 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 60px rgba(0,0,0,0.8)', overflow: 'hidden',
      }}>
        {editForm && selectedLead && (
          <>
            {/* ── Drawer header */}
            <div style={{ flexShrink: 0, padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: `${sc.dot}22`, border: `1px solid ${sc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: sc.color }}>
                {selectedLead.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>{selectedLead.name}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {selectedLead.service && <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{selectedLead.service}</span>}
                  {selectedLead.companyName && <><span>·</span><span>{selectedLead.companyName}</span></>}
                  <span>· {new Date(selectedLead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: selectedLead.assignedTo?.name ? '#2dd4bf' : '#64748b', fontWeight: 600 }}>
                    · <UserCheck size={12} /> {selectedLead.assignedTo?.name || 'Unassigned'}
                  </span>
                  <LiveDot />
                </div>
              </div>
              {/* Status badge */}
              <div style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                {editForm.status}
              </div>
              <button onClick={() => { setCallbackLead(selectedLead); setShowCallback(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(20,184,166,0.12)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.25)', fontSize: 13, cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                <Phone size={13} /> Callback
              </button>
              <button onClick={closeDetail} style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={17} />
              </button>
            </div>

            {/* ── Tabs */}
            <div style={{ flexShrink: 0, display: 'flex', gap: 4, padding: '10px 28px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { id: 'edit',  label: 'Edit Lead',  icon: Save      },
                { id: 'notes', label: `Notes${parsedNotes.length ? ` (${parsedNotes.length})` : ''}`, icon: StickyNote },
                { id: 'history', label: 'History', icon: History },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: '10px 10px 0 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTab === id ? 'rgba(20,184,166,0.12)' : 'transparent', color: activeTab === id ? '#2dd4bf' : '#64748b', borderBottom: activeTab === id ? '2px solid #14b8a6' : '2px solid transparent', transition: 'all 0.18s' }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* ── Scrollable body */}
            <div style={{
              flex: 1,
              overflowY: 'scroll',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              padding: '24px 28px 40px',
            }}>

              {/* ══ EDIT TAB ══════════════════════════════════════════════ */}
              {activeTab === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* Status + timestamps row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                    <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</span>
                    <select value={editForm.status} onChange={e => handleEditChange('status', e.target.value)}
                      style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none', color: sc.color }}>
                      {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span style={{ marginLeft: 'auto', color: '#334155', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> Created {fmt(selectedLead.createdAt)}
                    </span>
                  </div>

                  {/* Assignment */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                    <UserCheck size={13} style={{ color: '#0d9488' }} />
                    <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Assigned Agent</span>
                    {isAdmin ? (
                      <select
                        value={selectedLead.assignedTo?._id || ''}
                        onChange={e => assignLead(selectedLead._id, e.target.value)}
                        style={{ marginLeft: 'auto', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#2dd4bf', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="">Unassigned</option>
                        {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    ) : (
                      <span style={{ marginLeft: 'auto', color: selectedLead.assignedTo?.name ? '#cbd5e1' : '#475569', fontSize: 13, fontWeight: 600 }}>
                        {selectedLead.assignedTo?.name || 'Unassigned'}
                      </span>
                    )}
                  </div>

                  {/* ── CONTACT */}
                  <div>
                    <SectionHeading label="Contact Details" icon={User} />
                    <div style={GRID2}>
                      <EditField label="Full Name"    fieldKey="name"        Icon={User}  value={editForm.name}        onChange={handleEditChange} />
                      <EditField label="Nationality"  fieldKey="nationality"  Icon={Flag}  value={editForm.nationality}  onChange={handleEditChange} />
                      <EditField label="Phone"        fieldKey="phone"       Icon={Phone} value={editForm.phone}       onChange={handleEditChange} type="tel" />
                      <EditField label="WhatsApp"     fieldKey="whatsapp"    Icon={Phone} value={editForm.whatsapp}    onChange={handleEditChange} type="tel" />
                      <EditField label="Email"        fieldKey="email"       Icon={Mail}  value={editForm.email}       onChange={handleEditChange} type="email" span />
                    </div>
                  </div>

                  {/* ── SERVICE */}
                  <div>
                    <SectionHeading label="Service & Source" icon={Target} />
                    <div style={GRID2}>
                      <EditField label="Service"                fieldKey="service"              Icon={Briefcase} value={editForm.service}              onChange={handleEditChange} />
                      <EditField label="Free Zone"              fieldKey="freezone"             Icon={Globe}     value={editForm.freezone}             onChange={handleEditChange} />
                      <EditField label="Offshore Jurisdiction"  fieldKey="offshoreJurisdiction" Icon={Globe}     value={editForm.offshoreJurisdiction} onChange={handleEditChange} />
                      <EditField label="Purpose"                fieldKey="purpose"              Icon={Target}    value={editForm.purpose}              onChange={handleEditChange} />
                    </div>
                  </div>

                  {/* ── BUSINESS */}
                  <div>
                    <SectionHeading label="Business Details" icon={Building2} />
                    <div style={GRID2}>
                      <EditField label="Company Name"       fieldKey="companyName"      Icon={Building2}  value={editForm.companyName}      onChange={handleEditChange} />
                      <EditField label="Business Category"  fieldKey="businessCategory" Icon={LayoutGrid}  value={editForm.businessCategory} onChange={handleEditChange} />
                      <EditField label="Business Activity"  fieldKey="businessActivity" Icon={Briefcase}  value={editForm.businessActivity} onChange={handleEditChange} />
                      <EditField label="Business Type"      fieldKey="businessType"     Icon={Tag}        value={editForm.businessType}     onChange={handleEditChange} />
                      <EditField label="Shareholders"       fieldKey="shareholders"     Icon={Users}      value={editForm.shareholders}     onChange={handleEditChange} />
                      <EditField label="Office Space"       fieldKey="officeSpace"      Icon={Home}       value={editForm.officeSpace}      onChange={handleEditChange} />
                      <EditField label="Preferred Location" fieldKey="startLocation"    Icon={MapPin}     value={editForm.startLocation}    onChange={handleEditChange} />
                      <EditField label="Investment Range"   fieldKey="investmentRange"  Icon={DollarSign} value={editForm.investmentRange}  onChange={handleEditChange} />
                      <EditField label="Timeline"           fieldKey="timeline"         Icon={Clock}      value={editForm.timeline}         onChange={handleEditChange} />
                      <EditField label="Expert Call"        fieldKey="expertCall"       Icon={Video}      value={editForm.expertCall}       onChange={handleEditChange} />
                    </div>
                  </div>

                  {/* ── SAVE BUTTON */}
                  <button onClick={handleSave} disabled={saving} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer', color: 'white',
                    background: saveSuccess
                      ? 'linear-gradient(135deg,#166534,#15803d)'
                      : 'linear-gradient(135deg,#0f766e,#0d9488)',
                    opacity: saving ? 0.75 : 1, transition: 'all 0.2s',
                    boxShadow: saveSuccess ? '0 4px 20px rgba(22,163,74,0.3)' : '0 4px 20px rgba(13,148,136,0.25)',
                  }}>
                    {saving
                      ? <><Spinner /> Saving…</>
                      : saveSuccess
                        ? <><CheckCircle2 size={16} /> Saved!</>
                        : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              )}

              {/* ══ NOTES TAB ═════════════════════════════════════════════ */}
              {activeTab === 'notes' && (
                <div>
                  {/* New note box */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>New Note</label>
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      rows={4}
                      placeholder="Write a note… (Ctrl+Enter to save)"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
                      onFocus={e => e.target.style.borderColor = '#14b8a6'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button onClick={handleAddNote} disabled={addingNote || !newNote.trim()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: 'none', cursor: (addingNote || !newNote.trim()) ? 'not-allowed' : 'pointer', background: noteSuccess ? 'linear-gradient(135deg,#166534,#15803d)' : newNote.trim() ? 'linear-gradient(135deg,#0f766e,#0d9488)' : 'rgba(255,255,255,0.05)', color: newNote.trim() || noteSuccess ? 'white' : '#475569' }}>
                        {addingNote ? <><Spinner size={13} /> Saving…</> : noteSuccess ? <><CheckCircle2 size={14} /> Added</> : <><Plus size={14} /> Add Note</>}
                      </button>
                    </div>
                  </div>

                  {/* Notes list */}
                  {parsedNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
                      <StickyNote size={32} style={{ color: '#1e3a3a', margin: '0 auto 12px' }} />
                      <div style={{ color: '#475569' }}>No notes yet.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {parsedNotes.map((note, i) => (
                        <div key={`${note.createdAt}-${i}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#14b8a6' : '#1e3a3a', border: `2px solid ${i === 0 ? '#2dd4bf' : '#334155'}`, boxShadow: i === 0 ? '0 0 8px rgba(20,184,166,0.5)' : 'none' }} />
                            {i < parsedNotes.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 20, background: 'rgba(255,255,255,0.06)', marginTop: 4 }} />}
                          </div>
                          <div style={{ flex: 1, background: i === 0 ? 'rgba(20,184,166,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 0 ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#14b8a6', background: 'rgba(20,184,166,0.12)', padding: '2px 8px', borderRadius: 20 }}>Latest</span>}
                              <span style={{ marginLeft: i === 0 ? 'auto' : 0, color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} /> {fmt(note.createdAt)}
                              </span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{note.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ HISTORY TAB ════════════════════════════════════════════ */}
              {activeTab === 'history' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>Complete activity log for this lead — newest first.</div>
                    <button onClick={() => fetchHistory(selectedLead._id)} title="Refresh" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>
                      <RefreshCw size={12} /> Refresh
                    </button>
                  </div>

                  {historyLoading && history.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: '#475569' }}>
                      <Spinner size={16} color="#14b8a6" /> Loading history…
                    </div>
                  ) : history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
                      <History size={32} style={{ color: '#1e3a3a', margin: '0 auto 12px' }} />
                      <div style={{ color: '#475569' }}>No activity recorded yet.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {history.map((h, i) => {
                        const action = h.action || h.type || h.event || 'activity';
                        const meta = ACTION_META[action] || { label: String(action).replace(/_/g, ' '), color: '#94a3b8', icon: Clock };
                        const Icon = meta.icon;
                        const who = h.actor?.name || h.actorName || h.user?.name || h.userName || 'System';
                        const when = h.createdAt || h.timestamp || h.date;
                        let detail = '';
                        if (action === 'status_changed') detail = `${h.from || '—'} → ${h.to || '—'}`;
                        else if (action === 'assigned')      detail = `to ${agentLookup[h.to] || h.toName || (h.meta && h.meta.toName) || 'an agent'}`;
                        else if (action === 'transferred')   detail = `${agentLookup[h.from] || (h.meta && h.meta.fromName) || 'agent'} → ${agentLookup[h.to] || h.toName || (h.meta && h.meta.toName) || 'agent'}`;
                        else if (action === 'unassigned')    detail = 'Owner removed';
                        else if (action === 'follow_up')     detail = h.to ? `Scheduled for ${new Date(h.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Scheduled';
                        else if (action === 'note_added')    detail = h.note || (h.meta && h.meta.text) || '';
                        else if (action === 'field_updated') detail = (h.meta && Array.isArray(h.meta.fields)) ? `Fields: ${h.meta.fields.join(', ')}` : (h.note || '');
                        else detail = h.note || h.message || h.description || '';
                        return (
                          <div key={h._id || i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${meta.color}1f`, border: `1px solid ${meta.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={14} style={{ color: meta.color }} />
                              </div>
                              {i < history.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 16, background: 'rgba(255,255,255,0.06)', marginTop: 4 }} />}
                            </div>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ color: meta.color, fontWeight: 700, fontSize: 13 }}>{meta.label}</span>
                                {detail && <span style={{ color: '#cbd5e1', fontSize: 13 }}>· {detail}</span>}
                                <span style={{ marginLeft: 'auto', color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={10} /> {fmt(when)}
                                </span>
                              </div>
                              <div style={{ color: '#64748b', fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <User size={10} /> by {who}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* CALLBACK MODAL */}
      {showCallback && callbackLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'linear-gradient(160deg,#0d2226,#091a1e)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>Schedule Callback</h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 24px' }}>
              Schedule a call with <span style={{ color: '#2dd4bf' }}>{callbackLead.name}</span>. Downloads a .ics calendar file.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Date</label>
                <input type="date" value={callbackDate} onChange={e => setCallbackDate(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Time</label>
                <input type="time" value={callbackTime} onChange={e => setCallbackTime(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCallback(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={scheduleCallback} style={{ flex: 2, padding: 12, borderRadius: 12, background: 'linear-gradient(135deg,#0f766e,#0d9488)', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Calendar size={15} /> Generate .ICS
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin         { to { transform: rotate(360deg); } }
        @keyframes livePulse    { 0%{box-shadow:0 0 0 0 rgba(74,222,128,0.6)}70%{box-shadow:0 0 0 6px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)} }
        @keyframes slideUp      { from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }

        /* Smooth custom scrollbar for the drawer */
        div[style*="overflowY: scroll"] {
          scrollbar-width: thin;
          scrollbar-color: rgba(20,184,166,0.25) transparent;
        }
        div[style*="overflowY: scroll"]::-webkit-scrollbar { width: 5px; }
        div[style*="overflowY: scroll"]::-webkit-scrollbar-track { background: transparent; }
        div[style*="overflowY: scroll"]::-webkit-scrollbar-thumb {
          background: rgba(20,184,166,0.25);
          border-radius: 99px;
        }
        div[style*="overflowY: scroll"]::-webkit-scrollbar-thumb:hover {
          background: rgba(20,184,166,0.5);
        }
      `}</style>
    </>
  );
}