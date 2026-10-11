'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/auth';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold text-sm tracking-wide transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Signing in…' : 'Sign In'}
    </button>
  );
}

/* Underline input style */
const inputClass =
  'w-full bg-transparent border-0 border-b border-medical-300 dark:border-white/20 py-2.5 text-sm text-medical-800 dark:text-white placeholder:text-medical-400/60 dark:placeholder:text-white/25 focus:outline-none focus:border-primary dark:focus:border-primary transition-colors';

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen bg-bg-light-alt dark:bg-bg-dark overflow-hidden flex items-center justify-center px-6">

      {/* ── Medical cross watermark ── */}
      <svg
        className="absolute -top-16 -left-16 w-[480px] h-[480px] text-medical-800/10 dark:text-white/5 pointer-events-none select-none"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="70" y="0" width="60" height="200" rx="8" />
        <rect x="0" y="70" width="200" height="60" rx="8" />
      </svg>

      {/* ── Cross dot-grid bottom-left ── */}
      <div className="absolute bottom-8 left-8 grid grid-cols-3 gap-3 opacity-30 dark:opacity-10 pointer-events-none select-none" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <rect x="7" y="0" width="6" height="20" rx="1.5" />
            <rect x="0" y="7" width="20" height="6" rx="1.5" />
          </svg>
        ))}
      </div>

      {/* ── UNN badge bottom-right ── */}
      <div className="absolute bottom-8 right-8 pointer-events-none select-none">
        <span className="text-xs font-medium text-medical-500 dark:text-medical-400 bg-medical-100/80 dark:bg-white/5 px-3 py-1.5 rounded-full border border-medical-200 dark:border-white/10">
          UNN Student Portal
        </span>
      </div>

      {/* ── Form card ── */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl border border-medical-100/60 dark:border-white/5 border-l-4 border-l-primary overflow-hidden">
          <div className="p-8">

            {/* Brand header */}
            <div className="mb-6">
              <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-1">HEMC</p>
              <p className="text-sm text-medical-500 dark:text-medical-400">University Health Centre</p>
            </div>

            <div className="h-px bg-medical-100 dark:bg-white/8 mb-6" />

            {/* Error */}
            {state?.error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2.5 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>{state.error}</p>
              </div>
            )}

            <form action={formAction} className="flex flex-col gap-6">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-medical-500 dark:text-medical-400 uppercase tracking-widest mb-3">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@unn.edu.ng"
                  className={inputClass}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-bold text-medical-500 dark:text-medical-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[10px] font-semibold text-primary hover:text-primary-hover dark:text-medical-300 dark:hover:text-white transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    className={`${inputClass} pr-8`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-0 bottom-2.5 text-medical-400 hover:text-medical-600 dark:text-white/30 dark:hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <SubmitButton />
            </form>

            <p className="text-center text-xs text-medical-500 dark:text-medical-400 mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-primary hover:text-primary-hover dark:text-white transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>

        {/* Back link below card */}
        <div className="text-center mt-5">
          <Link href="/" className="text-xs text-medical-400 dark:text-medical-500 hover:text-medical-600 dark:hover:text-medical-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
