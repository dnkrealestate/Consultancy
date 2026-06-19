'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ArrowRight, Clock, Loader2, Calendar } from 'lucide-react';
import Section from '../../components/ui/Section';

const CATEGORIES = ['All', 'Business Setup', 'Visas', 'Banking', 'Tax & Accounting'];
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600&auto=format&fit=crop';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/8 animate-pulse flex flex-col">
      <div className="h-56 bg-white/10" />
      <div className="p-6 flex flex-col gap-3">
        <div className="h-3 bg-white/10 rounded w-1/3" />
        <div className="h-5 bg-white/10 rounded w-full" />
        <div className="h-5 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/10 rounded w-full mt-2" />
        <div className="h-3 bg-white/10 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'published', page, limit: '9' });
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();
      setBlogs(data.blogs || []);
      setPagination(data.pagination || { totalPages: 1, page: 1 });
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchTerm]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBlogs(); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { fetchBlogs(); }, [activeCategory, page]);

  const handleCategory = (cat) => { setActiveCategory(cat); setPage(1); };

  return (
    <Section className="pt-32 pb-24 min-h-screen">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-white mb-6">
          Latest <span className="text-teal-400">Insights</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-10">
          Stay updated with the latest news on UAE company formation, tax laws, and business strategies.
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-10 justify-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group rounded-2xl overflow-hidden bg-white/5 border border-white/8 flex flex-col hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20"
              >
                {/* Thumbnail */}
                <div className="h-56 relative overflow-hidden">
                  <Image
                    src={blog.thumbnail || PLACEHOLDER_IMG}
                    alt={blog.title}
                    fill
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {blog.category}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(blog.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {blog.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {blog.readTime} read
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-teal-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  {blog.excerpt && (
                    <p className="text-slate-400 text-sm mb-6 flex-grow line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="flex items-center text-teal-400 font-bold text-sm mt-auto">
                    Read Full Article
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            ))}

            {blogs.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                No articles found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    p === page
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Section>
  );
}