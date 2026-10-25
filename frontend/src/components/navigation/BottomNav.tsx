'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageCircle, Clock, User, ShieldCheck, Stethoscope } from 'lucide-react';

export default function BottomNav({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Track scroll on the main scrollable containers
      if (target.classList?.contains('overflow-y-auto')) {
        const currentScrollY = target.scrollTop;
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
          setIsVisible(false); // Scrolling down
        } else {
          setIsVisible(true);  // Scrolling up
        }
        lastScrollY = currentScrollY;
      }
    };
    
    // Use capture phase to catch scroll events from any container
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (userRole === 'admin') {
    navItems.push({ name: 'Admin', href: '/admin/dashboard', icon: ShieldCheck });
    navItems.push({ name: 'Doctor', href: '/doctor/dashboard', icon: Stethoscope });
  }
  if (userRole === 'doctor') {
    navItems.push({ name: 'Doctor', href: '/doctor/dashboard', icon: Stethoscope });
  }

  return (
    <>
      {/* Background fade - also hides when nav hides */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-bg-light-alt via-bg-light-alt/90 to-transparent dark:from-bg-dark dark:via-bg-dark/90 pointer-events-none z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      
      {/* Navigation bar */}
      <div 
        className={`md:hidden fixed left-0 right-0 z-50 flex justify-center px-5 pointer-events-none transition-all duration-300 ease-in-out ${
          isVisible ? 'bottom-5 translate-y-0 opacity-100' : '-bottom-5 translate-y-full opacity-0'
        }`}
      >
        <nav className="bg-white/70 dark:bg-[#1a1c23]/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2rem] px-3 py-2 flex items-center justify-between w-full max-w-lg overflow-x-auto gap-2 pointer-events-auto border border-slate-200/50 dark:border-white/10 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-label={item.name}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
