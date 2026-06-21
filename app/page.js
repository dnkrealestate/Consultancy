'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Script from 'next/script';
import { ArrowRight, CheckCircle2, TrendingUp, Building2, Landmark, Users, Globe, Briefcase, FileCheck, PhoneCall, Star, ChevronLeft, ChevronRight, ChevronDown, MessageCircle, ShoppingCart, Scale, Copyright, ShieldCheck  } from 'lucide-react';
import ConsultationPopup from '../components/ConsultationPopup';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import Section from '../components/ui/Section';
import restaurentBase from '@/public/assets/banner/restaurant-main.webp';
import restaurentChar from '@/public/assets/banner/restaurant-char.webp';
import factoryBase from '@/public/assets/banner/factory-main.webp';
import factoryChar from '@/public/assets/banner/factory-char.webp';
import ecommerceBase from '@/public/assets/banner/ecommerce-main.webp';
import ecommerceChar from '@/public/assets/banner/ecommerce-char.webp';
import OurServicesSection from './components/servicesSection/ServicesSection';
import ServicePopup from '../components/ServicePopup';
import BlogSection from './components/Blog/BlogSection';
import ContactForm from './components/contact/ContactForm';
import Link from 'next/link';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Data Sets
const faqs = [
  { q: 'How long does it take to setup a company in Dubai?', a: 'Freezone companies can typically be set up in 3-5 working days. Mainland companies might take 7-10 working days depending on the approvals required from DED.' },
  { q: 'Do I need a local sponsor for a Mainland license?', a: 'Recent law changes allow 100% foreign ownership for many Mainland commercial and industrial activities. Some specific activities might still require a local service agent.' },
  { q: 'What is the minimum capital required?', a: 'For most Freezones, there is no strict minimum capital requirement. You can start with a flexi-desk package which is highly cost-effective.' },
  { q: 'Are there any hidden costs?', a: 'No, we provide a transparent breakdown of all government fees, our service charges, and any expected third-party costs before you sign up.' },
];

const testimonials = [
  { name: 'Sarah Jenkins', role: 'CEO, TechFlow', img: 'https://i.pravatar.cc/150?img=47', text: 'DNK Consultancy made our expansion into the UAE incredibly smooth. Their team handled everything from the trade license to our golden visas within weeks.' },
  { name: 'Ahmed Al Mansoori', role: 'Founder, Elite Trading', img: 'https://i.pravatar.cc/150?img=11', text: 'The level of professionalism and deep understanding of Dubai mainland laws is unmatched. Highly recommend them for serious entrepreneurs.' },
  { name: 'Elena Rostova', role: 'E-commerce Director', img: 'https://i.pravatar.cc/150?img=5', text: 'Transparent pricing and excellent post-setup support. They even helped us with corporate bank account opening which is usually a hassle.' },
];

const googleReviews = [
  { name: 'Michael T.', rating: 5, date: '2 weeks ago', text: 'Exceptional service. Got my freelance visa in 4 days.' },
  { name: 'Zoya R.', rating: 5, date: '1 month ago', text: 'Very professional team. Answered all my tax queries perfectly.' },
  { name: 'David B.', rating: 5, date: '2 months ago', text: 'Best PRO services in Business Bay. Highly reliable.' },
];

export default function Home() {
  const heroRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isServicePopupOpen, setIsServicePopupOpen] = useState(false);
  const [selectedServiceTrack, setSelectedServiceTrack] = useState('Company Formation');
  const [activeFaq, setActiveFaq] = useState(null);
  const [testiIndex, setTestiIndex] = useState(0);

  // Counter State
  const [count, setCount] = useState({ clients: 0, years: 0, awards: 0 });

  const [activeSlide, setActiveSlide] = useState(0);

const slides = [
  {
    base: restaurentBase,
    char: restaurentChar,
    title: 'Freezone Setup',
    desc: '100% Foreign Ownership. Zero Tax. Fast track setup in 3 days.',
    icon: Landmark,
  },
  {
    base: factoryBase,
    char: factoryChar,
    title: 'Mainland License',
    desc: 'Trade anywhere in UAE. No minimum capital required.',
    icon: Building2,
  },
  {
    base: ecommerceBase,
    char: ecommerceChar,
    title: 'E-commerce Setup',
    desc: 'Launch your online business in the UAE with our seamless setup process.',
    icon: ShoppingCart,
  },
];

const licenseCards = [
  {
    title: 'Mainland License',
    href: '/licenses/mainland',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    icon: Building2,
    badge: 'Most Popular',
    tagline: 'Trade anywhere in UAE • 100% foreign ownership • No min. capital',
  },
  {
    title: 'Free Zone License',
    href: '/licenses/freezone',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    icon: Landmark,
    badge: 'Fastest Setup',
    tagline: '3-day setup • 0% tax • 100% profit repatriation',
  },
  {
    title: 'Offshore License',
    href: '/licenses/offshore',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop',
    icon: Globe,
    badge: 'Asset Protection',
    tagline: 'No office needed • Max privacy • Global holding structure',
  },
];


useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, 4000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-bg', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, heroRef);

    // Animate Counters
    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        let start = 0;
        const end = 500;
        const timer = setInterval(() => {
          start += 10;
          setCount({ clients: Math.min(start, 500), years: Math.min(Math.floor(start/50), 10), awards: Math.min(Math.floor(start/20), 25) });
          if(start >= end) clearInterval(timer);
        }, 30);
        observer.disconnect();
      }
    });
    
    const counterSec = document.getElementById('stats');
    if(counterSec) observer.observe(counterSec);

    return () => ctx.revert();
  }, []);

  const handleOpenFunnelWithService = (serviceTitle) => {
    setSelectedServiceTrack(serviceTitle);
    setIsServicePopupOpen(true);
  };

  return (
    <>
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#021a1a]">
        <div className="absolute inset-0 z-0 hero-bg">
          <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[150px]" />
          <Image 
            src="https://images.unsplash.com/photo-1661630804516-10393c1bb0a8?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Dubai Skyline"
            fill
            className="object-cover opacity-[0.15] mix-blend-overlay"
            priority
          />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-teal-500/30 text-teal-300 text-sm mb-6 font-bold shadow-lg shadow-teal-500/10 tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Dubai Business Setup Experts
            </div>
            <h1 className="text-5xl md:text-[3rem] xl:text-[4rem] font-extrabold mb-6 leading-[1.1] tracking-tight">
              Launch Your <br />
              <span className="text-gradient-gold">Business in Dubai</span> <br />
              With Zero Stress
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
              We provide end-to-end company formation, visa processing, and corporate PRO services. Start your journey in the UAE’s thriving economy today.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button asMotion onClick={() => setIsPopupOpen(true)} size="lg" className="flex items-center gap-2">
                Book Free Consultation <ArrowRight size={20} />
              </Button>
              <Button variant="ghost" size="lg" className="flex items-center gap-2" onClick={() => window.open('https://wa.me/97145546904', '_blank')}>
                <MessageCircle size={20} className="text-green-400" /> WhatsApp Us
              </Button>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#021a1a] overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-gold-400">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
                <span className="text-sm font-medium text-slate-300"><span className="text-white font-bold">500+</span> Entrepreneurs trust us</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visuals */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[650px] hidden lg:block"
          >
            {/* Floating Info Card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="absolute top-10 right-10 w-80 glass-card p-6 z-30"
            >
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-4 text-teal-400">
                {slides[activeSlide].icon &&
                  (() => {
                    const Icon = slides[activeSlide].icon;
                    return <Icon size={24} />;
                  })()}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {slides[activeSlide].title}
              </h3>

              <p className="text-sm text-slate-400">
                {slides[activeSlide].desc}
              </p>
            </motion.div>

            {/* Slider */}
            <div className="relative w-full h-full overflow-hidden rounded-[40px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  {/* Main Image */}
                  <Image
                    src={slides[activeSlide].base}
                    alt="Business Setup"
                    className="opacity-0 xl:opacity-100 absolute left-0 bottom-0 inset-20 object-contain p-10 xl:p-16 z-20"
                  />

                  {/* Character Floating */}
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: 'easeInOut',
                    }}
                    className="absolute left-0 bottom-0 inset-20 z-10"
                  >
                    <Image
                      src={slides[activeSlide].char}
                      alt="Character"
                      className="opacity-0 xl:opacity-100 object-contain p-10 xl:p-16 w-[50%]"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Floating Card */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute bottom-10 left-0 w-72 glass-card p-6 z-30 border-gold-500/30"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-4 text-gold-400">
                <TrendingUp size={24} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Business Growth
              </h3>

              <p className="text-sm text-slate-400">
                Expand your company in the UAE with premium consultancy support.
              </p>
            </motion.div>

            {/* Slider Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-40">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? 'w-10 bg-teal-400'
                      : 'w-3 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* BUSINESS LICENSE SECTION */}
      <Section darker className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none" />

        <div className="text-center mb-14 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            What opportunities do you want to explore?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-slate-300 max-w-4xl mx-auto text-lg leading-relaxed"
          >
            DNK Consultancy is your trusted partner for company formation in Dubai,
            UAE. Stay ahead with our expert business setup services and launch your
            company with confidence.
          </motion.p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-7 relative z-10">
          {licenseCards.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative h-[420px] rounded-[28px] overflow-hidden cursor-pointer"
            >
              <Link href={item.href} className="absolute inset-0 z-40" aria-label={`Learn more about ${item.title}`} />

              {/* Background Image */}
                  <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
          
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-all duration-500" />
          
              {/* Badge */}
              <div className="absolute top-5 left-5 z-30 px-3 py-1 rounded-full bg-teal-500/80 backdrop-blur-sm text-white text-xs font-bold">
                {item.badge}
              </div>
          
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-30">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white mb-5 group-hover:bg-teal-500 group-hover:border-teal-400 transition-all duration-300">
                  <item.icon size={30} />
                </div>
          
                <h3 className="text-3xl font-bold text-white mb-2">{item.title}</h3>
          
                <p className="text-slate-300 text-sm mb-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {item.tagline}
                </p>
          
                <div className="flex items-center text-white font-semibold gap-2 group-hover:text-teal-300 transition-all">
                  Explore More
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
          
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-[28px] border border-white/10 group-hover:border-teal-400/50 transition-all duration-500 z-30 pointer-events-none" />
            </motion.div>
          ))}

        </div>
      </Section>

      {/* 2. SERVICES PREVIEW SECTION */}
      {/* <Section id="services" darker>
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">Our Premium <span className="text-teal-400">Services</span></motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Comprehensive corporate solutions tailored for your ultimate success in the UAE market.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Company Formation', desc: 'Mainland, Freezone, and Offshore setup with end-to-end assistance.', icon: Building2 },
            { title: 'Visa Services', desc: 'Golden Visa, Investor Visa, and Employment Visa fast-track processing.', icon: Users },
            { title: 'Corporate Tax & VAT', desc: 'Tax registration, filing, and accounting services to stay compliant.', icon: TrendingUp },
            { title: 'PRO Services', desc: 'Document clearing, labor contracts, and Emirates ID processing.', icon: FileCheck },
            { title: 'Bank Account Opening', desc: 'Hassle-free corporate bank account opening with top UAE banks.', icon: Landmark },
            { title: 'Office Space', desc: 'Premium workspace solutions and Ejari registrations.', icon: Briefcase },
            { title: 'Legal Services', desc: 'Our legal team advises on UAE laws for M&As, restructuring, financing, and disputes.', icon: Scale },
                  { title: 'Trademark Registration', desc: 'Protect your brand globally through trademark registration in Dubai', icon: Copyright },
                  { title: 'Health Insurance', desc: 'Get tailored health insurance from the world’s leading companies.', icon: ShieldCheck },
          ].map((service, idx) => (
            <GlassCard key={idx} delay={idx * 0.1} className="group cursor-pointer flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
              <p className="text-slate-400 mb-8 flex-grow">{service.desc}</p>
              <div className="flex items-center text-teal-400 font-bold group-hover:gap-3 transition-all">
                Learn More <ArrowRight size={18} className="ml-2" />
              </div>
            </GlassCard>
          ))}
        </div>
      </Section> */}

      <OurServicesSection onOpenConsultation={handleOpenFunnelWithService} />
      {/* Shared Adaptive Funnel Configurator */}
      <ServicePopup 
        isOpen={isServicePopupOpen} 
        onClose={() => setIsServicePopupOpen(false)} 
        preselectedService={selectedServiceTrack} 
      />

      {/* 3. WHY CHOOSE US & STATS COUNTERS */}
      <Section id="stats">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="text-teal-400 font-bold tracking-widest uppercase mb-2">The DNK Advantage</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Partner With <span className="text-gradient-gold">Us?</span></h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              With over a decade of experience in the UAE market, we possess the deep local knowledge and strong government relationships needed to expedite your business setup. No delays, no hidden fees.
            </p>
            <ul className="space-y-6 mb-10">
              {[
                '100% Transparent Pricing - No Hidden Fees',
                'Dedicated Account Manager for Every Client',
                'Fast-Track Approvals within 72 Hours',
                'Full Post-Setup Support (Tax, Accounting, Legal)'
              ].map((point, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <CheckCircle2 className="text-teal-400 mt-1 shrink-0" size={24} />
                  <span className="text-white font-medium text-lg">{point}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => setIsPopupOpen(true)}>Consult An Expert Now</Button>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-6">
            <GlassCard delay={0.1} className="text-center p-8">
              <div className="text-5xl font-extrabold text-white mb-2">{count.clients}+</div>
              <div className="text-teal-400 font-bold">Happy Clients</div>
            </GlassCard>
            <GlassCard delay={0.2} className="text-center p-8 translate-y-8">
              <div className="text-5xl font-extrabold text-white mb-2">{count.years}+</div>
              <div className="text-teal-400 font-bold">Years Experience</div>
            </GlassCard>
            <GlassCard delay={0.3} className="text-center p-8">
              <div className="text-5xl font-extrabold text-white mb-2">72<span className="text-2xl">hr</span></div>
              <div className="text-teal-400 font-bold">Average Setup</div>
            </GlassCard>
            <GlassCard delay={0.4} className="text-center p-8 translate-y-8">
              <div className="text-5xl font-extrabold text-white mb-2">{count.awards}</div>
              <div className="text-teal-400 font-bold">Awards Won</div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* 4. PROCESS SECTION (STEP TIMELINE) */}
      <Section darker className="border-y border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple <span className="text-teal-400">4-Step</span> Process</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">We handle the complex paperwork while you focus on scaling your business.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 z-0" />

          {[
            { step: '01', title: 'Free Consultation', desc: 'Discuss your goals and select the right license type.', icon: MessageCircle },
            { step: '02', title: 'Documentation', desc: 'We collect and prepare all necessary legal documents.', icon: FileCheck },
            { step: '03', title: 'License Issuance', desc: 'Government approvals and trade license generation.', icon: Building2 },
            { step: '04', title: 'Visa & Banking', desc: 'Process residency visas and open corporate accounts.', icon: Landmark },
          ].map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-[#021a1a] border-2 border-teal-500/30 group-hover:border-teal-400 shadow-xl shadow-teal-500/20 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
                <item.icon size={32} className="text-teal-400" />
              </div>
              <div className="text-teal-500 font-bold mb-2">Step {item.step}</div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* VALUES / CORE PRINCIPLES SECTION */}
      <Section className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[160px] rounded-full pointer-events-none" />

        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-teal-400 uppercase tracking-[0.3em] text-sm font-bold">
              Our Core Values
            </span>

            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5">
              Values That Drive <span className="text-gradient-gold">Our Consultancy</span>
            </h2>

            <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
              We combine integrity, innovation, and strategic expertise to help
              entrepreneurs and businesses succeed confidently in the UAE market.
            </p>
          </motion.div>
        </div>

        {/* MOBILE / TABLET GRID */}
        <div className=" grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-10">
          {[
            {
              title: 'Integrity',
              desc: 'Transparent and ethical consultancy solutions.',
              icon: ShieldCheck,
            },
            {
              title: 'Innovation',
              desc: 'Smart digital strategies for modern businesses.',
              icon: TrendingUp,
            },
            {
              title: 'Commitment',
              desc: 'Dedicated support from setup to expansion.',
              icon: CheckCircle2,
            },
            {
              title: 'Growth',
              desc: 'Helping companies scale sustainably in the UAE.',
              icon: Globe,
            },
            {
              title: 'Trust',
              desc: 'Strong long-term relationships with our clients.',
              icon: Users,
            },
            {
              title: 'Compliance',
              desc: 'Ensuring your business stays legally protected.',
              icon: FileCheck,
            },
            {
              title: 'Strategy',
              desc: 'Tailored market-entry and expansion planning.',
              icon: Briefcase,
            },
            {
              title: 'Excellence',
              desc: 'Delivering premium consultancy experiences.',
              icon: Star,
            },
          ].map((item, index) => (
            <GlassCard
              key={index}
              delay={index * 0.05}
              className="group p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-5 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <item.icon size={26} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {item.title}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* 5. TESTIMONIALS & GOOGLE REVIEWS */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Testimonial Slider */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Client <span className="text-teal-400">Success Stories</span></h2>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testiIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard hoverEffect={false} className="p-10 border-teal-500/30 relative">
                    <div className="text-6xl text-teal-500/20 absolute top-6 left-6 font-serif">"</div>
                    <p className="text-xl text-slate-300 italic mb-8 relative z-10 leading-relaxed">
                      {testimonials[testiIndex].text}
                    </p>
                    <div className="flex items-center gap-4">
                      <Image src={testimonials[testiIndex].img} width={60} height={60} alt={testimonials[testiIndex].name} className="rounded-full border-2 border-teal-500" />
                      <div>
                        <h4 className="text-white font-bold text-lg">{testimonials[testiIndex].name}</h4>
                        <p className="text-teal-400 text-sm">{testimonials[testiIndex].role}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-4 mt-6 ml-2">
                <button onClick={() => setTestiIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))} className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors">
                  <ChevronLeft />
                </button>
                <button onClick={() => setTestiIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))} className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors">
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* Google Reviews */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold">Google <span className="text-gradient-gold">Reviews</span></h2>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-black font-bold">5.0</span>
                <div className="flex text-yellow-400"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {googleReviews.map((review, i) => (
                <GlassCard hoverEffect={false} key={i} className="p-6 flex gap-4 bg-white/5">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0 text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-bold">{review.name}</h4>
                      <span className="text-xs text-slate-500">{review.date}</span>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(review.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-sm text-slate-300">{review.text}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 6. BLOG PREVIEW SECTION */}
      <BlogSection />

      {/* 7. FAQ SECTION */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked <span className="text-teal-400">Questions</span></h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-lg text-white pr-8">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${activeFaq === idx ? 'bg-teal-500 border-teal-500 rotate-180' : 'border-white/20'}`}>
                    <ChevronDown size={18} className={activeFaq === idx ? 'text-white' : 'text-slate-400'} />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 text-slate-300 overflow-hidden">
                      <div className="pb-6 pt-2 leading-relaxed border-t border-white/5">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Section>

     {/* MAIN CONTACT BOX - Renders immediately on load */}
      <Section className="py-24 relative overflow-hidden" >
        <div className="absolute inset-0 bg-teal-900/40 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#021a1a] via-transparent to-[#021a1a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/20 blur-[150px] rounded-full pointer-events-none" />
        
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <ContactForm />
        </motion.div>
      </Section>
      
      <ConsultationPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  );
}
