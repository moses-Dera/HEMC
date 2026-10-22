'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2, 
  Clock, 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  FileText, 
  X,
  PhoneCall,
  Check,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminUrgentCheckData, adminUpdateUrgentCheckStatusAction } from '@/app/actions/admin';

interface AdminUrgentCasesQueueProps {
  initialCases: AdminUrgentCheckData[];
}

export default function AdminUrgentCasesQueue({ initialCases }: AdminUrgentCasesQueueProps) {
  const [cases, setCases] = useState<AdminUrgentCheckData[]>(initialCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'reviewed'>('all');
  const [selectedCase, setSelectedCase] = useState<AdminUrgentCheckData | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Metrics
  const metrics = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter(c => !c.contacted || !c.reviewed).length;
    const contacted = cases.filter(c => c.contacted).length;
    const reviewed = cases.filter(c => c.reviewed).length;
    return { total, pending, contacted, reviewed };
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
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

    // Optimistic
    setCases(prev => prev.map(item => item.check_id === c.check_id ? { ...item, contacted: nextVal } : item));
    if (selectedCase && selectedCase.check_id === c.check_id) {
      setSelectedCase(prev => prev ? { ...prev, contacted: nextVal } : null);
    }

    const res = await adminUpdateUrgentCheckStatusAction(c.check_id, { contacted: nextVal });
    setIsUpdating(null);

    if (!res.success) {
      // Revert
      setCases(prev => prev.map(item => item.check_id === c.check_id ? { ...item, contacted: c.contacted } : item));
      toast.error(res.error || 'Failed to update contact status');
    } else {
      toast.success(nextVal ? `Student ${c.patient_name} marked as Contacted` : `Contact status reset`);
    }
  };

  // Toggle Reviewed
  const handleToggleReviewed = async (c: AdminUrgentCheckData) => {
    const nextVal = !c.reviewed;
    setIsUpdating(c.check_id);

    // Optimistic
    setCases(prev => prev.map(item => item.check_id === c.check_id ? { ...item, reviewed: nextVal } : item));
    if (selectedCase && selectedCase.check_id === c.check_id) {
      setSelectedCase(prev => prev ? { ...prev, reviewed: nextVal } : null);
    }

    const res = await adminUpdateUrgentCheckStatusAction(c.check_id, { reviewed: nextVal });
    setIsUpdating(null);

    if (!res.success) {
      // Revert
      setCases(prev => prev.map(item => item.check_id === c.check_id ? { ...item, reviewed: c.reviewed } : item));
      toast.error(res.error || 'Failed to update review status');
    } else {
      toast.success(nextVal ? `Urgent case for ${c.patient_name} marked as Reviewed` : `Review status reset`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* ── Filters & Search ── */}
      <div className="p-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, reg number, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'contacted', 'reviewed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
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
                <tr key={c.check_id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Student Patient Info */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      {c.patient_name}
                      {!c.contacted && (
                        <span className="w-2 h-2 rounded-full bg-red-500" title="Uncontacted emergency" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                      {c.patient_reg_number && <span>Reg: {c.patient_reg_number}</span>}
                      {c.patient_department && <span>• {c.patient_department}</span>}
                      {c.patient_hostel && <span>• Hostel: {c.patient_hostel}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      {c.patient_phone && (
                        <a 
                          href={`tel:${c.patient_phone}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <Phone className="w-3 h-3" /> {c.patient_phone}
                        </a>
                      )}
                      <a 
                        href={`mailto:${c.patient_email}`}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Mail className="w-3 h-3" /> {c.patient_email}
                      </a>
                    </div>
                  </td>

                  {/* Red Flags & Symptoms */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {c.red_flags && c.red_flags.length > 0 ? (
                        c.red_flags.map((flag, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {flag}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                          Urgent Red-Flag Triage
                        </span>
                      )}
                    </div>
                    {c.fever_duration && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Fever: <strong className="text-slate-700 dark:text-slate-300">{c.fever_duration}</strong></span>
                      </div>
                    )}
                  </td>

                  {/* Flagged Time */}
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs">
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>

                  {/* Contacted Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleToggleContacted(c)}
                      disabled={isUpdating === c.check_id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        c.contacted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:opacity-80'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 hover:opacity-80'
                      }`}
                      title={c.contacted ? 'Click to mark uncontacted' : 'Click to mark student contacted'}
                    >
                      {c.contacted ? <Check className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}
                      {c.contacted ? 'Contacted' : 'Pending Call'}
                    </button>
                  </td>

                  {/* Reviewed Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleToggleReviewed(c)}
                      disabled={isUpdating === c.check_id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        c.reviewed
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:opacity-80'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:opacity-80'
                      }`}
                      title={c.reviewed ? 'Click to mark unreviewed' : 'Click to mark clinical review complete'}
                    >
                      {c.reviewed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {c.reviewed ? 'Reviewed' : 'Awaiting Review'}
                    </button>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── DETAILS MODAL ── */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Emergency Triage Escalation Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    Case #{selectedCase.check_id} • {new Date(selectedCase.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Student Bio */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Student Profile
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>Name: <strong className="text-slate-900 dark:text-white">{selectedCase.patient_name}</strong></div>
                  <div>Reg No: <strong>{selectedCase.patient_reg_number || 'N/A'}</strong></div>
                  <div>Email: <strong>{selectedCase.patient_email}</strong></div>
                  <div>Phone: <strong>{selectedCase.patient_phone || 'None registered'}</strong></div>
                  <div>Dept: <strong>{selectedCase.patient_department || 'N/A'}</strong></div>
                  <div>Hostel: <strong>{selectedCase.patient_hostel || 'N/A'}</strong></div>
                </div>
                {selectedCase.patient_emergency_contact && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/10 text-amber-700 dark:text-amber-400">
                    Emergency Contact: <strong>{selectedCase.patient_emergency_contact}</strong>
                  </div>
                )}
              </div>

              {/* Red-flag symptoms */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Clinical Red Flags Reported
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCase.red_flags && selectedCase.red_flags.length > 0 ? (
                    selectedCase.red_flags.map((flag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/40">
                        {flag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No specific flags parsed</span>
                  )}
                </div>
                {selectedCase.fever_duration && (
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Reported Fever Duration: <strong className="text-red-600 dark:text-red-400">{selectedCase.fever_duration}</strong>
                  </p>
                )}
              </div>

              {/* Status Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleContacted(selectedCase)}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                      selectedCase.contacted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {selectedCase.contacted ? 'Mark Uncontacted' : 'Mark as Contacted'}
                  </button>

                  <button
                    onClick={() => handleToggleReviewed(selectedCase)}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                      selectedCase.reviewed
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedCase.reviewed ? 'Mark Unreviewed' : 'Mark as Reviewed'}
                  </button>
                </div>

                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
