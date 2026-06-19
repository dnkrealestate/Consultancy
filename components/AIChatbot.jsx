'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your setup assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    
    // Simple decision tree bot logic
    setTimeout(() => {
      let botReply = "Please contact our agents on WhatsApp for detailed assistance.";
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('cost') || lowerInput.includes('price')) {
        botReply = "Setup costs start from AED 5,750 for Freezone licenses. For an exact quote, would you like to speak to an expert?";
      } else if (lowerInput.includes('visa')) {
        botReply = "We provide Golden, Investor, and Employment visas. Please provide your phone number so an expert can call you.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botReply = "Hi there! Are you looking for Mainland or Freezone company setup?";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    }, 1000);
    
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 bg-[#021a1a] border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-500/20 overflow-hidden flex flex-col h-96"
          >
            <div className="bg-teal-800 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-bold">DNK Setup Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'bot' ? 'bg-white/10 text-white self-start rounded-tl-none' : 'bg-teal-600 text-white self-end rounded-tr-none'}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/40">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm"
              />
              <button onClick={handleSend} className="text-teal-400 p-2 hover:bg-teal-500/20 rounded-lg">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-110 transition-transform"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
