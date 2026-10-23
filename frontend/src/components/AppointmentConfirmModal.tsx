'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  GraduationCap,
  Mail,
  CheckCircle2,
  X,
  Loader2,
  Building,
  Stethoscope,
} from 'lucide-react';

interface AppointmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { doctorId?: number }) => Promise<void>;
  appointment: {
    appointmentId: number;
    patientName?: string;
    patientEmail?: string;
    patientRegNumber?: string;
    patientDepartment?: string;
    appointmentDate: string;
    doctorName?: string;
    doctorId?: number;
  } | null;
  doctorsList?: Array<{
    doctor_id: number;
    name?: string;
    specialization?: string;
  }>;
  allowDoctorChange?: boolean;
}

export default function AppointmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  doctorsList,
  allowDoctorChange = false,
}: AppointmentConfirmModalProps) {
  const [selectedDocId, setSelectedDocId] = useState<number>(appointment?.doctorId || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment?.doctorId) {
      setSelectedDocId(appointment.doctorId);
    } else if (doctorsList && doctorsList.length > 0) {
      setSelectedDocId(doctorsList[0].doctor_id);
    }
  }, [appointment?.appointmentId, appointment?.doctorId, doctorsList]);

  if (!isOpen || !appointment) return null;

  const handleConfirmClick = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        doctorId: allowDoctorChange && selectedDocId ? selectedDocId : undefined,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(appointment.appointmentDate).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Clinic Appointment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify booking details and approve consultation slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Patient Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Student Patient</span>
              <span className="font-mono text-[11px] text-primary font-semibold">
                #{appointment.appointmentId}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                {appointment.patientName ? appointment.patientName.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {appointment.patientName || 'Student Patient'}
                </p>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <GraduationCap className="w-3 h-3" />
                    {appointment.patientRegNumber || 'UNN Student'}
                  </span>
                  <span>•</span>
                  <span className="truncate">{appointment.patientDepartment || 'General UNN'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Scheduled Time
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                {formattedDate}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1 flex items-center gap-1">
                <Building className="w-3 h-3" /> Clinic Venue
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                UNN Medical Centre Consult Room
              </span>
            </div>
          </div>

          {/* Doctor Assignment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                Assigned Physician
              </label>
              {appointment.doctorName && (
                <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                  Student Preferred: {appointment.doctorName}
                </span>
              )}
            </div>

            {allowDoctorChange && doctorsList && doctorsList.length > 0 ? (
              <div>
                <select
                  value={selectedDocId || appointment.doctorId || doctorsList[0].doctor_id}
                  onChange={(e) => setSelectedDocId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-primary text-xs"
                >
                  {doctorsList.map((d) => {
                    const isStudentChoice = d.doctor_id === appointment.doctorId;
                    return (
                      <option key={d.doctor_id} value={d.doctor_id}>
                        {d.name || `Dr. ${d.specialization}`} ({d.specialization || 'Clinical Generalist'})
                        {isStudentChoice ? ' ★ (Student Choice)' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Keep student&apos;s chosen doctor or reassign if that physician is currently off-duty or in emergency duty.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between">
                <span>{appointment.doctorName || 'Medical Officer on Duty'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  Student Requested
                </span>
              </div>
            )}
          </div>

          {/* Notification Assurance Notice */}
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-900 dark:text-purple-200 text-xs flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Upon confirmation, the student will immediately receive an in-app confirmation notification and official confirmation email with clinic directions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Confirming Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve &amp; Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
