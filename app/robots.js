export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/crm/', '/api/'],
    },
    sitemap: 'https://www.dnkconsultancy.com/sitemap.xml',
  };
}
