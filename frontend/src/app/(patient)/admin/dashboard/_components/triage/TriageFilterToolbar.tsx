'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface TriageFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: 'all' | 'red_flag' | 'duration_threshold';
  onTypeFilterChange: (type: 'all' | 'red_flag' | 'duration_threshold') => void;
  outcomeFilter: 'all' | 'urgent' | 'book' | 'self_care';
  onOutcomeFilterChange: (outcome: 'all' | 'urgent' | 'book' | 'self_care') => void;
}

export default function TriageFilterToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  outcomeFilter,
  onOutcomeFilterChange,
}: TriageFilterToolbarProps) {
  return (
    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search symptoms or slug..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        <select
          value={typeFilter}
          onChange={(e: any) => onTypeFilterChange(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="all">All Condition Types</option>
          <option value="red_flag">Red Flag Symptoms</option>
          <option value="duration_threshold">Duration Thresholds</option>
        </select>

        <select
          value={outcomeFilter}
          onChange={(e: any) => onOutcomeFilterChange(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="all">All Urgency Outcomes</option>
          <option value="urgent">Urgent Escalation</option>
          <option value="book">Book Appointment</option>
          <option value="self_care">Self Care Only</option>
        </select>
      </div>
    </div>
  );
}
