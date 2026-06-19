import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export default function GlassCard({ 
  children, 
  className, 
  hoverEffect = true,
  delay = 0,
  ...props 
}) {
  const baseStyles = 'bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8';
  const hoverStyles = hoverEffect ? 'hover:border-teal-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={twMerge(clsx(baseStyles, hoverStyles, className))}
      {...props}
    >
      {children}
    </motion.div>
  );
}
