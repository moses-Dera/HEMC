'use client';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all outline-none";
  const variants = {
    primary: "bg-sapphire-500 text-white hover:bg-sapphire-600",
    secondary: "bg-transparent text-sapphire-500 border border-sapphire-500 hover:bg-sapphire-50",
    ghost: "bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
