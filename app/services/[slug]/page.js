'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ArrowRight, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, Users, TrendingUp, FileCheck, Landmark,
  Briefcase, Scale, Copyright, ShieldCheck
} from 'lucide-react';
import ServicePopup from '@/components/ServicePopup';

const services = {
  'company-formation': {
    title: 'Company Formation',
    tagline: 'Build your business in the UAE the right way.',
    description:
      'We provide end-to-end company setup assistance across Mainland, Freezone, and Offshore jurisdictions. Whether you are a startup or an established enterprise, our experts guide you through every step — from choosing the right structure to getting your trade license in hand.',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      '100% foreign ownership options available',
      'Access to UAE and GCC markets',
      'Low corporate tax environment',
      'Prestigious Dubai address',
      'Repatriation of profits with no restrictions',
    ],
    process: [
      { step: 'Consultation', detail: 'We assess your business activity and recommend the best jurisdiction.' },
      { step: 'Name Reservation', detail: 'We reserve your trade name with the relevant authority.' },
      { step: 'License Application', detail: 'We prepare and submit all required documentation.' },
      { step: 'Office Setup', detail: 'We assist in securing a physical or virtual office address.' },
      { step: 'Final Approvals', detail: 'We collect your trade license and corporate documents.' },
    ],
    faqs: [
      { q: 'How long does company formation take?', a: 'Typically 3–7 business days for freezones and 2–4 weeks for mainland.' },
      { q: 'Can a foreigner own 100% of the business?', a: 'Yes, in all freezones and most mainland activities since the 2021 reforms.' },
      { q: 'What is the minimum share capital required?', a: 'It varies by jurisdiction. Many freezones have no minimum capital requirement.' },
    ],
  },
  'visa-services': {
    title: 'Visa Services',
    tagline: 'Fast-track your UAE residency.',
    description:
      'From Golden Visas to investor and employment visas, we handle the full process with speed and accuracy. Our PRO team liaises directly with immigration authorities to ensure your visa is processed without delays.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'UAE Golden Visa for investors & professionals',
      'Family sponsorship and dependent visas',
      'Employment and mission visas',
      'Express processing available',
      'Full document attestation support',
    ],
    process: [
      { step: 'Eligibility Check', detail: 'We review your profile to determine the best visa category.' },
      { step: 'Document Collection', detail: 'We provide a complete checklist and verify your documents.' },
      { step: 'Application Submission', detail: 'We submit your application to the relevant authority.' },
      { step: 'Medical & Biometrics', detail: 'We schedule and guide you through required medical tests.' },
      { step: 'Visa Stamping', detail: 'We collect and deliver your stamped visa and Emirates ID.' },
    ],
    faqs: [
      { q: 'What is the UAE Golden Visa?', a: 'A 10-year residency visa for investors, entrepreneurs, skilled professionals, and outstanding students.' },
      { q: 'How long does visa processing take?', a: 'Standard processing takes 5–10 business days. Express options are available.' },
      { q: 'Can I sponsor my family on a UAE visa?', a: 'Yes, once you hold a valid UAE residence visa, you can sponsor dependents.' },
    ],
  },
  'corporate-tax-vat': {
    title: 'Corporate Tax & VAT',
    tagline: 'Stay compliant. Stay ahead.',
    description:
      'Navigating UAE tax regulations is critical. Our team of qualified accountants and tax advisors ensures your business is fully compliant with corporate tax and VAT requirements, so you can focus on growth.',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'Corporate tax registration & filing',
      'VAT registration & return filing',
      'Bookkeeping and financial statements',
      'Transfer pricing advisory',
      'FTA audit support',
    ],
    process: [
      { step: 'Assessment', detail: 'We review your business activities and obligations under UAE tax law.' },
      { step: 'Registration', detail: 'We register your entity with the Federal Tax Authority.' },
      { step: 'Compliance Setup', detail: 'We implement accounting systems and processes for ongoing compliance.' },
      { step: 'Periodic Filing', detail: 'We prepare and submit VAT returns and corporate tax filings on time.' },
      { step: 'Advisory', detail: 'We provide ongoing guidance on tax-efficient structuring.' },
    ],
    faqs: [
      { q: 'What is the UAE corporate tax rate?', a: 'A 9% federal corporate tax applies to taxable income above AED 375,000.' },
      { q: 'Who needs to register for VAT?', a: 'Businesses with taxable supplies exceeding AED 375,000 annually must register.' },
      { q: 'Are free zone companies subject to corporate tax?', a: 'Qualifying free zone persons may benefit from a 0% rate on qualifying income.' },
    ],
  },
  'pro-services': {
    title: 'PRO Services',
    tagline: 'Government paperwork, handled for you.',
    description:
      'Our Public Relations Officers (PROs) manage all your government-related documentation efficiently. From labour contracts to Emirates ID renewals, we handle every interaction with UAE government departments on your behalf.',
    icon: FileCheck,
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'Document clearing & attestation',
      'Labour contract processing (MOHRE)',
      'Emirates ID applications & renewals',
      'License renewal and amendments',
      'Ministry of Justice filings',
    ],
    process: [
      { step: 'Requirement Review', detail: 'We identify all documents needed for your specific transaction.' },
      { step: 'Document Preparation', detail: 'We prepare, translate, and attest required paperwork.' },
      { step: 'Government Submission', detail: 'Our PRO team visits the relevant departments on your behalf.' },
      { step: 'Follow-Up', detail: 'We track the progress and resolve any queries raised by authorities.' },
      { step: 'Delivery', detail: 'We deliver completed documents directly to you.' },
    ],
    faqs: [
      { q: 'What does a PRO do?', a: 'A PRO handles all government-related paperwork and liaisons, saving you time.' },
      { q: 'How quickly can PRO services be completed?', a: 'Most standard transactions are completed within 2–5 business days.' },
      { q: 'Do I need to visit government offices myself?', a: 'No — our PRO team handles all in-person visits on your behalf.' },
    ],
  },
  'bank-account-opening': {
    title: 'Bank Account Opening',
    tagline: 'Your UAE corporate account, opened smoothly.',
    description:
      'Opening a business bank account in the UAE can be complex. We leverage our strong relationships with leading UAE banks to fast-track the process and ensure your application is approved without unnecessary back-and-forth.',
    icon: Landmark,
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'Access to top UAE banks (ADCB, FAB, Emirates NBD & more)',
      'Corporate and personal account options',
      'Multi-currency accounts available',
      'Online banking setup assistance',
      'Dedicated relationship manager introductions',
    ],
    process: [
      { step: 'Bank Selection', detail: 'We recommend the best bank based on your business profile.' },
      { step: 'Document Preparation', detail: 'We prepare a complete and compliant application package.' },
      { step: 'Application Submission', detail: 'We submit your application and manage bank communications.' },
      { step: 'KYC Support', detail: 'We assist with Know Your Customer (KYC) requirements and queries.' },
      { step: 'Account Activation', detail: 'We confirm account approval and set up online banking.' },
    ],
    faqs: [
      { q: 'How long does account opening take?', a: 'Typically 2–6 weeks, depending on the bank and your business structure.' },
      { q: 'Can non-residents open a UAE corporate account?', a: 'Yes, with the right documentation and business structure in place.' },
      { q: 'Which documents are required?', a: 'Trade license, MoA, passport copies, proof of address, and business plan are typically required.' },
    ],
  },
  'office-space': {
    title: 'Office Space',
    tagline: 'Premium workspaces in prime locations.',
    description:
      'From serviced offices to co-working hubs and virtual office solutions, we connect you with premium workspace options across Dubai. We also handle Ejari registration, ensuring full legal compliance for your tenancy.',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'Serviced offices in business districts',
      'Flexi-desk and co-working options',
      'Virtual office for legal address purposes',
      'Ejari registration included',
      'Meeting room access',
    ],
    process: [
      { step: 'Requirement Briefing', detail: 'We understand your space, location, and budget requirements.' },
      { step: 'Options Shortlisting', detail: 'We present curated options matching your criteria.' },
      { step: 'Site Visits', detail: 'We arrange viewings at your shortlisted offices.' },
      { step: 'Contract & Ejari', detail: 'We negotiate terms and handle Ejari registration.' },
      { step: 'Move-In Support', detail: 'We coordinate utilities, internet, and fit-out where needed.' },
    ],
    faqs: [
      { q: 'What is Ejari?', a: 'Ejari is the official tenancy contract registration system in Dubai, mandatory for all tenancy agreements.' },
      { q: 'Can a virtual office address be used for a trade license?', a: 'Yes, virtual office addresses are accepted for most mainland and freezone licenses.' },
      { q: 'Do you offer short-term office contracts?', a: 'Yes, we have partners offering monthly and quarterly options.' },
    ],
  },
  'legal-services': {
    title: 'Legal Services',
    tagline: 'Expert legal counsel for every business move.',
    description:
      'Our qualified legal team provides comprehensive advisory services covering mergers & acquisitions, corporate restructuring, financing arrangements, commercial disputes, and regulatory compliance under UAE and international law.',
    icon: Scale,
    image: 'https://images.unsplash.com/photo-1618771623063-6c3faa854a61?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    benefits: [
      'M&A structuring and due diligence',
      'Shareholder and partnership agreements',
      'Dispute resolution and arbitration',
      'Regulatory and compliance advisory',
      'Contract drafting and review',
    ],
    process: [
      { step: 'Initial Consultation', detail: 'We understand your legal needs and assess the complexity of the matter.' },
      { step: 'Strategy & Scoping', detail: 'We define the legal strategy and scope of work.' },
      { step: 'Documentation', detail: 'We draft, review, or advise on all relevant legal documents.' },
      { step: 'Negotiation & Representation', detail: 'We represent your interests in negotiations or proceedings.' },
      { step: 'Closure', detail: 'We ensure all legal matters are concluded and properly documented.' },
    ],
    faqs: [
      { q: 'What legal system does the UAE follow?', a: 'The UAE follows a civil law system with elements of Islamic law. DIFC and ADGM use common law frameworks.' },
      { q: 'Can you represent us in UAE courts?', a: 'We work with licensed UAE advocates for court representation and cover advisory and arbitration directly.' },
      { q: 'Do you handle international commercial contracts?', a: 'Yes, we advise on cross-border contracts and international commercial arrangements.' },
    ],
  },
  'trademark-registration': {
    title: 'Trademark Registration',
    tagline: 'Protect your brand globally.',
    description:
      'Your brand is your most valuable asset. We guide you through trademark registration in the UAE and internationally, safeguarding your intellectual property against infringement and ensuring your brand stands on solid legal ground.',
    icon: Copyright,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'UAE trademark registration (Ministry of Economy)',
      'GCC and international trademark filing',
      'Trademark search and availability checks',
      'Opposition and renewal management',
      'IP portfolio management',
    ],
    process: [
      { step: 'Trademark Search', detail: 'We conduct a comprehensive search to check availability and conflicts.' },
      { step: 'Class Determination', detail: 'We identify the correct Nice Classification classes for your goods/services.' },
      { step: 'Application Filing', detail: 'We file your application with the UAE Ministry of Economy or target jurisdictions.' },
      { step: 'Examination & Opposition', detail: 'We respond to any examination queries or third-party oppositions.' },
      { step: 'Registration Certificate', detail: 'We obtain and deliver your official trademark certificate.' },
    ],
    faqs: [
      { q: 'How long does UAE trademark registration take?', a: 'Typically 12–18 months from application to registration.' },
      { q: 'How long is a UAE trademark valid?', a: 'Registered trademarks are valid for 10 years, renewable indefinitely.' },
      { q: 'Can I file internationally from the UAE?', a: 'Yes, through the Madrid Protocol system, you can file in 130+ countries.' },
    ],
  },
  'health-insurance': {
    title: 'Health Insurance',
    tagline: 'World-class health cover for you and your team.',
    description:
      'We partner with leading global and regional insurance providers to offer tailored health insurance plans for individuals, families, and corporations. From basic compliance cover to comprehensive international plans, we find the right solution for your needs.',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?fm=jpg&q=60&w=2000&auto=format&fit=crop',
    benefits: [
      'Plans from Daman, AXA, Cigna, Bupa & more',
      'Individual, family, and group plans',
      'DHA / HAAD compliant coverage',
      'Inpatient, outpatient & dental options',
      'Dedicated claims support',
    ],
    process: [
      { step: 'Needs Assessment', detail: 'We understand the coverage requirements for you or your employees.' },
      { step: 'Market Comparison', detail: 'We compare plans from multiple insurers to find the best value.' },
      { step: 'Proposal Presentation', detail: 'We present a clear comparison of options and pricing.' },
      { step: 'Policy Issuance', detail: 'We finalize the plan, collect documents, and issue the policy.' },
      { step: 'Ongoing Support', detail: 'We assist with claims, renewals, and plan adjustments.' },
    ],
    faqs: [
      { q: 'Is health insurance mandatory in Dubai?', a: 'Yes, Dubai law requires all residents to have at least basic health insurance (Essential Benefits Plan).' },
      { q: 'Who is responsible for employee health insurance?', a: 'Employers are legally required to provide health insurance to all employees in Dubai.' },
      { q: 'Can I get international coverage?', a: 'Yes, we offer international plans with worldwide coverage including the USA.' },
    ],
  },
};

export default function ServicePage({ params }) {
  const { slug } = use(params);
  const service = services[slug];
  if (!service) notFound();

  const Icon = service.icon;

  // ── Popup state ──────────────────────────────────────────────────────────
  const [isServicePopupOpen, setIsServicePopupOpen] = useState(false);
  const [selectedServiceTrack, setSelectedServiceTrack] = useState('');

  const openPopup = (serviceTitle) => {
    setSelectedServiceTrack(serviceTitle);
    setIsServicePopupOpen(true);
  };

  const relatedServices = Object.entries(services)
    .filter(([s]) => s !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#021a1a] text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={service.image} alt={service.title} fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#021a1a]/60 via-transparent to-[#021a1a]" />
          <div className="absolute top-10 left-10 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]" />
        </div>
        <div className="container mt-30 mx-auto px-6 md:px-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6">
              <Icon size={32} />
            </div>
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-3">{service.tagline}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              {service.title}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">{service.description}</p>
          </motion.div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-teal-400 text-sm font-semibold mt-8 hover:gap-3 transition-all"
          >
            <ArrowLeft size={16} /> Back to Services
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-10">
              Why Choose Us for <span className="text-teal-400">{service.title}</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-colors"
                >
                  <CheckCircle2 size={20} className="text-teal-400 mt-0.5 shrink-0" />
                  <span className="text-slate-200 text-sm leading-relaxed">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12">
              Our <span className="text-teal-400">Process</span>
            </h2>
            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-px bg-teal-500/20 hidden md:block" />
              <div className="space-y-6">
                {service.process.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0 relative z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10">
                      <h3 className="text-white font-bold text-lg mb-1">{item.step}</h3>
                      <p className="text-slate-400 text-sm">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-10">
              Frequently Asked <span className="text-teal-400">Questions</span>
            </h2>
            <div className="space-y-4">
              {service.faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-white font-bold mb-2">{faq.q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to get started with <span className="text-teal-400">{service.title}?</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Speak to one of our specialists today. We respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openPopup(service.title)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-teal-500 hover:bg-teal-400 text-[#021a1a] font-bold transition-colors"
              >
                <Phone size={18} /> Book a Consultation
              </button>
              <a
                href="mailto:info@dnkconsultants.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-colors"
              >
                <Mail size={18} /> Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold mb-8">Other <span className="text-teal-400">Services</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map(([relSlug, s]) => {
              const RelIcon = s.icon;
              return (
                <Link
                  key={relSlug}
                  href={`/services/${relSlug}`}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-all flex flex-col gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <RelIcon size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{s.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{s.tagline}</p>
                  </div>
                  <div className="flex items-center text-teal-400 text-sm font-semibold gap-1 group-hover:gap-2 transition-all mt-auto">
                    Learn More <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Popup */}
      <ServicePopup
        isOpen={isServicePopupOpen}
        onClose={() => setIsServicePopupOpen(false)}
        preselectedService={selectedServiceTrack}
      />
    </div>
  );
}