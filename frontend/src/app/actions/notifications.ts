'use server';

import { apiFetch } from '@/lib/api';

export async function getNotificationsAction() {
  try {
    const res = await apiFetch('/notifications/my');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCountAction() {
  try {
    const res = await apiFetch('/notifications/unread-count');
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function markNotificationReadAction(id: number) {
  try {
    const res = await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const res = await apiFetch('/notifications/read-all', { method: 'POST' });
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}
