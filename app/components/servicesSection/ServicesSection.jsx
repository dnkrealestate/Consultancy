import { 
  Building2, Users, TrendingUp, FileCheck, Landmark, 
  Briefcase, Scale, Copyright, ShieldCheck, ArrowRight 
} from 'lucide-react';
import Section from '../../../components/ui/Section';
import GlassCard from '../../../components/ui/GlassCard';
import { motion } from 'framer-motion';

export default function OurServicesSection({ onOpenConsultation }) {
  const servicesList = [
    { title: 'Company Formation', desc: 'Mainland, Freezone, and Offshore setup with end-to-end assistance.', icon: Building2 },
    { title: 'Visa Services', desc: 'Golden Visa, Investor Visa, and Employment Visa fast-track processing.', icon: Users },
    { title: 'Corporate Tax & VAT', desc: 'Tax registration, filing, and accounting services to stay compliant.', icon: TrendingUp },
    { title: 'PRO Services', desc: 'Document clearing, labor contracts, and Emirates ID processing.', icon: FileCheck },
    { title: 'Bank Account Opening', desc: 'Hassle-free corporate bank account opening with top UAE banks.', icon: Landmark },
    { title: 'Office Space', desc: 'Premium workspace solutions and Ejari registrations.', icon: Briefcase },
    { title: 'Legal Services', desc: 'Our legal team advises on UAE laws for M&As, restructuring, financing, and disputes.', icon: Scale },
    { title: 'Trademark Registration', desc: 'Protect your brand globally through trademark registration in Dubai.', icon: Copyright },
    { title: 'Health Insurance', desc: 'Get tailored health insurance from the world’s leading companies.', icon: ShieldCheck },
  ];

  return (
    <Section id="services" darker>
      <div className="text-center mb-16">
        <motion.h2 
         initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Our Premium <span className="text-teal-400">Services</span>
        </motion.h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Comprehensive corporate solutions tailored for your ultimate success in the UAE market.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesList.map((service, idx) => (
          <GlassCard 
            key={idx} 
            delay={idx * 0.1} 
            className="group cursor-pointer flex flex-col"
            onClick={() => onOpenConsultation(service.title)}
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
              <service.icon size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
            <p className="text-slate-400 mb-8 flex-grow">{service.desc}</p>
            <div className="flex items-center text-teal-400 font-bold group-hover:gap-3 transition-all">
              Book Configurator <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}