'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AdminUserData } from '@/app/actions/admin';

interface UserDeleteModalProps {
  user: AdminUserData | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export default function UserDeleteModal({
  user,
  onClose,
  onConfirm,
  isSubmitting,
}: UserDeleteModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete User Account?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Are you sure you want to permanently remove{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>{' '}
            ({user.email})? This action cannot be undone.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Deleting...' : 'Yes, Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
