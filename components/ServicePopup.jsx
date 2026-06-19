'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  businessCategory: z.string().min(1, 'Please select a business category'),
  businessActivity: z.string().min(1, 'Please select a business activity'),
  shareholders: z.string().min(1, 'Please select options'),
  officeSpace: z.string().min(1, 'Please select a workspace preference'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone is required'),
  companyName: z.string().optional(),
  expertCall: z.string().min(1, 'Required'),
  startLocation: z.string().min(1, 'Required'),
  nationality: z.string().min(1, 'Nationality is required'),
  timeline: z.string().min(1, 'Required')
});

export default function ServicePopup({ isOpen, onClose, preselectedService }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger, setValue, watch, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      businessCategory: 'Professional services', 
      businessActivity: 'Corporate Management',             
      shareholders: '1',
      officeSpace: 'Business Centre',
      name: '',
      email: '',
      phone: '',
      companyName: '',
      expertCall: 'YES',
      startLocation: 'Dubai',
      nationality: '',
      timeline: 'Immediately'
    }
  });

  const formValues = watch();

  // Reset modal state and automatically apply services on click modifications
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsSuccess(false);
      if (preselectedService) {
        setValue('businessCategory', preselectedService);
        // Map logical fallback defaults for custom options
        if (preselectedService === 'Visa Services') {
          setValue('businessActivity', 'Investor / Golden Visa Routing');
          setValue('officeSpace', 'Not Decided');
        } else if (preselectedService === 'Corporate Tax & VAT') {
          setValue('businessActivity', 'Tax Auditing & Registration');
        } else if (preselectedService === 'Bank Account Opening') {
          setValue('businessActivity', 'Corporate Banking KYC Assistance');
        } else {
          setValue('businessActivity', 'General Management Consultancy');
        }
      }
    }
  }, [isOpen, preselectedService, setValue]);

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['businessCategory', 'businessActivity'];
    if (currentStep === 2) fieldsToValidate = ['shareholders', 'officeSpace'];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setCurrentStep((prev) => prev + 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'new' })
      });
      if (response.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#021a1a] border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-500/20 overflow-hidden my-8"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
          <X size={24} />
        </button>

        <div className="p-8">
          {isSuccess ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Configuration Request Saved!</h3>
              <p className="text-slate-400">Our team has logged your configuration framework regarding {formValues.businessCategory}. We will issue a custom quote sheet to your inbox shortly.</p>
              <button type="button" onClick={onClose} className="mt-8 bg-teal-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-400 transition-colors">
                Close Configuration
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3].map((stepIdx) => (
                    <div key={stepIdx} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${stepIdx <= currentStep ? 'bg-teal-500' : 'bg-white/10'}`} />
                  ))}
                </div>
                <div className="bg-teal-950/40 border border-teal-500/20 rounded-xl px-4 py-2 text-xs text-teal-400 inline-block font-mono tracking-wide mb-1">
                  MODULE ID: {formValues.businessCategory.toUpperCase()} CONFIGURATION
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: Custom Configuration Details display based on Selected service card */}
                  {currentStep === 1 && (
                    <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-1">01. Target Service Track Selection</label>
                        <p className="text-xs text-slate-400 mb-3">You selected this service from the primary dashboard catalog route.</p>
                        <input 
                          type="text" 
                          readOnly 
                          className="w-full bg-teal-950/20 border border-teal-500/30 text-teal-300 font-bold rounded-xl p-3 outline-none cursor-default"
                          value={formValues.businessCategory}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">02. Specific Activity Type</label>
                        <select {...register('businessActivity')} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500 cursor-pointer">
                          {preselectedService === 'Visa Services' ? (
                            <>
                              <option value="Golden Visa (10 Years)">Golden Visa Framework (10 Years)</option>
                              <option value="Investor Visa (3 Years)">Investor / Property Visa Route</option>
                              <option value="Corporate Employee Quota">Corporate Employee Visa Processing</option>
                            </>
                          ) : preselectedService === 'Corporate Tax & VAT' ? (
                            <>
                              <option value="VAT Registration & Filing">VAT Registration & Quarterly Filing</option>
                              <option value="Corporate Tax Assessment">Corporate Tax Calculation Compliance</option>
                              <option value="Bookkeeping Services">Monthly Bookkeeping & Management Accounts</option>
                            </>
                          ) : preselectedService === 'Bank Account Opening' ? (
                            <>
                              <option value="Tier-1 Emirates Bank Setup">Tier-1 Digital/Physical Banks (ENBD, FAB, ADCB)</option>
                              <option value="Neo-Banking Setup">Neo/Digital Merchant Gateways (Wio, Mashreq Neo)</option>
                            </>
                          ) : (
                            <>
                              <option value="Standard Dubai Mainland Execution">Standard Dubai Mainland Operations</option>
                              <option value="Freezone Regulatory License Execution">Freezone Regulatory License Setup</option>
                              <option value="General Management Consultancy">General Management Consultancy Processing</option>
                              <option value="Urgent Document Attestation">Urgent Attestation & Ministry Clearances</option>
                            </>
                          )}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Parameters Gathering */}
                  {currentStep === 2 && (
                    <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">03. Operational Stakeholders Involved</label>
                        <select {...register('shareholders')} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500 cursor-pointer">
                          {['1 Person / Solo Enterprise', '2 Partners', '3-4 Members', '5+ Group Stakeholders'].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">04. Corporate Infrastructure & Spatial Requirements</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['Virtual Office', 'Physical Office', 'Business Centre Co-Working', 'Warehouse Space', 'Shop Front Commercial', 'Not Required'].map(space => (
                            <button
                              type="button"
                              key={space}
                              onClick={() => setValue('officeSpace', space, { shouldValidate: true })}
                              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${formValues.officeSpace === space ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
                            >
                              <span className="text-xs font-medium">{space}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Lead Registration Capture Grid */}
                  {currentStep === 3 && (
                    <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                      <h4 className="text-sm font-medium text-teal-400 mb-2">05. Verify your contact details to generate your breakdown analysis report:</h4>
                      
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
                          <label className="block text-xs text-slate-400 mb-1">Phone / WhatsApp*</label>
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
                          <label className="block text-xs text-slate-400 mb-1">Do you need our Experts to Call You ?</label>
                          <select {...register('expertCall')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm">
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Target Launch Territory</label>
                          <select {...register('startLocation')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm">
                            <option value="Dubai">Dubai Mainland / Freezones</option>
                            <option value="Abu Dhabi">Abu Dhabi Mainland</option>
                            <option value="Sharjah">Sharjah / Northern Emirates</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Applicant Nationality</label>
                          <input {...register('nationality')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm" placeholder="e.g. French" />
                          {errors.nationality && <p className="text-red-400 mt-1 text-xs">{errors.nationality.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Execution Timeline</label>
                          <select {...register('timeline')} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 text-sm">
                            <option value="Immediately">Immediately</option>
                            <option value="Next 30 Days">Next 30 Days</option>
                            <option value="Exploratory Phase">Exploratory Phase</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/5">
                  {currentStep > 1 ? (
                    <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium">
                      Back
                    </button>
                  ) : <div />}
                  
                  {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm">
                      Next Step <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-10 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider">
                      {isSubmitting ? 'Saving Framework...' : 'Generate Cost Estimation'}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}