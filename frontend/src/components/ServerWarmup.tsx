'use client';

import { useEffect } from 'react';

/**
 * ServerWarmup: Lightweight, non-blocking background ping that ensures
 * the Render backend and Supabase database are awake and warm whenever
 * a user visits the application.
 */
export default function ServerWarmup() {
  useEffect(() => {
    // Only fire once per session or after 5 minutes to avoid redundant pings
    const lastPing = sessionStorage.getItem('hemc_last_warmup');
    const now = Date.now();
    if (lastPing && now - Number(lastPing) < 5 * 60 * 1000) {
      return;
    }

    const timer = setTimeout(() => {
      fetch('/api/keepalive')
        .then(() => {
          sessionStorage.setItem('hemc_last_warmup', String(Date.now()));
        })
        .catch(() => {
          // Silent catch — warmup is best-effort and non-blocking
        });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
