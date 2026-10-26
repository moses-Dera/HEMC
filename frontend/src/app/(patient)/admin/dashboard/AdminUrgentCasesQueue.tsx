'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminUrgentCheckData, adminUpdateUrgentCheckStatusAction } from '@/app/actions/admin';
import UrgentCaseHeader from './_components/urgent/UrgentCaseHeader';
import UrgentCaseFilterToolbar from './_components/urgent/UrgentCaseFilterToolbar';
import UrgentCaseRow from './_components/urgent/UrgentCaseRow';
import UrgentCaseModal from './_components/urgent/UrgentCaseModal';

interface AdminUrgentCasesQueueProps {
  initialCases: AdminUrgentCheckData[];
}

export default function AdminUrgentCasesQueue({ initialCases }: AdminUrgentCasesQueueProps) {
  const [cases, setCases] = useState<AdminUrgentCheckData[]>(initialCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'reviewed'>('all');
  const [selectedCase, setSelectedCase] = useState<AdminUrgentCheckData | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  useEffect(() => {
    setCases(initialCases);
  }, [initialCases]);

  // Metrics
  const metrics = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter((c) => !c.contacted || !c.reviewed).length;
    const contacted = cases.filter((c) => c.contacted).length;
    const reviewed = cases.filter((c) => c.reviewed).length;
    return { total, pending, contacted, reviewed };
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        c.patient_name.toLowerCase().includes(query) ||
        c.patient_email.toLowerCase().includes(query) ||
        (c.patient_reg_number && c.patient_reg_number.toLowerCase().includes(query)) ||
        (c.patient_department && c.patient_department.toLowerCase().includes(query));

      let matchesStatus = true;
      if (statusFilter === 'pending') {
        matchesStatus = !c.contacted || !c.reviewed;
      } else if (statusFilter === 'contacted') {
        matchesStatus = c.contacted;
      } else if (statusFilter === 'reviewed') {
        matchesStatus = c.reviewed;
      }

      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  // Toggle Contacted
  const handleToggleContacted = async (c: AdminUrgentCheckData) => {
    const nextVal = !c.contacted;
    setIsUpdating(c.check_id);

    setCases((prev) => prev.map((item) => item.check_id === c.check_id ? { ...item, contacted: nextVal } : item));
    if (selectedCase && selectedCase.check_id === c.check_id) {
      setSelectedCase((prev) => prev ? { ...prev, contacted: nextVal } : null);
    }

    const res = await adminUpdateUrgentCheckStatusAction(c.check_id, { contacted: nextVal });
    setIsUpdating(null);

    if (!res.success) {
      setCases((prev) => prev.map((item) => item.check_id === c.check_id ? { ...item, contacted: c.contacted } : item));
      toast.error(res.error || 'Failed to update contact status');
    } else {
      toast.success(nextVal ? `Student ${c.patient_name} marked as Contacted` : `Contact status reset`);
    }
  };

  // Toggle Reviewed
  const handleToggleReviewed = async (c: AdminUrgentCheckData) => {
    const nextVal = !c.reviewed;
    setIsUpdating(c.check_id);

    setCases((prev) => prev.map((item) => item.check_id === c.check_id ? { ...item, reviewed: nextVal } : item));
    if (selectedCase && selectedCase.check_id === c.check_id) {
      setSelectedCase((prev) => prev ? { ...prev, reviewed: nextVal } : null);
    }

    const res = await adminUpdateUrgentCheckStatusAction(c.check_id, { reviewed: nextVal });
    setIsUpdating(null);

    if (!res.success) {
      setCases((prev) => prev.map((item) => item.check_id === c.check_id ? { ...item, reviewed: c.reviewed } : item));
      toast.error(res.error || 'Failed to update review status');
    } else {
      toast.success(nextVal ? `Urgent case for ${c.patient_name} marked as Reviewed` : `Review status reset`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <UrgentCaseHeader metrics={metrics} />

      {/* ── Filters & Search ── */}
      <UrgentCaseFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* ── Cases Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200/60 dark:border-white/[0.06]">
            <tr>
              <th className="py-3.5 px-6">Student Patient</th>
              <th className="py-3.5 px-4">Emergency Symptoms & Red Flags</th>
              <th className="py-3.5 px-4">Flagged Time</th>
              <th className="py-3.5 px-4 text-center">Contact Status</th>
              <th className="py-3.5 px-4 text-center">Clinical Review</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No urgent cases matching filter</p>
                  <p className="text-xs text-slate-400 mt-1">All student triage escalations are currently cleared or none reported.</p>
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <UrgentCaseRow
                  key={c.check_id}
                  urgentCase={c}
                  isUpdating={isUpdating === c.check_id}
                  onToggleContacted={handleToggleContacted}
                  onToggleReviewed={handleToggleReviewed}
                  onViewDetails={setSelectedCase}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Details Modal ── */}
      <UrgentCaseModal
        urgentCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onToggleContacted={handleToggleContacted}
        onToggleReviewed={handleToggleReviewed}
      />
    </div>
  );
}
