import { cn } from '@/lib/utils';

const TONES = {
  lime: {
    chip: 'border-[#C6F94E]/20 bg-[#C6F94E]/10 text-[#C6F94E]',
    glow: 'from-[#C6F94E]/20',
    bar: 'bg-[#C6F94E]/60',
    accent: 'text-[#C6F94E]',
  },
  orange: {
    chip: 'border-[#FF7A3C]/20 bg-[#FF7A3C]/10 text-[#FF7A3C]',
    glow: 'from-[#FF7A3C]/20',
    bar: 'bg-[#FF7A3C]/60',
    accent: 'text-[#FF7A3C]',
  },
  cyan: {
    chip: 'border-[#4ED9C9]/20 bg-[#4ED9C9]/10 text-[#4ED9C9]',
    glow: 'from-[#4ED9C9]/20',
    bar: 'bg-[#4ED9C9]/60',
    accent: 'text-[#4ED9C9]',
  },
  violet: {
    chip: 'border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#A78BFA]',
    glow: 'from-[#A78BFA]/20',
    bar: 'bg-[#A78BFA]/60',
    accent: 'text-[#A78BFA]',
  },
};

export default function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  tone = 'lime',
  spark = [],
  index = 0,
}) {
  const t = TONES[tone] || TONES.lime;

  return (
    <div
      className="glass glass-hover anim-rise group relative overflow-hidden rounded-3xl p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-12 -top-20 h-44 w-44 rounded-full bg-gradient-to-b to-transparent opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
          t.glow
        )}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-500 group-hover:scale-105',
            t.chip
          )}
        >
          {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />}
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold', t.accent)}>{trend}</span>
        )}
      </div>

      <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>
      <p className="relative mt-1 font-display text-[28px] font-semibold leading-none tracking-tight text-white">
        {value}
      </p>
      {hint && <p className="relative mt-2 text-xs text-white/35">{hint}</p>}

      {spark.length > 0 && (
        <div className="relative mt-4 flex h-9 items-end gap-1">
          {spark.map((v, i) => (
            <span
              key={i}
              className={cn('flex-1 rounded-full transition-all duration-500', t.bar)}
              style={{ height: `${Math.max(10, v)}%`, opacity: 0.35 + (i / spark.length) * 0.65 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}