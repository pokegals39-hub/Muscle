export const fieldClass =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-[#C6F94E]/45 focus:outline-none';

export default function FormField({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-white/25">{hint}</span>}
    </div>
  );
}