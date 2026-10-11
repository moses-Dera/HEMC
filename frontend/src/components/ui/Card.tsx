'use client';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
  children: React.ReactNode;
}

export default function Card({ glass = false, children, className = '', ...props }: CardProps) {
  const baseClasses = "rounded-3xl p-6 shadow-sm border";
  const glassClasses = "bg-glass-bg border-glass-border backdrop-blur-md shadow-md";
  const solidClasses = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${baseClasses} ${glass ? glassClasses : solidClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
