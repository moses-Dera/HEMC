'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const department = formData.get('department') as string;
  const level = formData.get('level') as string;
  const reg_number = formData.get('reg_number') as string;
  const phone_number = formData.get('phone_number') as string;
  const blood_group = formData.get('blood_group') as string;
  const genotype = formData.get('genotype') as string;
  const allergies = formData.get('allergies') as string;
  const emergency_contact = formData.get('emergency_contact') as string;
  const hostel = formData.get('hostel') as string;

  const payload: Record<string, any> = {};
  if (name !== null) payload.name = name;
  if (department !== null) payload.department = department;
  if (level !== null) payload.level = level;
  if (reg_number !== null) payload.reg_number = reg_number;
  if (phone_number !== null) payload.phone_number = phone_number;
  if (blood_group !== null) payload.blood_group = blood_group;
  if (genotype !== null) payload.genotype = genotype;
  if (allergies !== null) payload.allergies = allergies;
  if (emergency_contact !== null) payload.emergency_contact = emergency_contact;
  if (hostel !== null) payload.hostel = hostel;

  try {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || 'Failed to update profile' };
    }

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { error: 'Network error updating profile' };
  }
}

export async function updatePassword(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { error: 'Not authenticated' };
  }

  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || 'Failed to update password' };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch {
    return { error: 'Network error updating password' };
  }
}
