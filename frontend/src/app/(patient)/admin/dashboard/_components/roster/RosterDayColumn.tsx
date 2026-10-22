'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { DutyShiftData } from '@/app/actions/admin';
import ShiftCard from './ShiftCard';

interface WeekDayInfo {
  date: Date;
  isoDate: string;
  dayName: string;
  dayFullName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
}

interface RosterDayColumnProps {
  day: WeekDayInfo;
  dayShifts: DutyShiftData[];
  onOpenAddShift: (dateStr: string) => void;
  onStatusChange: (shiftId: number, newStatus: string) => void;
  onDeleteShift: (shiftId: number) => void;
}

export default function RosterDayColumn({
  day,
  dayShifts,
  onOpenAddShift,
  onStatusChange,
  onDeleteShift,
}: RosterDayColumnProps) {
  return (
    <div
      className={`flex flex-col ${
        day.isToday ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
      }`}
    >
      {/* Column Header */}
      <div
        className={`p-3 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between ${
          day.isToday ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'bg-slate-50/50 dark:bg-slate-800/30'
        }`}
      >
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {day.dayName}
          </div>
          <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            {day.dayNumber}
            {day.isToday && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500 text-white uppercase">
                Today
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onOpenAddShift(day.isoDate)}
          className="w-6 h-6 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
          title={`Schedule shift for ${day.dayFullName}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Column Body: Shift Cards */}
      <div className="p-2 space-y-2 flex-1">
        {dayShifts.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <button
              onClick={() => onOpenAddShift(day.isoDate)}
              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-primary transition text-center cursor-pointer"
            >
              + Add Shift
            </button>
          </div>
        ) : (
          dayShifts.map((shift) => (
            <ShiftCard
              key={shift.shift_id}
              shift={shift}
              onStatusChange={onStatusChange}
              onDeleteShift={onDeleteShift}
              isDesktop={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
