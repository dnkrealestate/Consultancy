import dbConnect from './db';
import SeoMeta from '../models/SeoMeta';
import { SITE, SEO_PAGES } from './seoConfig';

// Re-export the constants so existing server imports of `{ SITE, SEO_PAGES }`
// from '@/lib/seo' keep working (sitemap, robots, structuredData, layouts).
export { SITE, SEO_PAGES };

// Read a page's SEO record (server-side only — uses mongoose). Returns null on
// any failure so metadata generation always falls back to the site defaults.
export async function getSeo(path) {
  try {
    await dbConnect();
    return await SeoMeta.findOne({ path }).lean();
  } catch {
    return null;
  }
}

// Turn an SEO record (or null) into a Next.js Metadata object.
export function buildMetadata(seo, path = '/') {
  const title = seo?.title || SITE.defaultTitle;
  const description = seo?.description || SITE.defaultDescription;
  const image = seo?.ogImage || SITE.defaultImage;
  const canonical = seo?.canonical || path;
  const index = !seo?.noindex;

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    keywords: seo?.keywords?.length ? seo.keywords : undefined,
    alternates: { canonical },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: canonical,
      siteName: SITE.name,
      images: [{ url: image, width: 1200, height: 630 }],
      locale: SITE.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [image],
    },
    robots: { index, follow: index },
  };
}