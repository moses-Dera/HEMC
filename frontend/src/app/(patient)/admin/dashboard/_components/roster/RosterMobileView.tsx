'use client';

import React from 'react';
import { Plus, Clock } from 'lucide-react';
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

interface RosterMobileViewProps {
  weekDays: WeekDayInfo[];
  shiftsByDate: Record<string, DutyShiftData[]>;
  activeMobileDayIdx: number;
  onSelectDayIdx: (idx: number) => void;
  onOpenAddShift: (dateStr: string) => void;
  onStatusChange: (shiftId: number, newStatus: string) => void;
  onDeleteShift: (shiftId: number) => void;
}

export default function RosterMobileView({
  weekDays,
  shiftsByDate,
  activeMobileDayIdx,
  onSelectDayIdx,
  onOpenAddShift,
  onStatusChange,
  onDeleteShift,
}: RosterMobileViewProps) {
  const selectedDay = weekDays[activeMobileDayIdx];
  const dayShifts = shiftsByDate[selectedDay.isoDate] || [];

  return (
    <div className="block md:hidden p-4">
      {/* Horizontal Day Tabs */}
      <div className="grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-4">
        {weekDays.map((d, idx) => {
          const isSelected = activeMobileDayIdx === idx;
          const shiftCount = shiftsByDate[d.isoDate]?.length || 0;
          return (
            <button
              key={d.isoDate}
              onClick={() => onSelectDayIdx(idx)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              } ${d.isToday ? 'ring-2 ring-blue-500/30' : ''}`}
            >
              <span className="text-[10px] uppercase">{d.dayName}</span>
              <span className="text-sm font-extrabold mt-0.5">{d.dayNumber}</span>
              {shiftCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Selected Day Shifts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {selectedDay.dayFullName}, {selectedDay.monthName} {selectedDay.dayNumber}
            </h3>
            <p className="text-xs text-slate-400">
              {dayShifts.length} {dayShifts.length === 1 ? 'shift scheduled' : 'shifts scheduled'}
            </p>
          </div>
          <button
            onClick={() => onOpenAddShift(selectedDay.isoDate)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Doctor
          </button>
        </div>

        {dayShifts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold text-slate-500">No shifts scheduled for this day</p>
            <button
              onClick={() => onOpenAddShift(selectedDay.isoDate)}
              className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Assign Doctor on Shift
            </button>
          </div>
        ) : (
          dayShifts.map((shift) => (
            <ShiftCard
              key={shift.shift_id}
              shift={shift}
              onStatusChange={onStatusChange}
              onDeleteShift={onDeleteShift}
              isDesktop={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
