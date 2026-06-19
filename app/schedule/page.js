'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Handles router navigation
import { motion } from 'framer-motion';
import { ChevronDown, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Wed May 20');
  const [selectedTime, setSelectedTime] = useState('09:00 AM - 11:00 AM');

  const dates = [
    { label: 'Wed', day: 'May 20' },
    { label: 'Thu', day: 'May 21' },
    { label: 'Fri', day: 'May 22' },
    { label: 'Sat', day: 'May 23' },
    { label: 'Sun', day: 'May 24' },
  ];

  const times = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Insert your data submission code logic here if needed
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#035c63] relative flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      {/* Visual background layers */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#022f34] z-0" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full z-0" />

      <div className="w-full max-w-2xl relative z-10 my-auto">
        
        {/* --- STATE 1: THANK YOU SUCCESS MESSAGE --- */}
        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={72} className="text-teal-400 animate-bounce" />
            </div>
            
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Thank You!</h2>
            <p className="text-slate-200 text-base max-w-md mx-auto mb-2">
              Your consultation request has been successfully submitted.
            </p>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-sm mx-auto mb-8 text-sm text-teal-200">
              <span className="text-white/50 block mb-1">Confirmed Schedule:</span>
              <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>
            </div>

            <Link
              href="/"
              className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Back to Home
            </Link>
          </motion.div>
        ) : (
          
          /* --- STATE 2: SCHEDULER FORM --- */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 text-white shadow-2xl relative"
          >
            {/* Top Close (X) button triggers page context step back */}
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute right-4 top-4 text-white/60 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">Schedule Meeting</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full h-11 bg-white/5 border border-white/20 rounded-xl px-4 outline-none focus:border-teal-400 transition-colors placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-11 bg-white/5 border border-white/20 rounded-xl px-4 outline-none focus:border-teal-400 transition-colors placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Phone</label>
                <input
                  required
                  type="tel"
                  placeholder="Enter your phone"
                  className="w-full h-11 bg-white/5 border border-white/20 rounded-xl px-4 outline-none focus:border-teal-400 transition-colors placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Select Service</label>
                <div className="relative">
                  <select className="appearance-none w-full h-11 bg-white/5 border border-white/20 rounded-xl px-4 outline-none focus:border-teal-400 text-white transition-colors">
                    <option className="text-slate-900">Company Formation</option>
                    <option className="text-slate-900">Visa Services</option>
                    <option className="text-slate-900">PRO Services</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-1">Select Category</label>
                  <div className="relative">
                    <select className="appearance-none w-full h-11 bg-white/5 border border-white/20 rounded-xl px-4 outline-none focus:border-teal-400 text-white transition-colors">
                      <option className="text-slate-900">Mainland</option>
                      <option className="text-slate-900">Freezone</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 mb-1">Select Subcategory</label>
                  <div className="relative">
                    <select className="appearance-none w-full h-11 bg-white/5 border border-white/20 rounded-xl px-4 outline-none focus:border-teal-400 text-white transition-colors">
                      <option className="text-slate-900">LLC Company</option>
                      <option className="text-slate-900">Sole Establishment</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Horizontal Slider Area */}
              <div>
                <label className="block text-white/70 mb-2">Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {dates.map((d, index) => {
                    const identifier = `${d.label} ${d.day}`;
                    const isSelected = selectedDate === identifier;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDate(identifier)}
                        className={`flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white font-bold'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span>{d.label}</span>
                        <span className="opacity-90">{d.day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-2">Select Time</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {times.map((t, index) => {
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`p-2 rounded-xl text-center text-xs border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white font-bold'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Meeting purpose"
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl outline-none focus:border-teal-400 transition-colors placeholder:text-white/30 resize-none"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/80">
                <p className="font-semibold text-white/50 mb-0.5">Selected Schedule Summary:</p>
                <p>{selectedDate} at {selectedTime}</p>
              </div>

              {/* Form Action triggers */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="h-11 bg-red-700/80 hover:bg-red-700 rounded-xl font-semibold transition-colors text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 bg-white hover:bg-slate-100 rounded-xl font-semibold transition-colors text-[#035c63]"
                >
                  Submit Schedule
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}