'use client';

import { useState, useTransition } from 'react';
import {
  Stethoscope,
  Video,
  Shield,
  HeartPulse,
  Pill,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  PhoneCall,
  Bell,
  Bot,
  User
} from 'lucide-react';
import Link from 'next/link';
import { bookAppointmentAction } from '@/lib/appointmentActions';

interface Doctor {
  doctor_id: number;
  user_id: number;
  name?: string | null;
  specialization: string;
  is_available: boolean;
}

interface Appointment {
  appointment_id: number;
  user_id: number;
  appointment_date: string;
  status: string;
  created_at: string;
}

interface DashboardClientProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string | null;
    level?: string | null;
  };
  doctors: Doctor[];
  appointments: Appointment[];
}

export default function DashboardClient({ user, doctors, appointments }: DashboardClientProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(
    doctors.length > 0 ? doctors[0].doctor_id : 1
  );
  const [isPending, startTransition] = useTransition();
  const [bookingStatus, setBookingStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const features = [
    { name: 'Symptom Checker', icon: Stethoscope, href: '/chat', desc: 'AI Triage & Urgency' },
    { name: 'Consult Doctor', icon: Video, href: '#booking-section', desc: 'Book Clinic Visit' },
    { name: 'WHO/NCDC Education', icon: Shield, href: '/chat', desc: 'Malaria & Typhoid' },
    { name: 'Health Monitoring', icon: HeartPulse, href: '/history', desc: 'Consultation Logs' },
    { name: 'Medication Reminders', icon: Pill, href: '/history', desc: 'Treatment Alerts' },
    { name: 'Clinic Reports', icon: FileText, href: '/history', desc: 'Appointment Slips' },
  ];

  const handleBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingStatus(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await bookAppointmentAction(formData);
      if (res?.error) {
        setBookingStatus({ type: 'error', text: res.error });
      } else {
        setBookingStatus({ type: 'success', text: 'Appointment booked successfully with UNN Medical Centre!' });
      }
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const upcomingApts = appointments.filter(a => a.status !== 'cancelled');

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin w-full p-6 pb-28 md:p-8 md:pb-8 flex flex-col gap-7">

      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hello, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            UNN Medical Centre Portal • {user.department || 'General Medicine'} {user.level ? `(${user.level}L)` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors"
          >
            Launch AI Triage <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Desktop Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">

        {/* LEFT COLUMN: Hero Banner, Features, & Appointment Booking (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* AI Consultation Hero Card */}
          <Link
            href="/chat"
            className="group relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 block"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg md:text-xl leading-tight">
                    Check Symptoms with AI Health Assistant
                  </h2>
                  <p className="text-medical-100 text-xs md:text-sm mt-1">
                    WHO & NCDC verified malaria & typhoid triage guidance available 24/7.
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </div>
            {/* Ambient blur accents */}
            <div className="absolute top-[-50%] right-[-10%] w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-50%] left-[-10%] w-40 h-40 bg-black/20 rounded-full blur-xl pointer-events-none" />
          </Link>

          {/* Features Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Healthcare Features</h3>
              <span className="text-xs text-slate-400">UNN Medical Services</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={i}
                    href={feature.href}
                    className="flex flex-col items-start p-4 bg-white dark:bg-bg-card-dark rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-3">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {feature.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {feature.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Real Appointment Scheduling Form */}
          <div id="booking-section" className="bg-white dark:bg-bg-card-dark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Schedule a Doctor's Appointment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Book a consultation slot with verified on-duty physicians at UNN Medical Centre.
                </p>
              </div>
            </div>

            {bookingStatus && (
              <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${bookingStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                {bookingStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {bookingStatus.text}
              </div>
            )}

            <form onSubmit={handleBook} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select On-Duty Doctor
                  </label>
                  <select
                    name="doctor_id"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>
                        {doc.name || `Dr. Specialization ${doc.doctor_id}`} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="appointment_date"
                    required
                    defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {isPending ? 'Confirming Appointment...' : 'Confirm Appointment Booking'}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Upcoming Appointments, On-Duty Doctors, Hotline (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Upcoming Appointments Card */}
          <div className="bg-white dark:bg-bg-card-dark rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                My Upcoming Consultations
              </h3>
              <Link href="/history?tab=appointments" className="text-xs text-primary hover:underline font-semibold">
                View All
              </Link>
            </div>

            {upcomingApts.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No pending visits scheduled.</p>
                <p className="text-[11px] mt-0.5">Use the scheduler to reserve a consultation slot.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingApts.slice(0, 3).map((apt) => (
                  <div
                    key={apt.appointment_id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        UNN Medical Centre Consult
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDate(apt.appointment_date)}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* On-Duty Doctors List */}
          <div className="bg-white dark:bg-bg-card-dark rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              On-Duty Medical Staff
            </h3>

            <div className="flex flex-col gap-3">
              {doctors.map((doc) => (
                <div
                  key={doc.doctor_id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {doc.name || `Dr. Specialization ${doc.doctor_id}`}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {doc.specialization}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    Available
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Hotline Card */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <PhoneCall className="w-4 h-4 text-red-500" />
              UNN Nsukka Campus Medical Hotline
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If experiencing high fever with confusion, convulsions, or severe shortness of breath, report immediately to the triage desk.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-primary pt-2 border-t border-slate-200/60 dark:border-white/10">
              <span>Emergency Reception</span>
              <span>+234 (0) 42 771 911</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
