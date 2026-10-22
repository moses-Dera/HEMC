'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  DutyShiftData,
  adminCreateDutyShiftAction,
  adminUpdateDutyShiftAction,
  adminDeleteDutyShiftAction
} from '@/app/actions/admin';
import RosterHeader from './_components/roster/RosterHeader';
import RosterMobileView from './_components/roster/RosterMobileView';
import RosterDayColumn from './_components/roster/RosterDayColumn';
import RosterShiftModal from './_components/roster/RosterShiftModal';

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
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Schedule Shift Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDateForShift, setSelectedDateForShift] = useState<string>('');

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
    setIsModalOpen(true);
  };

  // Create Shift Handler
  const handleCreateShift = async (formData: {
    doctor_id: number;
    shift_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await adminCreateDutyShiftAction(formData);

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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden transition-all">
      {/* ── Header Bar & Controls ── */}
      <RosterHeader
        doctors={doctors}
        selectedDoctorFilter={selectedDoctorFilter}
        onDoctorFilterChange={setSelectedDoctorFilter}
        onPrevWeek={handlePrevWeek}
        onThisWeek={handleThisWeek}
        onNextWeek={handleNextWeek}
        onScheduleShift={() => handleOpenAddShift()}
        weekDays={weekDays}
      />

      {/* ── A. Mobile Layout (< 768px): Day Tabs & Detailed Card List ─────── */}
      <RosterMobileView
        weekDays={weekDays}
        shiftsByDate={shiftsByDate}
        activeMobileDayIdx={activeMobileDayIdx}
        onSelectDayIdx={setActiveMobileDayIdx}
        onOpenAddShift={handleOpenAddShift}
        onStatusChange={handleStatusChange}
        onDeleteShift={handleDeleteShift}
      />

      {/* ── B. Desktop 7-Column Grid View (≥ 768px) ───────────────────────── */}
      <div className="hidden md:grid grid-cols-7 divide-x divide-slate-200/80 dark:divide-white/10 min-h-[380px]">
        {weekDays.map((day) => (
          <RosterDayColumn
            key={day.isoDate}
            day={day}
            dayShifts={shiftsByDate[day.isoDate] || []}
            onOpenAddShift={handleOpenAddShift}
            onStatusChange={handleStatusChange}
            onDeleteShift={handleDeleteShift}
          />
        ))}
      </div>

      {/* ── Add Shift Modal ───────────────────────────────────────────────── */}
      <RosterShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateShift}
        doctors={doctors}
        initialDate={selectedDateForShift}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
