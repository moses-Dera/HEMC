'use client';
import Image from 'next/image';
import { Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

const doctors = [
  {
    id: 1,
    name: "Dr. Samuel Okafor",
    specialty: "Chief Medical Officer",
    desc: "Over 15 years of experience in tropical medicine and infectious diseases.",
    image: "/images/doctor1.jpeg"
  },
  {
    id: 2,
    name: "Dr. Emmanuel Chukwu",
    specialty: "General Practitioner",
    desc: "Specializes in student health, preventive care, and health education.",
    image: "/images/doctor2.jpeg"
  }
];

export default function DoctorsSection() {
  return (
    <section id="doctors" className="py-24 bg-white dark:bg-bg-dark border-b border-medical-100 dark:border-medical-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
            Meet Our <span className="text-primary">Specialists</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Our medical team comprises highly trained professionals dedicated to providing the best healthcare for the UNN community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {doctors.map((doc) => (
            <div key={doc.id} className="group relative bg-slate-50 dark:bg-bg-dark-alt rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src={doc.image} 
                  alt={doc.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="flex gap-3 w-full justify-center">
                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-colors">
                      <Mail className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 text-center relative">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{doc.name}</h3>
                <p className="text-sm font-semibold text-primary mb-4">{doc.specialty}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {doc.desc}
                </p>
                <Link href="/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-semibold hover:bg-primary hover:text-white transition-colors gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
