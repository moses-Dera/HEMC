'use client';

import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Power,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  TriageRuleData, 
  adminCreateTriageRuleAction, 
  adminUpdateTriageRuleAction, 
  adminDeleteTriageRuleAction 
} from '@/app/actions/admin';

interface AdminTriageRulesManagerProps {
  initialRules: TriageRuleData[];
}

export default function AdminTriageRulesManager({ initialRules }: AdminTriageRulesManagerProps) {
  const [rules, setRules] = useState<TriageRuleData[]>(initialRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'red_flag' | 'duration_threshold'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'urgent' | 'book' | 'self_care'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<TriageRuleData | null>(null);
  const [deletingRule, setDeletingRule] = useState<TriageRuleData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    label: string;
    condition_type: 'red_flag' | 'duration_threshold';
    value: string;
    outcome: 'urgent' | 'book' | 'self_care';
    active: boolean;
  }>({
    label: '',
    condition_type: 'red_flag',
    value: '',
    outcome: 'urgent',
    active: true,
  });

  // Filtered rules
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchesSearch = 
        r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.value && r.value.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || r.condition_type === typeFilter;
      const matchesOutcome = outcomeFilter === 'all' || r.outcome === outcomeFilter;

      return matchesSearch && matchesType && matchesOutcome;
    });
  }, [rules, searchQuery, typeFilter, outcomeFilter]);

  // Handle Toggle Active
  const handleToggleActive = async (rule: TriageRuleData) => {
    if (!rule.rule_id) return;
    const nextActive = !rule.active;

    // Optimistic UI update
    setRules(prev => prev.map(r => r.rule_id === rule.rule_id ? { ...r, active: nextActive } : r));

    const res = await adminUpdateTriageRuleAction(rule.rule_id, { active: nextActive });
    if (!res.success) {
      // Revert on failure
      setRules(prev => prev.map(r => r.rule_id === rule.rule_id ? { ...r, active: rule.active } : r));
      toast.error(res.error || 'Failed to update rule status');
    } else {
      toast.success(`Rule "${rule.label}" is now ${nextActive ? 'Active' : 'Disabled'}`);
    }
  };

  // Handle Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      toast.error('Rule label is required');
      return;
    }

    setIsSubmitting(true);
    const slug = formData.value.trim() || formData.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const res = await adminCreateTriageRuleAction({
      condition_type: formData.condition_type,
      label: formData.label.trim(),
      value: slug,
      outcome: formData.outcome,
      active: formData.active,
    });

    setIsSubmitting(false);
    if (!res.success) {
      toast.error(res.error || 'Failed to create triage rule');
    } else {
      toast.success('New clinical triage rule created successfully');
      if (res.rule) {
        setRules(prev => [res.rule, ...prev]);
      }
      setShowCreateModal(false);
      setFormData({
        label: '',
        condition_type: 'red_flag',
        value: '',
        outcome: 'urgent',
        active: true,
      });
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule || !editingRule.rule_id) return;

    setIsSubmitting(true);
    const res = await adminUpdateTriageRuleAction(editingRule.rule_id, {
      label: editingRule.label.trim(),
      condition_type: editingRule.condition_type,
      value: editingRule.value?.trim(),
      outcome: editingRule.outcome,
      active: editingRule.active,
    });

    setIsSubmitting(false);
    if (!res.success) {
      toast.error(res.error || 'Failed to update triage rule');
    } else {
      toast.success('Triage rule updated successfully');
      setRules(prev => prev.map(r => r.rule_id === editingRule.rule_id ? { ...editingRule } : r));
      setEditingRule(null);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingRule || !deletingRule.rule_id) return;

    setIsSubmitting(true);
    const res = await adminDeleteTriageRuleAction(deletingRule.rule_id);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.error || 'Failed to delete triage rule');
    } else {
      toast.success(`Rule "${deletingRule.label}" deleted`);
      setRules(prev => prev.filter(r => r.rule_id !== deletingRule.rule_id));
      setDeletingRule(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="p-6 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Clinical Triage Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Triage Rules Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define red-flag clinical conditions, fever duration thresholds, and urgency outcomes that guide AI student triage.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Triage Rule
        </button>
      </div>

      {/* ── Filters & Search ── */}
      <div className="p-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Condition Type Filter */}
          <select
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="all">All Condition Types</option>
            <option value="red_flag">Red Flag Symptoms</option>
            <option value="duration_threshold">Duration Thresholds</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e: any) => setOutcomeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="all">All Urgency Outcomes</option>
            <option value="urgent">Urgent Escalation</option>
            <option value="book">Book Appointment</option>
            <option value="self_care">Self Care Only</option>
          </select>
        </div>
      </div>

      {/* ── Rules List / Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200/60 dark:border-white/[0.06]">
            <tr>
              <th className="py-3.5 px-6">Rule Label & Slug</th>
              <th className="py-3.5 px-4">Condition Type</th>
              <th className="py-3.5 px-4">Urgency Outcome</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No triage rules found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : (
              filteredRules.map((rule) => (
                <tr key={rule.rule_id || rule.label} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
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
                      onClick={() => handleToggleActive(rule)}
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
                        onClick={() => setEditingRule(rule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit rule"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingRule(rule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer Info ── */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-white/[0.04] text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Rules directly calibrate how the AI chatbot evaluates symptoms during student conversations.</span>
        </div>
        <span className="font-semibold">{rules.filter(r => r.active).length} of {rules.length} active</span>
      </div>

      {/* ── CREATE MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Add New Clinical Triage Rule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Create a symptom criterion evaluated during AI student triage consultations.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
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
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="activeCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Enable rule immediately upon creation
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition"
                >
                  {isSubmitting ? 'Creating…' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Edit Triage Rule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Update criteria or urgency outcome for this rule.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rule Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingRule.label}
                  onChange={(e) => setEditingRule({ ...editingRule, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Condition Type
                  </label>
                  <select
                    value={editingRule.condition_type}
                    onChange={(e: any) => setEditingRule({ ...editingRule, condition_type: e.target.value })}
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
                    value={editingRule.outcome}
                    onChange={(e: any) => setEditingRule({ ...editingRule, outcome: e.target.value })}
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
                  Identifier / Slug
                </label>
                <input
                  type="text"
                  value={editingRule.value || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, value: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editActiveCheck"
                  checked={editingRule.active}
                  onChange={(e) => setEditingRule({ ...editingRule, active: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="editActiveCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Rule is active and evaluated in live triage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition"
                >
                  {isSubmitting ? 'Updating…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deletingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Delete Triage Rule?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-800 dark:text-slate-200">{deletingRule.label}</strong>? Symptoms matching this rule will no longer trigger this clinical escalation.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRule(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition"
              >
                {isSubmitting ? 'Deleting…' : 'Delete Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
