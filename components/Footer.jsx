import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import logo from '@/public/logo.png';
import Image from 'next/image';

// ─── Footer navigation data ─────────────────────────────────────────────────
const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Our Services', href: '/services' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
];

const licenseLinks = [
  { label: 'Mainland License', href: '/licenses/mainland' },
  { label: 'Free Zone License', href: '/licenses/freezone' },
  { label: 'Offshore License', href: '/licenses/offshore' },
];

const serviceLinks = [
  { label: 'Company Formation', href: '/services/company-formation' },
  { label: 'Visa Services', href: '/services/visa-services' },
  { label: 'Corporate Tax & VAT', href: '/services/corporate-tax-vat' },
  { label: 'PRO Services', href: '/services/pro-services' },
  { label: 'Bank Account Opening', href: '/services/bank-account-opening' },
  { label: 'Legal Services', href: '/services/legal-services' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#021a1a] pt-20 pb-10 border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-teal-500/20 blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="font-bold text-2xl text-white">
                DNK<span className="text-teal-400">Consultancy</span>
              </span>
            </Link> */}
            <Link href="/" className="flex items-center gap-2">
              <Image src={logo} alt="DNK Consultancy Logo" width={100} height={100} className="h-auto object-contain" />
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Your trusted partner for business setup, company formation, and visa services in Dubai, UAE.
            </p>
            {/* Social */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-teal-500/20 transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-teal-500/20 transition-colors">
                <FaYoutube />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-teal-500/20 transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-teal-500/20 transition-colors">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors">
                    {link.label}
                    <ArrowUpRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

           {/* Services Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors">
                    {link.label}
                    <ArrowUpRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Licenses */}
          <div>
            <h4 className="text-white font-bold mb-6">Business Licenses</h4>
            <ul className="space-y-3 text-sm">
              {licenseLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors">
                    {link.label}
                    <ArrowUpRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-bold mb-6 mt-10">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-2">
                <MapPin size={18} className="text-teal-400 shrink-0" />
                Suite No: 303, Sama Building,
                Al Barsha 1 - Al Barsha,
                Dubai, United Arab Emirates.
              </li>
              <li className="flex gap-2">
                <Phone size={18} className="text-teal-400 shrink-0" />
                <a href="tel:+971555769195" className="text-slate-400 hover:text-teal-400 transition-colors">
                  +971 55 576 9195
                </a>
              </li>
              <li className="flex gap-2">
                <Mail size={18} className="text-teal-400 shrink-0" />
                <a href="mailto:info@dnkconsultants.com" className="text-slate-400 hover:text-teal-400 transition-colors">
                  info@dnkconsultants.com
                </a>
              </li>
            </ul>
          </div>

         
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} DNK Consultancy. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}