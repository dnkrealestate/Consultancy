import { Inter } from 'next/font/google';
import './globals.css';
import LenisScroll from '../components/LenisScroll';
import ClientWrapper from '../components/ClientWrapper.js'; // Import the new wrapper
import AIChatbot from '../components/AIChatbot';
import JsonLd from '../components/JsonLd';
import { organizationSchema, websiteSchema } from '../lib/structuredData';
import { getSeo, buildMetadata } from '../lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// Home-page ("/") + site-wide default metadata, driven by the SEO Manager (database).
// If no SEO record exists for "/", it falls back to the defaults in lib/seo-config.js.
export async function generateMetadata() {
  return buildMetadata(await getSeo('/'), '/');
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-slate-100 bg-[#021a1a] min-h-screen flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <LenisScroll>
          <ClientWrapper>
            {children}
          </ClientWrapper>
          <AIChatbot />
        </LenisScroll>
      </body>
    </html>
  );
}