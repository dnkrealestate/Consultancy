'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, CheckCircle2, ArrowRight, X, ChevronDown, Star,
  Users, Globe, FileCheck, TrendingUp, Briefcase, Shield,
  Clock, BadgeCheck, MapPin, PhoneCall
} from 'lucide-react';

// ─── Inline License Popup ──────────────────────────────────────────────────
function LicensePopup({ isOpen, onClose, licenseType }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    businessActivity: '', shareholders: '1', officeSpace: 'Business Centre',
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
        className="relative w-full max-w-xl bg-[#021a1a] border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-500/20 overflow-hidden my-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          <X size={16} />
        </button>

        <div className="p-8">
          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-500/30">
                <CheckCircle2 size={36} className="text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-slate-400 mb-6">Our experts will contact you shortly regarding your {licenseType}.</p>
              <button onClick={() => { onClose(); setSuccess(false); setStep(1); }}
                className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                Close
              </button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
                  <Building2 size={12} /> {licenseType}
                </div>
                <h3 className="text-xl font-bold text-white">Get Your Free Cost Estimate</h3>
                <p className="text-slate-400 text-sm mt-1">Step {step} of 2 — Complete the form below</p>
              </div>

              {/* Progress */}
              <div className="flex gap-2 mb-6">
                {[1,2].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-teal-500' : 'bg-white/10'}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Business Activity</label>
                      <select value={form.businessActivity} onChange={e => set('businessActivity', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500 text-sm appearance-none">
                        <option value="">Select activity...</option>
                        {['Consulting','Technology','Trading','Manufacturing','Healthcare','Finance','Marketing','Real Estate','Education','Food & Beverage','Retail','Other'].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Number of Shareholders</label>
                      <div className="flex gap-2 flex-wrap">
                        {['1','2','3','4','5','5+'].map(n => (
                          <button key={n} type="button" onClick={() => set('shareholders', n)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${form.shareholders === n ? 'border-teal-500 bg-teal-500/15 text-teal-300' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Office Space Preference</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Virtual Office','Business Centre','Physical Office','Shared Office','Warehouse','Not Decided'].map(o => (
                          <label key={o} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form.officeSpace === o ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                            <input type="radio" checked={form.officeSpace === o} onChange={() => set('officeSpace', o)} className="accent-teal-500" />
                            <span className="text-xs">{o}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => form.businessActivity && setStep(2)}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${form.businessActivity ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
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
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-teal-500 placeholder-slate-600" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Start Location</label>
                        <select value={form.startLocation} onChange={e => set('startLocation', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-teal-500 appearance-none">
                          <option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Timeline</label>
                        <select value={form.timeline} onChange={e => set('timeline', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-teal-500 appearance-none">
                          <option>Immediately</option><option>2-3 Months</option><option>6 Months+</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Back</button>
                      <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email || !form.phone}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!submitting && form.name && form.email && form.phone ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
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

// ─── FAQs ──────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Can foreigners own 100% of a Mainland company?', a: 'Yes. Following the 2021 UAE Commercial Companies Law amendments, most commercial and industrial activities now allow 100% foreign ownership without a local sponsor.' },
  { q: 'What is the difference between Mainland and Freezone?', a: 'Mainland companies can trade freely anywhere in the UAE and internationally without restrictions. Freezone companies are confined to the freezone or overseas unless a distributor is used.' },
  { q: 'How long does Mainland setup take?', a: 'Typically 7–10 working days for standard commercial licenses. Specialized activities requiring extra government approvals may take 2–4 weeks.' },
  { q: 'Is a physical office mandatory?', a: 'Yes, a registered UAE address is required for a Mainland license. We can assist with cost-effective options including shared offices and business centres.' },
  { q: 'What are the annual renewal costs?', a: 'Annual trade license renewal with DED typically ranges between AED 8,000–15,000 depending on activity and authority, plus our service fee.' },
];

// ─── Page ──────────────────────────────────────────────────────────────────
export default function MainlandLicensePage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    { icon: Globe, title: 'Trade Anywhere in UAE', desc: 'Full access to the entire UAE market — mainland, freezones, and internationally without restriction.' },
    { icon: Users, title: '100% Foreign Ownership', desc: 'Recent law reforms permit full foreign ownership across most business activities.' },
    { icon: Shield, title: 'No Capital Minimum', desc: 'Most activities have no mandatory minimum share capital requirement to get started.' },
    { icon: BadgeCheck, title: 'Government Contracts', desc: 'Eligible to bid on UAE federal and local government tenders and contracts.' },
    { icon: MapPin, title: 'Multiple Branches', desc: 'Open branches anywhere across the seven emirates without additional licensing.' },
    { icon: TrendingUp, title: 'Banking Ease', desc: 'Mainland companies enjoy the broadest acceptance from UAE banks for account opening.' },
  ];

  const steps = [
    { n: '01', title: 'Initial Consultation', desc: 'We assess your business activity and recommend the ideal DED license type.' },
    { n: '02', title: 'Name Reservation', desc: 'Reserve your trade name with the Department of Economic Development (DED).' },
    { n: '03', title: 'Document Submission', desc: 'We prepare and submit all MOA, POA, and required documents to authorities.' },
    { n: '04', title: 'License Issuance', desc: 'Trade license issued by DED. Visa quota activated. Business ready to operate.' },
  ];

  const costs = [
    { label: 'DED Trade License', range: 'AED 8,000 – 15,000' },
    { label: 'Office / Ejari Registration', range: 'AED 3,000 – 8,000' },
    { label: 'Establishment Card', range: 'AED 2,000 – 3,000' },
    { label: 'Investor Visa (per person)', range: 'AED 4,000 – 6,000' },
    { label: 'Our Service Fee', range: 'AED 3,500 onwards' },
  ];

  return (
    <div className="min-h-screen bg-[#021a1a] text-white font-sans">
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'60px 60px'}} />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <span>Home</span><span>/</span><span>Business Licenses</span><span>/</span>
            <span className="text-teal-400">Mainland License</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm font-semibold mb-6">
                <Building2 size={15} /> DED Licensed · UAE Mainland
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
                UAE Mainland<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Business License</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
                Operate freely across the entire UAE market. A Mainland license issued by the Department of Economic Development (DED) gives your company the widest commercial reach — no geographic restrictions, full banking access, and eligibility for government contracts.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setPopupOpen(true)}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Get Free Cost Estimate <ArrowRight size={18} />
                </button>
                <a href="https://wa.me/97145546904" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 border border-white/15 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/5 transition-all">
                  <PhoneCall size={17} className="text-green-400" /> Chat on WhatsApp
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                {['500+ Companies Setup', '72hr Fast Track', 'DED Approved'].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={15} className="text-teal-500" /> {b}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/30 to-cyan-500/10 rounded-3xl blur-xl" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { v: '7–10', u: 'Working Days', label: 'Setup Time' },
                      { v: '100%', u: 'Foreign Ownership', label: 'Allowed' },
                      { v: 'UAE-wide', u: 'Market Access', label: 'No Restrictions' },
                      { v: '3,000+', u: 'Activities', label: 'Available' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <div className="text-2xl font-extrabold text-white">{s.v}</div>
                        <div className="text-teal-400 text-xs font-semibold mt-0.5">{s.u}</div>
                        <div className="text-slate-500 text-xs mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-sm">Most Popular Choice</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">Mainland licenses are the #1 choice for businesses targeting the entire UAE market with full operational flexibility.</p>
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
            <span className="text-teal-400 uppercase tracking-[0.3em] text-xs font-bold">Why Mainland</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">Key Advantages</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-teal-500/30 rounded-2xl p-7 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 flex items-center justify-center text-teal-400 mb-5 transition-colors">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Setup Process ── */}
      <section className="py-24 border-y border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-teal-400 uppercase tracking-[0.3em] text-xs font-bold">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">4-Step Setup Process</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0" />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#021a1a] border-2 border-teal-500/40 flex items-center justify-center text-teal-400 font-extrabold text-lg mb-5 shadow-lg shadow-teal-500/10">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cost Breakdown ── */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-teal-400 uppercase tracking-[0.3em] text-xs font-bold">Transparent Pricing</span>
              <h2 className="text-4xl font-extrabold mt-3 mb-6">Estimated Cost Breakdown</h2>
              <p className="text-slate-400 leading-relaxed mb-8">All government and authority fees are transparently itemised. No hidden charges. Final cost depends on activity type and number of visas required.</p>
              <div className="space-y-3">
                {costs.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-teal-500 shrink-0" />
                      <span className="text-white text-sm">{c.label}</span>
                    </div>
                    <span className="text-teal-300 font-semibold text-sm">{c.range}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">* Prices are indicative. Final quote provided after consultation.</p>
            </div>
            {/* CTA Box */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-3xl blur-lg" />
              <div className="relative bg-white/[0.04] border border-teal-500/20 rounded-3xl p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/15 flex items-center justify-center text-teal-400 mx-auto mb-6">
                  <Clock size={28} />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">Ready to Start?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Get a personalised cost estimate in under 5 minutes. Our consultants will guide you through the entire setup — from name reservation to visa issuance.</p>
                <button onClick={() => setPopupOpen(true)}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-2 hover:gap-3">
                  Get Free Cost Estimate <ArrowRight size={18} />
                </button>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Shield size={13} /> No commitment required · 100% free
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold">Frequently Asked <span className="text-teal-400">Questions</span></h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                  <span className="font-semibold text-white pr-8 text-sm">{f.q}</span>
                  <ChevronDown size={17} className={`text-teal-400 transition-transform shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
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
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-teal-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-6 md:px-12 relative text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5">Start Your Mainland Business <span className="text-teal-400">Today</span></h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Join 500+ entrepreneurs who trusted DNK Consultancy for their UAE company setup. Fast, transparent, and fully supported.</p>
          <button onClick={() => setPopupOpen(true)}
            className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/30 transition-all hover:scale-[1.02]">
            Book Free Consultation <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <LicensePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} licenseType="Mainland License" />
    </div>
  );
}