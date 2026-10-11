import { getTriageRules, getDoctors, getAdminUsers, getDutyShifts, getMe } from '@/lib/api';
import { redirect } from 'next/navigation';
import AdminUsersManagement from './AdminUsersManagement';
import AdminDutyRosterScheduler from './AdminDutyRosterScheduler';
import { ShieldCheck, Stethoscope, SlidersHorizontal, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await getMe();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const [rules, doctors, users, shifts] = await Promise.all([
    getTriageRules(),
    getDoctors(),
    getAdminUsers(),
    getDutyShifts(),
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32 md:pb-12 overflow-y-auto h-full">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Governance
            </span>
            <span className="text-xs text-slate-400">UNN Medical Centre</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage student & staff accounts, schedule weekly doctor duty rosters, and configure clinical AI operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
        </div>
      </div>

      {/* ── 1. Users Table with Pagination & Actions ───────────────────────── */}
      <AdminUsersManagement initialUsers={users} currentUserId={user.id} />

      {/* ── 2. Duty Roster Visual Scheduler ─────────────────────────────────── */}
      <AdminDutyRosterScheduler initialShifts={shifts} doctors={doctors} />

      {/* ── 3. Auxiliary System Management Panels ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Triage Rules Engine Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              Live Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Triage Rules Engine</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Custom rules evaluated against incoming student symptoms to trigger urgent medical centre escalations.
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{rules.length || 0}</span>
            <span className="text-xs text-slate-500">Active rules configured</span>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/[0.04]">
            Rule parameters automatically protect students against persistent vomiting, prolonged fever, and clinical dehydration.
          </div>
        </div>

        {/* Doctor Clinical Roster Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold">
              Clinical Staff
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Doctor Roster & Clinics</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Physicians assigned to consultation queues at the UNN Medical Centre.
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{doctors.length || 0}</span>
            <span className="text-xs text-slate-500">Physicians registered in clinic database</span>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/[0.04]">
            Promoting any user to Doctor in the table above automatically adds them to the clinical queue.
          </div>
        </div>
      </div>
    </div>
  );
}
