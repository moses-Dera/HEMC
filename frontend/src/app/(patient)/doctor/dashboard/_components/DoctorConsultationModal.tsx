'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, X, AlertCircle, Sparkles, Pill, CheckCircle } from 'lucide-react';

export const PRESET_PROTOCOLS = [
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

import { PatientAssignment } from '../types';

interface DoctorConsultationModalProps {
  patient: PatientAssignment | null;
  onClose: () => void;
  onSubmit: (data: {
    appointmentId: number;
    diagnosis: string;
    prescription: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function DoctorConsultationModal({
  patient,
  onClose,
  onSubmit,
  isSubmitting,
}: DoctorConsultationModalProps) {
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  useEffect(() => {
    if (patient) {
      setClinicalDiagnosis(patient.clinical_notes || '');
      setPrescriptionNotes(patient.prescription || '');
    }
  }, [patient]);

  if (!patient) return null;

  const applyProtocol = (proto: (typeof PRESET_PROTOCOLS)[0]) => {
    setClinicalDiagnosis(proto.diagnosis);
    setPrescriptionNotes(proto.prescription);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      appointmentId: patient.appointment_id,
      diagnosis: clinicalDiagnosis,
      prescription: prescriptionNotes,
    });
  };

  return (
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
                Consultation #{patient.appointment_id} &bull; UNN Medical Centre
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Patient Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/[0.06] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {patient.patient_name}
                </span>
                <span className="text-slate-400 font-mono text-xs ml-2">
                  ({patient.patient_reg_number || `#${patient.patient_id}`})
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {patient.patient_department || 'General UNN'}{' '}
                {patient.patient_level ? `(${patient.patient_level})` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium flex-wrap pt-1 border-t border-slate-200/40 dark:border-white/[0.04]">
              {patient.patient_blood_group && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] font-bold">
                  Blood: {patient.patient_blood_group}
                </span>
              )}
              {patient.patient_genotype && (
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-[11px] font-bold">
                  Genotype: {patient.patient_genotype}
                </span>
              )}
              {patient.patient_hostel && (
                <span className="text-[11px] text-slate-500">Hostel: {patient.patient_hostel}</span>
              )}
              {patient.patient_phone && (
                <span className="text-[11px] text-slate-500">Tel: {patient.patient_phone}</span>
              )}
            </div>

            {patient.patient_allergies && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>PATIENT ALLERGIES:</strong> {patient.patient_allergies}. Verify before prescribing!
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
                  className="p-2 text-left rounded-xl border border-emerald-200/70 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 transition text-[11px] font-semibold active:scale-95 cursor-pointer"
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
              <span className="text-[10px] text-slate-400 font-mono">
                Format: Drug, Strength, Frequency, Duration
              </span>
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'Signing & Saving...' : 'Complete Consultation & Issue Rx'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
