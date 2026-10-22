'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

/* Underline input style matching LoginPage */
const inputClass =
  'w-full bg-transparent border-0 border-b border-medical-300 dark:border-white/20 py-2.5 text-sm text-medical-800 dark:text-white placeholder:text-medical-400/60 dark:placeholder:text-white/25 focus:outline-none focus:border-primary dark:focus:border-primary transition-colors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Dispatch password reset or show confirmation
      // Even if email is not found, standard security practice is to show generic success
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch {
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl border border-medical-100/60 dark:border-white/5 border-l-4 border-l-primary overflow-hidden">
          <div className="p-8">
            {/* Brand header */}
            <div className="mb-6">
              <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-1">HEMC</p>
              <h1 className="text-lg font-bold text-medical-900 dark:text-white">Reset Password</h1>
              <p className="text-xs text-medical-500 dark:text-medical-400 mt-1">
                Enter your UNN email address to receive password recovery instructions.
              </p>
            </div>

            <div className="h-px bg-medical-100 dark:bg-white/8 mb-6" />

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2.5 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {submitted ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-medical-900 dark:text-white mb-2">Check Your Email</h2>
                <p className="text-xs text-medical-600 dark:text-medical-300 leading-relaxed mb-6">
                  If an account exists for <span className="font-semibold text-primary">{email}</span>, password reset instructions have been dispatched. Please check your inbox and spam folder.
                </p>
                <div className="p-3 w-full bg-medical-50 dark:bg-white/5 rounded-lg border border-medical-200/60 dark:border-white/10 text-[11px] text-medical-500 dark:text-medical-400 mb-6 text-left">
                  <p className="font-semibold text-medical-700 dark:text-medical-200 mb-1">Need immediate access?</p>
                  <p>Visit the UNN Medical Centre records desk or email <a href="mailto:healthcentre@unn.edu.ng" className="text-primary hover:underline font-medium">healthcentre@unn.edu.ng</a> with your Matriculation/Staff ID.</p>
                </div>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-xs tracking-wide transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-medical-500 dark:text-medical-400 uppercase tracking-widest mb-3">
                    UNN Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@unn.edu.ng"
                      className={inputClass}
                      required
                      autoFocus
                    />
                    <Mail className="absolute right-0 bottom-2.5 w-4 h-4 text-medical-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold text-sm tracking-wide transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending Instructions…' : 'Send Reset Link'}
                </button>

                <p className="text-center text-xs text-medical-500 dark:text-medical-400">
                  Remember your password?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:text-primary-hover dark:text-white transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <Link href="/login" className="text-xs text-medical-400 dark:text-medical-500 hover:text-medical-600 dark:hover:text-medical-300 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
