import { Inter } from 'next/font/google';
import './globals.css';
import LenisScroll from '../components/LenisScroll';
import ClientWrapper from '../components/ClientWrapper.js'; // Import the new wrapper
import AIChatbot from '../components/AIChatbot';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'DNK Consultancy | Premium Business Setup in Dubai',
  description: 'Launch your business in Dubai with zero stress. Expert company formation, Freezone and Mainland licenses, UAE Golden Visa, and corporate tax services.',
  openGraph: {
    title: 'DNK Consultancy | Premium Business Setup in Dubai',
    description: 'Expert company formation, Freezone and Mainland licenses, UAE Golden Visa, and corporate tax services.',
    url: 'https://www.dnkconsultancy.com',
    siteName: 'DNK Consultancy',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNK Consultancy | Premium Business Setup in Dubai',
    description: 'Launch your business in Dubai with zero stress.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-slate-100 bg-[#021a1a] min-h-screen flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
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