'use client';
import { MapPin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-white dark:bg-bg-dark">
      {/* Decorative blurred background elements for modern "liquid" aesthetic */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Column: Intent & Messaging */}
          <div className="flex-1 w-full lg:sticky lg:top-32">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-primary"></div>
              <span className="text-primary font-bold tracking-widest text-xs uppercase">
                Support Center
              </span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-6">
              Let's get you <br /> <span className="text-primary">sorted out.</span>
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
              Immediate triage, general inquiries, or clinical visits. Choose how you'd like to connect with the UNN Medical Centre.
            </p>

            <Link 
              href="/chat" 
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold transition-all hover:scale-105"
            >
              Start AI Triage 
              <span className="bg-white/20 dark:bg-black/10 p-1 rounded-full group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Right Column: Typographic List (No Generic Boxes) */}
          <div className="flex-1 w-full flex flex-col pt-8 lg:pt-0">
            
            {/* List Item 1 */}
            <a href="tel:080086663342" className="group block border-t border-slate-200 dark:border-white/10 py-10 transition-colors hover:border-red-500 dark:hover:border-red-500">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-red-500 transition-colors flex items-center gap-3">
                    Emergency
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Immediate medical assistance</p>
                </div>
                <div className="flex flex-col sm:text-right">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">0800-UNN-MEDIC</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">+234 123 456 7890</span>
                </div>
                <div className="hidden sm:flex items-center justify-center shrink-0 w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all transform group-hover:rotate-45">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </a>

            {/* List Item 2 */}
            <div className="group block border-t border-slate-200 dark:border-white/10 py-10 transition-colors hover:border-primary dark:hover:border-primary cursor-default">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-3">
                    Clinic Visit
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Walk-ins and appointments</p>
                </div>
                <div className="flex flex-col sm:text-right">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">UNN Medical Centre</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">University of Nigeria,<br/>Nsukka, Enugu State</span>
                </div>
                <div className="hidden sm:flex items-center justify-center shrink-0 w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* List Item 3 */}
            <a href="mailto:support@hemc.unn.edu.ng" className="group block border-t border-b border-slate-200 dark:border-white/10 py-10 transition-colors hover:border-primary dark:hover:border-primary">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-3">
                    Email Support
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">General enquiries</p>
                </div>
                <div className="flex flex-col sm:text-right">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">support@hemc.edu.ng</span>
                </div>
                <div className="hidden sm:flex items-center justify-center shrink-0 w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all transform group-hover:rotate-45">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}
