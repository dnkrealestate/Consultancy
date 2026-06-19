'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin as LinkedinIcon,
  Link as LinkIcon,
  Loader2,
  Eye
} from 'lucide-react';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import Section from '../../../components/ui/Section';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch blog + trigger view tracking
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/blogs/${slug}?track=true`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setBlog(data.blog);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(total ? document.documentElement.scrollTop / total : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-400" size={48} />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-slate-400">This article may have been removed or the URL is incorrect.</p>
      </div>
    );
  }

  // JSON-LD
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.seoMetadata?.title || blog.title,
    description: blog.seoMetadata?.description || blog.excerpt,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: [{ '@type': 'Organization', name: 'DNK Consultancy' }],
    image: blog.thumbnail,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-teal-500 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <Section className="pt-32 pb-16 bg-[#021a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-teal-500/20 text-teal-400 font-bold px-4 py-1 rounded-full mb-6 text-sm">
            {blog.category}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-white leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-slate-400 font-medium flex-wrap">
            <span>
              {new Date(blog.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {blog.readTime && (
              <span className="flex items-center gap-2">
                <Clock size={16} /> {blog.readTime} read
              </span>
            )}
            <span className="flex items-center gap-2 text-teal-400">
              <Eye size={16} /> {blog.views.toLocaleString()} views
            </span>
          </div>
        </div>
      </Section>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/50">
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <Section darker className="py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_250px] gap-12">
          {/* Main Content */}
          <article
            className="prose prose-invert prose-lg prose-teal max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="sticky top-32 glass p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Share2 size={18} /> Share Article
              </h3>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-colors text-slate-400"
                >
                  <FaLinkedinIn size={18} />
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-colors text-slate-400"
                >
                  <FaTwitter size={18} />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-colors text-slate-400"
                >
                  <FaFacebookF size={18} />
                </a>

                <button
                  onClick={copyLink}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-colors text-slate-400 relative"
                >
                  <FiLink size={18} />
                </button>
              </div>

              {/* Views */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <Eye size={14} className="text-teal-400" />
                  <span className="text-white font-bold">{blog.views.toLocaleString()}</span> unique views
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}