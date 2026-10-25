'use server';

import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function updateAppointmentStatusAction(
  appointmentId: number,
  status: string,
  prescription?: string,
  clinicalNotes?: string
) {
  try {
    const res = await apiFetch('/doctor-dashboard/appointment-status', {
      method: 'PATCH',
      body: JSON.stringify({
        appointment_id: appointmentId,
        status,
        prescription: prescription || undefined,
        clinical_notes: clinicalNotes || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to update appointment status' };
    }
    revalidatePath('/doctor/dashboard');
    revalidatePath('/dashboard');
    revalidatePath('/history');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function toggleDoctorAvailabilityAction(isAvailable: boolean) {
  try {
    const res = await apiFetch('/doctor-dashboard/availability', {
      method: 'PATCH',
      body: JSON.stringify({ is_available: isAvailable }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to update availability' };
    }
    revalidatePath('/doctor/dashboard');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function requestPatientHandoverAction(assignmentId: number, toDoctorId: number, reason: string, notes?: string) {
  try {
    const res = await apiFetch('/doctor-dashboard/handover', {
      method: 'POST',
      body: JSON.stringify({
        assignment_id: assignmentId,
        to_doctor_id: toDoctorId,
        reason,
        notes: notes || '',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || 'Failed to request patient handover' };
    }
    revalidatePath('/doctor/dashboard');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function sendDoctorEmailAction(toEmail: string, subject: string, body: string) {
  try {
    const res = await apiFetch('/notifications/send-email', {
      method: 'POST',
      body: JSON.stringify({
        to_email: toEmail,
        subject,
        body,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.detail || 'Failed to dispatch email' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error sending email' };
  }
}

export async function getDoctorDashboardDataAction(doctorId?: number) {
  try {
    const { getDoctorOverview, getDoctorPatients } = await import('@/lib/api');
    const [overview, patients] = await Promise.all([
      getDoctorOverview(doctorId),
      getDoctorPatients(doctorId),
    ]);
    return { success: true, overview, patients };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load doctor dashboard' };
  }
}

