'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Shield, Stethoscope, GraduationCap, Key } from 'lucide-react';
import { AdminUserData } from '@/app/actions/admin';
import { toast } from 'sonner';

interface UserEditModalProps {
  user: AdminUserData | null;
  onClose: () => void;
  onSubmit: (userData: any) => Promise<void>;
  isSubmitting: boolean;
  isSelf?: boolean;
}

export default function UserEditModal({
  user: editingUser,
  onClose,
  onSubmit,
  isSubmitting,
  isSelf = false,
}: UserEditModalProps) {
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'doctor' | 'admin',
    department: '',
    level: '',
    reg_number: '',
    specialization: '',
    password: '',
  });

  useEffect(() => {
    if (editingUser) {
      setEditForm({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'student',
        department: editingUser.department || '',
        level: editingUser.level || '',
        reg_number: editingUser.reg_number || '',
        specialization: editingUser.specialization || '',
        password: '',
      });
    }
  }, [editingUser]);

  if (!editingUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }
    onSubmit(editForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit User: {editingUser.name}</h3>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Account Role
              </label>
              {isSelf && (
                <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                  (Cannot demote your own account)
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'doctor', 'admin'] as const).map((r) => {
                const isSelected = editForm.role === r;
                const isDisabled = isSelf && r !== 'admin';
                return (
                  <button
                    type="button"
                    key={r}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) {
                        toast.error('You cannot change your own role to prevent losing admin access.');
                        return;
                      }
                      setEditForm({ ...editForm, role: r });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? r === 'admin'
                          ? 'bg-purple-600 text-white'
                          : r === 'doctor'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary text-white'
                        : isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {r === 'admin' && <Shield className="w-3.5 h-3.5" />}
                    {r === 'doctor' && <Stethoscope className="w-3.5 h-3.5" />}
                    {r === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {editForm.role === 'doctor' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                placeholder="e.g. General Medicine, Pediatrics"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {editForm.role !== 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Level
                </label>
                <input
                  type="text"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  placeholder="e.g. 400"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Reg Number
                </label>
                <input
                  type="text"
                  value={editForm.reg_number}
                  onChange={(e) => setEditForm({ ...editForm, reg_number: e.target.value })}
                  placeholder="e.g. 2020/248100"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Reset Password (leave empty to keep current password)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Enter new password to reset"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

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
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
