'use client';
import { Stethoscope, CalendarClock, ShieldAlert, HeartPulse, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  { 
    id: 1,
    icon: Stethoscope, 
    title: "AI Symptom Assessment", 
    desc: "Our intelligent triage engine guides your immediate next steps before you even step into the clinic. Understand your symptoms instantly.", 
    className: "md:col-span-2 bg-gradient-to-br from-bg-light to-medical-50 dark:from-bg-dark-alt dark:to-medical-800",
    large: true,
    imageSrc: "/images/Symptom-Checker.webp"
  },
  { 
    id: 2,
    icon: CalendarClock, 
    title: "Instant Scheduling", 
    desc: "Book physical or teleconsultations seamlessly.", 
    className: "md:col-span-1 bg-bg-light dark:bg-bg-dark-alt",
    large: false,
    imageSrc: "/images/instant.jpeg"
  },
  { 
    id: 3,
    icon: HeartPulse, 
    title: "Health Monitoring", 
    desc: "Keep track of your vitals and prescriptions.", 
    className: "md:col-span-1 bg-bg-light dark:bg-bg-dark-alt flex flex-col justify-between",
    large: false,
    imageSrc: "/images/heart_monitoring.jpeg"
  },
  { 
    id: 4,
    icon: ShieldAlert, 
    title: "24/7 Virtual Support", 
    desc: "Get instant, verified answers to your medical queries anytime, anywhere securely.", 
    className: "md:col-span-2 bg-gradient-to-tr from-bg-light to-primary/5 dark:from-bg-dark-alt dark:to-primary/10 flex flex-col justify-between",
    large: true,
    imageSrc: "/images/virtual_support.jpeg"
  }
];

export default function FeaturesGrid() {
  return (
    <section id="services" className="py-24 bg-bg-light-alt dark:bg-bg-dark border-b border-medical-100 dark:border-medical-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-medical-800 dark:text-white tracking-tight mb-6">
              A healthcare experience <br />
              <span className="text-primary">reimagined.</span>
            </h2>
            <p className="text-lg text-medical-600 dark:text-medical-200">
              We've broken away from clunky portals. Access your medical records, speak with doctors, and manage your health journey through a seamless, modern interface.
            </p>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors group">
            View all services
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* BENTO BOX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.id} 
                className={`relative group overflow-hidden border border-medical-50 dark:border-medical-600 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 min-h-[250px] md:min-h-[280px] ${feat.className}`}
              >
                {/* Full Background Image (if present) */}
                {feat.imageSrc && (
                  <>
                    <Image 
                      src={feat.imageSrc} 
                      alt={feat.title} 
                      fill 
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 z-0"
                    />
                    {/* Dark gradient overlay to ensure text is perfectly readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90"></div>
                  </>
                )}

                {/* Content Area */}
                <div className={`p-8 md:p-10 relative z-20 h-full flex flex-col ${feat.imageSrc ? 'justify-end' : ''}`}>
                  <div>
                    <div className={`mb-6 inline-flex items-center justify-center rounded-2xl shadow-sm backdrop-blur-sm ${feat.imageSrc ? 'bg-white/20 border border-white/20' : 'bg-white dark:bg-bg-dark/50 border border-medical-50 dark:border-medical-600'} ${feat.large ? 'w-14 h-14' : 'w-12 h-12'}`}>
                      <Icon className={`${feat.imageSrc ? 'text-white' : 'text-primary'} ${feat.large ? 'w-7 h-7' : 'w-6 h-6'}`} />
                    </div>
                    
                    <h3 className={`font-bold mb-3 ${feat.imageSrc ? 'text-white drop-shadow-md' : 'text-medical-800 dark:text-white'} ${feat.large ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                      {feat.title}
                    </h3>
                    
                    <p className={`leading-relaxed ${feat.imageSrc ? 'text-white/90 drop-shadow-sm' : 'text-medical-600 dark:text-medical-100'} ${feat.large ? 'text-lg max-w-md' : 'text-base'}`}>
                      {feat.desc}
                    </p>
                  </div>
                </div>

                {/* Decorative Element on large cards (without images) */}
                {feat.large && !feat.imageSrc && (
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
