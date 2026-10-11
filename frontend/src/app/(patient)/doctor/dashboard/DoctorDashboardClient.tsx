'use client';

import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  Search,
  Filter,
  Check,
  X,
  Activity,
  Users,
  Shield,
  PhoneCall,
  FileText,
  Pill,
  Printer,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import {
  updateAppointmentStatusAction,
  toggleDoctorAvailabilityAction,
  requestPatientHandoverAction,
} from '@/app/actions/doctor';
import ClinicSlipModal from '@/components/ClinicSlipModal';

interface DoctorShift {
  shift_id: number;
  doctor_id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface DoctorOverview {
  doctor_id: number;
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  is_available: boolean;
  total_assigned: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  shifts: DoctorShift[];
}

interface PatientAssignment {
  assignment_id: number;
  appointment_id: number;
  doctor_id: number;
  assigned_at: string;
  status: string;
  patient_id?: number;
  patient_name?: string;
  patient_email?: string;
  patient_department?: string;
  patient_level?: string;
  patient_reg_number?: string;
  patient_phone?: string;
  patient_blood_group?: string;
  patient_genotype?: string;
  patient_allergies?: string;
  patient_hostel?: string;
  patient_emergency_contact?: string;
  appointment_date?: string;
  appointment_status?: string;
  triage_urgency?: string;
  triage_summary?: string;
  prescription?: string;
  clinical_notes?: string;
}

const PRESET_PROTOCOLS = [
  {
    name: 'Malaria ACT Protocol',
    diagnosis: 'Acute Uncomplicated Malaria (P. falciparum). Clinical presentation: chills, intermittent pyrexia, headache, arthralgia.',
    prescription: '1. Tab Artemether/Lumefantrine 80/480mg — 1 tab BD x 3 days with food.\n2. Tab Paracetamol 1000mg — 2 tabs TDS x 3 days.\n3. Oral Rehydration Solution (ORS) — 1 sachet in 1L water ad libitum.',
  },
  {
    name: 'Enteric / Typhoid Protocol',
    diagnosis: 'Suspected Salmonella Enteric Fever. Step-ladder pyrexia, coated tongue, constitutional fatigue, abdominal discomfort.',
    prescription: '1. Tab Ciprofloxacin 500mg — 1 tab BD x 7 days.\n2. Tab Paracetamol 500mg — 2 tabs TDS x 3 days.\n3. Tab Omeprazole 20mg — 1 cap daily mane x 7 days.\n4. Strict boiled drinking water and light nutritious diet advised.',
  },
  {
    name: 'Upper Respiratory (URTI)',
    diagnosis: 'Acute Upper Respiratory Tract Infection (URTI). Pharyngitis, rhinitis, non-productive dry cough.',
    prescription: '1. Tab Amoxicillin/Clavulanate 625mg — 1 tab BD x 5 days.\n2. Tab Loratadine 10mg — 1 tab daily nocte x 5 days.\n3. Tab Vitamin C 1000mg — 1 tab daily x 5 days.\n4. Warm saline gargles thrice daily.',
  },
  {
    name: 'Analgesic / Pain Relief',
    diagnosis: 'Acute Musculoskeletal strain / Tension Headache / Fatigue.',
    prescription: '1. Tab Ibuprofen 400mg — 1 tab TDS post-prandial x 3 days.\n2. Tab Paracetamol 1000mg — 2 tabs TDS x 3 days.\n3. Adequate hydration and bed rest advised.',
  },
];

interface ColleagueDoctor {
  doctor_id: number;
  user_id: number;
  name?: string;
  specialization?: string;
  is_available: boolean;
}

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
  const [overview, setOverview] = useState<DoctorOverview | null>(initialOverview);
  const [patients, setPatients] = useState<PatientAssignment[]>(initialPatients);
  const [isAvailable, setIsAvailable] = useState<boolean>(initialOverview?.is_available ?? true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prescription & Consultation Modal State
  const [consultationPatient, setConsultationPatient] = useState<PatientAssignment | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState<string>('');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState<string>('');

  // Official Clinic Slip Viewer State
  const [viewSlipPatient, setViewSlipPatient] = useState<PatientAssignment | null>(null);

  // Handover Modal State
  const [handoverPatient, setHandoverPatient] = useState<PatientAssignment | null>(null);
  const [handoverToDoctorId, setHandoverToDoctorId] = useState<number>(0);
  const [handoverReason, setHandoverReason] = useState<string>('specialist_review');
  const [handoverNotes, setHandoverNotes] = useState<string>('');

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
  const handleUpdateStatus = async (appointmentId: number, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
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
      toast.error('Network error updating consultation status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Consultation / Prescription modal
  const handleOpenConsultationModal = (p: PatientAssignment) => {
    setConsultationPatient(p);
    setPrescriptionNotes(p.prescription || '');
    setClinicalDiagnosis(p.clinical_notes || '');
  };

  // Quick Apply Clinical Protocol
  const applyProtocol = (proto: (typeof PRESET_PROTOCOLS)[0]) => {
    setClinicalDiagnosis(proto.diagnosis);
    setPrescriptionNotes(proto.prescription);
    toast.success(`Applied ${proto.name}`);
  };

  // Submit Consultation & Prescription
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationPatient) return;

    if (!clinicalDiagnosis.trim()) {
      toast.error('Please enter clinical diagnosis or consultation notes');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction(
        consultationPatient.appointment_id,
        'completed',
        prescriptionNotes,
        clinicalDiagnosis
      );
      if (res.success) {
        setPatients((prev) =>
          prev.map((p) =>
            p.appointment_id === consultationPatient.appointment_id
              ? {
                  ...p,
                  appointment_status: 'completed',
                  prescription: prescriptionNotes,
                  clinical_notes: clinicalDiagnosis,
                }
              : p
          )
        );
        toast.success(`Consultation completed & prescription issued for ${consultationPatient.patient_name}`);
        setConsultationPatient(null);
        setPrescriptionNotes('');
        setClinicalDiagnosis('');
      } else {
        toast.error(res.error || 'Failed to complete consultation');
      }
    } catch {
      toast.error('Network error completing consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handover
  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverPatient || !handoverToDoctorId) {
      toast.error('Please select a colleague doctor for referral');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPatientHandoverAction(
        handoverPatient.assignment_id,
        handoverToDoctorId,
        handoverReason,
        handoverNotes
      );
      if (res.success) {
        setPatients((prev) => prev.filter((p) => p.assignment_id !== handoverPatient.assignment_id));
        toast.success(`Case transferred to Dr. Colleague successfully`);
        setHandoverPatient(null);
        setHandoverNotes('');
      } else {
        toast.error(res.error || 'Failed to transfer patient case');
      }
    } catch {
      toast.error('Network error during referral handover');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.appointment_status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.patient_name?.toLowerCase().includes(q) ||
        p.patient_email?.toLowerCase().includes(q) ||
        p.patient_department?.toLowerCase().includes(q) ||
        p.patient_reg_number?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [patients, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* ── 1. Doctor Clinical Identity & Duty Header ───────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/30">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                {overview?.name || 'Medical Officer'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {overview?.specialization || 'General Practitioner'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              UNN Medical Centre — Clinical Consultation Desk & Emergency Triage
            </p>
          </div>
        </div>

        {/* Live Duty Availability Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.04]">
          <div className="text-left md:text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAvailable ? 'On Duty — Accepting Patients' : 'Off Duty / Unavailable'}
            </div>
            <div className="text-[11px] text-slate-400">
              {isAvailable ? 'Assigned to university queue' : 'New bookings paused'}
            </div>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── 2. Clinical KPI Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Consultations</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</div>
          <p className="text-xs text-slate-400 mt-1">Assigned to your care</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {patients.filter((p) => p.appointment_status === 'pending' || p.appointment_status === 'active').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Confirmed Queue</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-500">
            {patients.filter((p) => p.appointment_status === 'confirmed').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Scheduled visits</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Cases</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            {patients.filter((p) => p.appointment_status === 'completed').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Treated & discharged</p>
        </div>
      </div>

      {/* ── 3. Doctor's Duty Schedule & Clinic Shifts ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Duty Schedule & Clinic Roster
          </h3>
          <span className="text-xs text-slate-400">UNN Medical Centre Timetable</span>
        </div>

        {overview?.shifts && overview.shifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overview.shifts.map((shift) => (
              <div
                key={shift.shift_id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {shift.start_time} - {shift.end_time}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Date: {new Date(shift.shift_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    shift.status === 'on_duty'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}
                >
                  {shift.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-400">
            No active shift roster recorded for this week. Contact UNN Medical Centre Admin for shift scheduling.
          </div>
        )}
      </div>

      {/* ── 4. Patient Consultations Queue (Mobile Cards + Desktop Table) ── */}
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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

        {/* ── A. Mobile-First Card View (Displayed on Mobile < 768px) ─────── */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No patients in this queue</p>
              <p className="text-xs mt-1">All assigned consultations are up to date</p>
            </div>
          ) : (
            filteredPatients.map((p) => (
              <div key={p.assignment_id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                      {p.patient_name ? p.patient_name.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.patient_name}</h4>
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
                    <span>{p.patient_department || 'General UNN'} {p.patient_level ? `(${p.patient_level})` : ''}</span>
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
                      {p.patient_blood_group && <span>Blood: <strong className="text-blue-700 dark:text-blue-300">{p.patient_blood_group}</strong></span>}
                      {p.patient_genotype && <span>Genotype: <strong className="text-blue-700 dark:text-blue-300">{p.patient_genotype}</strong></span>}
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
                      onClick={() => handleUpdateStatus(p.appointment_id, 'confirmed')}
                      disabled={isSubmitting}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm
                    </button>
                  )}
                  {p.appointment_status !== 'completed' ? (
                    <button
                      onClick={() => handleOpenConsultationModal(p)}
                      disabled={isSubmitting}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Consult &amp; Rx
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewSlipPatient(p)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Clinic Slip
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setHandoverPatient(p);
                      if (availableColleagues.length > 0) {
                        setHandoverToDoctorId(availableColleagues[0].doctor_id);
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Refer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── B. Desktop Table View (Displayed on Tablets/Desktop >= 768px) ── */}
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
                  <tr key={p.assignment_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Patient Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {p.patient_name ? p.patient_name.slice(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{p.patient_name}</div>
                          <div className="text-xs text-slate-400">{p.patient_email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Reg */}
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                      <div>{p.patient_department || 'General UNN'} {p.patient_level ? `(${p.patient_level})` : ''}</div>
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
                      {p.appointment_date ? new Date(p.appointment_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled'}
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
                            onClick={() => handleUpdateStatus(p.appointment_id, 'confirmed')}
                            disabled={isSubmitting}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Confirm
                          </button>
                        )}
                        {p.appointment_status !== 'completed' ? (
                          <button
                            onClick={() => handleOpenConsultationModal(p)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Consult &amp; Rx
                          </button>
                        ) : (
                          <button
                            onClick={() => setViewSlipPatient(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Clinic Slip
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setHandoverPatient(p);
                            if (availableColleagues.length > 0) {
                              setHandoverToDoctorId(availableColleagues[0].doctor_id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Refer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Case Referral / Handover Modal ─────────────────────────────── */}
      {handoverPatient && (
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
                onClick={() => setHandoverPatient(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHandoverSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/[0.04] text-xs">
                <span className="text-slate-400 block font-semibold">Patient Being Referred:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {handoverPatient.patient_name} ({handoverPatient.patient_reg_number || `#${handoverPatient.patient_id}`})
                </span>
                <span className="text-slate-400 block mt-1">{handoverPatient.patient_department}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Transfer To Colleague Doctor *
                </label>
                <select
                  required
                  value={handoverToDoctorId}
                  onChange={(e) => setHandoverToDoctorId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500"
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
                  value={handoverReason}
                  onChange={(e) => setHandoverReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500"
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
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setHandoverPatient(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Transferring Case...' : 'Confirm Case Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Clinical Consultation & Prescription Modal ─────────────────── */}
      {consultationPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/30">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Clinical Consultation &amp; Prescription
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Consultation #{consultationPatient.appointment_id} &bull; UNN Medical Centre
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConsultationPatient(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConsultationSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Patient Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/[0.06] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {consultationPatient.patient_name}
                    </span>
                    <span className="text-slate-400 font-mono text-xs ml-2">
                      ({consultationPatient.patient_reg_number || `#${consultationPatient.patient_id}`})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {consultationPatient.patient_department || 'General UNN'} {consultationPatient.patient_level ? `(${consultationPatient.patient_level})` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium flex-wrap pt-1 border-t border-slate-200/40 dark:border-white/[0.04]">
                  {consultationPatient.patient_blood_group && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] font-bold">
                      Blood: {consultationPatient.patient_blood_group}
                    </span>
                  )}
                  {consultationPatient.patient_genotype && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-[11px] font-bold">
                      Genotype: {consultationPatient.patient_genotype}
                    </span>
                  )}
                  {consultationPatient.patient_hostel && (
                    <span className="text-[11px] text-slate-500">
                      Hostel: {consultationPatient.patient_hostel}
                    </span>
                  )}
                  {consultationPatient.patient_phone && (
                    <span className="text-[11px] text-slate-500">
                      Tel: {consultationPatient.patient_phone}
                    </span>
                  )}
                </div>

                {consultationPatient.patient_allergies && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>PATIENT ALLERGIES:</strong> {consultationPatient.patient_allergies}. Verify before prescribing!
                    </span>
                  </div>
                )}
              </div>

              {/* Protocol Quick-Fill Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    UNN Standard Clinical Protocols (Quick-Fill)
                  </label>
                  <span className="text-[11px] text-slate-400">Click to autofill diagnosis &amp; Rx</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_PROTOCOLS.map((proto) => (
                    <button
                      key={proto.name}
                      type="button"
                      onClick={() => applyProtocol(proto)}
                      className="p-2 text-left rounded-xl border border-emerald-200/70 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 transition text-[11px] font-semibold active:scale-95"
                    >
                      {proto.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnosis Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Clinical Assessment &amp; Diagnosis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={clinicalDiagnosis}
                  onChange={(e) => setClinicalDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Uncomplicated Malaria, presenting with 3-day history of chills, intermittent pyrexia..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Prescription Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    Official Pharmacy Prescription &amp; Dosage (℞) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Format: Drug, Strength, Frequency, Duration</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="1. Tab Artemether/Lumefantrine 80/480mg — 1 tab BD x 3 days with meals&#10;2. Tab Paracetamol 1000mg — 2 tabs TDS x 3 days..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  This electronic prescription will be certified under your Medical Officer registration and can be printed by the patient as their official UNN Clinic Slip.
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConsultationPatient(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? 'Signing & Saving...' : 'Complete Consultation & Issue Rx'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Official Clinic Slip Modal ──────────────────────────────────── */}
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
    </div>
  );
}
