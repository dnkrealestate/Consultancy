// Client-safe SEO constants — NO database/mongoose imports.
// Safe to import from both client components and server code.

export const SITE = {
  name: 'DNK Consultancy',
  url: 'https://dnkconsultants.com/',
  defaultTitle: 'DNK Consultancy | Premium Business Setup in Dubai',
  defaultDescription:
    'Launch your business in Dubai with zero stress. Expert company formation, Freezone and Mainland licenses, UAE Golden Visa, and corporate tax services.',
  defaultImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200',
  locale: 'en_AE',
};

// The public pages the SEO editor manages.
export const SEO_PAGES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/visa-services', label: 'Visa Services' },
  { path: '/blogs', label: 'Blogs' },
  { path: '/contact', label: 'Contact' },
  { path: '/schedule', label: 'Schedule' },
];