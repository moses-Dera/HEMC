'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DoctorShift {
  shift_id: number;
  doctor_id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface DoctorDutyRosterCardProps {
  shifts?: DoctorShift[];
}

export default function DoctorDutyRosterCard({ shifts }: DoctorDutyRosterCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Duty Schedule &amp; Clinic Roster
        </h3>
        <span className="text-xs text-slate-400">UNN Medical Centre Timetable</span>
      </div>

      {shifts && shifts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {shifts.map((shift) => (
            <div
              key={shift.shift_id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {shift.start_time} - {shift.end_time}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Date:{' '}
                  {new Date(shift.shift_date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  shift.status === 'on_duty'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                }`}
              >
                {shift.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-400">
          No active shift roster recorded for this week. Contact UNN Medical Centre Admin for shift scheduling.
        </div>
      )}
    </div>
  );
}
