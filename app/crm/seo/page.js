'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Pencil, X, Save, CheckCircle2, AlertCircle, Shield,
  ExternalLink, Search, RotateCcw, Code,
} from 'lucide-react';
import { SEO_PAGES, SITE } from '../../../lib/seoConfig';
import { canAccessModule } from '../../../lib/permissions';

function Spinner({ size = 14, color = 'white' }) {
  return <span style={{ width: size, height: size, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: color, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

const BLANK = { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '', noindex: false, jsonLd: '' };
const lbl = { display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 };
const inp = { width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit' };

function Meter({ value, ideal, max }) {
  const len = (value || '').length;
  const color = len === 0 ? '#475569' : len <= ideal ? '#4ade80' : len <= max ? '#fbbf24' : '#f87171';
  return <span style={{ fontSize: 11, color, fontWeight: 600 }}>{len}/{ideal}</span>;
}

export default function AdminSeo() {
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null); // { path, label }
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newPath, setNewPath] = useState('');

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/seo');
      if (res.status === 401 || res.status === 403) { setDenied(true); return; }
      if (res.ok) setRecords(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        if (r.ok) {
          const d = await r.json();
          setMe(d.user);
          if (!(d.user.role === 'admin' || canAccessModule(d.user, 'seo'))) {
            setDenied(true); setLoading(false); return;
          }
        }
      } catch { /* ignore */ }
      fetchRecords();
    })();
  }, [fetchRecords]);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setServices(data); })
      .catch(() => {});
  }, []);

  const byPath = {};
  records.forEach((r) => { byPath[r.path] = r; });

  const servicePages = services.map((s) => ({ path: `/services/${s.slug}`, label: s.title, group: 'service' }));
  const servicePaths = new Set(servicePages.map((s) => s.path));

  // Known pages + service pages + any remaining custom paths that have a record.
  const customPaths = records.map((r) => r.path).filter((p) => !SEO_PAGES.some((x) => x.path === p) && !servicePaths.has(p));
  const pages = [...SEO_PAGES, ...servicePages, ...customPaths.map((p) => ({ path: p, label: p }))];

  const change = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (page) => {
    const rec = byPath[page.path];
    setForm(rec
      ? { title: rec.title || '', description: rec.description || '', keywords: (rec.keywords || []).join(', '), ogTitle: rec.ogTitle || '', ogDescription: rec.ogDescription || '', ogImage: rec.ogImage || '', canonical: rec.canonical || '', noindex: !!rec.noindex, jsonLd: rec.jsonLd || '' }
      : BLANK);
    setError(''); setEditing(page);
  };

  const save = async () => {
    setError('');
    if (form.jsonLd && form.jsonLd.trim()) {
      try { JSON.parse(form.jsonLd); } catch { setError('Structured data is not valid JSON.'); return; }
    }
    setSaving(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: editing.path, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed'); return; }
      await fetchRecords();
      setSavedFlash(true);
      setTimeout(() => { setSavedFlash(false); setEditing(null); }, 900);
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const resetPage = async (page) => {
    const rec = byPath[page.path];
    if (!rec) return;
    if (!window.confirm(`Reset SEO for ${page.label} to site defaults?`)) return;
    try {
      const res = await fetch(`/api/seo/${rec._id}`, { method: 'DELETE' });
      if (res.ok) fetchRecords();
    } catch (e) { console.error(e); }
  };

  const addCustom = () => {
    let p = newPath.trim();
    if (!p) return;
    if (!p.startsWith('/')) p = '/' + p;
    setNewPath('');
    openEdit({ path: p, label: p });
  };

  if (denied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
        <Shield size={40} style={{ color: '#475569' }} />
        <h2 style={{ color: 'white', margin: 0 }}>No access to SEO</h2>
        <p style={{ color: '#475569' }}>Ask an admin to grant you the SEO module.</p>
      </div>
    );
  }

  const filtered = pages.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q);
  });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe size={26} style={{ color: '#2dd4bf' }} /> SEO Manager
        </h1>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>Edit the title, description, keywords and social preview for each page. Changes go live on save.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 320 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages…" style={{ ...inp, paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <input value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="/custom-path" onKeyDown={(e) => e.key === 'Enter' && addCustom()} style={{ ...inp, width: 180 }} />
          <button onClick={addCustom} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)', color: '#2dd4bf', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add page</button>
        </div>
      </div>

      {!loading && !search && servicePages.length > 0 && (
        <div style={{ margin: '8px 0 4px', color: '#2dd4bf', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Main Pages
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 12 }}>
        {loading ? (
          <div style={{ color: '#334155', padding: 24 }}>Loading…</div>
        ) : filtered.map((page, i) => {
          const rec = byPath[page.path];
          const configured = !!rec && !!(rec.title || rec.description);
          const prevPage = filtered[i - 1];
          const isFirstService = page.group === 'service' && (!prevPage || prevPage.group !== 'service');
          return (
            <React.Fragment key={page.path}>
              {isFirstService && !search && (
                <div style={{ gridColumn: '1 / -1', margin: '8px 0 4px', color: '#2dd4bf', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Service Pages
                </div>
              )}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{page.label}</span>
                <span style={{ color: '#475569', fontSize: 12 }}>{page.path}</span>
                <a href={`${SITE.url}${page.path === '/' ? '' : page.path}`} target="_blank" rel="noopener noreferrer" title="View live" style={{ marginLeft: 'auto', color: '#475569', display: 'flex' }}>
                  <ExternalLink size={14} />
                </a>
              </div>

              <div style={{ minHeight: 52 }}>
                <div style={{ color: configured ? '#cbd5e1' : '#475569', fontSize: 13, fontWeight: 600, marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rec?.title || 'Using site default title'}
                </div>
                <div style={{ color: '#475569', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rec?.description || 'Using site default description'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: rec?.noindex ? '#f87171' : '#4ade80' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: rec?.noindex ? '#f87171' : '#4ade80' }} />
                  {rec?.noindex ? 'Noindex' : 'Indexed'}
                </span>
                {configured && <span style={{ fontSize: 11, color: '#2dd4bf', fontWeight: 700 }}>· Customised</span>}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {rec && (
                    <button onClick={() => resetPage(page)} title="Reset to defaults" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button onClick={() => openEdit(page)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#2dd4bf', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <Pencil size={13} /> Edit
                  </button>
                </div>
              </div>
            </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg,#0d2226,#091a1e)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: '#0d2226' }}>
              <div>
                <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: 0 }}>{editing.label}</h3>
                <div style={{ color: '#475569', fontSize: 12 }}>{editing.path}</div>
              </div>
              <button onClick={() => setEditing(null)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ ...lbl, margin: 0 }}>Page Title</label>
                  <Meter value={form.title} ideal={60} max={70} />
                </div>
                <input value={form.title} onChange={(e) => change('title', e.target.value)} placeholder={SITE.defaultTitle} style={inp} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ ...lbl, margin: 0 }}>Meta Description</label>
                  <Meter value={form.description} ideal={160} max={180} />
                </div>
                <textarea value={form.description} onChange={(e) => change('description', e.target.value)} rows={3} placeholder={SITE.defaultDescription} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
              </div>

              <div>
                <label style={lbl}>Keywords <span style={{ textTransform: 'none', fontWeight: 400 }}>(comma separated)</span></label>
                <input value={form.keywords} onChange={(e) => change('keywords', e.target.value)} placeholder="business setup dubai, freezone license, golden visa" style={inp} />
              </div>

              {/* Google preview */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
                <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Search preview</div>
                <div style={{ color: '#9aa8ff', fontSize: 16, lineHeight: 1.3 }}>{form.title || SITE.defaultTitle}</div>
                <div style={{ color: '#4ade80', fontSize: 12, margin: '2px 0 4px' }}>{SITE.url}{editing.path === '/' ? '' : editing.path}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.45 }}>{form.description || SITE.defaultDescription}</div>
              </div>

              <details>
                <summary style={{ color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Social & advanced</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                  <div><label style={lbl}>Social Image URL (OG)</label><input value={form.ogImage} onChange={(e) => change('ogImage', e.target.value)} placeholder="https://…/cover.jpg (1200×630)" style={inp} /></div>
                  <div><label style={lbl}>OG Title (optional)</label><input value={form.ogTitle} onChange={(e) => change('ogTitle', e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>OG Description (optional)</label><input value={form.ogDescription} onChange={(e) => change('ogDescription', e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Canonical URL (optional)</label><input value={form.canonical} onChange={(e) => change('canonical', e.target.value)} placeholder={`${SITE.url}${editing.path === '/' ? '' : editing.path}`} style={inp} /></div>
                  <div>
                    <label style={lbl}><Code size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Structured data JSON-LD (optional)</label>
                    <textarea value={form.jsonLd} onChange={(e) => change('jsonLd', e.target.value)} rows={4} placeholder='{ "@context": "https://schema.org", "@type": "FAQPage", ... }' style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
                  </div>
                </div>
              </details>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#cbd5e1', fontSize: 13 }}>
                <input type="checkbox" checked={form.noindex} onChange={(e) => change('noindex', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#f87171' }} />
                Hide this page from search engines (noindex)
              </label>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'sticky', bottom: 0, background: '#0d2226' }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: savedFlash ? 'linear-gradient(135deg,#166534,#15803d)' : 'linear-gradient(135deg,#0f766e,#0d9488)', color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Spinner /> Saving…</> : savedFlash ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save SEO</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}