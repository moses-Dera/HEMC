import { cookies } from 'next/headers';

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
  }
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Set 6-second timeout to prevent Vercel 504 FUNCTION_INVOCATION_TIMEOUT on cold starts
  const signal = options.signal || (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    signal,
    headers,
    cache: 'no-store',
  });

  return res;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function getMe() {
  try {
    const res = await apiFetch('/users/me');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

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

export async function getDoctorPatients() {
  try {
    const res = await apiFetch('/doctor-dashboard/patients');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getDoctorOverview() {
  try {
    const res = await apiFetch('/doctor-dashboard/overview');
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
