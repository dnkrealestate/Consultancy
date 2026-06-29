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
  const baseStyles = 'bg-[#021a1a]/60 !backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8';
  // Border + shadow stay as CSS hover (they aren't transforms, so they work).
  // The lift is handled by framer-motion's whileHover below — NOT a Tailwind
  // `-translate-y` — because framer-motion sets an inline transform that would
  // override any CSS hover transform.
  const hoverStyles = hoverEffect
    ? 'hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { y: -8, transition: { duration: 0.25 } } : undefined}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={twMerge(clsx(baseStyles, hoverStyles, className))}
      {...props}
    >
      {children}
    </motion.div>
  );
}