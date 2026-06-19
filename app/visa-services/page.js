export default function VisaServices() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 min-h-screen text-center">
      <h1 className="text-5xl font-bold text-white mb-6">Visa <span className="text-teal-400">Services</span></h1>
      <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-12">
        Secure your residency in the UAE with our expert visa processing services.
      </p>
      <div className="grid md:grid-cols-3 gap-6 text-left">
        {['Golden Visa', 'Investor Visa', 'Employment Visa', 'Family Visa', 'Freelance Visa', 'Visit Visa'].map(s => (
          <div key={s} className="glass-card p-6 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-2">{s}</h3>
            <p className="text-slate-400 text-sm">Fast-track processing and document clearing.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
