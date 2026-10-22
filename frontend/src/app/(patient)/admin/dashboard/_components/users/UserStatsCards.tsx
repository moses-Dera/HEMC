'use client';

import React from 'react';
import { Users, GraduationCap, Stethoscope, Shield } from 'lucide-react';

interface UserStatsCardsProps {
  stats: {
    total: number;
    students: number;
    doctors: number;
    admins: number;
  };
}

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Accounts</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
        <p className="text-xs text-slate-400 mt-1">All registered users</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Students</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.students}</div>
        <p className="text-xs text-slate-400 mt-1">Patient community</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Doctors</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.doctors}</div>
        <p className="text-xs text-slate-400 mt-1">Clinical medical staff</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administrators</span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</div>
        <p className="text-xs text-slate-400 mt-1">Management & ICT</p>
      </div>
    </div>
  );
}
