'use client';

import React, { useState, useEffect } from 'react';
import { TriageRuleData } from '@/app/actions/admin';
import { toast } from 'sonner';

interface TriageRuleModalProps {
  isOpen: boolean;
  initialData?: TriageRuleData | null;
  onClose: () => void;
  onSubmit: (data: {
    label: string;
    condition_type: 'red_flag' | 'duration_threshold';
    value: string;
    outcome: 'urgent' | 'book' | 'self_care';
    active: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function TriageRuleModal({
  isOpen,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}: TriageRuleModalProps) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    label: '',
    condition_type: 'red_flag' as 'red_flag' | 'duration_threshold',
    value: '',
    outcome: 'urgent' as 'urgent' | 'book' | 'self_care',
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label,
        condition_type: initialData.condition_type,
        value: initialData.value || '',
        outcome: initialData.outcome,
        active: initialData.active,
      });
    } else {
      setFormData({
        label: '',
        condition_type: 'red_flag',
        value: '',
        outcome: 'urgent',
        active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      toast.error('Rule label is required');
      return;
    }
    const slug = formData.value.trim() || formData.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    onSubmit({
      ...formData,
      value: slug,
      label: formData.label.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {isEditing ? 'Edit Triage Rule' : 'Add New Clinical Triage Rule'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          {isEditing 
            ? 'Update criteria or urgency outcome for this rule.' 
            : 'Create a symptom criterion evaluated during AI student triage consultations.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rule Label / Symptom Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stiff Neck / Severe Photophobia"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Condition Type
              </label>
              <select
                value={formData.condition_type}
                onChange={(e: any) => setFormData({ ...formData, condition_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="red_flag">Red Flag Symptom</option>
                <option value="duration_threshold">Duration Threshold</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Urgency Outcome
              </label>
              <select
                value={formData.outcome}
                onChange={(e: any) => setFormData({ ...formData, outcome: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary font-semibold"
              >
                <option value="urgent">Urgent Escalation</option>
                <option value="book">Book Appointment</option>
                <option value="self_care">Self Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Identifier / Value Slug (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. stiff_neck (auto-generated if empty)"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="triageModalActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="triageModalActive" className="text-slate-700 dark:text-slate-300 font-medium">
              Rule is active and evaluated in live triage
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition"
            >
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
