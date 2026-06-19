import { MessageCircle, Phone, Mail, ChevronDown } from 'lucide-react'
import React from 'react'

export default function ContactForm() {
  return (
     <div
          className=" backdrop-blur-xl rounded-[26px] p-8 md:p-14 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
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
                <button className="w-fit px-8 py-4 rounded-xl border border-white/40 hover:bg-white/10 transition-all duration-300 text-white font-semibold flex items-center gap-3">
                  <Phone size={20} />
                  Call Now
                </button>
                <div className="flex items-center gap-3 text-white text-lg">
                  <span>Or contact us right now via</span>
                  <a
                    href="https://wa.me/97145546904"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
                  >
                    <MessageCircle size={22} />
                    WhatsApp
                  </a>
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
        </div>
  )
}
