import { cache } from "react";
import dbConnect from "@/lib/db";
import Service from "@/models/Service";
import { getSeo, buildMetadata } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dnkconsultants.com";
const SITE_NAME = "DNK Consultancy";
const DEFAULT_OG = `${SITE_URL}/og-default.jpg`;

function getParam(params) {
  return params.slug ?? params.id ?? Object.values(params)[0];
}

const getService = cache(async (key) => {
  try {
    await dbConnect();
    let doc = await Service.findOne({ slug: key }).lean();
    if (!doc && /^[0-9a-f]{24}$/i.test(key)) {
      doc = await Service.findById(key).lean();
    }
    return doc;
  } catch {
    return null;
  }
});

// Wrap getSeo with cache() so generateMetadata and ServiceLayout share one DB hit.
const getCachedSeo = cache((path) => getSeo(path));

const stripHtml = (s = "") =>
  String(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function derive(svc) {
  const title = svc.metaTitle || svc.title || svc.name || "Service";
  const desc = (
    svc.metaDescription ||
    svc.shortDescription ||
    svc.description ||
    stripHtml(svc.content || svc.details) ||
    `Expert ${title} in Dubai from ${SITE_NAME}.`
  ).slice(0, 160);
  const image = svc.ogImage || svc.coverImage || svc.image || svc.icon || DEFAULT_OG;
  const url = `${SITE_URL}/services/${svc.slug || svc._id}`;
  const serviceType = svc.serviceType || svc.category || title;
  const tags = Array.isArray(svc.tags)
    ? svc.tags
    : Array.isArray(svc.keywords)
    ? svc.keywords
    : [];
  return { title, desc, image, url, serviceType, tags };
}

export async function generateMetadata({ params }) {
  const p = await params;
  const slug = getParam(p);
  const path = `/services/${slug}`;

  // Admin-managed SEO takes priority over auto-derived metadata.
  const seo = await getCachedSeo(path);
  if (seo) return buildMetadata(seo, path);

  // Fall back: derive metadata from the Service document.
  const svc = await getService(slug);
  if (!svc) {
    return {
      title: `Services | ${SITE_NAME}`,
      description: `Business setup, licensing, and consultancy services in Dubai from ${SITE_NAME}.`,
      robots: { index: false, follow: false },
    };
  }

  const { title, desc, image, url, tags } = derive(svc);
  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} | ${SITE_NAME}`,
    description: desc,
    keywords: tags.length ? tags : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description: desc,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
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

export default async function ServiceLayout({ children, params }) {
  const p = await params;
  const slug = getParam(p);
  const path = `/services/${slug}`;

  // Both calls are cache-deduped within the same request.
  const [svc, seo] = await Promise.all([getService(slug), getCachedSeo(path)]);

  let jsonLd = null;

  // Admin-provided JSON-LD (from SEO manager) takes priority.
  if (seo?.jsonLd) {
    try {
      jsonLd = JSON.parse(seo.jsonLd);
    } catch {
      // Invalid JSON in DB — fall through to auto-generated schema.
    }
  }

  // Auto-generate Service schema if no admin override.
  if (!jsonLd && svc) {
    const { title, desc, image, url, serviceType } = derive(svc);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: title,
      description: desc,
      image: [image],
      serviceType,
      url,
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      areaServed: { "@type": "Place", name: "Dubai, United Arab Emirates" },
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
