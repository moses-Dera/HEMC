import { cookies } from 'next/headers';
import { cache } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Server-side fetch wrapper — forwards the access_token cookie to FastAPI.
 * Cookie *writes* are NOT done here (Next.js constraint); only Server Actions / Route Handlers can write cookies.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Cookie', `access_token=${accessToken}`);
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Set 10-second timeout to handle cross-region cloud DB calls cleanly
  const signal = options.signal || (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    signal,
    headers,
    cache: 'no-store',
  });

  return res;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const getMe = cache(async () => {
  try {
    const res = await apiFetch('/users/me');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function getChatSessions() {
  try {
    const res = await apiFetch('/chat/sessions');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Appointments ─────────────────────────────────────────────────────────────

export async function getMyAppointments() {
  try {
    const res = await apiFetch('/appointments/my');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getAllAppointments() {
  try {
    const res = await apiFetch('/appointments/all');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Doctors ──────────────────────────────────────────────────────────────────

export async function getDoctors() {
  try {
    const res = await apiFetch('/doctors/');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Doctor Dashboard ─────────────────────────────────────────────────────────

export async function getDoctorPatients(doctorId?: number) {
  try {
    const query = doctorId ? `?doctor_id=${doctorId}` : '';
    const res = await apiFetch(`/doctor-dashboard/patients${query}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getDoctorOverview(doctorId?: number) {
  try {
    const query = doctorId ? `?doctor_id=${doctorId}` : '';
    const res = await apiFetch(`/doctor-dashboard/overview${query}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────

export async function getTriageRules() {
  try {
    const res = await apiFetch('/triage-rules/');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getAdminUsers() {
  try {
    const res = await apiFetch('/users/');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getDutyShifts() {
  try {
    const res = await apiFetch('/doctors/shifts');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getUrgentSymptomChecks() {
  try {
    const res = await apiFetch('/symptom-check/urgent');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
