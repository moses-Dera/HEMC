'use client';

import React from 'react';
import { Trash2, Clock } from 'lucide-react';
import { DutyShiftData } from '@/app/actions/admin';

interface ShiftCardProps {
  shift: DutyShiftData;
  onStatusChange: (shiftId: number, newStatus: string) => void;
  onDeleteShift: (shiftId: number) => void;
  isDesktop?: boolean;
}

export function formatTimeSlot(start: string, end: string) {
  const s = String(start).slice(0, 5);
  const e = String(end).slice(0, 5);
  return `${s} – ${e}`;
}

export default function ShiftCard({
  shift,
  onStatusChange,
  onDeleteShift,
  isDesktop = false,
}: ShiftCardProps) {
  const nextStatus =
    shift.status === 'scheduled'
      ? 'on_duty'
      : shift.status === 'on_duty'
      ? 'completed'
      : 'scheduled';

  if (isDesktop) {
    return (
      <div className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-white/[0.08] shadow-xs hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between gap-1">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
            {shift.doctor_name || `Dr. #${shift.doctor_id}`}
          </div>
          <button
            onClick={() => onDeleteShift(shift.shift_id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-0.5 cursor-pointer"
            title="Delete Shift"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 truncate mt-0.5">
          {shift.doctor_specialization || 'Clinical'}
        </div>

        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {formatTimeSlot(shift.start_time, shift.end_time)}
          </span>

          <button
            onClick={() => onStatusChange(shift.shift_id, nextStatus)}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer uppercase ${
              shift.status === 'on_duty'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : shift.status === 'completed'
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
            }`}
            title="Click to toggle status"
          >
            {shift.status.replace('_', ' ')}
          </button>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="p-3.5 rounded-2xl border bg-white dark:bg-slate-800/60 border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
            {shift.doctor_name ? shift.doctor_name.slice(4, 6).toUpperCase() : 'DR'}
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {shift.doctor_name || `Doctor #${shift.doctor_id}`}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {shift.doctor_specialization || 'General Practice'}
            </div>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            shift.status === 'on_duty'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : shift.status === 'completed'
              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
          }`}
        >
          {shift.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatTimeSlot(shift.start_time, shift.end_time)}
        </div>

        <div className="flex items-center gap-2">
          {shift.status !== 'on_duty' && shift.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(shift.shift_id, 'on_duty')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Mark On Duty
            </button>
          )}
          {shift.status === 'on_duty' && (
            <button
              onClick={() => onStatusChange(shift.shift_id, 'completed')}
              className="text-[11px] text-slate-500 font-bold hover:underline cursor-pointer"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => onDeleteShift(shift.shift_id)}
            className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
            title="Remove Shift"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
