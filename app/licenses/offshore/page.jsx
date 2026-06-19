'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, CheckCircle2, ArrowRight, X, ChevronDown,
  Shield, Clock, TrendingUp, Lock, FileCheck,
  Briefcase, Users, PhoneCall, Star, Building2
} from 'lucide-react';

// ─── Inline License Popup ──────────────────────────────────────────────────
function LicensePopup({ isOpen, onClose, licenseType }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    offshoreJurisdiction: '', purpose: '', shareholders: '1',
    name: '', email: '', phone: '', nationality: '', timeline: 'Immediately'
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, service: licenseType, status: 'new' })
      });
      setSuccess(true);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-[#021a1a] border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden my-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-500" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          <X size={16} />
        </button>

        <div className="p-8">
          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                <CheckCircle2 size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-slate-400 mb-6">Our offshore specialists will contact you shortly.</p>
              <button onClick={() => { onClose(); setSuccess(false); setStep(1); }}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-xl font-bold transition-colors">Close</button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                  <Globe size={12} /> {licenseType}
                </div>
                <h3 className="text-xl font-bold text-white">Get Your Free Consultation</h3>
                <p className="text-slate-400 text-sm mt-1">Step {step} of 2</p>
              </div>
              <div className="flex gap-2 mb-6">
                {[1,2].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Offshore Jurisdiction</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { name: 'JAFZA Offshore', sub: 'Jebel Ali — Most popular' },
                          { name: 'RAK ICC Offshore', sub: 'Ras Al Khaimah — Cost-effective' },
                          { name: 'ADGM Offshore', sub: 'Abu Dhabi — Financial hub' },
                          { name: 'Not Sure', sub: 'Help me choose' },
                        ].map(j => (
                          <label key={j.name} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.offshoreJurisdiction === j.name ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                            <input type="radio" checked={form.offshoreJurisdiction === j.name} onChange={() => set('offshoreJurisdiction', j.name)} className="accent-indigo-500" />
                            <div>
                              <div className="text-sm font-medium text-white">{j.name}</div>
                              <div className="text-xs text-slate-500">{j.sub}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Primary Purpose</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['International Trading','Holding Company','Asset Protection','IP Holding','Investment Vehicle','Consulting'].map(p => (
                          <label key={p} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form.purpose === p ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                            <input type="radio" checked={form.purpose === p} onChange={() => set('purpose', p)} className="accent-indigo-500" />
                            <span className="text-xs">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => form.offshoreJurisdiction && setStep(2)}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${form.offshoreJurisdiction ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
                      Next Step <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Full Name*', key: 'name', placeholder: 'Your name', type: 'text' },
                        { label: 'Email*', key: 'email', placeholder: 'email@example.com', type: 'email' },
                        { label: 'Phone*', key: 'phone', placeholder: '+971...', type: 'tel' },
                        { label: 'Nationality', key: 'nationality', placeholder: 'e.g. British', type: 'text' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                          <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Shareholders</label>
                      <div className="flex gap-2">
                        {['1','2','3','4','5+'].map(n => (
                          <button key={n} type="button" onClick={() => set('shareholders', n)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${form.shareholders === n ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">When do you plan to start?</label>
                      <select value={form.timeline} onChange={e => set('timeline', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500 appearance-none">
                        <option>Immediately</option><option>2-3 Months</option><option>6 Months+</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Back</button>
                      <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email || !form.phone}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!submitting && form.name && form.email && form.phone ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
                        {submitting ? 'Submitting...' : 'Request Consultation →'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const jurisdictions = [
  {
    name: 'JAFZA Offshore',
    location: 'Jebel Ali, Dubai',
    desc: 'Most established offshore jurisdiction. Allows property ownership in designated Dubai areas. Preferred by large enterprises.',
    pros: ['Dubai bank account','Real estate ownership','Strongest credibility'],
    price: 'From AED 11,500'
  },
  {
    name: 'RAK ICC Offshore',
    location: 'Ras Al Khaimah',
    desc: 'Most cost-effective offshore option in the UAE. Perfect for startups, holding companies, and international trading vehicles.',
    pros: ['Lowest setup cost','Quick 2-day setup','High confidentiality'],
    price: 'From AED 6,500'
  },
  {
    name: 'ADGM Offshore',
    location: 'Abu Dhabi',
    desc: "Abu Dhabi's international financial centre. Preferred for financial services, investment funds, and high-net-worth structures.",
    pros: ['English common law','Top-tier reputation','Fund structures'],
    price: 'From AED 15,000'
  },
];

const features = [
  { icon: Shield, title: 'Asset Protection', desc: 'Legally safeguard assets from personal liability, disputes, and creditors.' },
  { icon: Lock, title: 'Privacy & Confidentiality', desc: 'Offshore companies are not listed in public registries — maximum discretion.' },
  { icon: TrendingUp, title: 'Tax Efficiency', desc: 'No corporate tax, no withholding tax on dividends, interest, or royalties.' },
  { icon: Globe, title: 'Global Operations', desc: 'Operate internationally without UAE mainland geographic restrictions.' },
  { icon: Briefcase, title: 'Holding Structures', desc: 'Ideal for holding IP, investments, real estate, and subsidiaries globally.' },
  { icon: Users, title: 'Estate Planning', desc: 'Use offshore companies for succession planning and generational wealth transfer.' },
];

const faqs = [
  { q: 'What is a UAE Offshore company?', a: 'A UAE Offshore company (also called an International Business Company or IBC) is registered in a special jurisdiction like JAFZA or RAK ICC. It cannot trade within the UAE but can conduct business internationally with significant tax and privacy advantages.' },
  { q: 'Can an Offshore company open a UAE bank account?', a: 'Yes — JAFZA Offshore companies can open UAE bank accounts. RAK ICC offshore companies may open accounts with some banks. We assist with the entire bank account opening process.' },
  { q: 'Is an offshore company legal?', a: 'Absolutely. UAE Offshore companies are fully regulated by their respective authorities (JAFZA, RAK ICC, ADGM). They are legitimate corporate structures used by thousands of global businesses.' },
  { q: 'Can I hold UAE property in an offshore company?', a: 'JAFZA Offshore companies are specifically permitted to own real estate in designated Dubai freehold areas — making them ideal for property holding structures.' },
  { q: 'Does an offshore company need a physical office?', a: 'No. Offshore companies do not require a physical office, resident director, or local employee — making them highly cost-effective to maintain annually.' },
];

export default function OffshoreLicensePage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const steps = [
    { n: '01', title: 'Jurisdiction Selection', desc: 'We assess your goals and recommend the ideal offshore jurisdiction.' },
    { n: '02', title: 'Document Preparation', desc: 'KYC documents, MOA, and notarised passports prepared and submitted.' },
    { n: '03', title: 'Company Registration', desc: 'Authority approves and issues the certificate of incorporation.' },
    { n: '04', title: 'Bank Account Setup', desc: 'We assist with bank account opening in UAE or international banks.' },
  ];

  return (
    <div className="min-h-screen bg-[#021a1a] text-white font-sans">
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
          {/* Diagonal lines pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize:'30px 30px'}} />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <span>Home</span><span>/</span><span>Business Licenses</span><span>/</span>
            <span className="text-indigo-400">Offshore License</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-6">
                <Globe size={15} /> JAFZA · RAK ICC · ADGM
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
                UAE Offshore<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Business License</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
                Establish a UAE Offshore company for international trading, asset protection, and holding structures. No physical office required. Maximum privacy, zero tax, and full foreign ownership — with the credibility of a UAE-registered entity.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setPopupOpen(true)}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]">
                  Get Free Consultation <ArrowRight size={18} />
                </button>
                <a href="https://wa.me/97145546904" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 border border-white/15 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/5 transition-all">
                  <PhoneCall size={17} className="text-green-400" /> Chat on WhatsApp
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                {['No Physical Office', '0% Tax', 'Full Privacy'].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={15} className="text-indigo-500" /> {b}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/30 to-violet-500/10 rounded-3xl blur-xl" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { v: '2–5', u: 'Working Days', label: 'Setup Time' },
                      { v: '0%', u: 'Corporate Tax', label: 'On Profits' },
                      { v: 'No', u: 'Office Required', label: 'Low Overhead' },
                      { v: '100%', u: 'Foreign Owned', label: 'No Sponsor' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <div className="text-2xl font-extrabold text-white">{s.v}</div>
                        <div className="text-indigo-400 text-xs font-semibold mt-0.5">{s.u}</div>
                        <div className="text-slate-500 text-xs mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-sm">Ideal for Global Structuring</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">Offshore companies are the preferred tool for wealth management, IP holding, and international business with maximum privacy.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="container mx-auto px-6 md:px-12 relative">
          <div className="text-center mb-16">
            <span className="text-indigo-400 uppercase tracking-[0.3em] text-xs font-bold">Why Offshore</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">Key Advantages</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl p-7 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 transition-colors">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jurisdictions ── */}
      <section className="py-24 border-y border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <span className="text-indigo-400 uppercase tracking-[0.3em] text-xs font-bold">Choose Your Jurisdiction</span>
            <h2 className="text-4xl font-extrabold mt-3">UAE Offshore Options</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm">Three distinct offshore jurisdictions — each optimised for different business structures and budgets.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {jurisdictions.map((j, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/8 hover:border-indigo-500/30 rounded-2xl p-7 transition-all hover:bg-white/[0.06] flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{j.name}</h3>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1"><Globe size={11} /> {j.location}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{j.desc}</p>
                <div className="space-y-2 mb-6 flex-1">
                  {j.pros.map((p, pi) => (
                    <div key={pi} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-indigo-500 shrink-0" /> {p}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-indigo-300 font-bold text-sm">{j.price}</span>
                  <button onClick={() => setPopupOpen(true)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Get Quote <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-indigo-400 uppercase tracking-[0.3em] text-xs font-bold">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">4-Step Setup Process</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#021a1a] border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 font-extrabold text-lg mb-5 shadow-lg shadow-indigo-500/10">{s.n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ + CTA ── */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-extrabold mb-8">Common <span className="text-indigo-400">Questions</span></h2>
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                      <span className="font-semibold text-white pr-8 text-sm">{f.q}</span>
                      <ChevronDown size={16} className={`text-indigo-400 transition-transform shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-6 py-4 text-slate-400 text-sm leading-relaxed border-t border-white/5">{f.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 rounded-3xl blur-lg" />
              <div className="relative bg-white/[0.04] border border-indigo-500/20 rounded-3xl p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-6">
                  <Lock size={28} />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">Ready to Structure Offshore?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Our offshore specialists will help you choose the right jurisdiction, prepare all documents, and open your UAE or international bank account.</p>
                <button onClick={() => setPopupOpen(true)}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
                  Book Free Consultation <ArrowRight size={18} />
                </button>
                <div className="mt-5 text-xs text-slate-500">Confidential · No commitment · 100% free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-indigo-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-6 md:px-12 relative text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5">Structure Your Business <span className="text-indigo-400">Offshore Today</span></h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Join hundreds of global investors who have used UAE offshore companies to protect assets, minimise tax, and scale internationally.</p>
          <button onClick={() => setPopupOpen(true)}
            className="inline-flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02]">
            Book Free Consultation <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <LicensePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} licenseType="Offshore License" />
    </div>
  );
}