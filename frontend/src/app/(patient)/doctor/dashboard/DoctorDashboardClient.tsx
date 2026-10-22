'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  updateAppointmentStatusAction,
  toggleDoctorAvailabilityAction,
  requestPatientHandoverAction,
} from '@/app/actions/doctor';
import ClinicSlipModal from '@/components/ClinicSlipModal';
import AppointmentConfirmModal from '@/components/AppointmentConfirmModal';
import DoctorHeader from './_components/DoctorHeader';
import DoctorKPICards from './_components/DoctorKPICards';
import DoctorDutyRosterCard from './_components/DoctorDutyRosterCard';
import DoctorPatientRow from './_components/DoctorPatientRow';
import DoctorPatientMobileCard from './_components/DoctorPatientMobileCard';
import DoctorHandoverModal from './_components/DoctorHandoverModal';
import DoctorConsultationModal from './_components/DoctorConsultationModal';
import DoctorPatientDetailsModal from './_components/DoctorPatientDetailsModal';
import { DoctorOverview, PatientAssignment, ColleagueDoctor } from './types';

interface DoctorDashboardClientProps {
  initialOverview: DoctorOverview | null;
  initialPatients: PatientAssignment[];
  doctorsList: ColleagueDoctor[];
}

export default function DoctorDashboardClient({
  initialOverview,
  initialPatients,
  doctorsList,
}: DoctorDashboardClientProps) {
  const [overview] = useState<DoctorOverview | null>(initialOverview);
  const [patients, setPatients] = useState<PatientAssignment[]>(initialPatients);
  const [isAvailable, setIsAvailable] = useState<boolean>(initialOverview?.is_available ?? true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Appointment Confirmation Modal State
  const [confirmingPatient, setConfirmingPatient] = useState<PatientAssignment | null>(null);

  // Prescription & Consultation Modal State
  const [consultationPatient, setConsultationPatient] = useState<PatientAssignment | null>(null);

  // Patient AI Dossier & Details Modal State
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientAssignment | null>(null);

  // Official Clinic Slip Viewer State
  const [viewSlipPatient, setViewSlipPatient] = useState<PatientAssignment | null>(null);

  // Handover Modal State
  const [handoverPatient, setHandoverPatient] = useState<PatientAssignment | null>(null);

  // Other doctors available for handover
  const availableColleagues = useMemo(() => {
    return doctorsList.filter((d) => d.doctor_id !== overview?.doctor_id);
  }, [doctorsList, overview]);

  // Toggle Availability
  const handleToggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    try {
      const res = await toggleDoctorAvailabilityAction(nextState);
      if (res.success) {
        toast.success(`Duty status updated: ${nextState ? 'Available for Consultations' : 'Off Duty'}`);
      } else {
        setIsAvailable(!nextState);
        toast.error(res.error || 'Failed to update duty availability');
      }
    } catch {
      setIsAvailable(!nextState);
      toast.error('Network error updating availability');
    }
  };

  // Update Appointment Status
  const handleUpdateStatus = async (
    appointmentId: number,
    newStatus: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction(appointmentId, newStatus);
      if (res.success) {
        setPatients((prev) =>
          prev.map((p) => (p.appointment_id === appointmentId ? { ...p, appointment_status: newStatus } : p))
        );
        toast.success(`Consultation #${appointmentId} marked as ${newStatus.toUpperCase()}`);
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    } catch {
      toast.error('An error occurred updating appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Consultation & Prescription
  const handleConsultationSubmit = async ({
    appointmentId,
    diagnosis,
    prescription,
  }: {
    appointmentId: number;
    diagnosis: string;
    prescription: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction(
        appointmentId,
        'completed',
        prescription,
        diagnosis
      );

      if (res.success) {
        setPatients((prev) =>
          prev.map((p) =>
            p.appointment_id === appointmentId
              ? {
                  ...p,
                  appointment_status: 'completed',
                  prescription,
                  clinical_notes: diagnosis,
                }
              : p
          )
        );
        toast.success('Consultation certified and prescription issued to student record');
        setConsultationPatient(null);
      } else {
        toast.error(res.error || 'Failed to complete consultation');
      }
    } catch {
      toast.error('Error recording consultation diagnosis');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Referral / Handover
  const handleHandoverSubmit = async ({
    assignmentId,
    toDoctorId,
    reason,
    notes,
  }: {
    assignmentId: number;
    toDoctorId: number;
    reason: string;
    notes: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await requestPatientHandoverAction(assignmentId, toDoctorId, reason, notes);
      if (res.success) {
        toast.success('Patient case successfully transferred to colleague doctor');
        setPatients((prev) => prev.filter((p) => p.assignment_id !== assignmentId));
        setHandoverPatient(null);
      } else {
        toast.error(res.error || 'Failed to transfer patient case');
      }
    } catch {
      toast.error('An error occurred during case handover');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.appointment_status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.patient_name?.toLowerCase().includes(q) ||
        p.patient_email?.toLowerCase().includes(q) ||
        p.patient_reg_number?.toLowerCase().includes(q) ||
        p.patient_department?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [patients, statusFilter, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6 pb-28 md:pb-12">
      {/* ── 1. Doctor Header ── */}
      <DoctorHeader
        doctorName={overview?.name}
        specialization={overview?.specialization}
        isAvailable={isAvailable}
        onToggleAvailability={handleToggleAvailability}
      />

      {/* ── 2. Clinical KPI Metrics ── */}
      <DoctorKPICards
        totalCount={patients.length}
        pendingCount={
          patients.filter(
            (p) => p.appointment_status === 'pending' || p.appointment_status === 'active'
          ).length
        }
        confirmedCount={
          patients.filter((p) => p.appointment_status === 'confirmed').length
        }
        completedCount={
          patients.filter((p) => p.appointment_status === 'completed').length
        }
      />

      {/* ── 3. Doctor's Duty Schedule & Clinic Shifts ── */}
      <DoctorDutyRosterCard shifts={overview?.shifts} />

      {/* ── 4. Patient Consultations Queue ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Patient Consultation Queue
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review assigned students, check pre-triage AI symptoms, and conduct consultations.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'all', label: 'All Patients' },
                { id: 'pending', label: 'Pending' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'completed', label: 'Completed' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === filter.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 md:px-6 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, matric number, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* ── Mobile-First Card View (< 768px) ── */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No patients in this queue</p>
              <p className="text-xs mt-1">All assigned consultations are up to date</p>
            </div>
          ) : (
            filteredPatients.map((p) => (
              <DoctorPatientMobileCard
                key={p.assignment_id}
                patient={p}
                isSubmitting={isSubmitting}
                onUpdateStatus={handleUpdateStatus}
                onOpenConsultationModal={setConsultationPatient}
                onViewSlip={setViewSlipPatient}
                onOpenHandoverModal={setHandoverPatient}
                onSelectPatient={setSelectedPatientDetails}
                onConfirmClick={setConfirmingPatient}
              />
            ))
          )}
        </div>

        {/* ── Desktop Table View (>= 768px) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-100 dark:border-white/[0.06] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Student Patient</th>
                <th className="px-5 py-3.5">Dept / Reg No</th>
                <th className="px-5 py-3.5">Scheduled Time</th>
                <th className="px-5 py-3.5">Triage Severity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Consultation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No patient consultations found</p>
                    <p className="text-xs mt-1">Your consultation queue is clear</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <DoctorPatientRow
                    key={p.assignment_id}
                    patient={p}
                    isSubmitting={isSubmitting}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenConsultationModal={setConsultationPatient}
                    onViewSlip={setViewSlipPatient}
                    onOpenHandoverModal={setHandoverPatient}
                    onSelectPatient={setSelectedPatientDetails}
                    onConfirmClick={setConfirmingPatient}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. AI Clinical Dossier & Patient Details Modal ── */}
      <DoctorPatientDetailsModal
        patient={selectedPatientDetails}
        doctorName={overview?.name}
        onClose={() => setSelectedPatientDetails(null)}
        onOpenConsultationModal={(p) => {
          setSelectedPatientDetails(null);
          setConsultationPatient(p);
        }}
        onViewSlip={(p) => {
          setSelectedPatientDetails(null);
          setViewSlipPatient(p);
        }}
        onOpenHandoverModal={(p) => {
          setSelectedPatientDetails(null);
          setHandoverPatient(p);
        }}
      />

      {/* ── 6. Case Referral / Handover Modal ── */}
      <DoctorHandoverModal
        patient={handoverPatient}
        availableColleagues={availableColleagues}
        onClose={() => setHandoverPatient(null)}
        onSubmit={handleHandoverSubmit}
        isSubmitting={isSubmitting}
      />

      {/* ── 7. Clinical Consultation & Prescription Modal ── */}
      <DoctorConsultationModal
        patient={consultationPatient}
        onClose={() => setConsultationPatient(null)}
        onSubmit={handleConsultationSubmit}
        isSubmitting={isSubmitting}
      />

      {/* ── 8. Official Clinic Slip Modal ── */}
      <ClinicSlipModal
        isOpen={!!viewSlipPatient}
        onClose={() => setViewSlipPatient(null)}
        data={
          viewSlipPatient
            ? {
                appointmentId: viewSlipPatient.appointment_id,
                appointmentDate: viewSlipPatient.appointment_date || new Date().toISOString(),
                studentName: viewSlipPatient.patient_name || 'Student Patient',
                regNumber: viewSlipPatient.patient_reg_number,
                department: viewSlipPatient.patient_department,
                level: viewSlipPatient.patient_level,
                bloodGroup: viewSlipPatient.patient_blood_group,
                genotype: viewSlipPatient.patient_genotype,
                allergies: viewSlipPatient.patient_allergies,
                phoneNumber: viewSlipPatient.patient_phone,
                hostel: viewSlipPatient.patient_hostel,
                doctorName: overview?.name ? `Dr. ${overview.name}` : 'Medical Officer on Duty',
                doctorSpecialization: overview?.specialization || 'Clinical General Practitioner',
                diagnosis: viewSlipPatient.clinical_notes || '',
                prescription: viewSlipPatient.prescription || '',
                status: viewSlipPatient.appointment_status,
              }
            : null
        }
      />

      {/* ── 9. Official Appointment Confirmation Modal ── */}
      <AppointmentConfirmModal
        isOpen={!!confirmingPatient}
        onClose={() => setConfirmingPatient(null)}
        onConfirm={async () => {
          if (confirmingPatient) {
            await handleUpdateStatus(confirmingPatient.appointment_id, 'confirmed');
            setConfirmingPatient(null);
          }
        }}
        appointment={
          confirmingPatient
            ? {
                appointmentId: confirmingPatient.appointment_id,
                patientName: confirmingPatient.patient_name,
                patientEmail: confirmingPatient.patient_email,
                patientRegNumber: confirmingPatient.patient_reg_number,
                patientDepartment: confirmingPatient.patient_department,
                appointmentDate: confirmingPatient.appointment_date || new Date().toISOString(),
                doctorName: overview?.name ? `Dr. ${overview.name}` : undefined,
                doctorId: overview?.doctor_id,
              }
            : null
        }
        allowDoctorChange={false}
      />
    </div>
  );
}
