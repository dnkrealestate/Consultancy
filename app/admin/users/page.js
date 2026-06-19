'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Pencil, Trash2, X, Save, Mail, User as UserIcon,
  Lock, Shield, CheckCircle2, AlertCircle, Search,
} from 'lucide-react';
import {
  MODULES, ROLES, ROLE_LABELS, ROLE_COLORS, DEFAULT_MODULES_BY_ROLE,
} from '../../../lib/permissions';

function Spinner({ size = 14, color = 'white' }) {
  return <span style={{ width: size, height: size, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: color, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

const EMPTY = { name: '', email: '', password: '', role: 'agent', modules: ['leads'], active: true };
const lbl = { display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 };
const inpBase = { width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px 10px 38px', color: 'white', fontSize: 13, outline: 'none' };

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none', zIndex: 1 }} />}
        {children}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.status === 403 || res.status === 401) { setDenied(true); return; }
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const d = await res.json();
          setMe(d.user);
          if (d.user.role !== 'admin') { setDenied(true); setLoading(false); return; }
        }
      } catch { /* ignore */ }
      fetchUsers();
    })();
  }, [fetchUsers]);

  const change = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const changeRole = (role) =>
    setForm((p) => ({ ...p, role, modules: role === 'admin' ? [] : DEFAULT_MODULES_BY_ROLE[role] || [] }));
  const toggleModule = (key) =>
    setForm((p) => ({ ...p, modules: p.modules.includes(key) ? p.modules.filter((m) => m !== key) : [...p.modules, key] }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, modules: u.modules || [], active: u.active !== false });
    setError(''); setShowModal(true);
  };

  const submit = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim() || (!editing && !form.password)) {
      setError('Name, email and password are required.');
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/users/${editing._id}` : '/api/users';
      const method = editing ? 'PUT' : 'POST';
      const payload = { name: form.name, email: form.email, role: form.role, modules: form.modules, active: form.active };
      if (form.password) payload.password = form.password;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      await fetchUsers();
      setShowModal(false);
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${confirmDelete._id}`, { method: 'DELETE' });
      if (res.ok) { await fetchUsers(); setConfirmDelete(null); }
      else { const d = await res.json(); alert(d.error || 'Delete failed'); }
    } catch { alert('Network error'); }
    finally { setDeleting(false); }
  };

  if (denied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
        <Shield size={40} style={{ color: '#475569' }} />
        <h2 style={{ color: 'white', margin: 0 }}>Admin access required</h2>
        <p style={{ color: '#475569' }}>User management is restricted to administrators.</p>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });
  const roleCount = (r) => users.filter((u) => u.role === r).length;
  const myId = me?.id || me?._id;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0 }}>Users &amp; Roles</h1>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>Create and manage agents, content writers and back-office staff.</p>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#0f766e,#0d9488)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(13,148,136,0.3)' }}>
          <UserPlus size={15} /> Add User
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['all', 'All', users.length], ...ROLES.map((r) => [r, ROLE_LABELS[r], roleCount(r)])].map(([key, label, count]) => (
          <button key={key} onClick={() => setFilterRole(key)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: filterRole === key ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.04)', color: filterRole === key ? '#2dd4bf' : '#475569', boxShadow: filterRole === key ? '0 0 0 1px #14b8a655' : '0 0 0 1px rgba(255,255,255,0.07)' }}>
            {label} ({count})
          </button>
        ))}
        <div style={{ position: 'relative', marginLeft: 'auto', maxWidth: 280, width: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px 9px 36px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['User', 'Role', 'Modules', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: 48, textAlign: 'center', color: '#334155' }}>Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 48, textAlign: 'center', color: '#334155' }}>No users found.</td></tr>
              ) : filtered.map((u) => {
                const rc = ROLE_COLORS[u.role] || '#94a3b8';
                const isMe = String(u._id) === String(myId);
                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${rc}22`, border: `1px solid ${rc}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: rc }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{u.name}{isMe && <span style={{ color: '#475569', fontWeight: 500 }}> (you)</span>}</div>
                          <div style={{ color: '#475569', fontSize: 12 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: `${rc}1a`, color: rc, border: `1px solid ${rc}40` }}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role === 'admin' ? (
                        <span style={{ color: '#2dd4bf', fontSize: 12, fontWeight: 600 }}>Full access</span>
                      ) : (u.modules || []).length === 0 ? (
                        <span style={{ color: '#334155', fontSize: 12 }}>None</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {(u.modules || []).map((m) => (
                            <span key={m} style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {MODULES.find((x) => x.key === m)?.label || m}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: u.active !== false ? '#4ade80' : '#64748b' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.active !== false ? '#4ade80' : '#475569' }} />
                        {u.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(u)} title="Edit" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(u)} disabled={isMe} title={isMe ? 'You cannot delete yourself' : 'Delete'} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isMe ? 'not-allowed' : 'pointer', opacity: isMe ? 0.4 : 1 }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg,#0d2226,#091a1e)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: 0 }}>{editing ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full Name" icon={UserIcon}><input value={form.name} onChange={(e) => change('name', e.target.value)} style={inpBase} /></Field>
              <Field label="Email" icon={Mail}><input type="email" value={form.email} onChange={(e) => change('email', e.target.value)} style={inpBase} /></Field>
              <Field label={editing ? 'New Password (leave blank to keep)' : 'Password'} icon={Lock}>
                <input type="password" value={form.password} onChange={(e) => change('password', e.target.value)} style={inpBase} />
              </Field>

              <div>
                <label style={lbl}>Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLES.map((r) => {
                    const rc = ROLE_COLORS[r];
                    const active = form.role === r;
                    return (
                      <button key={r} onClick={() => changeRole(r)} style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left', background: active ? `${rc}1a` : 'rgba(255,255,255,0.03)', color: active ? rc : '#94a3b8', border: `1px solid ${active ? `${rc}55` : 'rgba(255,255,255,0.08)'}` }}>
                        {ROLE_LABELS[r]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.role === 'admin' ? (
                <div style={{ padding: '12px 14px', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 10, color: '#2dd4bf', fontSize: 12 }}>
                  Admins have full access to every module and report.
                </div>
              ) : (
                <div>
                  <label style={lbl}>Module Access</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {MODULES.map((m) => {
                      const checked = form.modules.includes(m.key);
                      return (
                        <button key={m.key} onClick={() => toggleModule(m.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', background: checked ? 'rgba(20,184,166,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${checked ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
                          <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: checked ? '#14b8a6' : 'transparent', border: `1px solid ${checked ? '#14b8a6' : 'rgba(255,255,255,0.2)'}` }}>
                            {checked && <CheckCircle2 size={12} color="white" />}
                          </span>
                          <span>
                            <span style={{ color: checked ? '#2dd4bf' : '#cbd5e1', fontSize: 13, fontWeight: 600, display: 'block' }}>{m.label}</span>
                            <span style={{ color: '#475569', fontSize: 11 }}>{m.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#cbd5e1', fontSize: 13 }}>
                <input type="checkbox" checked={form.active} onChange={(e) => change('active', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#14b8a6' }} />
                Account active (can log in)
              </label>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0f766e,#0d9488)', color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Spinner /> Saving…</> : <><Save size={15} /> {editing ? 'Save Changes' : 'Create User'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg,#0d2226,#091a1e)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Trash2 size={22} style={{ color: '#f87171' }} />
            </div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>Delete {confirmDelete.name}?</h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 22px', lineHeight: 1.6 }}>
              This permanently removes the user. Any leads they own will be unassigned and they will be removed from lead rotation.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={doDelete} disabled={deleting} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#b91c1c,#dc2626)', color: 'white', fontSize: 14, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {deleting ? <><Spinner /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}