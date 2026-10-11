'use server';

import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export interface AdminUserData {
  id?: number;
  name: string;
  email: string;
  role: 'student' | 'doctor' | 'admin';
  department?: string | null;
  level?: string | null;
  reg_number?: string | null;
  specialization?: string | null;
  is_on_duty?: boolean | null;
  created_at?: string;
  password?: string;
}

export async function getAdminUsersAction(): Promise<AdminUserData[]> {
  try {
    const res = await apiFetch('/users/');
    if (!res.ok) {
      console.error('Failed to fetch admin users:', res.status, res.statusText);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return [];
  }
}

export async function adminCreateUserAction(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  level?: string;
  reg_number?: string;
  specialization?: string;
}) {
  try {
    const res = await apiFetch('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to create user' };
    }
    revalidatePath('/admin/dashboard');
    return { success: true, user: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminUpdateUserAction(
  userId: number,
  userData: {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    level?: string;
    reg_number?: string;
    specialization?: string;
    password?: string;
  }
) {
  try {
    const res = await apiFetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to update user' };
    }
    revalidatePath('/admin/dashboard');
    return { success: true, user: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminDeleteUserAction(userId: number) {
  try {
    const res = await apiFetch(`/users/${userId}`, {
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to delete user' };
    }
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export interface DutyShiftData {
  shift_id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_specialization?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'on_duty' | 'completed' | 'absent';
  created_at?: string;
}

export async function getDutyShiftsAction(): Promise<DutyShiftData[]> {
  try {
    const res = await apiFetch('/doctors/shifts');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error fetching duty shifts:', err);
    return [];
  }
}

export async function adminCreateDutyShiftAction(shiftData: {
  doctor_id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  status?: string;
}) {
  try {
    const res = await apiFetch('/doctors/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to schedule shift' };
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/doctor/dashboard');
    return { success: true, shift: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminUpdateDutyShiftAction(
  shiftId: number,
  shiftData: {
    doctor_id?: number;
    shift_date?: string;
    start_time?: string;
    end_time?: string;
    status?: string;
  }
) {
  try {
    const res = await apiFetch(`/doctors/shifts/${shiftId}`, {
      method: 'PATCH',
      body: JSON.stringify(shiftData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to update shift' };
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/doctor/dashboard');
    return { success: true, shift: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminDeleteDutyShiftAction(shiftId: number) {
  try {
    const res = await apiFetch(`/doctors/shifts/${shiftId}`, {
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to remove shift' };
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/doctor/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}
