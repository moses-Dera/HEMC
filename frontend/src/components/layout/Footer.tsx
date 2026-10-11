import { Stethoscope } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-bg-light-alt dark:bg-bg-dark border-t border-medical-100 dark:border-medical-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
              <Image src="/logo.jpg" alt="HEMC Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-lg text-medical-800 dark:text-white">HEMC</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-medical-600 dark:text-medical-200">
            <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
          
          <div className="text-sm text-medical-500 dark:text-medical-300">
            © {new Date().getFullYear()} UNN Medical Centre.
          </div>

        </div>
      </div>
    </footer>
  );
}
