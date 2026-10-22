'use client';

import React from 'react';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface DoctorOption {
  doctor_id: number;
  user_id: number;
  name?: string;
  email?: string;
  specialization?: string;
  is_available: boolean;
}

interface WeekDayInfo {
  date: Date;
  isoDate: string;
  dayName: string;
  dayFullName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
}

interface RosterHeaderProps {
  doctors: DoctorOption[];
  selectedDoctorFilter: string;
  onDoctorFilterChange: (doctorId: string) => void;
  onPrevWeek: () => void;
  onThisWeek: () => void;
  onNextWeek: () => void;
  onScheduleShift: () => void;
  weekDays: WeekDayInfo[];
}

export default function RosterHeader({
  doctors,
  selectedDoctorFilter,
  onDoctorFilterChange,
  onPrevWeek,
  onThisWeek,
  onNextWeek,
  onScheduleShift,
  weekDays,
}: RosterHeaderProps) {
  return (
    <>
      {/* ── Main Header Bar ── */}
      <div className="p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                UNN Medical Centre Duty Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Schedule and coordinate on-duty physicians for student clinical consultations
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Week Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Doctor Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDoctorFilter}
              onChange={(e) => onDoctorFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800">
                All Doctors
              </option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={String(d.doctor_id)} className="bg-white dark:bg-slate-800">
                  {d.name || `Dr. Specialization ${d.doctor_id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Week Nav Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={onPrevWeek}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onThisWeek}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              This Week
            </button>
            <button
              onClick={onNextWeek}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Shift Button */}
          <button
            onClick={onScheduleShift}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Schedule Shift
          </button>
        </div>
      </div>

      {/* Week Title Subheader */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
        <div>
          Week of{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {weekDays[0].dayFullName}, {weekDays[0].monthName} {weekDays[0].dayNumber}
          </strong>{' '}
          –{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {weekDays[6].dayFullName}, {weekDays[6].monthName} {weekDays[6].dayNumber}
          </strong>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            On Duty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Completed
          </span>
        </div>
      </div>
    </>
  );
}
