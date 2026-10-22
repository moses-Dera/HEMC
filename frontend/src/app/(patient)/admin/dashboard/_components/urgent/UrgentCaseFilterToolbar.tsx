'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface UrgentCaseFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'pending' | 'contacted' | 'reviewed';
  onStatusFilterChange: (status: 'all' | 'pending' | 'contacted' | 'reviewed') => void;
}

export default function UrgentCaseFilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: UrgentCaseFilterToolbarProps) {
  return (
    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student name, reg number, department..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {(['all', 'pending', 'contacted', 'reviewed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onStatusFilterChange(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer whitespace-nowrap ${
              statusFilter === tab
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'all' ? 'All Urgent Cases' : tab === 'pending' ? 'Needs Attention' : tab}
          </button>
        ))}
      </div>
    </div>
  );
}
