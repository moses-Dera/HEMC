'use client';

import React, { useState } from 'react';
import { UserPlus, X, Shield, Stethoscope, GraduationCap, Key } from 'lucide-react';
import { toast } from 'sonner';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function UserCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: UserCreateModalProps) {
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'doctor' | 'admin',
    department: '',
    level: '',
    reg_number: '',
    specialization: 'General Medicine',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(createForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New User</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              System Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'doctor', 'admin'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setCreateForm({ ...createForm, role: r })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                    createForm.role === r
                      ? r === 'admin'
                        ? 'bg-purple-600 text-white'
                        : r === 'doctor'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-primary text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {r === 'admin' && <Shield className="w-3.5 h-3.5" />}
                  {r === 'doctor' && <Stethoscope className="w-3.5 h-3.5" />}
                  {r === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ngozi Eze"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ngozi.eze@unn.edu.ng"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Initial Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Conditional Role Fields */}
          {createForm.role === 'doctor' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Clinical Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. General Medicine, Infectious Diseases, Pediatrics"
                value={createForm.specialization}
                onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {createForm.role === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pharmacy"
                  value={createForm.department}
                  onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. 400L"
                  value={createForm.level}
                  onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Reg Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2020/248991"
                  value={createForm.reg_number}
                  onChange={(e) => setCreateForm({ ...createForm, reg_number: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating User...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
