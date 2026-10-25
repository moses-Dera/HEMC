'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageCircle, Clock, User, LogOut, ShieldCheck, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import { logout } from '@/lib/auth';
import NotificationBell from '@/components/ui/NotificationBell';

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Chatbot', href: '/chat', icon: MessageCircle },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (userRole === 'admin') {
    navItems.push({ name: 'System Admin', href: '/admin/dashboard', icon: ShieldCheck });
    navItems.push({ name: 'Doctor Panel', href: '/doctor/dashboard', icon: Stethoscope });
  }
  if (userRole === 'doctor') {
    navItems.push({ name: 'Doctor Panel', href: '/doctor/dashboard', icon: Stethoscope });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-bg-dark-alt border-r border-slate-100 dark:border-white/[0.06] z-50">
      
      {/* Logo and Notifications Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-white shadow-sm">
            <Image src="/logo.jpg" alt="HEMC Logo" width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">HEMC</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                isActive 
                  ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] shrink-0">
        <form action={logout}>
          <button 
            type="submit"
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all duration-200 font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>

    </aside>
  );
}
