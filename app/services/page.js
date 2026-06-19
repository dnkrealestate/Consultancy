'use client';

import GlassCard from '@/components/ui/GlassCard';
import Section from '@/components/ui/Section';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Building2, Landmark, Users, Briefcase, FileCheck, Scale, Copyright, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const servicesList = [
  { title: 'Company Formation',     desc: 'Mainland, Freezone, and Offshore setup with end-to-end assistance.',                  icon: Building2,  slug: 'company-formation'     },
  { title: 'Visa Services',         desc: 'Golden Visa, Investor Visa, and Employment Visa fast-track processing.',               icon: Users,      slug: 'visa-services'         },
  { title: 'Corporate Tax & VAT',   desc: 'Tax registration, filing, and accounting services to stay compliant.',                 icon: TrendingUp, slug: 'corporate-tax-vat'     },
  { title: 'PRO Services',          desc: 'Document clearing, labor contracts, and Emirates ID processing.',                      icon: FileCheck,  slug: 'pro-services'          },
  { title: 'Bank Account Opening',  desc: 'Hassle-free corporate bank account opening with top UAE banks.',                       icon: Landmark,   slug: 'bank-account-opening'  },
  { title: 'Office Space',          desc: 'Premium workspace solutions and Ejari registrations.',                                 icon: Briefcase,  slug: 'office-space'          },
  { title: 'Legal Services',        desc: 'Our legal team advises on UAE laws for M&As, restructuring, financing, and disputes.', icon: Scale,      slug: 'legal-services'        },
  { title: 'Trademark Registration',desc: 'Protect your brand globally through trademark registration in Dubai.',                 icon: Copyright,  slug: 'trademark-registration'},
  { title: 'Health Insurance',      desc: "Get tailored health insurance from the world's leading companies.",                   icon: ShieldCheck,slug: 'health-insurance'      },
];

export default function Services() {
  return (
    <div className="mx-auto min-h-screen">

      {/* Hero */}
      <section className="relative flex items-center pt-20 overflow-hidden bg-[#021a1a]">
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
        <div className="container mx-auto px-6 md:px-12 relative z-10 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <h1 className="text-5xl md:text-[3rem] xl:text-[4rem] font-extrabold mb-6 leading-[1.1] tracking-tight text-center">
              Our <span className="text-teal-400">Services</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed text-center mx-auto">
              Comprehensive corporate solutions tailored for your ultimate success in the UAE market.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <Section id="services" darker>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, idx) => (
            <Link key={idx} href={`/services/${service.slug}`} className="block group">
              <GlassCard  className="cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                  <service.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-slate-400 mb-8 flex-grow">{service.desc}</p>
                <div className="flex items-center text-teal-400 font-bold group-hover:gap-3 transition-all">
                  Learn More <ArrowRight size={18} className="ml-2" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </Section>

    </div>
  );
}