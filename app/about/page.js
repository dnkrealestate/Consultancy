'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Target, Eye, Heart, Award,
  Users, Globe, TrendingUp, ShieldCheck, Briefcase, Star,
  MessageCircle, Building2
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import ConsultationPopup from '@/components/ConsultationPopup';
import dan from "@/public/assets/team-img/dan01.webp";
import waseem from "@/public/assets/team-img/waseem01.webp";

// ─── Data ──────────────────────────────────────────────────────────────────
const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '10+', label: 'Years Experience' },
  { value: '72hr', label: 'Average Setup' },
  { value: '25', label: 'Awards Won' },
];

const values = [
  { title: 'Integrity', desc: 'Transparent and ethical consultancy solutions in every engagement.', icon: ShieldCheck },
  { title: 'Innovation', desc: 'Smart digital strategies for modern, future-ready businesses.', icon: TrendingUp },
  { title: 'Commitment', desc: 'Dedicated support from initial setup through full expansion.', icon: CheckCircle2 },
  { title: 'Excellence', desc: 'Delivering premium consultancy experiences, every time.', icon: Star },
];

const team = [
  { name: 'Waseem Khursheed', role: 'Founder & CEO', img: waseem },
  { name: 'Dann Leslie', role: 'Co-Founder & Managing Director', img: dan },
  // { name: 'Omar Al Habsi', role: 'Senior PRO Manager', img: 'null' },
  // { name: 'Lina Chen', role: 'Visa & Immigration Lead', img: 'null' },
  
];

const milestones = [
  { year: '2015', title: 'Company Founded', desc: 'Started as a small PRO services desk in Business Bay, Dubai.' },
  { year: '2018', title: 'Freezone Partnerships', desc: 'Became an official partner of 15+ major UAE freezones.' },
  { year: '2021', title: '100+ Clients Milestone', desc: 'Crossed 100 successfully formed companies in the UAE.' },
  { year: '2024', title: 'Digital Transformation', desc: 'Launched fully digital onboarding and consultation platform.' },
  { year: '2026', title: '500+ Companies Formed', desc: 'Recognised as a top-rated business setup consultancy in Dubai.' },
];

export default function AboutPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#021a1a] text-white font-sans">

      {/* ── HERO ── */}
      <section className="relative min-h-[60vh] flex items-center pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[150px]" />
          <Image
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000&auto=format&fit=crop"
            alt="Dubai Business District"
            fill
            className="object-cover opacity-[0.12] mix-blend-overlay"
            priority
          />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <span>Home</span><span>/</span><span className="text-teal-400">About Us</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-teal-500/30 text-teal-300 text-sm mb-6 font-bold shadow-lg shadow-teal-500/10 tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              About DNK Consultancy
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Built On Trust.<br />
              <span className="text-gradient-gold">Driven By Results.</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
              For over a decade, DNK Consultancy has helped entrepreneurs and global businesses establish a strong, compliant, and thriving presence in the UAE — from first license to full-scale growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STORY + STATS ── */}
      <Section darker className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="text-teal-400 font-bold tracking-widest uppercase mb-2">Our Story</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">A Decade of <span className="text-gradient-gold">UAE Expertise</span></h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              DNK Consultancy was founded with a simple mission: make business setup in the UAE transparent, fast, and stress-free. What began as a boutique PRO services desk has grown into a full-service consultancy trusted by over 500 entrepreneurs and corporations.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              Today, we offer end-to-end support across Mainland, Freezone, and Offshore company formation, visa processing, tax compliance, and ongoing corporate services — all backed by deep relationships with UAE government authorities.
            </p>
            <Button onClick={() => setIsPopupOpen(true)}>Book Free Consultation</Button>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((s, i) => (
              <GlassCard key={i} delay={i * 0.1} className={`text-center p-8 ${i % 2 !== 0 ? 'translate-y-8' : ''}`}>
                <div className="text-5xl font-extrabold text-white mb-2">{s.value}</div>
                <div className="text-teal-400 font-bold">{s.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ── MISSION / VISION ── */}
      <Section className="relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none" />
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <GlassCard hoverEffect={false} className="p-10 h-full border-teal-500/30">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6">
                <Target size={30} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed">
                To simplify business setup in the UAE through transparent pricing, expert guidance, and dedicated support — empowering entrepreneurs to launch and scale with total confidence.
              </p>
            </GlassCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <GlassCard hoverEffect={false} className="p-10 h-full border-cyan-500/30">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
                <Eye size={30} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                To be the UAE's most trusted business consultancy — recognised globally for integrity, efficiency, and long-term partnership with every client we serve.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </Section>

      {/* ── CORE VALUES ── */}
      <Section darker className="relative overflow-hidden border-y border-white/5">
        <div className="text-center mb-16 relative z-10">
          <span className="text-teal-400 uppercase tracking-[0.3em] text-sm font-bold">Our Core Values</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4">What Drives <span className="text-gradient-gold">Our Consultancy</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {values.map((v, i) => (
            <GlassCard key={i} delay={i * 0.1} className="group p-7">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-5 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <v.icon size={26} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* ── TEAM ── */}
      <Section darker className="border-y border-white/5">
        <div className="text-center mb-16">
          <span className="text-teal-400 uppercase tracking-[0.3em] text-sm font-bold">Meet The Experts</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">Our Leadership <span className="text-teal-400">Team</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mt-4">Seasoned professionals dedicated to your business success in the UAE.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {team.map((member, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <GlassCard hoverEffect={false} className="overflow-hidden !p-5 group">
                <div className="relative w-full h-90 overflow-hidden">
                  <Image src={member.img} alt={member.name} fill className="object-cover  transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-teal-400 text-sm">{member.role}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── WHY CHOOSE US ── */}
      <Section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="grid grid-cols-2 gap-5">
            {[
              { icon: Users, label: '500+ Clients Served' },
              { icon: Globe, label: 'UAE-Wide Coverage' },
              { icon: Briefcase, label: '40+ Freezone Partners' },
              { icon: Award, label: '25 Industry Awards' },
            ].map((f, i) => (
              <GlassCard key={i} delay={i * 0.08} className={`text-center p-6 ${i % 2 !== 0 ? 'translate-y-6' : ''}`}>
                <f.icon size={28} className="text-teal-400 mx-auto mb-3" />
                <div className="text-white font-semibold text-sm">{f.label}</div>
              </GlassCard>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="text-teal-400 font-bold tracking-widest uppercase mb-2">Why Choose Us</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">A Partner Invested In <span className="text-gradient-gold">Your Success</span></h2>
            <ul className="space-y-5 mb-10">
              {[
                'Dedicated account manager for every client',
                'Transparent pricing with zero hidden fees',
                'Direct relationships with UAE government authorities',
                'Full post-setup support — tax, accounting, and legal',
              ].map((point, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <CheckCircle2 className="text-teal-400 mt-1 shrink-0" size={22} />
                  <span className="text-white font-medium">{point}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setIsPopupOpen(true)} className="flex items-center gap-2">
                Book Free Consultation <ArrowRight size={18} />
              </Button>
              <Button variant="ghost" className="flex items-center gap-2" onClick={() => window.open('https://wa.me/97145546904', '_blank')}>
                <MessageCircle size={18} className="text-green-400" /> WhatsApp Us
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── BOTTOM CTA ── */}
      <Section className="py-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-teal-900/40 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#021a1a] via-transparent to-[#021a1a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/20 blur-[150px] rounded-full pointer-events-none" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Building2 size={40} className="text-teal-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5">Ready to Build Your Business <span className="text-gradient-gold">in the UAE?</span></h2>
          <p className="text-slate-300 mb-10">Let our experts guide you from licensing to launch — with complete transparency at every step.</p>
          <button onClick={() => setIsPopupOpen(true)}
            className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/30 transition-all hover:scale-[1.02]">
            Book Free Consultation <ArrowRight size={20} />
          </button>
        </div>
      </Section>

      <ConsultationPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
}