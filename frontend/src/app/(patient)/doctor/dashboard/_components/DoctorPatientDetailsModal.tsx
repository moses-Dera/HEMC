'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldAlert,
  Activity,
  FileText,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  Building,
  GraduationCap,
  ArrowRightLeft,
  Send,
  Loader2,
  Calendar,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientAssignment } from '../types';
import { sendDoctorEmailAction } from '@/app/actions/doctor';

interface DoctorPatientDetailsModalProps {
  patient: PatientAssignment | null;
  doctorName?: string;
  onClose: () => void;
  onOpenConsultationModal: (patient: PatientAssignment) => void;
  onViewSlip: (patient: PatientAssignment) => void;
  onOpenHandoverModal: (patient: PatientAssignment) => void;
}

export default function DoctorPatientDetailsModal({
  patient,
  doctorName,
  onClose,
  onOpenConsultationModal,
  onViewSlip,
  onOpenHandoverModal,
}: DoctorPatientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'dossier' | 'chat' | 'email'>('dossier');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!patient) return null;

  // Preset email templates
  const applyEmailTemplate = (type: 'reminder' | 'instructions' | 'urgent') => {
    const studentFirstName = patient.patient_name ? patient.patient_name.split(' ')[0] : 'Student';
    const docTitle = doctorName ? `Dr. ${doctorName}` : 'Doctor on Duty';

    if (type === 'reminder') {
      setEmailSubject('UNN Medical Centre: Clinical Consultation Reminder');
      setEmailBody(
        `Dear ${studentFirstName},\n\nThis is ${docTitle} from the UNN Medical Centre. Your clinical consultation has been queued. Please proceed to the clinic consultation room when called.\n\nBring your Student ID card with you.\n\nWarm regards,\nUNN Medical Centre Team`
      );
    } else if (type === 'instructions') {
      setEmailSubject('UNN Medical Centre: Post-Consultation Care & Pharmacy Instructions');
      setEmailBody(
        `Dear ${studentFirstName},\n\nFollowing your consultation with ${docTitle}, please ensure you:\n1. Collect your prescribed medication at the University Pharmacy.\n2. Complete the full course of treatment as directed.\n3. Drink plenty of clean water and get adequate rest.\n\nIf symptoms persist after 48 hours, please return to the Medical Centre.\n\nWarm regards,\nUNN Medical Centre Team`
      );
    } else if (type === 'urgent') {
      setEmailSubject('URGENT: Immediate Evaluation Required at UNN Medical Centre');
      setEmailBody(
        `Dear ${studentFirstName},\n\nBased on your reported symptoms and AI pre-triage assessment, ${docTitle} advises you to report to the UNN Medical Centre Emergency Unit IMMEDIATELY for an in-person clinical evaluation.\n\nIf you have difficulty walking, contact UNN Emergency Services or your hostel porter.\n\nUNN Medical Centre Emergency Unit`
      );
    }
  };

  const handleSendEmail = async () => {
    if (!patient.patient_email) {
      toast.error('Student email address is not available');
      return;
    }
    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }
    if (!emailBody.trim()) {
      toast.error('Please enter the email body');
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await sendDoctorEmailAction(patient.patient_email, emailSubject, emailBody);
      if (res.success) {
        toast.success(`Email successfully sent to ${patient.patient_email}`);
        setEmailSubject('');
        setEmailBody('');
        setActiveTab('dossier');
      } else {
        toast.error(res.error || 'Failed to dispatch email');
      }
    } catch {
      toast.error('Network error dispatching email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isUrgent =
    patient.triage_urgency?.toLowerCase().includes('urgent') ||
    (patient.red_flags && patient.red_flags.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Modal Header ── */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-base shadow-xs">
              {patient.patient_name ? patient.patient_name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {patient.patient_name || 'Student Patient'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isUrgent
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}
                >
                  {isUrgent ? 'Urgent / Red Flags' : 'Routine'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                  {patient.appointment_status || 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {patient.patient_reg_number || `#${patient.patient_id}`}
                </span>
                <span>•</span>
                <span>{patient.patient_department || 'General UNN'} {patient.patient_level ? `(${patient.patient_level})` : ''}</span>
                {patient.patient_email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {patient.patient_email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'dossier'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            AI Clinical Dossier &amp; Vitals
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer relative ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat History
            {patient.recent_chat_messages && patient.recent_chat_messages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 rounded-full text-[10px]">
                {patient.recent_chat_messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'email'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            Send Email Notification
          </button>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* TAB 1: Clinical Dossier */}
          {activeTab === 'dossier' && (
            <div className="space-y-4">
              {/* Allergy Alert Warning */}
              {patient.patient_allergies && patient.patient_allergies.toLowerCase() !== 'none' ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3 text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider">Allergy Safety Alert</h4>
                    <p className="text-xs mt-0.5 font-medium">
                      Student has reported drug/substance allergies:{' '}
                      <strong className="underline decoration-amber-500">{patient.patient_allergies}</strong>.
                      Verify before administering or prescribing medications.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/[0.04] flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  No known drug allergies reported on student file.
                </div>
              )}

              {/* Bio & Clinical Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {patient.patient_blood_group || 'Not recorded'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Genotype</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {patient.patient_genotype || 'Not recorded'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fever Duration</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {patient.fever_duration || 'Not specified'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/[0.06]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Triage Outcome</span>
                  <span className={`text-sm font-bold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {patient.triage_urgency || 'Routine'}
                  </span>
                </div>
              </div>

              {/* Red Flags & Symptoms Card */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    AI Symptom Pre-Triage Assessment
                  </h4>
                  {patient.appointment_date && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(patient.appointment_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-white/[0.04]">
                  <span className="font-semibold block mb-0.5 text-slate-700 dark:text-slate-200">Clinical Summary:</span>
                  {patient.triage_summary || 'Standard clinical consultation appointment booked through UNN student portal.'}
                </div>

                {/* Detected Red Flags */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Detected Red Flag Signs:
                  </span>
                  {patient.red_flags && patient.red_flags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.red_flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No critical emergency red flags reported during pre-triage questionnaire.</p>
                  )}
                </div>
              </div>

              {/* Student Demographics & Location */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Hostel / Hall of Residence: <strong>{patient.patient_hostel || 'Not listed (Off-campus)'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Faculty &amp; Department: <strong>{patient.patient_department || 'General UNN'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Student Phone: <strong>{patient.patient_phone || 'None provided'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <HeartPulse className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Emergency Contact: <strong>{patient.patient_emergency_contact || 'None listed'}</strong>
                  </span>
                </div>
              </div>

              {/* Doctor's Previous Consultation Notes if Completed */}
              {patient.clinical_notes && (
                <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Recorded Clinical Diagnosis &amp; Rx
                  </h4>
                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-200">
                    <p>
                      <strong>Diagnosis:</strong> {patient.clinical_notes}
                    </p>
                    {patient.prescription && (
                      <p className="whitespace-pre-line mt-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 font-mono text-[11px]">
                        {patient.prescription}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI Chat Conversation History */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  Below is the dialogue exchanged between the student and the UNN Medical AI Assistant prior to scheduling.
                </span>
              </div>

              {patient.recent_chat_messages && patient.recent_chat_messages.length > 0 ? (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {patient.recent_chat_messages.map((msg, i) => {
                    const isAssistant = msg.role === 'assistant' || msg.role === 'ai';
                    return (
                      <div
                        key={i}
                        className={`flex gap-3 text-xs ${isAssistant ? 'justify-start' : 'justify-end'}`}
                      >
                        {isAssistant && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
                            AI
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            isAssistant
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                              : 'bg-emerald-600 text-white rounded-tr-sm shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                          {msg.time && (
                            <span
                              className={`text-[9px] block text-right mt-1 ${
                                isAssistant ? 'text-slate-400' : 'text-emerald-200'
                              }`}
                            >
                              {msg.time}
                            </span>
                          )}
                        </div>
                        {!isAssistant && (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                            {patient.patient_name ? patient.patient_name.slice(0, 1).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-sm">No recorded AI chat messages</p>
                  <p className="text-xs mt-1">This consultation may have been scheduled directly through the triage desk or emergency intake.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Send Follow-up Email */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                    Send Direct Clinical Email to Student
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dispatched securely via UNN Medical Centre Mail Gateway (Gmail API) to: <strong>{patient.patient_email || 'No email registered'}</strong>
                  </p>
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Quick Clinical Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('reminder')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    Consultation Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('instructions')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    Pharmacy &amp; Care Rx
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('urgent')}
                    className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium transition cursor-pointer"
                  >
                    Urgent Intake Notice
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. UNN Medical Centre: Follow-up regarding your consultation"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-850 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Message Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Type your medical instructions or follow-up note to the student..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-850 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !patient.patient_email}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Email to Student
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenHandoverModal(patient);
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Refer / Handover Case
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>

            {patient.appointment_status === 'completed' ? (
              <button
                onClick={() => {
                  onClose();
                  onViewSlip(patient);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                View Clinic Slip
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenConsultationModal(patient);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Proceed to Consult &amp; Rx
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
