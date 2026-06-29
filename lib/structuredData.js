import { SITE } from './seo';

// Organization schema — update phone, address and social profiles to match.
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.name,
  url: SITE.url,
  image: SITE.defaultImage,
  description: SITE.defaultDescription,
  areaServed: 'AE',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  // contactPoint: [{ '@type': 'ContactPoint', telephone: '+971-XX-XXXXXXX', contactType: 'customer service' }],
  // sameAs: ['https://www.instagram.com/...', 'https://www.linkedin.com/company/...'],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
};