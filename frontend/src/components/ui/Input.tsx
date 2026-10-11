export default function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>}
      <input 
        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-sapphire-500 focus:ring-4 focus:ring-sapphire-500/10 transition-all" 
        {...props} 
      />
    </div>
  );
}
