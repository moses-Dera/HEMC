'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';

interface DoctorHeaderProps {
  doctorName?: string;
  specialization?: string;
  isAvailable: boolean;
  onToggleAvailability: () => void;
}

export default function DoctorHeader({
  doctorName,
  specialization,
  isAvailable,
  onToggleAvailability,
}: DoctorHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shadow-xs">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              {doctorName || 'Medical Officer'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              {specialization || 'General Practitioner'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            UNN Medical Centre — Clinical Consultation Desk &amp; Emergency Triage
          </p>
        </div>
      </div>

      {/* Live Duty Availability Toggle */}
      <div className="flex items-center justify-between md:justify-end gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.04]">
        <div className="text-left md:text-right">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isAvailable ? 'On Duty — Accepting Patients' : 'Off Duty / Unavailable'}
          </div>
          <div className="text-[11px] text-slate-400">
            {isAvailable ? 'Assigned to university queue' : 'New bookings paused'}
          </div>
        </div>
        <button
          onClick={onToggleAvailability}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none cursor-pointer ${
            isAvailable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
              isAvailable ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
