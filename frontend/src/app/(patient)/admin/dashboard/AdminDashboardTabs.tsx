'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Calendar, 
  SlidersHorizontal, 
  LayoutDashboard 
} from 'lucide-react';
import AdminUrgentCasesQueue from './AdminUrgentCasesQueue';
import AdminUsersManagement from './AdminUsersManagement';
import AdminDutyRosterScheduler from './AdminDutyRosterScheduler';
import AdminTriageRulesManager from './AdminTriageRulesManager';
import { TriageRuleData, AdminUserData, DutyShiftData, AdminUrgentCheckData } from '@/app/actions/admin';

interface DoctorOption {
  doctor_id: number;
  user_id: number;
  name?: string;
  email?: string;
  specialization?: string;
  is_available: boolean;
}

interface AdminDashboardTabsProps {
  urgentCases: AdminUrgentCheckData[];
  users: AdminUserData[];
  currentUserId?: number;
  shifts: DutyShiftData[];
  doctors: DoctorOption[];
  rules: TriageRuleData[];
}

type TabType = 'overview' | 'urgent' | 'users' | 'roster' | 'triage';

export default function AdminDashboardTabs({
  urgentCases,
  users,
  currentUserId,
  shifts,
  doctors,
  rules,
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const pendingUrgentCount = urgentCases.filter(
    (c) => !c.contacted || !c.reviewed
  ).length;

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'All Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'urgent' as TabType,
      label: 'Urgent Queue',
      icon: ShieldAlert,
      badge: pendingUrgentCount > 0 ? pendingUrgentCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'users' as TabType,
      label: 'Users & Roles',
      icon: Users,
      badge: users.length,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'roster' as TabType,
      label: 'Duty Roster',
      icon: Calendar,
      badge: shifts.length,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'triage' as TabType,
      label: 'Triage Engine',
      icon: SlidersHorizontal,
      badge: rules.length,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Views ────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <AdminUrgentCasesQueue initialCases={urgentCases} />
          <AdminUsersManagement initialUsers={users} currentUserId={currentUserId} />
          <AdminDutyRosterScheduler initialShifts={shifts} doctors={doctors} />
          <AdminTriageRulesManager initialRules={rules} />
        </div>
      )}

      {activeTab === 'urgent' && (
        <div className="animate-in fade-in duration-200">
          <AdminUrgentCasesQueue initialCases={urgentCases} />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-200">
          <AdminUsersManagement initialUsers={users} currentUserId={currentUserId} />
        </div>
      )}

      {activeTab === 'roster' && (
        <div className="animate-in fade-in duration-200">
          <AdminDutyRosterScheduler initialShifts={shifts} doctors={doctors} />
        </div>
      )}

      {activeTab === 'triage' && (
        <div className="animate-in fade-in duration-200">
          <AdminTriageRulesManager initialRules={rules} />
        </div>
      )}
    </div>
  );
}
