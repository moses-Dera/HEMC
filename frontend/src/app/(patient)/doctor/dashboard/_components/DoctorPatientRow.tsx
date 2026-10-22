'use client';

import React from 'react';
import { Check, CheckCircle, FileText, ArrowRightLeft, Eye } from 'lucide-react';
import { PatientAssignment } from '../types';

interface DoctorPatientRowProps {
  patient: PatientAssignment;
  isSubmitting: boolean;
  onUpdateStatus: (appointmentId: number, newStatus: 'confirmed' | 'completed' | 'cancelled') => void;
  onOpenConsultationModal: (patient: PatientAssignment) => void;
  onViewSlip: (patient: PatientAssignment) => void;
  onOpenHandoverModal: (patient: PatientAssignment) => void;
  onSelectPatient: (patient: PatientAssignment) => void;
  onConfirmClick?: (patient: PatientAssignment) => void;
}

export default function DoctorPatientRow({
  patient: p,
  isSubmitting,
  onUpdateStatus,
  onOpenConsultationModal,
  onViewSlip,
  onOpenHandoverModal,
  onSelectPatient,
  onConfirmClick,
}: DoctorPatientRowProps) {
  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
      {/* Patient Info */}
      <td
        className="px-5 py-4 cursor-pointer"
        onClick={() => onSelectPatient(p)}
        title="Click to view AI clinical dossier & triage details"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs ring-2 ring-transparent group-hover:ring-blue-500/30 transition">
            {p.patient_name ? p.patient_name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>{p.patient_name}</span>
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-xs text-slate-400">{p.patient_email}</div>
          </div>
        </div>
      </td>

      {/* Department & Reg */}
      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
        <div>
          {p.patient_department || 'General UNN'} {p.patient_level ? `(${p.patient_level})` : ''}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-slate-400 font-mono text-[11px]">{p.patient_reg_number || `#${p.patient_id}`}</span>
          {p.patient_blood_group && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {p.patient_blood_group}
            </span>
          )}
          {p.patient_genotype && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              {p.patient_genotype}
            </span>
          )}
        </div>
      </td>

      {/* Scheduled Time */}
      <td className="px-5 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
        {p.appointment_date
          ? new Date(p.appointment_date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : 'Scheduled'}
      </td>

      {/* Triage Urgency */}
      <td className="px-5 py-4">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
            p.triage_urgency?.includes('Urgent')
              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {p.triage_urgency || 'Routine'}
        </span>
      </td>

      {/* Status Badge */}
      <td className="px-5 py-4">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
            p.appointment_status === 'confirmed'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
              : p.appointment_status === 'completed'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          }`}
        >
          {p.appointment_status || 'Pending'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {p.appointment_status !== 'confirmed' && p.appointment_status !== 'completed' && (
            <button
              onClick={() => (onConfirmClick ? onConfirmClick(p) : onUpdateStatus(p.appointment_id, 'confirmed'))}
              disabled={isSubmitting}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
          )}
          {p.appointment_status !== 'completed' ? (
            <button
              onClick={() => onOpenConsultationModal(p)}
              disabled={isSubmitting}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Consult &amp; Rx
            </button>
          ) : (
            <button
              onClick={() => onViewSlip(p)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Clinic Slip
            </button>
          )}
          <button
            onClick={() => onOpenHandoverModal(p)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Refer
          </button>
        </div>
      </td>
    </tr>
  );
}
