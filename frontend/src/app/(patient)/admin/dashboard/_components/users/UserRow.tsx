'use client';

import React from 'react';
import { Shield, Stethoscope, GraduationCap, Edit3, Trash2 } from 'lucide-react';
import { AdminUserData } from '@/app/actions/admin';

interface UserRowProps {
  user: AdminUserData;
  isCurrent: boolean;
  isSubmitting: boolean;
  onEdit: (user: AdminUserData) => void;
  onDelete: (user: AdminUserData) => void;
  onQuickRoleChange: (user: AdminUserData, newRole: 'student' | 'doctor' | 'admin') => void;
}

export function renderUserRoleBadge(role: string) {
  switch (role) {
    case 'admin':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
          <Shield className="w-3.5 h-3.5" />
          Admin
        </span>
      );
    case 'doctor':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
          <Stethoscope className="w-3.5 h-3.5" />
          Doctor
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
          <GraduationCap className="w-3.5 h-3.5" />
          Student
        </span>
      );
  }
}

export default function UserRow({
  user,
  isCurrent,
  isSubmitting,
  onEdit,
  onDelete,
  onQuickRoleChange,
}: UserRowProps) {
  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
      {/* User Info */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
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
            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
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
      </td>

      {/* Role Badge & Quick Change */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {renderUserRoleBadge(user.role)}
          {/* Quick Role Select Dropdown */}
          <select
            value={user.role}
            disabled={isSubmitting || isCurrent}
            onChange={(e) => onQuickRoleChange(user, e.target.value as any)}
            title={isCurrent ? 'You cannot change your own role here' : 'Change user role'}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded px-1.5 py-1 text-slate-600 dark:text-slate-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition"
          >
            <option value="student">Student</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </td>

      {/* Specialization / Department */}
      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
        {user.role === 'doctor' ? (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {user.specialization || 'General Medicine'}
          </span>
        ) : user.role === 'student' ? (
          <span>
            {user.department || 'Not specified'}
            {user.level ? ` (${user.level})` : ''}
          </span>
        ) : (
          <span className="text-slate-400">Management & Administration</span>
        )}
      </td>

      {/* Reg Number / ID */}
      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
        {user.reg_number || `#${user.id}`}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Edit User Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {!isCurrent && (
            <button
              onClick={() => onDelete(user)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
              title="Delete Account"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
