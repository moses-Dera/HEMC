'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function sendChatMessage(content: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
      },
      body: JSON.stringify({ content }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || 'Failed to send message' };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function startNewChat() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch(`${API_URL}/chat/new`, {
      method: 'POST',
      headers: {
        'Cookie': `access_token=${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { error: 'Failed to start new chat' };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getActiveChatSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return null;

  try {
    const res = await fetch(`${API_URL}/chat/sessions`, {
      headers: {
        'Cookie': `access_token=${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const sessions = await res.json();
    if (sessions && sessions.length > 0) {
      return sessions[0];
    }
    return null;
  } catch {
    return null;
  }
}
