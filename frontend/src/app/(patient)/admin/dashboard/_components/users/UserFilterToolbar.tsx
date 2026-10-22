'use client';

import React from 'react';
import { UserCheck, UserPlus, Search, X } from 'lucide-react';

interface UserFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: 'all' | 'student' | 'doctor' | 'admin';
  onRoleFilterChange: (role: 'all' | 'student' | 'doctor' | 'admin') => void;
  onAddUser: () => void;
}

export default function UserFilterToolbar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onAddUser,
}: UserFilterToolbarProps) {
  return (
    <>
      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Users & Role Governance
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage accounts, promote/demote user roles, and assign clinical permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onAddUser}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 md:px-6 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department, or reg number..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: 'all', label: 'All Users' },
              { id: 'student', label: 'Students' },
              { id: 'doctor', label: 'Doctors' },
              { id: 'admin', label: 'Admins' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => onRoleFilterChange(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                roleFilter === filter.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
