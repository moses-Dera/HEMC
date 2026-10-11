'use client';
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 w-full z-50 px-0 md:px-4 flex justify-center transition-all duration-300 ease-in-out pointer-events-none">
      <nav 
        className={`pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden
          ${isScrolled 
            ? 'mt-4 w-[95%] md:w-[80%] max-w-5xl rounded-full bg-white/80 dark:bg-bg-card-dark/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg dark:shadow-black/50' 
            : 'mt-0 w-full rounded-none bg-transparent border-b border-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-sm bg-white">
              <Image src="/logo.jpg" alt="HEMC Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">HEMC</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Services</Link>
            <Link href="#doctors" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Doctors</Link>
            <Link href="#contact" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Contact</Link>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              aria-label="Toggle Theme"
            >
              {mounted && theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:border-white/10 mx-2"></div>
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors rounded-full shadow-sm">
              Log In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-bg-dark-alt">
          <div className="px-4 pt-4 pb-6 space-y-1">
            <Link href="#services" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Services</Link>
            <Link href="#doctors" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Doctors</Link>
            <Link href="#contact" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Contact</Link>
            <div className="pt-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl text-base font-semibold text-white bg-primary hover:bg-primary-hover transition-colors">
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
    </header>
  );
}
