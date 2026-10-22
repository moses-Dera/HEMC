'use client';

import React from 'react';
import { Users, Clock, Calendar, CheckCircle } from 'lucide-react';

interface DoctorKPICardsProps {
  totalCount: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
}

export default function DoctorKPICards({
  totalCount,
  pendingCount,
  confirmedCount,
  completedCount,
}: DoctorKPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Consultations</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</div>
        <p className="text-xs text-slate-400 mt-1">Assigned to your care</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Review</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
        <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Confirmed Queue</span>
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-blue-500">{confirmedCount}</div>
        <p className="text-xs text-slate-400 mt-1">Scheduled visits</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Cases</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-emerald-500">{completedCount}</div>
        <p className="text-xs text-slate-400 mt-1">Treated &amp; discharged</p>
      </div>
    </div>
  );
}
