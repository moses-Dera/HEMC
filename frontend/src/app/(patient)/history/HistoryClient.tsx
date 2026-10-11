'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Search,
  FileText,
  Pill,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ClinicSlipModal from '@/components/ClinicSlipModal';

interface Message {
  message_id?: number;
  role: 'user' | 'bot';
  content: string;
  created_at?: string;
}

interface ChatSession {
  session_id: number;
  user_id: number;
  started_at: string;
  last_active_at: string;
  messages: Message[];
}

interface Appointment {
  appointment_id: number;
  user_id: number;
  appointment_date: string;
  status: string;
  prescription?: string;
  clinical_notes?: string;
  doctor_name?: string;
  doctor_specialization?: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  department?: string;
  level?: string;
  reg_number?: string;
  phone_number?: string;
  blood_group?: string;
  genotype?: string;
  allergies?: string;
  hostel?: string;
  emergency_contact?: string;
}

interface HistoryClientProps {
  sessions: ChatSession[];
  appointments: Appointment[];
  currentUser?: UserProfile | null;
}

export default function HistoryClient({ sessions, appointments, currentUser }: HistoryClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'chats' | 'appointments'>(
    tabParam === 'appointments' ? 'appointments' : 'chats'
  );

  useEffect(() => {
    if (tabParam === 'appointments') {
      setActiveTab('appointments');
    } else if (tabParam === 'chats') {
      setActiveTab('chats');
    }
  }, [tabParam]);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    sessions.length > 0 ? sessions[0].session_id : null
  );
  const [isViewingTranscript, setIsViewingTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewSlipAppointment, setViewSlipAppointment] = useState<Appointment | null>(null);

  const selectedSession = sessions.find((s) => s.session_id === selectedSessionId) || sessions[0];

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return s.messages.some((m) => m.content.toLowerCase().includes(query));
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin w-full p-6 pb-28 md:p-8 md:pb-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Consultation & Visit History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review past health inquiries, AI triage interactions, and scheduled Medical Centre appointments.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-bg-card-dark p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'chats'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Chat Inquiries ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'appointments'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Clinic Visits ({appointments.length})
          </button>
        </div>
      </div>

      {/* Main Content Grid: 2 columns on desktop to maximize space */}
      {activeTab === 'chats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1">

          {/* Left Column: Sessions List (5 cols) */}
          <div className={`lg:col-span-5 flex-col gap-4 ${isViewingTranscript ? 'hidden lg:flex' : 'flex'}`}>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past conversations..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-bg-card-dark text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: '60vh' }}>
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-bg-card-dark rounded-3xl border border-slate-200/80 dark:border-white/10">
                  <MessageCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No chat sessions found</p>
                  <p className="text-xs text-slate-400 mt-1">Start a conversation in the AI Chatbot to see records here.</p>
                  <Link
                    href="/chat"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                  >
                    Start Chat <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isSelected = selectedSession?.session_id === session.session_id;
                  const firstUserMsg = session.messages.find((m) => m.role === 'user')?.content || 'Inquiry conversation';
                  const dateLabel = formatDate(session.started_at);

                  return (
                    <button
                      key={session.session_id}
                      onClick={() => {
                        setSelectedSessionId(session.session_id);
                        setIsViewingTranscript(true);
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${isSelected
                          ? 'bg-primary/5 dark:bg-primary/10 border-primary shadow-sm'
                          : 'bg-white dark:bg-bg-card-dark border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Session #{session.session_id}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateLabel}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        "{firstUserMsg}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{session.messages.length} messages</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Full Conversation Transcript Viewer (7 cols) */}
          <div className={`lg:col-span-7 bg-white dark:bg-bg-card-dark rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex-col ${isViewingTranscript ? 'flex' : 'hidden lg:flex'}`} style={{ minHeight: '400px', maxHeight: '70vh' }}>
            {selectedSession ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsViewingTranscript(false)}
                      className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Conversation #{selectedSession.session_id} Transcript
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Started on {formatDate(selectedSession.started_at)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
                  >
                    Open Live Chat <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                  {selectedSession.messages.map((m, i) => {
                    const isUser = m.role === 'user';
                    return (
                      <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                          {isUser ? 'You' : 'HEMC Bot (WHO / NCDC)'}
                        </span>
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${isUser
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 rounded-tl-none whitespace-pre-line'
                            }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <MessageCircle className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-semibold">Select a conversation session to review transcript</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Visits / Appointments Tab */
        <div className="w-full">
          {appointments.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-bg-card-dark rounded-3xl border border-slate-200/80 dark:border-white/10 max-w-2xl mx-auto">
              <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Clinic Visits Scheduled</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                You currently have no past or upcoming appointments at the UNN Medical Centre. You can book an appointment directly from your Dashboard.
              </p>
              <Link
                href="/dashboard"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors"
              >
                Schedule Appointment on Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((apt) => {
                const isCompleted = apt.status === 'completed';
                const isConfirmed = apt.status === 'confirmed';
                const hasRxOrNotes = isCompleted || !!apt.prescription || !!apt.clinical_notes;

                return (
                  <div
                    key={apt.appointment_id}
                    className="bg-white dark:bg-bg-card-dark rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">#APT-{apt.appointment_id}</span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : isConfirmed
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-primary" />
                          UNN Medical Centre Consultation
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {apt.doctor_name
                            ? `${apt.doctor_name} ${apt.doctor_specialization ? `(${apt.doctor_specialization})` : ''}`
                            : 'General Outpatient & Triage Review'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(apt.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Booked on {formatDate(apt.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {hasRxOrNotes && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                        <button
                          onClick={() => setViewSlipAppointment(apt)}
                          className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs active:scale-95"
                        >
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>View Official Clinic Slip &amp; Rx</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Official UNN Clinic Consultation & Prescription Slip Modal ─────── */}
      <ClinicSlipModal
        isOpen={!!viewSlipAppointment}
        onClose={() => setViewSlipAppointment(null)}
        data={
          viewSlipAppointment
            ? {
                appointmentId: viewSlipAppointment.appointment_id,
                appointmentDate: viewSlipAppointment.appointment_date,
                studentName: currentUser?.name || 'Student Patient',
                regNumber: currentUser?.reg_number,
                department: currentUser?.department,
                level: currentUser?.level,
                bloodGroup: currentUser?.blood_group,
                genotype: currentUser?.genotype,
                allergies: currentUser?.allergies,
                phoneNumber: currentUser?.phone_number,
                hostel: currentUser?.hostel,
                doctorName: viewSlipAppointment.doctor_name || 'Medical Officer on Duty',
                doctorSpecialization: viewSlipAppointment.doctor_specialization || 'Clinical General Practitioner',
                diagnosis: viewSlipAppointment.clinical_notes || 'Consultation completed. Patient examined and advised.',
                prescription: viewSlipAppointment.prescription || 'Medications prescribed as recorded.',
                status: viewSlipAppointment.status,
              }
            : null
        }
      />

    </div>
  );
}
