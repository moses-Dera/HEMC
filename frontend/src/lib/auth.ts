'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      let errMsg = 'Invalid credentials';
      if (typeof errorData.detail === 'string') errMsg = errorData.detail;
      else if (Array.isArray(errorData.detail)) errMsg = errorData.detail.map((e: any) => e.msg).join(', ');
      
      return { error: errMsg };
    }

    // Forward the Set-Cookie headers from FastAPI to Next.js Client
    const setCookieHeaders = res.headers.getSetCookie();
    const cookieStore = await cookies();

    setCookieHeaders.forEach((cookieStr) => {
      const parts = cookieStr.split(';');
      const [nameValue, ...options] = parts;
      const [name, value] = nameValue.split('=');
      
      let maxAge;
      const maxAgePart = options.find(o => o.trim().toLowerCase().startsWith('max-age='));
      if (maxAgePart) {
        maxAge = parseInt(maxAgePart.split('=')[1]);
      }

      cookieStore.set({
        name: name.trim(),
        value: value,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        ...(maxAge ? { maxAge } : {})
      });
    });

  } catch (error) {
    return { error: 'Failed to connect to the server' };
  }
  
  redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
  const full_name = formData.get('full_name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirm_password = formData.get('confirm_password');
  
  const reg_number = formData.get('reg_number');
  const department = formData.get('department');
  const level = formData.get('level');
  
  // Basic validation
  if (!full_name || !email || !password || !confirm_password) {
    return { error: 'All fields are required' };
  }
  
  if (password !== confirm_password) {
    return { error: 'Passwords do not match' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        full_name, 
        email, 
        password, 
        role: 'student',
        reg_number: reg_number || undefined,
        department: department || undefined,
        level: level || undefined
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      let errMsg = 'Registration failed';
      if (typeof errorData.detail === 'string') errMsg = errorData.detail;
      else if (Array.isArray(errorData.detail)) errMsg = errorData.detail.map((e: any) => e.msg).join(', ');
      
      return { error: errMsg };
    }

    // Forward the Set-Cookie headers from FastAPI to Next.js Client
    const setCookieHeaders = res.headers.getSetCookie();
    const cookieStore = await cookies();

    setCookieHeaders.forEach((cookieStr) => {
      const parts = cookieStr.split(';');
      const [nameValue, ...options] = parts;
      const [name, value] = nameValue.split('=');
      
      let maxAge;
      const maxAgePart = options.find(o => o.trim().toLowerCase().startsWith('max-age='));
      if (maxAgePart) {
        maxAge = parseInt(maxAgePart.split('=')[1]);
      }

      cookieStore.set({
        name: name.trim(),
        value: value,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        ...(maxAge ? { maxAge } : {})
      });
    });

  } catch (error) {
    return { error: 'Failed to connect to the server' };
  }

  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Cookie': `access_token=${cookieStore.get('access_token')?.value}`
    }
  }).catch(() => {});

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  redirect('/login');
}
