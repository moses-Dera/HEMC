'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  CheckCircle,
  Clock,
  User,
  GraduationCap,
  Building,
  Check,
  XCircle,
  Filter,
  Stethoscope,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminAppointmentData, adminUpdateAppointmentAction } from '@/app/actions/admin';
import AppointmentConfirmModal from '@/components/AppointmentConfirmModal';

interface DoctorOption {
  doctor_id: number;
  user_id: number;
  name?: string;
  email?: string;
  specialization?: string;
  is_available: boolean;
}

interface AdminAppointmentsManagerProps {
  initialAppointments: AdminAppointmentData[];
  doctors: DoctorOption[];
}

export default function AdminAppointmentsManager({
  initialAppointments,
  doctors,
}: AdminAppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<AdminAppointmentData[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [confirmingAppointment, setConfirmingAppointment] = useState<AdminAppointmentData | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.patient_name?.toLowerCase().includes(q) ||
        apt.patient_email?.toLowerCase().includes(q) ||
        apt.patient_reg_number?.toLowerCase().includes(q) ||
        apt.doctor_name?.toLowerCase().includes(q) ||
        apt.patient_department?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Handle direct status change (confirm or cancel)
  const handleStatusChange = async (appointmentId: number, newStatus: 'confirmed' | 'cancelled', doctorId?: number) => {
    setIsUpdating(appointmentId);
    try {
      const res = await adminUpdateAppointmentAction(appointmentId, {
        status: newStatus,
        doctor_id: doctorId,
      });

      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.appointment_id === appointmentId
              ? {
                  ...a,
                  status: newStatus,
                  ...(doctorId && doctors.find((d) => d.doctor_id === doctorId)
                    ? {
                        doctor_id: doctorId,
                        doctor_name: doctors.find((d) => d.doctor_id === doctorId)?.name,
                      }
                    : {}),
                }
              : a
          )
        );
        toast.success(`Appointment #${appointmentId} marked as ${newStatus.toUpperCase()}`);
      } else {
        toast.error(res.error || 'Failed to update appointment');
      }
    } catch {
      toast.error('Network error updating appointment status');
    } finally {
      setIsUpdating(null);
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {appointments.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Awaiting Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Confirmed Slots</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {confirmedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Completed &amp; Rx</span>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {completedCount}
          </div>
        </div>
      </div>

      {/* ── Main Appointments Table Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Clinic Appointments &amp; Consultations Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review all student bookings, confirm slots, reassign physicians, and track consultation progress.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'pending', label: `Pending (${pendingCount})` },
                { id: 'confirmed', label: `Confirmed (${confirmedCount})` },
                { id: 'completed', label: `Completed (${completedCount})` },
                { id: 'cancelled', label: 'Cancelled' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === filter.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, matric number, or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-white/[0.06]">
              <tr>
                <th className="px-5 py-3">Student Patient</th>
                <th className="px-5 py-3">Dept / Reg No</th>
                <th className="px-5 py-3">Scheduled Time</th>
                <th className="px-5 py-3">Assigned Physician</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">No appointments matching criteria</p>
                    <p className="text-[11px] mt-0.5">All bookings are handled</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const isPending = apt.status === 'pending';
                  const isConfirmed = apt.status === 'confirmed';
                  const isCompleted = apt.status === 'completed';
                  const isCancelled = apt.status === 'cancelled';

                  return (
                    <tr
                      key={apt.appointment_id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Student Patient */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {apt.patient_name ? apt.patient_name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {apt.patient_name || `Student #${apt.user_id}`}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {apt.patient_email || 'No email registered'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Reg */}
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{apt.patient_department || 'General UNN'}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {apt.patient_reg_number || `#${apt.user_id}`}
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(apt.appointment_date).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Doctor Assignment */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <Stethoscope className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{apt.doctor_name || 'Medical Officer on Duty'}</span>
                        </div>
                        {apt.doctor_specialization && (
                          <div className="text-[10px] text-slate-400 ml-5">
                            {apt.doctor_specialization}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : isConfirmed
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : isCancelled
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 line-through'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              onClick={() => setConfirmingAppointment(apt)}
                              disabled={isUpdating === apt.appointment_id}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              Confirm Booking
                            </button>
                          )}

                          {isConfirmed && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approved
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Consultation Completed
                            </span>
                          )}

                          {!isCompleted && !isCancelled && (
                            <button
                              onClick={() => handleStatusChange(apt.appointment_id, 'cancelled')}
                              disabled={isUpdating === apt.appointment_id}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-slate-500 transition cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      <AppointmentConfirmModal
        isOpen={!!confirmingAppointment}
        onClose={() => setConfirmingAppointment(null)}
        appointment={
          confirmingAppointment
            ? {
                appointmentId: confirmingAppointment.appointment_id,
                patientName: confirmingAppointment.patient_name || 'Student Patient',
                patientEmail: confirmingAppointment.patient_email || '',
                patientRegNumber: confirmingAppointment.patient_reg_number || '',
                patientDepartment: confirmingAppointment.patient_department || '',
                appointmentDate: confirmingAppointment.appointment_date,
                doctorName: confirmingAppointment.doctor_name || 'Assigned Doctor',
                doctorId: confirmingAppointment.doctor_id || undefined,
              }
            : null
        }
        doctorsList={doctors}
        allowDoctorChange={true}
        onConfirm={async ({ doctorId }) => {
          if (confirmingAppointment) {
            await handleStatusChange(confirmingAppointment.appointment_id, 'confirmed', doctorId);
          }
        }}
      />
    </div>
  );
}
