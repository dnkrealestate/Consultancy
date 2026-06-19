'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, PhoneCall } from 'lucide-react';
import Image from 'next/image';
import logo from '@/public/logo.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Visa', path: '/services/visa-services' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`border-none outline-none fixed top-0 w-full z-50 transition-all duration-300  ${
        scrolled ? 'py-3 glass' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center border-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="DNK Consultancy Logo" width={70} height={70} className="h-auto object-contain" />
          {/* <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            DNK<span className="text-teal-400">Consultancy</span>
          </span> */}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.path}
                  className="text-sm font-medium text-slate-200 hover:text-teal-400 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95">
            <PhoneCall size={16} className="text-teal-400" />
            <span>Free Consultation</span>
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass border-t border-white/10 p-6 md:hidden flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="text-lg font-medium text-slate-200 hover:text-teal-400 border-b border-white/5 pb-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button className="mt-4 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-500/25">
              <PhoneCall size={18} />
              Free Consultation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
