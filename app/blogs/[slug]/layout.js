// app/blogs/[slug]/layout.js
//
// Adds dynamic SEO (per-post <title>, meta description, canonical, OpenGraph,
// Twitter cards) + Article JSON-LD to the blog detail page WITHOUT touching
// your page.js. This is a Server Component, so generateMetadata works here even
// if your page.js is 'use client' (Framer Motion).
//
// SET THREE THINGS:
//   1. Make the two imports below match app/api/blogs/[id]/route.js exactly
//      (same dbConnect path, same Blog model path).
//   2. Add NEXT_PUBLIC_SITE_URL to your .env (used for canonical + OG/Twitter).
//   3. If your schema uses different field names, edit derive() below.

import { cache } from "react";
import dbConnect from "@/lib/db"; // <-- match app/api/blogs/[id]/route.js
import Blog from "@/models/Blog";        // <-- match app/api/blogs/[id]/route.js

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dnkconsultants.com";
const SITE_NAME = "DNK Consultancy";
const DEFAULT_OG = `${SITE_URL}/og-default.jpg`;

// Route is /blogs/[slug] -> look up by the `slug` field. Falls back to _id only
// if the URL value looks like a Mongo ObjectId (so findById never throws on a
// real slug). One DB hit, shared by generateMetadata() and the JSON-LD below.
const getBlog = cache(async (slug) => {
  try {
    await dbConnect();
    let blog = await Blog.findOne({ slug }).lean();
    if (!blog && /^[0-9a-f]{24}$/i.test(slug)) {
      blog = await Blog.findById(slug).lean();
    }
    return blog;
  } catch {
    return null;
  }
});

const stripHtml = (s = "") =>
  String(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Map your schema field names here if they differ.
function derive(blog) {
  const title = blog.metaTitle || blog.title || "Blog";
  const desc = (
    blog.metaDescription ||
    blog.excerpt ||
    blog.description ||
    stripHtml(blog.content) ||
    `Insights from ${SITE_NAME}.`
  ).slice(0, 160);
  const image = blog.ogImage || blog.coverImage || blog.image || blog.thumbnail || DEFAULT_OG;
  const url = `${SITE_URL}/blogs/${blog.slug || blog._id}`;
  const published = blog.publishedAt || blog.createdAt || null;
  const modified = blog.updatedAt || published;
  const tags = Array.isArray(blog.tags)
    ? blog.tags
    : Array.isArray(blog.keywords)
    ? blog.keywords
    : [];
  const author =
    blog?.author?.name || (typeof blog.author === "string" ? blog.author : SITE_NAME);
  return { title, desc, image, url, published, modified, tags, author };
}

export async function generateMetadata({ params }) {
  const { slug } = await params; // Next.js 15: params is a Promise — must await
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: `Blog | ${SITE_NAME}`,
      description: `Insights and updates from ${SITE_NAME}.`,
      robots: { index: false, follow: false },
    };
  }

  const { title, desc, image, url, published, modified, tags, author } = derive(blog);

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} | ${SITE_NAME}`,
    description: desc,
    keywords: tags.length ? tags : undefined,
    authors: [{ name: author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title,
      description: desc,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: published ? new Date(published).toISOString() : undefined,
      modifiedTime: modified ? new Date(modified).toISOString() : undefined,
      authors: [author],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogLayout({ children, params }) {
  const { slug } = await params;
  const blog = await getBlog(slug); // deduped — same query as generateMetadata

  let jsonLd = null;
  if (blog) {
    const { title, desc, image, url, published, modified, author } = derive(blog);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: desc,
      image: [image],
      datePublished: published ? new Date(published).toISOString() : undefined,
      dateModified: modified ? new Date(modified).toISOString() : undefined,
      author:
        author === SITE_NAME
          ? { "@type": "Organization", name: author }
          : { "@type": "Person", name: author },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}