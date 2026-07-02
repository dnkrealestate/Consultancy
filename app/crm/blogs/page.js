'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Search, X, Save, Eye, EyeOff,
  Loader2, CheckCircle, AlertCircle, Upload, RefreshCw,
} from 'lucide-react';

const CATEGORIES = ['Business Setup', 'Visas', 'Banking', 'Tax & Accounting', 'Other'];
const EMPTY_FORM = {
  title: '', slug: '', thumbnail: '', excerpt: '', content: '',
  category: 'Business Setup', status: 'draft', readTime: '',
  seoMetadata: { title: '', description: '', keywords: '' },
};

// ─── Toast Notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all ${type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d2626] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4">
        <p className="text-white text-lg font-semibold mb-6 text-center">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 transition font-bold">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-bold">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Blog Form Modal ───────────────────────────────────────────────────────────
function BlogFormModal({ blog, onClose, onSaved }) {
  const [form, setForm] = useState(blog ? { ...blog } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(blog?._id);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setSeo = (field, val) =>
    setForm(prev => ({ ...prev, seoMetadata: { ...prev.seoMetadata, [field]: val } }));

  // Auto-generate slug from title (new posts only)
  const handleTitle = (val) => {
    set('title', val);
    if (!isEdit) {
      set('slug', val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.thumbnail) {
      setError('Title, thumbnail, and content are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const url = isEdit ? `/api/blogs/${blog._id}` : '/api/blogs';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSaved(data.blog, isEdit ? 'update' : 'create');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-[#071e1e] border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header — always visible */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Article' : 'New Article'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={22} /></button>
        </div>

        {/* Scrollable form body */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(20,184,166,0.3) transparent' }}>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Title *</label>
            <input value={form.title} onChange={e => handleTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm"
              placeholder="Enter article title..." />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Slug</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm font-mono"
              placeholder="auto-generated-from-title" />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Thumbnail URL *</label>
            <div className="flex gap-3">
              <input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm"
                placeholder="https://..." />
              {form.thumbnail && (
                <img src={form.thumbnail} alt="preview" className="h-12 w-20 object-cover rounded-lg border border-white/10" onError={e => e.target.style.display = 'none'} />
              )}
            </div>
          </div>

          {/* Category + Status + Read Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Read Time</label>
              <input value={form.readTime} onChange={e => set('readTime', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm"
                placeholder="e.g. 5 min" />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Excerpt <span className="text-slate-600">(auto-generated if empty)</span></label>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm resize-none"
              placeholder="Short description shown on blog listing..." />
          </div>

          {/* Content (HTML) */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Content (HTML) *</label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={12}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition text-sm resize-y font-mono"
              placeholder="<p>Write your article in HTML...</p>" />
            <p className="text-slate-600 text-xs mt-1">Supports full HTML. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.</p>
          </div>

          {/* SEO */}
          <div className="border border-white/5 rounded-xl p-5 space-y-4 bg-white/2">
            <h3 className="text-slate-300 font-semibold text-sm">SEO Metadata</h3>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Meta Title</label>
              <input value={form.seoMetadata.title} onChange={e => setSeo('title', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white outline-none focus:border-teal-500 transition text-sm"
                placeholder="Leave blank to use article title" />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Meta Description</label>
              <textarea value={form.seoMetadata.description} onChange={e => setSeo('description', e.target.value)} rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white outline-none focus:border-teal-500 transition text-sm resize-none"
                placeholder="150-160 characters recommended" />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Keywords</label>
              <input value={form.seoMetadata.keywords} onChange={e => setSeo('keywords', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white outline-none focus:border-teal-500 transition text-sm"
                placeholder="dubai company formation, freezone, ..." />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between gap-4">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition font-semibold text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm flex items-center gap-2 transition disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalBlog, setModalBlog] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBlogs, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSaved = (blog, action) => {
    if (action === 'create') {
      setBlogs(prev => [blog, ...prev]);
      showToast('Article created successfully!');
    } else {
      setBlogs(prev => prev.map(b => b._id === blog._id ? blog : b));
      showToast('Article updated successfully!');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/blogs/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.filter(b => b._id !== deleteTarget._id));
      showToast('Article deleted.');
    } catch {
      showToast('Failed to delete article.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      setBlogs(prev => prev.map(b => b._id === blog._id ? data.blog : b));
      showToast(`Article ${newStatus === 'published' ? 'published' : 'moved to draft'}.`);
    } catch {
      showToast('Status update failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050f0f] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Management</h1>
          <p className="text-slate-400 text-sm mt-1">{blogs.length} article{blogs.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchBlogs} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setModalBlog(null)}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm">
            <Plus size={18} /> New Article
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="Search articles..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-teal-500 transition text-sm" />
        </div>
        <div className="flex gap-2">
          {['all', 'published', 'draft'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${statusFilter === s ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-teal-400" size={36} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02]">
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Views</th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(blog => (
                  <tr key={blog._id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {blog.thumbnail && (
                          <img src={blog.thumbnail} alt="" className="w-12 h-9 object-cover rounded-lg border border-white/10 flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                        )}
                        <div>
                          <p className="text-white font-semibold text-sm line-clamp-1 max-w-xs">{blog.title}</p>
                          <p className="text-slate-500 text-xs font-mono mt-0.5">{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(blog)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition hover:opacity-80 ${blog.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {blog.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">
                      {(blog.views || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/blogs/${blog.slug}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 transition" title="Preview">
                          <Eye size={16} />
                        </a>
                        <button onClick={() => setModalBlog(blog)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 transition" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteTarget(blog)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500">
                      No articles found. <button onClick={() => setModalBlog(null)} className="text-teal-400 hover:underline ml-1">Create your first one.</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalBlog !== undefined && (
        <BlogFormModal
          blog={modalBlog}
          onClose={() => setModalBlog(undefined)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}