import BottomNav from '@/components/navigation/BottomNav';
import Sidebar from '@/components/navigation/Sidebar';
import { Toaster } from 'sonner';
import NotificationBell from '@/components/ui/NotificationBell';
import { getMe } from '@/lib/api';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  
  if (!user) {
    redirect('/login');
  }

  const role = user.role;

  return (
    <div className="h-screen bg-bg-light-alt dark:bg-bg-dark flex overflow-hidden">
      {/* Fixed sidebar — desktop only */}
      <Sidebar userRole={role} />

      {/* Main content — fills remaining space after sidebar */}
      <main className="flex-1 md:ml-64 overflow-hidden bg-bg-light-alt dark:bg-bg-dark flex flex-col relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-white/[0.06] shrink-0 bg-white dark:bg-bg-dark-alt">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-white">
              <Image src="/logo.jpg" alt="HEMC Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white">HEMC</span>
          </Link>
          <NotificationBell />
        </div>

        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav userRole={role} />

      <Toaster position="top-right" richColors />
    </div>
  );
}
