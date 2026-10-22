'use client';

import React from 'react';
import { Phone, Mail, AlertTriangle, Clock, Check, PhoneCall, CheckCircle2, Eye } from 'lucide-react';
import { AdminUrgentCheckData } from '@/app/actions/admin';

interface UrgentCaseRowProps {
  urgentCase: AdminUrgentCheckData;
  isUpdating: boolean;
  onToggleContacted: (c: AdminUrgentCheckData) => void;
  onToggleReviewed: (c: AdminUrgentCheckData) => void;
  onViewDetails: (c: AdminUrgentCheckData) => void;
}

export default function UrgentCaseRow({
  urgentCase: c,
  isUpdating,
  onToggleContacted,
  onToggleReviewed,
  onViewDetails,
}: UrgentCaseRowProps) {
  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
      {/* Student Patient Info */}
      <td className="py-4 px-6">
        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
          {c.patient_name}
          {!c.contacted && (
            <span className="w-2 h-2 rounded-full bg-red-500" title="Uncontacted emergency" />
          )}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
          {c.patient_reg_number && <span>Reg: {c.patient_reg_number}</span>}
          {c.patient_department && <span>• {c.patient_department}</span>}
          {c.patient_hostel && <span>• Hostel: {c.patient_hostel}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
          {c.patient_phone && (
            <a 
              href={`tel:${c.patient_phone}`}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <Phone className="w-3 h-3" /> {c.patient_phone}
            </a>
          )}
          <a 
            href={`mailto:${c.patient_email}`}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Mail className="w-3 h-3" /> {c.patient_email}
          </a>
        </div>
      </td>

      {/* Red Flags & Symptoms */}
      <td className="py-4 px-4 max-w-xs">
        <div className="flex flex-wrap gap-1.5 mb-1">
          {c.red_flags && c.red_flags.length > 0 ? (
            c.red_flags.map((flag, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {flag}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
              Urgent Red-Flag Triage
            </span>
          )}
        </div>
        {c.fever_duration && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Fever: <strong className="text-slate-700 dark:text-slate-300">{c.fever_duration}</strong></span>
          </div>
        )}
      </td>

      {/* Flagged Time */}
      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs">
        <div className="font-medium text-slate-700 dark:text-slate-300">
          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-[10px] text-slate-400">
          {new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </td>

      {/* Contacted Toggle */}
      <td className="py-4 px-4 text-center">
        <button
          onClick={() => onToggleContacted(c)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
            c.contacted
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:opacity-80'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 hover:opacity-80'
          }`}
          title={c.contacted ? 'Click to mark uncontacted' : 'Click to mark student contacted'}
        >
          {c.contacted ? <Check className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}
          {c.contacted ? 'Contacted' : 'Pending Call'}
        </button>
      </td>

      {/* Reviewed Toggle */}
      <td className="py-4 px-4 text-center">
        <button
          onClick={() => onToggleReviewed(c)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
            c.reviewed
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:opacity-80'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:opacity-80'
          }`}
          title={c.reviewed ? 'Click to mark unreviewed' : 'Click to mark clinical review complete'}
        >
          {c.reviewed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {c.reviewed ? 'Reviewed' : 'Awaiting Review'}
        </button>
      </td>

      {/* Action */}
      <td className="py-4 px-6 text-right">
        <button
          onClick={() => onViewDetails(c)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      </td>
    </tr>
  );
}
