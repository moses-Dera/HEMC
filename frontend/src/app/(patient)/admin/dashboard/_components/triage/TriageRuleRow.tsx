'use client';

import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Power, Edit3, Trash2 } from 'lucide-react';
import { TriageRuleData } from '@/app/actions/admin';

interface TriageRuleRowProps {
  rule: TriageRuleData;
  onToggleActive: (rule: TriageRuleData) => void;
  onEdit: (rule: TriageRuleData) => void;
  onDelete: (rule: TriageRuleData) => void;
}

export default function TriageRuleRow({
  rule,
  onToggleActive,
  onEdit,
  onDelete,
}: TriageRuleRowProps) {
  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-6">
        <div className="font-bold text-slate-900 dark:text-white text-sm">
          {rule.label}
        </div>
        {rule.value && (
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            slug: {rule.value}
          </div>
        )}
      </td>

      <td className="py-4 px-4">
        {rule.condition_type === 'red_flag' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/30">
            <AlertTriangle className="w-3 h-3" /> Red Flag
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30">
            <Clock className="w-3 h-3" /> Duration Threshold
          </span>
        )}
      </td>

      <td className="py-4 px-4">
        {rule.outcome === 'urgent' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
            <ShieldAlert className="w-3.5 h-3.5" /> Urgent Medical Centre Visit
          </span>
        )}
        {rule.outcome === 'book' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            Book Doctor Appointment
          </span>
        )}
        {rule.outcome === 'self_care' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            Self-Care & Advice
          </span>
        )}
      </td>

      <td className="py-4 px-4 text-center">
        <button
          onClick={() => onToggleActive(rule)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            rule.active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:opacity-80'
              : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:opacity-80'
          }`}
          title={rule.active ? 'Click to disable rule' : 'Click to enable rule'}
        >
          <Power className="w-3 h-3" />
          {rule.active ? 'Active' : 'Disabled'}
        </button>
      </td>

      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Edit rule"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            title="Delete rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
