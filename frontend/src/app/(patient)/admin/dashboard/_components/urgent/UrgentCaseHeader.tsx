'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface UrgentCaseHeaderProps {
  metrics: {
    total: number;
    pending: number;
    contacted: number;
    reviewed: number;
  };
}

export default function UrgentCaseHeader({ metrics }: UrgentCaseHeaderProps) {
  return (
    <div className="p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="p-1 rounded-md bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency Escalations
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Urgent Clinical Cases Queue
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time feed of students who triggered red-flag clinical emergencies during AI symptom evaluation.
        </p>
      </div>

      {/* Quick metric pill counts */}
      <div className="flex items-center gap-2 text-xs">
        <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300">
          <span className="font-extrabold text-sm mr-1.5">{metrics.pending}</span>
          <span className="font-medium text-[11px]">Pending Follow-up</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300">
          <span className="font-extrabold text-sm mr-1.5">{metrics.contacted}</span>
          <span className="font-medium text-[11px]">Contacted</span>
        </div>
      </div>
    </div>
  );
}
