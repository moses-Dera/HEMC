'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Trash2,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  X,
  Filter,
  Sparkles,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DutyShiftData,
  adminCreateDutyShiftAction,
  adminUpdateDutyShiftAction,
  adminDeleteDutyShiftAction
} from '@/app/actions/admin';

interface DoctorOption {
  doctor_id: number;
  user_id: number;
  name?: string;
  email?: string;
  specialization?: string;
  is_available: boolean;
}

interface AdminDutyRosterSchedulerProps {
  initialShifts: DutyShiftData[];
  doctors: DoctorOption[];
}

export default function AdminDutyRosterScheduler({
  initialShifts,
  doctors,
}: AdminDutyRosterSchedulerProps) {
  const [shifts, setShifts] = useState<DutyShiftData[]>(initialShifts);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    // Monday as start of week: day 0 is Sunday, so if day is 0, diff = -6, else 1 - day
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Schedule Shift Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDateForShift, setSelectedDateForShift] = useState<string>('');
  const [formDoctorId, setFormDoctorId] = useState<number>(doctors[0]?.doctor_id || 1);
  const [formStartTime, setFormStartTime] = useState<string>('08:00');
  const [formEndTime, setFormEndTime] = useState<string>('14:00');
  const [formStatus, setFormStatus] = useState<string>('scheduled');

  // Active Mobile Day View Tab (0 for Mon, 6 for Sun)
  const [activeMobileDayIdx, setActiveMobileDayIdx] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // 0=Mon ... 6=Sun
  });

  // Calculate the 7 days of the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const isoDate = d.toISOString().slice(0, 10);
      const isToday = new Date().toISOString().slice(0, 10) === isoDate;
      return {
        date: d,
        isoDate,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayFullName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday,
      };
    });
  }, [currentWeekStart]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (selectedDoctorFilter !== 'all' && String(s.doctor_id) !== selectedDoctorFilter) {
        return false;
      }
      return true;
    });
  }, [shifts, selectedDoctorFilter]);

  // Map shifts by ISO Date string
  const shiftsByDate = useMemo(() => {
    const map: Record<string, DutyShiftData[]> = {};
    weekDays.forEach((w) => {
      map[w.isoDate] = [];
    });
    filteredShifts.forEach((s) => {
      const shiftIso = String(s.shift_date).slice(0, 10);
      if (map[shiftIso]) {
        map[shiftIso].push(s);
      }
    });
    return map;
  }, [weekDays, filteredShifts]);

  // Open Add Shift Modal for a specific date
  const handleOpenAddShift = (dateStr?: string) => {
    const targetDate = dateStr || weekDays[0].isoDate;
    setSelectedDateForShift(targetDate);
    if (doctors.length > 0) {
      setFormDoctorId(doctors[0].doctor_id);
    }
    setFormStartTime('08:00');
    setFormEndTime('14:00');
    setFormStatus('scheduled');
    setIsModalOpen(true);
  };

  // Quick Preset Helper
  const applyPreset = (start: string, end: string) => {
    setFormStartTime(start);
    setFormEndTime(end);
  };

  // Create Shift Handler
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDoctorId || !selectedDateForShift || !formStartTime || !formEndTime) {
      toast.error('All shift fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminCreateDutyShiftAction({
        doctor_id: Number(formDoctorId),
        shift_date: selectedDateForShift,
        start_time: formStartTime.length === 5 ? `${formStartTime}:00` : formStartTime,
        end_time: formEndTime.length === 5 ? `${formEndTime}:00` : formEndTime,
        status: formStatus,
      });

      if (!res.success || !res.shift) {
        toast.error(res.error || 'Failed to create shift');
      } else {
        toast.success('Duty shift scheduled successfully');
        setShifts((prev) => [...prev, res.shift]);
        setIsModalOpen(false);
      }
    } catch {
      toast.error('Error scheduling shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status Handler
  const handleStatusChange = async (shiftId: number, newStatus: string) => {
    try {
      const res = await adminUpdateDutyShiftAction(shiftId, { status: newStatus });
      if (!res.success || !res.shift) {
        toast.error(res.error || 'Failed to update shift');
      } else {
        toast.success(`Shift marked as ${newStatus.replace('_', ' ')}`);
        setShifts((prev) =>
          prev.map((s) => (s.shift_id === shiftId ? { ...s, status: newStatus as any } : s))
        );
      }
    } catch {
      toast.error('Failed to update shift status');
    }
  };

  // Delete Shift Handler
  const handleDeleteShift = async (shiftId: number) => {
    if (!window.confirm('Are you sure you want to remove this duty shift?')) return;
    try {
      const res = await adminDeleteDutyShiftAction(shiftId);
      if (!res.success) {
        toast.error(res.error || 'Failed to delete shift');
      } else {
        toast.success('Duty shift removed from timetable');
        setShifts((prev) => prev.filter((s) => s.shift_id !== shiftId));
      }
    } catch {
      toast.error('Failed to remove shift');
    }
  };

  const formatTimeSlot = (start: string, end: string) => {
    const s = String(start).slice(0, 5);
    const e = String(end).slice(0, 5);
    return `${s} – ${e}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden transition-all">
      {/* ── Header Bar ────────────────────────────────────────────────────── */}
      <div className="p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                UNN Medical Centre Duty Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Schedule and coordinate on-duty physicians for student clinical consultations
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Week Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Doctor Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={String(d.doctor_id)} className="bg-white dark:bg-slate-800">
                  {d.name || `Dr. Specialization ${d.doctor_id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Week Nav Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleThisWeek}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
            >
              This Week
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Shift Button */}
          <button
            onClick={() => handleOpenAddShift()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Schedule Shift
          </button>
        </div>
      </div>

      {/* Week Title Subheader */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
        <div>
          Week of{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {weekDays[0].dayFullName}, {weekDays[0].monthName} {weekDays[0].dayNumber}
          </strong>{' '}
          –{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {weekDays[6].dayFullName}, {weekDays[6].monthName} {weekDays[6].dayNumber}
          </strong>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            On Duty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Completed
          </span>
        </div>
      </div>

      {/* ── A. Mobile Layout (< 768px): Day Tabs & Detailed Card List ─────── */}
      <div className="block md:hidden p-4">
        {/* Horizontal Day Tabs */}
        <div className="grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-4">
          {weekDays.map((d, idx) => {
            const isSelected = activeMobileDayIdx === idx;
            const shiftCount = shiftsByDate[d.isoDate]?.length || 0;
            return (
              <button
                key={d.isoDate}
                onClick={() => setActiveMobileDayIdx(idx)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                } ${d.isToday ? 'ring-2 ring-blue-500/30' : ''}`}
              >
                <span className="text-[10px] uppercase">{d.dayName}</span>
                <span className="text-sm font-extrabold mt-0.5">{d.dayNumber}</span>
                {shiftCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Selected Day Shifts */}
        {(() => {
          const selectedDay = weekDays[activeMobileDayIdx];
          const dayShifts = shiftsByDate[selectedDay.isoDate] || [];

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedDay.dayFullName}, {selectedDay.monthName} {selectedDay.dayNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {dayShifts.length} {dayShifts.length === 1 ? 'shift scheduled' : 'shifts scheduled'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAddShift(selectedDay.isoDate)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Doctor
                </button>
              </div>

              {dayShifts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold text-slate-500">No shifts scheduled for this day</p>
                  <button
                    onClick={() => handleOpenAddShift(selectedDay.isoDate)}
                    className="mt-3 text-xs font-bold text-primary hover:underline"
                  >
                    + Assign Doctor on Shift
                  </button>
                </div>
              ) : (
                dayShifts.map((shift) => (
                  <div
                    key={shift.shift_id}
                    className="p-3.5 rounded-2xl border bg-white dark:bg-slate-800/60 border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {shift.doctor_name ? shift.doctor_name.slice(4, 6).toUpperCase() : 'DR'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {shift.doctor_name || `Doctor #${shift.doctor_id}`}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {shift.doctor_specialization || 'General Practice'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          shift.status === 'on_duty'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : shift.status === 'completed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}
                      >
                        {shift.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatTimeSlot(shift.start_time, shift.end_time)}
                      </div>

                      <div className="flex items-center gap-2">
                        {shift.status !== 'on_duty' && shift.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(shift.shift_id, 'on_duty')}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            Mark On Duty
                          </button>
                        )}
                        {shift.status === 'on_duty' && (
                          <button
                            onClick={() => handleStatusChange(shift.shift_id, 'completed')}
                            className="text-[11px] text-slate-500 font-bold hover:underline"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteShift(shift.shift_id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition"
                          title="Remove Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })()}
      </div>

      {/* ── B. Desktop 7-Column Grid View (≥ 768px) ───────────────────────── */}
      <div className="hidden md:grid grid-cols-7 divide-x divide-slate-200/80 dark:divide-white/10 min-h-[380px]">
        {weekDays.map((day) => {
          const dayShifts = shiftsByDate[day.isoDate] || [];

          return (
            <div
              key={day.isoDate}
              className={`flex flex-col ${
                day.isToday ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between ${
                  day.isToday ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {day.dayName}
                  </div>
                  <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    {day.dayNumber}
                    {day.isToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500 text-white uppercase">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddShift(day.isoDate)}
                  className="w-6 h-6 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
                  title={`Schedule shift for ${day.dayFullName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Body: Shift Cards */}
              <div className="p-2 space-y-2 flex-1">
                {dayShifts.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <button
                      onClick={() => handleOpenAddShift(day.isoDate)}
                      className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-primary transition text-center"
                    >
                      + Add Shift
                    </button>
                  </div>
                ) : (
                  dayShifts.map((shift) => (
                    <div
                      key={shift.shift_id}
                      className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-white/[0.08] shadow-xs hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {shift.doctor_name || `Dr. #${shift.doctor_id}`}
                        </div>
                        <button
                          onClick={() => handleDeleteShift(shift.shift_id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-0.5"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {shift.doctor_specialization || 'Clinical'}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-white/[0.04]">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {formatTimeSlot(shift.start_time, shift.end_time)}
                        </span>

                        <button
                          onClick={() => {
                            const nextStatus =
                              shift.status === 'scheduled'
                                ? 'on_duty'
                                : shift.status === 'on_duty'
                                ? 'completed'
                                : 'scheduled';
                            handleStatusChange(shift.shift_id, nextStatus);
                          }}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer uppercase ${
                            shift.status === 'on_duty'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : shift.status === 'completed'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}
                          title="Click to toggle status"
                        >
                          {shift.status.replace('_', ' ')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Shift Modal ───────────────────────────────────────────────── */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              {/* Doctor Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Physician / Doctor
                </label>
                <select
                  value={formDoctorId}
                  onChange={(e) => setFormDoctorId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary"
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
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('14:00', '20:00')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition"
                  >
                    <Sunset className="w-3.5 h-3.5 text-orange-500" /> Afternoon
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('20:00', '08:00')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="scheduled">Scheduled (Upcoming)</option>
                  <option value="on_duty">On Duty (Active Now)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save Duty Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
