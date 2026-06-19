'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import ProfessionalImg from '@/public/assets/images/ProfessionalImg.webp';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 animate-pulse flex flex-col">
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

export default function BlogRowList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs?status=published&limit=3')
      .then((r) => r.json())
      .then((data) => setBlogs(data.blogs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <p className="text-center text-slate-400 py-16 mt-10">No articles published yet.</p>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-10">
      {blogs.map((blog) => (
        <Link
          key={blog._id}
          href={`/blogs/${blog.slug}`}
          className="group rounded-2xl overflow-hidden bg-white/5 border border-white/8 flex flex-col hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20"
        >
          {/* Thumbnail */}
          <div className="h-56 relative overflow-hidden">
            <Image
              src={blog.thumbnail || ProfessionalImg}
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
    </div>
  );
}