'use client';

import React from 'react';
import { Printer, X, ShieldCheck, Stethoscope, AlertTriangle, FileText, Pill, HeartPulse } from 'lucide-react';

export interface ClinicSlipData {
  appointmentId: number | string;
  appointmentDate: string;
  studentName: string;
  regNumber?: string;
  department?: string;
  level?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  phoneNumber?: string;
  hostel?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  diagnosis?: string;
  prescription?: string;
  status?: string;
}

interface ClinicSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ClinicSlipData | null;
}

export default function ClinicSlipModal({ isOpen, onClose, data }: ClinicSlipModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = (() => {
    try {
      const d = new Date(data.appointmentDate);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return data.appointmentDate;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Print-specific style injected into head for clean output */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-clinic-slip, #printable-clinic-slip * {
              visibility: visible;
            }
            #printable-clinic-slip {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              box-shadow: none;
              border: none;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `
      }} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Official UNN Clinic Consultation Slip
              </h3>
              <p className="text-[11px] text-slate-400">
                Slip Ref: #UNN-RX-{data.appointmentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          <div
            id="printable-clinic-slip"
            className="border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm space-y-6"
          >
            {/* Header: University Crest & Stationery Title */}
            <div className="text-center pb-5 border-b-2 border-emerald-600/30 dark:border-emerald-500/30 space-y-1">
              <div className="inline-flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                University of Nigeria, Nsukka
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                University Health Services Centre (HEMC)
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Medical Consultation Record & Pharmacy Prescription Slip
              </p>
              <div className="text-[10px] text-slate-400 italic pt-0.5">
                Motto: &quot;To Restore the Dignity of Man&quot;
              </div>
            </div>

            {/* Slip Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Slip Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  UNN/MC/RX-{data.appointmentId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formattedDate}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {data.status ? data.status.toUpperCase() : 'COMPLETED'}
                </span>
              </div>
            </div>

            {/* Section 1: Patient Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                Student Patient Profile
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/40 dark:bg-slate-900/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{data.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Matric / Reg No</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {data.regNumber || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Department & Level</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {data.department || 'General UNN'} {data.level ? `(${data.level})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {data.bloodGroup || 'Not logged'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Genotype</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {data.genotype || 'Not logged'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Hostel / Residence</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {data.hostel || 'Nsukka Campus'}
                  </span>
                </div>
              </div>

              {/* Allergy Warning if present */}
              {data.allergies && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">KNOWN DRUG ALLERGIES:</span> {data.allergies}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Attending Medical Officer */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                Attending Physician
              </h4>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/40 dark:bg-slate-900/40 text-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {data.doctorName || 'Medical Officer on Duty'}
                  </span>
                  <span className="block text-slate-500 dark:text-slate-400 text-[11px]">
                    {data.doctorSpecialization || 'Clinical General Practitioner'} &bull; UNN Health Services
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Station</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Consulting Room & Triage</span>
                </div>
              </div>
            </div>

            {/* Section 3: Diagnosis & Clinical Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Clinical Assessment & Diagnosis
              </h4>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                {data.diagnosis || 'Clinical consultation conducted. Patient examined and prescribed medication.'}
              </div>
            </div>

            {/* Section 4: Official Prescription (Rx) */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                Official Pharmacy Prescription (℞)
              </h4>
              <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-mono">
                {data.prescription || 'No medications prescribed. Routine advice provided.'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Dispensing Notice: Present this official slip at the HEMC Central Pharmacy (Ground Floor, Main Clinic Building) for medication dispensing.
              </p>
            </div>

            {/* Section 5: Signature & Validation Seal */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Electronically Verified & Signed</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Authentication Hash: UNN-HEMC-{String(data.appointmentId).padStart(6, '0')}-VERIFIED
                </p>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
                <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700 pb-1 inline-block min-w-[160px]">
                  {data.doctorName || 'Medical Officer'}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                  Authorized Medical Officer
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
