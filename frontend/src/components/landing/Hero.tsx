import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden border-b border-medical-100 dark:border-medical-600">
      
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero_showcase.jpeg"
          alt="HEMC Hero Background"
          fill
          priority
          className="object-cover object-[70%_center] md:object-right"
        />
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/70 to-zinc-950/20 md:bg-gradient-to-r md:from-zinc-950/95 md:via-zinc-950/60 md:to-transparent z-10"></div>
        
        {/* Top-down gradient to protect the transparent navbar text */}
        <div className="absolute inset-x-0 top-0 h-32 md:h-40 bg-gradient-to-b from-zinc-950/80 to-transparent z-10"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20 relative z-20 mt-20 md:mt-16">
        <div className="w-full lg:w-2/3 xl:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Typography */}
          <div className="flex flex-col items-center lg:items-start mb-6 md:mb-8">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-medical-200 uppercase mb-2 drop-shadow-md">
              University of Nigeria, Nsukka
            </span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-medical-300"></div>
              <span className="text-xs md:text-sm font-medium text-white drop-shadow-md">
                Medical Portal
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 md:mb-6 drop-shadow-xl">
            Healthcare access, <br className="hidden sm:block" />
            <span className="text-primary-light dark:text-medical-300 text-medical-50">simplified.</span>
          </h1>

          <p className="text-base md:text-xl text-medical-100 mb-8 md:mb-10 max-w-xl leading-relaxed drop-shadow-md">
            Your official digital health companion. Get immediate symptom assessments, manage prescriptions, and schedule physical or teleconsultations seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Access Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-white px-4 drop-shadow-md bg-black/20 rounded-full py-2 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verified & Secure
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
