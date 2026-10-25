'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Stethoscope, ChevronDown, Check } from 'lucide-react';
import { ColleagueDoctor } from '../types';

interface AdminDoctorPreviewBarProps {
  doctors: ColleagueDoctor[];
  currentDoctorId?: number;
  currentDoctorName?: string;
  currentDoctorSpecialization?: string;
  onSelectDoctor: (doctorId: number) => void;
}

export default function AdminDoctorPreviewBar({
  doctors,
  currentDoctorId,
  currentDoctorName,
  currentDoctorSpecialization,
  onSelectDoctor,
}: AdminDoctorPreviewBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedDoctor =
    doctors.find((d) => d.doctor_id === currentDoctorId) || doctors[0];

  return (
    <div className="bg-white dark:bg-bg-card-dark border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
      {/* ── Left: Status & Context ── */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-primary dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/40">
              Admin Preview Mode
            </span>
            <span className="hidden sm:inline text-xs text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Clinical Consultation Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Currently inspecting desk for:{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {currentDoctorName || selectedDoctor?.name || 'Attending Physician'}
            </strong>{' '}
            <span className="text-slate-400 dark:text-slate-500">
              ({currentDoctorSpecialization || selectedDoctor?.specialization || 'Clinical Specialist'})
            </span>
          </p>
        </div>
      </div>

      {/* ── Right: Custom Doctor Selector Dropdown ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Switch Doctor:
        </span>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border transition-all cursor-pointer min-w-[260px] sm:min-w-[290px] text-left ${
              isOpen
                ? 'border-primary ring-2 ring-primary/20 bg-white dark:bg-slate-800'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-primary dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/60 dark:border-blue-800/40">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {selectedDoctor?.name || 'Select Doctor'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {selectedDoctor?.specialization || 'Clinical Doctor'}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-primary' : ''
              }`}
            />
          </button>

          {/* Custom Popover Panel */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-full sm:w-80 bg-white dark:bg-bg-card-dark border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xl z-50 p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                Medical Centre Physicians ({doctors.length})
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                {doctors.map((doc) => {
                  const isSelected = doc.doctor_id === currentDoctorId;
                  const initial = doc.name
                    ? doc.name.replace(/^Dr\.\s*/i, '').charAt(0)
                    : 'D';
                  return (
                    <button
                      key={doc.doctor_id}
                      type="button"
                      onClick={() => {
                        onSelectDoctor(doc.doctor_id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p
                              className={`text-xs font-bold truncate ${
                                isSelected
                                  ? 'text-primary dark:text-blue-300'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {doc.name || `Doctor #${doc.doctor_id}`}
                            </p>
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                doc.is_available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                              title={doc.is_available ? 'On Duty' : 'Off Duty'}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {doc.specialization || 'Clinical Doctor'}
                          </p>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
