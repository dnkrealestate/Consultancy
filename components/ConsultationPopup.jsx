'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  businessCategory: z.string().min(1, 'Please select a business category'),
  businessActivity: z.string().min(1, 'Please select a business activity'),
  shareholders: z.string().min(1, 'Please select the number of owners/shareholders'),
  officeSpace: z.string().min(1, 'Please select an office space preference'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone is required'),
  companyName: z.string().optional(),
  expertCall: z.string().min(1, 'Required'),
  startLocation: z.string().min(1, 'Required'),
  nationality: z.string().min(1, 'Required'),
  timeline: z.string().min(1, 'Required'),
});

const steps = [
  { id: 1, title: '01. Select your business category & 02. Activity' },
  { id: 2, title: '03. Shareholders & 04. Office Space' },
  { id: 3, title: '05. Please provide your information' },
];

// ─── SERVICE OPTIONS ────────────────────────────────────────────────────────
// Shown at the top of the popup so the lead's service is always captured.
const SERVICE_OPTIONS = [
  'Mainland License',
  'Free Zone License',
  'Offshore License',
  'Company Formation',
  'Visa Services',
  'Corporate Tax & VAT',
  'PRO Services',
  'Bank Account Opening',
  'Legal Services',
  'Trademark Registration',
  'Health Insurance',
  'General Consultation',
];

export default function ConsultationPopup({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Service selection (NEW — captured before step 1) ──────────────────────
  const [selectedService, setSelectedService] = useState('');
  const [serviceStep, setServiceStep] = useState(true); // show service picker first

  const { register, handleSubmit, formState: { errors }, trigger, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      businessCategory: 'Professional services',
      businessActivity: 'Please Select...',
      shareholders: '5',
      officeSpace: 'Business Centre',
      name: '',
      email: '',
      phone: '',
      companyName: '',
      expertCall: 'YES',
      startLocation: 'Dubai',
      nationality: 'Dubai',
      timeline: '2-3 Months',
    },
  });

  const formData = watch();

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['businessCategory', 'businessActivity'];
    if (currentStep === 2) fieldsToValidate = ['shareholders', 'officeSpace'];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setCurrentStep((prev) => prev + 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          service: selectedService || 'General Consultation',
          status: 'new',
        }),
      });
      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Connection error. Please check your internet and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset all state when closing
  const handleClose = () => {
    onClose();
    // Small delay so the animation completes before resetting
    setTimeout(() => {
      setCurrentStep(1);
      setServiceStep(true);
      setSelectedService('');
      setIsSuccess(false);
      setSubmitError('');
    }, 300);
  };

  if (!isOpen) return null;

  // ── Total steps including service picker ──────────────────────────────────
  const totalVisualSteps = steps.length + 1; // service + 3 form steps
  const currentVisualStep = serviceStep ? 1 : currentStep + 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#021a1a] border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-500/20 overflow-hidden my-8"
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />

        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          <X size={16} />
        </button>

        <div className="p-8">
          {/* ── SUCCESS STATE ── */}
          {isSuccess ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-500/30">
                <CheckCircle2 size={40} className="text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Registration Estimate Sent!</h3>
              <p className="text-slate-400">
                We've received your enquiry for{' '}
                <span className="text-teal-400 font-semibold">{selectedService || 'our services'}</span>.
                A copy of the estimate has been sent to your inbox.
              </p>
              <button onClick={handleClose} className="mt-8 bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-400 transition-colors">
                Close
              </button>
            </motion.div>
          ) : (
            <>
              {/* ── PROGRESS BAR ── */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  {Array.from({ length: totalVisualSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i + 1 <= currentVisualStep ? 'bg-teal-500' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Step {currentVisualStep} of {totalVisualSteps}
                  {selectedService && (
                    <span className="ml-2 text-teal-400 font-medium">· {selectedService}</span>
                  )}
                </p>
              </div>

              {/* ── SERVICE PICKER STEP (step 0) ── */}
              {serviceStep && (
                <motion.div key="service-step" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                  <h3 className="text-xl font-bold text-white mb-1">What service are you looking for?</h3>
                  <p className="text-slate-400 text-sm mb-6">Select the service that best describes your needs.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {SERVICE_OPTIONS.map((svc) => (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className={`p-3 rounded-xl border text-sm font-medium text-left transition-all leading-snug ${
                          selectedService === svc
                            ? 'border-teal-500 bg-teal-500/15 text-teal-300'
                            : 'border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => selectedService && setServiceStep(false)}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                      selectedService
                        ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* ── FORM STEPS 1–3 ── */}
              {!serviceStep && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">

                    {/* STEP 1 */}
                    {currentStep === 1 && (
                      <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-white mb-3">01. Select your business category</label>
                          <div className="flex flex-wrap gap-3">
                            {['Trading', 'Manufacturing', 'Professional services'].map((cat) => (
                              <label key={cat} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${formData.businessCategory === cat ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}>
                                <input type="radio" checked={formData.businessCategory === cat} onChange={() => setValue('businessCategory', cat)} className="accent-teal-500 w-4 h-4" />
                                <span className="text-sm font-medium">{cat}</span>
                              </label>
                            ))}
                          </div>
                          {errors.businessCategory && <p className="text-red-400 mt-2 text-sm">{errors.businessCategory.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">02. Choose your business activity</label>
                          <select {...register('businessActivity')} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500 appearance-none cursor-pointer">
                            {['Please Select...','Agriculture','Apparel','Banking','Biotechnology','Business Accelerator','Chemicals','Communications','Construction','Consulting','Education','Electronics','Energy','Engineering','Entertainment','Environmental','Finance','Food & Beverage','Government','Healthcare','Hospitality','Insurance','Machinery','Manufacturing','Marketing','Media','Non Profit','Private Equity','Publishing','Recreation','Recruitment','Retail','Salesforce Consultants','Shipping','Sports Management','Technology','Telecommunications','Transportation','Utilities','Venture Capital','Others'].map((activity) => (
                              <option key={activity} value={activity}>{activity}</option>
                            ))}
                          </select>
                          {errors.businessActivity && <p className="text-red-400 mt-2 text-sm">{errors.businessActivity.message}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                      <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">03. How many owners/shareholders?</label>
                          <select {...register('shareholders')} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500 appearance-none cursor-pointer">
                            {['1', '2', '3', '4', '5', '5+'].map((num) => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                          {errors.shareholders && <p className="text-red-400 mt-2 text-sm">{errors.shareholders.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-white mb-3">04. What type of office space do you prefer?</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {['Virtual Office', 'Warehouse', 'Business Centre', 'Physical Office', 'Shared Office', 'Shop Front', 'Not Decided', 'Other'].map((space) => (
                              <label key={space} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.officeSpace === space ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}>
                                <input type="radio" checked={formData.officeSpace === space} onChange={() => setValue('officeSpace', space)} className="accent-teal-500 w-4 h-4" />
                                <span className="text-xs font-medium whitespace-nowrap">{space}</span>
                              </label>
                            ))}
                          </div>
                          {errors.officeSpace && <p className="text-red-400 mt-2 text-sm">{errors.officeSpace.message}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                      <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                        <h4 className="text-sm font-semibold text-teal-400 mb-2">
                          05. Please provide your information so we can send a copy of the estimate to your inbox
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Name*</label>
                            <input {...register('name')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm" placeholder="Your Name" />
                            {errors.name && <p className="text-red-400 mt-1 text-xs">{errors.name.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Email*</label>
                            <input {...register('email')} type="email" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm" placeholder="email@address.com" />
                            {errors.email && <p className="text-red-400 mt-1 text-xs">{errors.email.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Phone*</label>
                            <input {...register('phone')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm" placeholder="+971..." />
                            {errors.phone && <p className="text-red-400 mt-1 text-xs">{errors.phone.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Company (Optional)</label>
                            <input {...register('companyName')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm" placeholder="Optional" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Do you need our experts to call you?</label>
                            <select {...register('expertCall')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm appearance-none">
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">I want to start in?</label>
                            <select {...register('startLocation')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm appearance-none">
                              <option value="Dubai">Dubai</option>
                              <option value="Abu Dhabi">Abu Dhabi</option>
                              <option value="Sharjah">Sharjah</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Nationality</label>
                            <input {...register('nationality')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm" />
                            {errors.nationality && <p className="text-red-400 mt-1 text-xs">{errors.nationality.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">When do you plan to start?</label>
                            <select {...register('timeline')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm appearance-none">
                              <option value="Immediately">Immediately</option>
                              <option value="2-3 Months">2-3 Months</option>
                              <option value="6 Months+">6 Months+</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── FOOTER CONTROLS ── */}
                  {submitError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <span className="mt-0.5 shrink-0">⚠</span>
                      <span>{submitError}</span>
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => currentStep === 1 ? setServiceStep(true) : setCurrentStep((p) => p - 1)}
                      className="px-6 py-3 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                      Back
                    </button>

                    {currentStep < 3 ? (
                      <button type="button" onClick={handleNext}
                        className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 text-sm">
                        Next Step <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button type="submit" disabled={isSubmitting}
                        className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg text-sm tracking-wide uppercase">
                        {isSubmitting ? 'Processing...' : 'Send Request'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}