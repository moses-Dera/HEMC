'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Shield, 
  Stethoscope, 
  GraduationCap, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  RefreshCw, 
  UserCheck, 
  Users,
  AlertTriangle,
  Key
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AdminUserData, 
  adminCreateUserAction, 
  adminUpdateUserAction, 
  adminDeleteUserAction 
} from '@/app/actions/admin';

interface AdminUsersManagementProps {
  initialUsers: AdminUserData[];
  currentUserId?: number;
}

export default function AdminUsersManagement({ 
  initialUsers, 
  currentUserId 
}: AdminUsersManagementProps) {
  const [users, setUsers] = useState<AdminUserData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'doctor' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form state
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

  // Edit form state
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

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === 'student').length;
    const doctors = users.filter((u) => u.role === 'doctor').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, students, doctors, admins };
  }, [users]);

  // Filtered & Searched Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.reg_number?.toLowerCase().includes(q) ||
        u.specialization?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset page when filter or search changes
  const handleFilterChange = (role: 'all' | 'student' | 'doctor' | 'admin') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Open Edit Modal
  const openEditModal = (user: AdminUserData) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      department: user.department || '',
      level: user.level || '',
      reg_number: user.reg_number || '',
      specialization: user.specialization || (user.role === 'doctor' ? 'General Medicine' : ''),
      password: '',
    });
  };

  // Handle Quick Role Change
  const handleQuickRoleChange = async (user: AdminUserData, newRole: 'student' | 'doctor' | 'admin') => {
    if (user.role === newRole) return;
    setIsSubmitting(true);
    try {
      const res = await adminUpdateUserAction(user.id!, {
        role: newRole,
        specialization: newRole === 'doctor' ? (user.specialization || 'General Medicine') : undefined,
      });

      if (res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...res.user } : u)));
        toast.success(`Role for ${user.name} updated to ${newRole.toUpperCase()}`);
      } else {
        toast.error(res.error || 'Failed to update role');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create User Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Please fill in all required fields (Name, Email, Password)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminCreateUserAction(createForm);
      if (res.success && res.user) {
        setUsers((prev) => [res.user, ...prev]);
        toast.success(`User ${createForm.name} (${createForm.role}) created successfully!`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          role: 'student',
          department: '',
          level: '',
          reg_number: '',
          specialization: 'General Medicine',
        });
      } else {
        toast.error(res.error || 'Failed to create user');
      }
    } catch {
      toast.error('An error occurred during user creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        department: editForm.department,
        level: editForm.level,
        reg_number: editForm.reg_number,
        specialization: editForm.specialization,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await adminUpdateUserAction(editingUser.id!, payload);
      if (res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.user } : u)));
        toast.success(`Updated ${editForm.name} successfully`);
        setEditingUser(null);
      } else {
        toast.error(res.error || 'Failed to update user');
      }
    } catch {
      toast.error('An error occurred updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      const res = await adminDeleteUserAction(deletingUser.id!);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        toast.success(`User ${deletingUser.name} deleted successfully`);
        setDeletingUser(null);
      } else {
        toast.error(res.error || 'Failed to delete user');
      }
    } catch {
      toast.error('An error occurred deleting user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role Badge Helper
  const renderRoleBadge = (role: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          <p className="text-xs text-slate-400 mt-1">All registered users</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.students}</div>
          <p className="text-xs text-slate-400 mt-1">Patient community</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Doctors</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.doctors}</div>
          <p className="text-xs text-slate-400 mt-1">Clinical medical staff</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administrators</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</div>
          <p className="text-xs text-slate-400 mt-1">Management & ICT</p>
        </div>
      </div>

      {/* ── Table Container ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Users & Role Governance
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage accounts, promote/demote user roles, and assign clinical permissions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 md:px-6 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, department, or reg number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'all', label: 'All Users' },
                { id: 'student', label: 'Students' },
                { id: 'doctor', label: 'Doctors' },
                { id: 'admin', label: 'Admins' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  roleFilter === filter.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── A. Mobile-First Card View (Displayed on Smartphones < 768px) ── */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
          {paginatedUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No users found</p>
              <p className="text-xs mt-1">Try clearing filters or search terms</p>
            </div>
          ) : (
            paginatedUsers.map((user) => {
              const isCurrent = user.id === currentUserId;
              return (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : user.role === 'doctor'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>
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
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit User Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!isCurrent && (
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      {renderRoleBadge(user.role)}
                      <select
                        value={user.role}
                        disabled={isSubmitting || isCurrent}
                        onChange={(e) => handleQuickRoleChange(user, e.target.value as any)}
                        title={isCurrent ? "You cannot change your own role here" : "Change user role"}
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
            })
          )}
        </div>

        {/* ── B. Desktop Table View (Displayed on Tablets/Desktop >= 768px) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-100 dark:border-white/[0.06] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Specialization / Dept</th>
                <th className="px-5 py-3.5">Reg Number / ID</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No users found matching your query</p>
                    <p className="text-xs mt-1">Try clearing filters or search terms</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  return (
                    <tr 
                      key={user.id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                              : user.role === 'doctor'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
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
                          {renderRoleBadge(user.role)}
                          {/* Quick Role Select Dropdown */}
                          <select
                            value={user.role}
                            disabled={isSubmitting || isCurrent}
                            onChange={(e) => handleQuickRoleChange(user, e.target.value as any)}
                            title={isCurrent ? "You cannot change your own role here" : "Change user role"}
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
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit User Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {!isCurrent && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Bar ──────────────────────────────────────────────── */}
        <div className="p-4 md:px-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>
            <span>to</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, filteredUsers.length)}
            </span>
            <span>of</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredUsers.length}</span>
            <span>users</span>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              // Only display nearby pages if large list
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-1 text-slate-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CREATE USER MODAL ──────────────────────────────────────────────── */}
      {showCreateModal && (
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
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                  onClick={() => setShowCreateModal(false)}
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
      )}

      {/* ── EDIT USER MODAL ────────────────────────────────────────────────── */}
      {editingUser && (
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
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Change Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'doctor', 'admin'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setEditForm({ ...editForm, role: r })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                        editForm.role === r
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

              {editForm.role === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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
                  onClick={() => setEditingUser(null)}
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
      )}

      {/* ── DELETE CONFIRMATION MODAL ──────────────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently remove <span className="font-semibold text-slate-700 dark:text-slate-200">{deletingUser.name}</span> ({deletingUser.email})? This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubmit}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
