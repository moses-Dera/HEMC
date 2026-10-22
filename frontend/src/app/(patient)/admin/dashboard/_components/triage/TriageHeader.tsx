'use client';

import React from 'react';
import { SlidersHorizontal, Plus } from 'lucide-react';

interface TriageHeaderProps {
  onAddRule: () => void;
}

export default function TriageHeader({ onAddRule }: TriageHeaderProps) {
  return (
    <div className="p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <SlidersHorizontal className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Clinical Triage Engine
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Triage Rules Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define red-flag clinical conditions, fever duration thresholds, and urgency outcomes that guide AI student triage.
        </p>
      </div>

      <button
        onClick={onAddRule}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 self-start md:self-auto"
      >
        <Plus className="w-4 h-4" /> Add Triage Rule
      </button>
    </div>
  );
}
