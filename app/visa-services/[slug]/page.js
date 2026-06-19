import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Section from '../../../components/ui/Section';
import GlassCard from '../../../components/ui/GlassCard';
import Button from '../../../components/ui/Button';

const getVisa = (slug) => {
  const visas = {
    'golden-visa': {
      title: 'UAE Golden Visa',
      desc: '10-Year Long Term Residency for Investors, Entrepreneurs, and Talented Individuals.',
      benefits: ['10-year renewable visa', 'No sponsor required', 'Can sponsor family members', 'Stay outside UAE for > 6 months'],
      requirements: ['Minimum 2M AED property investment OR', 'Deposit 2M AED in UAE Investment Fund OR', 'Exceptional talent approval from respective ministry']
    },
    'freelance-visa': {
      title: 'Freelance Visa & Permit',
      desc: 'Work as an independent contractor in Dubai legally with a 2-year renewable visa.',
      benefits: ['Legally invoice clients', 'Open personal & corporate bank accounts', 'Sponsor dependents', 'Flexible working'],
      requirements: ['Passport copy', 'NOC from current sponsor (if any)', 'Proof of relevant experience/degree', 'Business plan or portfolio']
    }
  };
  return visas[slug];
};

export default function VisaDetail({ params }) {
  const visa = getVisa(params.slug);
  
  if (!visa) return notFound();

  return (
    <>
      <Section className="pt-32 pb-16 bg-[#021a1a]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-teal-400 font-bold mb-4 uppercase tracking-widest">Visa Services</div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">{visa.title}</h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">{visa.desc}</p>
            <Button size="lg" className="w-full sm:w-auto">Check Your Eligibility</Button>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000" alt={visa.title} fill className="object-cover" />
          </div>
        </div>
      </Section>

      <Section darker>
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Visa Benefits</h2>
            <div className="grid gap-6">
              {visa.benefits.map((benefit, i) => (
                <GlassCard key={i} className="p-6 flex items-start gap-4 border-gold-500/20">
                  <CheckCircle2 className="text-gold-400 shrink-0" size={24} />
                  <span className="text-white text-lg font-medium">{benefit}</span>
                </GlassCard>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Eligibility Requirements</h2>
            <div className="space-y-6">
              {visa.requirements.map((req, i) => (
                <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <p className="text-slate-300 font-medium">{req}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 glass p-8 rounded-2xl border border-teal-500/30 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Start Your Application</h3>
              <p className="text-slate-400 mb-6">Our PRO team handles all typing, medical bookings, and Emirates ID processing.</p>
              <Button className="w-full">Get Started <ArrowRight size={18} className="ml-2" /></Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
