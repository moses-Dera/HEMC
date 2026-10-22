'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, X } from 'lucide-react';
import { toast } from 'sonner';

import { ColleagueDoctor, PatientAssignment } from '../types';

interface DoctorHandoverModalProps {
  patient: PatientAssignment | null;
  availableColleagues: ColleagueDoctor[];
  onClose: () => void;
  onSubmit: (data: {
    assignmentId: number;
    toDoctorId: number;
    reason: string;
    notes: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function DoctorHandoverModal({
  patient,
  availableColleagues,
  onClose,
  onSubmit,
  isSubmitting,
}: DoctorHandoverModalProps) {
  const [toDoctorId, setToDoctorId] = useState<number>(availableColleagues[0]?.doctor_id || 0);
  const [reason, setReason] = useState<string>('specialist_review');
  const [notes, setNotes] = useState<string>('');

  if (!patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toDoctorId) {
      toast.error('Please select a doctor to transfer the case to');
      return;
    }
    onSubmit({
      assignmentId: patient.assignment_id,
      toDoctorId,
      reason,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Refer Patient Case</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/[0.04] text-xs">
            <span className="text-slate-400 block font-semibold">Patient Being Referred:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {patient.patient_name} ({patient.patient_reg_number || `#${patient.patient_id}`})
            </span>
            <span className="text-slate-400 block mt-1">{patient.patient_department}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Transfer To Colleague Doctor *
            </label>
            <select
              required
              value={toDoctorId}
              onChange={(e) => setToDoctorId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableColleagues.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  Dr. {doc.name || `Physician #${doc.doctor_id}`} ({doc.specialization || 'Clinical Staff'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Referral Clinical Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="specialist_review">Specialist Review (Infectious Diseases / Internal Medicine)</option>
              <option value="emergency_escalation">Emergency Escalation / Inpatient Admission</option>
              <option value="shift_end">Duty Shift Concluded / Handover to Next Roster</option>
              <option value="workload_balancing">Clinic Workload Balancing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Clinical Handover Notes
            </label>
            <textarea
              rows={3}
              placeholder="Notes on patient vitals, suspected malaria/typhoid stage, recommended diagnostic labs, or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Transferring Case...' : 'Confirm Case Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
