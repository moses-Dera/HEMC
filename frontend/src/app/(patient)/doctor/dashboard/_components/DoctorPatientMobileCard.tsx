'use client';

import React from 'react';
import { Check, CheckCircle, FileText, ArrowRightLeft, Eye } from 'lucide-react';
import { PatientAssignment } from '../types';

interface DoctorPatientMobileCardProps {
  patient: PatientAssignment;
  isSubmitting: boolean;
  onUpdateStatus: (appointmentId: number, newStatus: 'confirmed' | 'completed' | 'cancelled') => void;
  onOpenConsultationModal: (patient: PatientAssignment) => void;
  onViewSlip: (patient: PatientAssignment) => void;
  onOpenHandoverModal: (patient: PatientAssignment) => void;
  onSelectPatient: (patient: PatientAssignment) => void;
  onConfirmClick?: (patient: PatientAssignment) => void;
}

export default function DoctorPatientMobileCard({
  patient: p,
  isSubmitting,
  onUpdateStatus,
  onOpenConsultationModal,
  onViewSlip,
  onOpenHandoverModal,
  onSelectPatient,
  onConfirmClick,
}: DoctorPatientMobileCardProps) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectPatient(p)}
          title="Click to view AI clinical dossier"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm ring-2 ring-transparent group-hover:ring-blue-500/30 transition">
            {p.patient_name ? p.patient_name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {p.patient_name}
              </h4>
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition" />
            </div>
            <div className="text-xs text-slate-400">{p.patient_email}</div>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
            p.appointment_status === 'confirmed'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
              : p.appointment_status === 'completed'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          }`}
        >
          {p.appointment_status || 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.04]">
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Student ID</span>
          <span className="font-mono font-medium">{p.patient_reg_number || `#${p.patient_id}`}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Department</span>
          <span>
            {p.patient_department || 'General UNN'} {p.patient_level ? `(${p.patient_level})` : ''}
          </span>
        </div>
        <div className="col-span-2 pt-1 border-t border-slate-200/40 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Consultation Date</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {p.appointment_date ? new Date(p.appointment_date).toLocaleString() : 'Scheduled'}
          </span>
        </div>
      </div>

      {(p.patient_blood_group || p.patient_genotype || p.patient_allergies || p.patient_phone) && (
        <div className="text-[11px] bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-100/50 dark:border-blue-900/30 text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-3 font-medium flex-wrap">
            {p.patient_blood_group && (
              <span>
                Blood: <strong className="text-blue-700 dark:text-blue-300">{p.patient_blood_group}</strong>
              </span>
            )}
            {p.patient_genotype && (
              <span>
                Genotype:{' '}
                <strong className="text-blue-700 dark:text-blue-300">{p.patient_genotype}</strong>
              </span>
            )}
            {p.patient_phone && <span>Tel: {p.patient_phone}</span>}
          </div>
          {p.patient_allergies && (
            <div className="text-amber-700 dark:text-amber-400 text-[10px]">
              Allergies: <strong>{p.patient_allergies}</strong>
            </div>
          )}
        </div>
      )}

      {/* Pre-triage Urgency Badge */}
      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            p.triage_urgency?.includes('Urgent')
              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {p.triage_urgency || 'Routine'}
        </span>
        <span className="text-slate-400 text-[11px] truncate">{p.triage_summary}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {p.appointment_status !== 'confirmed' && p.appointment_status !== 'completed' && (
          <button
            onClick={() => (onConfirmClick ? onConfirmClick(p) : onUpdateStatus(p.appointment_id, 'confirmed'))}
            disabled={isSubmitting}
            className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Confirm
          </button>
        )}
        {p.appointment_status !== 'completed' ? (
          <button
            onClick={() => onOpenConsultationModal(p)}
            disabled={isSubmitting}
            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Consult &amp; Rx
          </button>
        ) : (
          <button
            onClick={() => onViewSlip(p)}
            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Clinic Slip
          </button>
        )}
        <button
          onClick={() => onOpenHandoverModal(p)}
          className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Refer
        </button>
      </div>
    </div>
  );
}
