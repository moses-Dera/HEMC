import { 
  getTriageRules, 
  getDoctors, 
  getAdminUsers, 
  getDutyShifts, 
  getUrgentSymptomChecks, 
  getMe 
} from '@/lib/api';
import { redirect } from 'next/navigation';
import AdminUsersManagement from './AdminUsersManagement';
import AdminDutyRosterScheduler from './AdminDutyRosterScheduler';
import AdminTriageRulesManager from './AdminTriageRulesManager';
import AdminUrgentCasesQueue from './AdminUrgentCasesQueue';
import { ShieldCheck, Stethoscope, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await getMe();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const [rules, doctors, users, shifts, urgentCases] = await Promise.all([
    getTriageRules(),
    getDoctors(),
    getAdminUsers(),
    getDutyShifts(),
    getUrgentSymptomChecks(),
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
            Track emergency triage escalations, manage user accounts, schedule doctor rosters, and configure clinical AI rules.
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

      {/* ── 1. Urgent Cases & Clinical Escalations Queue ────────────────────── */}
      <AdminUrgentCasesQueue initialCases={urgentCases} />

      {/* ── 2. Users Table with Pagination & Role Management ───────────────── */}
      <AdminUsersManagement initialUsers={users} currentUserId={user.id} />

      {/* ── 3. Doctor Duty Roster Visual Scheduler ─────────────────────────── */}
      <AdminDutyRosterScheduler initialShifts={shifts} doctors={doctors} />

      {/* ── 4. Interactive Triage Rules Configuration ─────────────────────── */}
      <AdminTriageRulesManager initialRules={rules} />
    </div>
  );
}
