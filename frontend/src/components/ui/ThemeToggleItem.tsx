'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggleItem() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button 
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
      type="button"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Dark Mode
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
        </p>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-colors border ${
        isDark ? 'bg-primary border-primary' : 'bg-slate-200 border-slate-300'
      }`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          isDark ? 'left-5' : 'left-0.5'
        }`} />
      </div>
    </button>
  );
}
