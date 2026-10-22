'use client';

import React from 'react';
import { ShieldAlert, X, User, AlertTriangle, PhoneCall, CheckCircle2 } from 'lucide-react';
import { AdminUrgentCheckData } from '@/app/actions/admin';

interface UrgentCaseModalProps {
  urgentCase: AdminUrgentCheckData | null;
  onClose: () => void;
  onToggleContacted: (c: AdminUrgentCheckData) => void;
  onToggleReviewed: (c: AdminUrgentCheckData) => void;
}

export default function UrgentCaseModal({
  urgentCase: selectedCase,
  onClose,
  onToggleContacted,
  onToggleReviewed,
}: UrgentCaseModalProps) {
  if (!selectedCase) return null;

  return (
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
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Student Profile Card */}
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
                onClick={() => onToggleContacted(selectedCase)}
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
                onClick={() => onToggleReviewed(selectedCase)}
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
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
