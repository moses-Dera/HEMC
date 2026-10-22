'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Sun, Sunset, Moon } from 'lucide-react';

interface DoctorOption {
  doctor_id: number;
  user_id: number;
  name?: string;
  email?: string;
  specialization?: string;
  is_available: boolean;
}

interface RosterShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    doctor_id: number;
    shift_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }) => Promise<void>;
  doctors: DoctorOption[];
  initialDate?: string;
  isSubmitting: boolean;
}

export default function RosterShiftModal({
  isOpen,
  onClose,
  onSubmit,
  doctors,
  initialDate,
  isSubmitting,
}: RosterShiftModalProps) {
  const [formDoctorId, setFormDoctorId] = useState<number>(doctors[0]?.doctor_id || 1);
  const [selectedDateForShift, setSelectedDateForShift] = useState<string>(initialDate || '');
  const [formStartTime, setFormStartTime] = useState<string>('08:00');
  const [formEndTime, setFormEndTime] = useState<string>('14:00');
  const [formStatus, setFormStatus] = useState<string>('scheduled');

  useEffect(() => {
    if (initialDate) {
      setSelectedDateForShift(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (doctors.length > 0 && !doctors.some(d => d.doctor_id === formDoctorId)) {
      setFormDoctorId(doctors[0].doctor_id);
    }
  }, [doctors, formDoctorId]);

  if (!isOpen) return null;

  const applyPreset = (start: string, end: string) => {
    setFormStartTime(start);
    setFormEndTime(end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      doctor_id: Number(formDoctorId),
      shift_date: selectedDateForShift,
      start_time: formStartTime.length === 5 ? `${formStartTime}:00` : formStartTime,
      end_time: formEndTime.length === 5 ? `${formEndTime}:00` : formEndTime,
      status: formStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Schedule Doctor Duty Shift
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assign a physician to UNN Medical Centre clinical hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Physician / Doctor
            </label>
            <select
              value={formDoctorId}
              onChange={(e) => setFormDoctorId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary cursor-pointer"
              required
            >
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.name || `Doctor #${d.doctor_id}`} ({d.specialization || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Duty Date
            </label>
            <input
              type="date"
              value={selectedDateForShift}
              onChange={(e) => setSelectedDateForShift(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary cursor-pointer"
              required
            />
          </div>

          {/* Shift Timing Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Shift Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('08:00', '14:00')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning
              </button>
              <button
                type="button"
                onClick={() => applyPreset('14:00', '20:00')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition cursor-pointer"
              >
                <Sunset className="w-3.5 h-3.5 text-orange-500" /> Afternoon
              </button>
              <button
                type="button"
                onClick={() => applyPreset('20:00', '08:00')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition cursor-pointer"
              >
                <Moon className="w-3.5 h-3.5 text-purple-500" /> Night Call
              </button>
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="scheduled">Scheduled (Upcoming)</option>
              <option value="on_duty">On Duty (Active Now)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Scheduling...' : 'Save Duty Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
