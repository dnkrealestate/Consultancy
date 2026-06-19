'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark, CheckCircle2, ArrowRight, X, ChevronDown,
  Star, Globe, Shield, BadgeCheck, Clock, TrendingUp,
  Zap, Users, FileCheck, PhoneCall, Package
} from 'lucide-react';

// ─── Inline License Popup ──────────────────────────────────────────────────
function LicensePopup({ isOpen, onClose, licenseType }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    businessActivity: '', freezone: '', shareholders: '1', officeSpace: 'Flexi Desk',
    name: '', email: '', phone: '', nationality: '', timeline: 'Immediately',
    expertCall: 'YES', startLocation: 'Dubai'
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
        className="relative w-full max-w-xl bg-[#021a1a] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden my-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          <X size={16} />
        </button>

        <div className="p-8">
          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                <CheckCircle2 size={36} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-slate-400 mb-6">Our experts will contact you shortly regarding your {licenseType}.</p>
              <button onClick={() => { onClose(); setSuccess(false); setStep(1); }}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                Close
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
                  <Landmark size={12} /> {licenseType}
                </div>
                <h3 className="text-xl font-bold text-white">Get Your Free Cost Estimate</h3>
                <p className="text-slate-400 text-sm mt-1">Step {step} of 2 — Complete the form below</p>
              </div>
              <div className="flex gap-2 mb-6">
                {[1,2].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-cyan-500' : 'bg-white/10'}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Freezone</label>
                      <select value={form.freezone} onChange={e => set('freezone', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 text-sm appearance-none">
                        <option value="">Select freezone...</option>
                        {['DMCC (Dubai Multi Commodities Centre)','DIFC (Dubai International Financial Centre)','IFZA (International Freezone Authority)','SHAMS (Sharjah Media City)','RAKEZ (Ras Al Khaimah Economic Zone)','KIZAD (Khalifa Industrial Zone)','Dubai Silicon Oasis','Dubai Internet City','Meydan Freezone','ADGM (Abu Dhabi Global Market)','JAFZA (Jebel Ali)','Other'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Business Activity</label>
                      <select value={form.businessActivity} onChange={e => set('businessActivity', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 text-sm appearance-none">
                        <option value="">Select activity...</option>
                        {['Technology','Consulting','Trading','E-commerce','Media & Publishing','Financial Services','Marketing','Healthcare','Education','Logistics','Real Estate','Freelance / Professional','Other'].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Office Space Preference</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Flexi Desk','Shared Desk','Private Office','Warehouse','Virtual Office','Not Decided'].map(o => (
                          <label key={o} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form.officeSpace === o ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                            <input type="radio" checked={form.officeSpace === o} onChange={() => set('officeSpace', o)} className="accent-cyan-500" />
                            <span className="text-xs">{o}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => form.businessActivity && setStep(2)}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${form.businessActivity ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
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
                        { label: 'Nationality', key: 'nationality', placeholder: 'e.g. Indian', type: 'text' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                          <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-500 placeholder-slate-600" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Timeline</label>
                        <select value={form.timeline} onChange={e => set('timeline', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-500 appearance-none">
                          <option>Immediately</option><option>2-3 Months</option><option>6 Months+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Shareholders</label>
                        <select value={form.shareholders} onChange={e => set('shareholders', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-500 appearance-none">
                          {['1','2','3','4','5','5+'].map(n => <option key={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Back</button>
                      <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email || !form.phone}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!submitting && form.name && form.email && form.phone ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
                        {submitting ? 'Submitting...' : 'Get Free Estimate →'}
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

// ─── Freezone list ─────────────────────────────────────────────────────────
const freezones = [
  { name: 'DMCC', location: 'Dubai', focus: 'Commodities & Trade', price: 'From AED 18,500' },
  { name: 'IFZA', location: 'Dubai', focus: 'Multi-Activity', price: 'From AED 12,900' },
  { name: 'SHAMS', location: 'Sharjah', focus: 'Media & Creatives', price: 'From AED 5,750' },
  { name: 'RAKEZ', location: 'Ras Al Khaimah', focus: 'Industrial & Trading', price: 'From AED 7,500' },
  { name: 'Meydan', location: 'Dubai', focus: 'Business & Sports', price: 'From AED 11,500' },
  { name: 'DSO', location: 'Dubai', focus: 'Technology & IT', price: 'From AED 13,500' },
];

const faqs = [
  { q: 'What is a Freezone company?', a: 'A Freezone company (also called FZCO or FZE) operates within a designated economic zone with tax exemptions, 100% foreign ownership, and profit repatriation rights. They cannot trade directly on the UAE mainland without a local distributor.' },
  { q: 'Which Freezone is best for me?', a: 'It depends on your activity and budget. DMCC is ideal for commodities and trade, DIFC for finance, DSO for tech, SHAMS for media. Our consultants can match you with the most cost-effective option.' },
  { q: 'Can a Freezone company do business in mainland UAE?', a: 'Indirectly, yes — through a local distributor or by obtaining a dual license. If you need direct UAE market access, we recommend a Mainland license or a branch office.' },
  { q: 'Is VAT applicable to Freezone companies?', a: 'Most Freezone companies dealing with international clients outside the UAE are zero-rated for VAT. Transactions within the UAE may attract standard 5% VAT.' },
  { q: 'What documents are needed to set up a Freezone?', a: 'Passport copies, visa pages, proof of address, and business plan (some freezones). We handle the entire submission process on your behalf.' },
];

export default function FreeZoneLicensePage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    { icon: Globe, title: '100% Foreign Ownership', desc: 'Full ownership with no requirement for a UAE national partner or sponsor.' },
    { icon: TrendingUp, title: '0% Corporate Tax Zone', desc: 'Most Freezones offer zero corporate and income tax on qualifying income.' },
    { icon: Zap, title: '3-Day Fast Setup', desc: 'Some Freezones can be incorporated within 3–5 working days end-to-end.' },
    { icon: Package, title: 'Repatriate 100% Profits', desc: 'Move your capital and profits out of the UAE with zero restrictions.' },
    { icon: Shield, title: 'No Currency Restrictions', desc: 'Operate in any currency. No forex controls or capital repatriation limits.' },
    { icon: Users, title: 'Flexible Visa Quotas', desc: 'Investor, employee, and dependent visas — scalable to your team size.' },
  ];

  const steps = [
    { n: '01', title: 'Choose Freezone', desc: 'We match you with the optimal freezone for your activity and budget.' },
    { n: '02', title: 'Name & Documents', desc: 'Trade name reservation and preparation of MOA / shareholder documents.' },
    { n: '03', title: 'Pay & Submit', desc: 'Authority fees paid and application submitted with all documents.' },
    { n: '04', title: 'License & Visas', desc: 'License issued digitally. Visas and bank account setup initiated.' },
  ];

  return (
    <div className="min-h-screen bg-[#021a1a] text-white font-sans">
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'40px 40px'}} />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <span>Home</span><span>/</span><span>Business Licenses</span><span>/</span>
            <span className="text-cyan-400">Free Zone License</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-semibold mb-6">
                <Landmark size={15} /> 40+ Freezones Available · UAE
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
                UAE Free Zone<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Business License</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
                Launch a 100% foreign-owned company in one of Dubai's 40+ world-class Freezones. Enjoy zero corporate tax, fast 3-day setup, and full profit repatriation — the ideal gateway for global entrepreneurs.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setPopupOpen(true)}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02]">
                  Get Free Cost Estimate <ArrowRight size={18} />
                </button>
                <a href="https://wa.me/97145546904" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 border border-white/15 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/5 transition-all">
                  <PhoneCall size={17} className="text-green-400" /> Chat on WhatsApp
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                {['3-Day Setup', '0% Corporate Tax', '100% Ownership'].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={15} className="text-cyan-500" /> {b}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 to-teal-500/10 rounded-3xl blur-xl" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { v: '3–5', u: 'Working Days', label: 'Fast Setup' },
                      { v: '0%', u: 'Corporate Tax', label: 'Zone Income' },
                      { v: '40+', u: 'Freezones', label: 'To Choose From' },
                      { v: '100%', u: 'Profit Repatriation', label: 'Guaranteed' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <div className="text-2xl font-extrabold text-white">{s.v}</div>
                        <div className="text-cyan-400 text-xs font-semibold mt-0.5">{s.u}</div>
                        <div className="text-slate-500 text-xs mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-sm">Ideal for Global Entrepreneurs</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">Freezones are the fastest and most tax-efficient way to establish a UAE business presence with complete foreign ownership.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Key Benefits ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="container mx-auto px-6 md:px-12 relative">
          <div className="text-center mb-16">
            <span className="text-cyan-400 uppercase tracking-[0.3em] text-xs font-bold">Why Freezone</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">Key Advantages</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-cyan-500/30 rounded-2xl p-7 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 transition-colors">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Freezones ── */}
      <section className="py-24 border-y border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <span className="text-cyan-400 uppercase tracking-[0.3em] text-xs font-bold">Our Recommendations</span>
            <h2 className="text-4xl font-extrabold mt-3">Popular Freezones</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm">We work with all major UAE Freezones. Here are the most popular options across different sectors and budgets.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {freezones.map((fz, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/8 hover:border-cyan-500/30 rounded-2xl p-6 transition-all hover:bg-white/[0.06] group cursor-pointer"
                onClick={() => setPopupOpen(true)}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{fz.name}</h3>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1"><Globe size={11} /> {fz.location}</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 transition-colors">
                    <ArrowRight size={15} />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-3">{fz.focus}</div>
                <div className="text-cyan-300 font-bold text-sm">{fz.price}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => setPopupOpen(true)} className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold underline underline-offset-4">
              Can't find your freezone? Talk to our experts →
            </button>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-cyan-400 uppercase tracking-[0.3em] text-xs font-bold">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">4-Step Setup Process</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/40 to-cyan-500/0" />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#021a1a] border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-5 shadow-lg shadow-cyan-500/10">{s.n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + FAQ ── */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* CTA */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-teal-500/10 rounded-3xl blur-lg" />
              <div className="relative bg-white/[0.04] border border-cyan-500/20 rounded-3xl p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-6">
                  <Clock size={28} />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">Start Your Freezone Today</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Get a custom freezone comparison and cost estimate. We help you pick the perfect zone for your business — free of charge.</p>
                <button onClick={() => setPopupOpen(true)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-4 rounded-2xl font-bold shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2">
                  Get Free Estimate <ArrowRight size={18} />
                </button>
                <div className="mt-5 text-xs text-slate-500">No commitment · 100% free consultation</div>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-extrabold mb-8">Common <span className="text-cyan-400">Questions</span></h2>
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                      <span className="font-semibold text-white pr-8 text-sm">{f.q}</span>
                      <ChevronDown size={16} className={`text-cyan-400 transition-transform shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
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
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-cyan-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-6 md:px-12 relative text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5">Launch Your Freezone Company <span className="text-cyan-400">Today</span></h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">From Flexi Desk packages to full physical offices — we find the most cost-effective freezone for your needs.</p>
          <button onClick={() => setPopupOpen(true)}
            className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-cyan-500/30 transition-all hover:scale-[1.02]">
            Book Free Consultation <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <LicensePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} licenseType="Free Zone License" />
    </div>
  );
}