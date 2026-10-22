'use client';

import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { AdminUserData } from '@/app/actions/admin';
import { renderUserRoleBadge } from './UserRow';

interface UserMobileCardProps {
  user: AdminUserData;
  isCurrent: boolean;
  isSubmitting: boolean;
  onEdit: (user: AdminUserData) => void;
  onDelete: (user: AdminUserData) => void;
  onQuickRoleChange: (user: AdminUserData, newRole: 'student' | 'doctor' | 'admin') => void;
}

export default function UserMobileCard({
  user,
  isCurrent,
  isSubmitting,
  onEdit,
  onDelete,
  onQuickRoleChange,
}: UserMobileCardProps) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : user.role === 'doctor'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            }`}
          >
            {user.name ? user.name.slice(0, 2) : 'U'}
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {user.name}
              {isCurrent && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  YOU
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{user.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Edit User Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {!isCurrent && (
            <button
              onClick={() => onDelete(user)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
              title="Delete Account"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          {renderUserRoleBadge(user.role)}
          <select
            value={user.role}
            disabled={isSubmitting || isCurrent}
            onChange={(e) => onQuickRoleChange(user, e.target.value as any)}
            title={isCurrent ? 'You cannot change your own role here' : 'Change user role'}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-slate-700 dark:text-slate-300 cursor-pointer disabled:opacity-40"
          >
            <option value="student">Student</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {user.reg_number || `#${user.id}`}
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
        {user.role === 'doctor' ? (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {user.specialization || 'General Medicine'}
          </span>
        ) : user.role === 'student' ? (
          <span>
            {user.department || 'General UNN'} {user.level ? `(${user.level})` : ''}
          </span>
        ) : (
          <span className="text-slate-400">System Administrator</span>
        )}
      </div>
    </div>
  );
}
