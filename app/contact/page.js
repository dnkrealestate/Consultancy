'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Contact() {
  return (
    <section className="relative overflow-hidden bg-[#035c63] pt-32 pb-24">
      {/* TOP DARK AREA */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[#022f34]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <Image
          src="https://images.unsplash.com/photo-1661630804516-10393c1bb0a8?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Dubai Skyline"
          fill
          className="object-cover opacity-[0.15] mix-blend-overlay"
          priority
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* TOP CONTENT */}
        <div className="max-w-2xl mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-teal-400 font-semibold text-xl"
          >
            Contact Us
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[2rem] md:text-[2.6rem] font-extrabold text-white leading-tight mt-3 mb-3"
          >
            Do you want to start a business in the{' '}
            <span className="text-gradient-gold"> UAE?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-[0.9rem] leading-relaxed max-w-xl"
          >
            Book a free consultation with one of our company formation
            specialists and find out all the information you need about
            starting your own company in the UAE.
          </motion.p>

          {/* BUTTONS */}
          <div className="flex items-center gap-4 mt-8">
            <Link 
              href="/schedule"
              className="px-8 py-4 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-300 text-white font-semibold block"
            >
              Get Started Today
            </Link>

            <Link 
              href="https://wa.me/+971555769195"
              target="_blank"
              className="w-16 h-16 rounded-xl border border-white/30 bg-white/10 hover:bg-green-500 transition-all duration-300 flex items-center justify-center text-white"
            >
              <MessageCircle size={28} />
            </Link>
          </div>
        </div>

        {/* CONTACT CARDS - Now renders on load sequentially */}
        <div className="grid xl:grid-cols-3 gap-7 relative z-20 mb-16">
          {[
            {
              title: 'Location',
              icon: MapPin,
              info: ['Suite No: 303, Sama Building, Al Barsha 1 - Al Barsha, Dubai, United Arab Emirates.'],
            },
            {
              title: 'Phone',
              icon: Phone,
              info: ['+971 55 576 9195', '+971 54 304 9309'],

            },
            {
              title: 'E-Mail',
              icon: Mail,
              info: ['info@dnkconsultants.com', 'career@dnkconsultants.com'],
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-[#dfe4e4] rounded-[28px] p-8 flex md:block xl:flex items-center gap-6 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#0c7b84] flex items-center justify-center text-white">
                  <item.icon size={28} />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#111827] mb-2">
                  {item.title}
                </h3>
                {item.info.map((line, i) => (
                  <p key={i} className="text-[#374151] text-lg leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN CONTACT BOX - Renders immediately on load */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#3f7b84]/90 backdrop-blur-xl rounded-[26px] p-8 md:p-14 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Let&apos;s Talk Together
              </h2>
              <p className="text-slate-200 text-[0.9rem] md:text-lg leading-relaxed max-w-lg mb-14">
                We love to talk with new people. Please take a moment to tell
                us about your dream. Your messages will be responded to within
                one business day.
              </p>
              <div className="flex flex-col gap-5">
                <Link
                  href="tel:+971555769195"
                  className="w-fit px-8 py-4 rounded-xl border border-white/40 hover:bg-white/10 transition-all duration-300 text-white font-semibold flex items-center gap-3"
                >
                  <Phone size={20} />
                  Call Now
                </Link>
                <div className="flex items-center gap-3 text-white text-lg">
                  <span>Or contact us right now via</span>
                  <Link
                    href="https://wa.me/+971555769195"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
                  >
                    <MessageCircle size={22} />
                    WhatsApp
                  </Link>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <input
                type="text"
                placeholder="Full Name*"
                className="w-full h-16 rounded-xl bg-transparent border border-white/40 px-6 text-white placeholder:text-slate-200 outline-none focus:border-teal-300 transition-all"
              />
              <input
                type="email"
                placeholder="Email Address*"
                className="w-full h-16 rounded-xl bg-transparent border border-white/40 px-6 text-white placeholder:text-slate-200 outline-none focus:border-teal-300 transition-all"
              />
              <input
                type="text"
                placeholder="Mobile Number*"
                className="w-full h-16 rounded-xl bg-transparent border border-white/40 px-6 text-white placeholder:text-slate-200 outline-none focus:border-teal-300 transition-all"
              />
              <div className="relative">
                <select className="appearance-none w-full h-16 rounded-xl bg-transparent border border-white/40 px-6 text-white outline-none focus:border-teal-300 transition-all">
                  <option className="text-black">Select Service</option>
                  <option className="text-black">Company Formation</option>
                  <option className="text-black">Visa Services</option>
                  <option className="text-black">PRO Services</option>
                  <option className="text-black">Tax & VAT</option>
                </select>
                <ChevronDown
                  size={22}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                />
              </div>
              <button
                type="submit"
                className="w-full h-16 rounded-xl bg-teal-500 hover:bg-teal-400 transition-all duration-300 text-white font-bold text-lg tracking-wide shadow-lg shadow-teal-900/30"
              >
                SUBMIT
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}