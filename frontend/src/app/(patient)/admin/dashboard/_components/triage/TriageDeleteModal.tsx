'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TriageRuleData } from '@/app/actions/admin';

interface TriageDeleteModalProps {
  rule: TriageRuleData | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export default function TriageDeleteModal({
  rule,
  onClose,
  onConfirm,
  isSubmitting,
}: TriageDeleteModalProps) {
  if (!rule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Delete Triage Rule?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          Are you sure you want to permanently remove <strong className="text-slate-800 dark:text-slate-200">{rule.label}</strong>? Symptoms matching this rule will no longer trigger this clinical escalation.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition"
          >
            {isSubmitting ? 'Deleting…' : 'Delete Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
