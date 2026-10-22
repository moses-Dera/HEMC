'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Info } from 'lucide-react';
import { toast } from 'sonner';
import { 
  TriageRuleData, 
  adminCreateTriageRuleAction, 
  adminUpdateTriageRuleAction, 
  adminDeleteTriageRuleAction 
} from '@/app/actions/admin';
import TriageHeader from './_components/triage/TriageHeader';
import TriageFilterToolbar from './_components/triage/TriageFilterToolbar';
import TriageRuleRow from './_components/triage/TriageRuleRow';
import TriageRuleModal from './_components/triage/TriageRuleModal';
import TriageDeleteModal from './_components/triage/TriageDeleteModal';

interface AdminTriageRulesManagerProps {
  initialRules: TriageRuleData[];
}

export default function AdminTriageRulesManager({ initialRules }: AdminTriageRulesManagerProps) {
  const [rules, setRules] = useState<TriageRuleData[]>(initialRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'red_flag' | 'duration_threshold'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'urgent' | 'book' | 'self_care'>('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<TriageRuleData | null>(null);
  const [deletingRule, setDeletingRule] = useState<TriageRuleData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
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

    setRules((prev) => prev.map((r) => r.rule_id === rule.rule_id ? { ...r, active: nextActive } : r));

    const res = await adminUpdateTriageRuleAction(rule.rule_id, { active: nextActive });
    if (!res.success) {
      setRules((prev) => prev.map((r) => r.rule_id === rule.rule_id ? { ...r, active: rule.active } : r));
      toast.error(res.error || 'Failed to update rule status');
    } else {
      toast.success(`Rule "${rule.label}" is now ${nextActive ? 'Active' : 'Disabled'}`);
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const res = await adminCreateTriageRuleAction(formData);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.error || 'Failed to create triage rule');
    } else {
      toast.success('New clinical triage rule created successfully');
      if (res.rule) {
        setRules((prev) => [res.rule, ...prev]);
      }
      setShowCreateModal(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (formData: any) => {
    if (!editingRule || !editingRule.rule_id) return;

    setIsSubmitting(true);
    const res = await adminUpdateTriageRuleAction(editingRule.rule_id, formData);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.error || 'Failed to update triage rule');
    } else {
      toast.success('Triage rule updated successfully');
      setRules((prev) => prev.map((r) => r.rule_id === editingRule.rule_id ? { ...r, ...formData } : r));
      setEditingRule(null);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingRule || !deletingRule.rule_id) return;

    setIsSubmitting(true);
    const res = await adminDeleteTriageRuleAction(deletingRule.rule_id);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.error || 'Failed to delete triage rule');
    } else {
      toast.success(`Rule "${deletingRule.label}" deleted`);
      setRules((prev) => prev.filter((r) => r.rule_id !== deletingRule.rule_id));
      setDeletingRule(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <TriageHeader onAddRule={() => setShowCreateModal(true)} />

      {/* ── Filters & Search ── */}
      <TriageFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        outcomeFilter={outcomeFilter}
        onOutcomeFilterChange={setOutcomeFilter}
      />

      {/* ── Table ── */}
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
                <TriageRuleRow
                  key={rule.rule_id || rule.label}
                  rule={rule}
                  onToggleActive={handleToggleActive}
                  onEdit={setEditingRule}
                  onDelete={setDeletingRule}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-white/[0.04] text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Rules directly calibrate how the AI chatbot evaluates symptoms during student conversations.</span>
        </div>
        <span className="font-semibold">{rules.filter((r) => r.active).length} of {rules.length} active</span>
      </div>

      {/* Modals */}
      <TriageRuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />

      <TriageRuleModal
        isOpen={Boolean(editingRule)}
        initialData={editingRule}
        onClose={() => setEditingRule(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      <TriageDeleteModal
        rule={deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDeleteConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
