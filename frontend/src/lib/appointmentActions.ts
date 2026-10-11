'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function bookAppointmentAction(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { error: 'Not authenticated' };
  }

  const dateStr = formData.get('appointment_date') as string;
  const doctorIdStr = formData.get('doctor_id') as string;
  if (!dateStr) {
    return { error: 'Appointment date and time are required' };
  }

  try {
    const appointment_date = new Date(dateStr).toISOString();
    const payload: { appointment_date: string; doctor_id?: number } = { appointment_date };
    if (doctorIdStr && !isNaN(Number(doctorIdStr))) {
      payload.doctor_id = Number(doctorIdStr);
    }

    const res = await fetch(`${API_URL}/appointments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || 'Failed to book appointment' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/history');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Network error booking appointment' };
  }
}
