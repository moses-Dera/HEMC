'use client';

import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AdminUserData, 
  adminCreateUserAction, 
  adminUpdateUserAction, 
  adminDeleteUserAction 
} from '@/app/actions/admin';
import UserStatsCards from './_components/users/UserStatsCards';
import UserFilterToolbar from './_components/users/UserFilterToolbar';
import UserRow from './_components/users/UserRow';
import UserMobileCard from './_components/users/UserMobileCard';
import UserPagination from './_components/users/UserPagination';
import UserCreateModal from './_components/users/UserCreateModal';
import UserEditModal from './_components/users/UserEditModal';
import UserDeleteModal from './_components/users/UserDeleteModal';

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

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filter & Search Handlers
  const handleFilterChange = (role: 'all' | 'student' | 'doctor' | 'admin') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Quick Role Change
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

  // Create User Submit
  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const res = await adminCreateUserAction(formData);
      if (res.success && res.user) {
        setUsers((prev) => [res.user, ...prev]);
        toast.success(`User ${formData.name} created successfully!`);
        setShowCreateModal(false);
      } else {
        toast.error(res.error || 'Failed to create user');
      }
    } catch {
      toast.error('An error occurred during user creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User Submit
  const handleEditSubmit = async (formData: any) => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        level: formData.level,
        reg_number: formData.reg_number,
        specialization: formData.specialization,
      };
      if (formData.password?.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await adminUpdateUserAction(editingUser.id!, payload);
      if (res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.user } : u)));
        toast.success(`Updated ${formData.name} successfully`);
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

  // Delete User Submit
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

  return (
    <div className="space-y-6">
      {/* ── Summary Stat Cards ────────────────────────────────────────────── */}
      <UserStatsCards stats={stats} />

      {/* ── Table Container ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Header & Filter Toolbar */}
        <UserFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleFilterChange}
          onAddUser={() => setShowCreateModal(true)}
        />

        {/* ── A. Mobile-First Card View (< 768px) ── */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.06]">
          {paginatedUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No users found</p>
              <p className="text-xs mt-1">Try clearing filters or search terms</p>
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <UserMobileCard
                key={user.id}
                user={user}
                isCurrent={user.id === currentUserId}
                isSubmitting={isSubmitting}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
                onQuickRoleChange={handleQuickRoleChange}
              />
            ))
          )}
        </div>

        {/* ── B. Desktop Table View (>= 768px) ── */}
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
                paginatedUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isCurrent={user.id === currentUserId}
                    isSubmitting={isSubmitting}
                    onEdit={setEditingUser}
                    onDelete={setDeletingUser}
                    onQuickRoleChange={handleQuickRoleChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Bar ── */}
        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalFilteredUsers={filteredUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ── Modals ── */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />

      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      <UserDeleteModal
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
