import Link from 'next/link';
import BlogRowList from './BlogRowList';

export default function BlogSection() {
  return (
    <div className="w-full bg-[#021414]">
      <div className="container max-w-[1240px] mx-auto px-4 py-12 md:py-20">

        {/* Header row */}
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Latest <span className="text-teal-400">Insights</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">
              Keep up with the latest UAE company formation insights from our team of experts.
            </p>
          </div>
          <Link
            href="/blogs"
            className="hidden md:flex items-center gap-2 text-teal-400 font-bold text-sm border border-teal-500/30 px-5 py-2.5 rounded-xl hover:bg-teal-500/10 transition-all"
          >
            View All Articles
          </Link>
        </div>

        {/* Blog cards */}
        <BlogRowList />

        {/* Mobile "View All" */}
        <div className="flex md:hidden justify-center mt-8">
          <Link
            href="/blogs"
            className="text-teal-400 font-bold text-sm border border-teal-500/30 px-6 py-2.5 rounded-xl hover:bg-teal-500/10 transition-all"
          >
            View All Articles
          </Link>
        </div>

      </div>
    </div>
  );
}