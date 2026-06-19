import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  asMotion = false,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 duration-200';
  
  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-500/30',
    secondary: 'bg-white hover:bg-slate-100 text-[#021a1a]',
    ghost: 'glass hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
    danger: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = twMerge(clsx(baseStyles, variants[variant], sizes[size], className));

  if (asMotion) {
    return (
      <motion.button 
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={classes} 
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
