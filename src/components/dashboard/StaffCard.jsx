import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLE = {
  Disponibile: 'border-[#C6F94E]/25 bg-[#C6F94E]/10 text-[#C6F94E]',
  'In lezione': 'border-[#FF7A3C]/25 bg-[#FF7A3C]/10 text-[#FF7A3C]',
  Off: 'border-white/12 bg-white/[0.05] text-white/40',
};

export default function StaffCard({ trainers = [], onCycle }) {
  const available = trainers.filter((t) => t.status === 'Disponibile').length;

  return (
    <section className="glass anim-rise rounded-3xl p-5" style={{ animationDelay: '180ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70">
            <Dumbbell className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-white">Trainer</h2>
            <p className="text-[11px] text-white/35">{available} disponibili adesso</p>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {trainers.map((t) => (
          <li key={t.id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[10px] font-semibold text-white/70">
              {t.name
                .split(' ')
                .slice(0, 2)
                .map((p) => p.charAt(0))
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white/85">{t.name}</p>
              <p className="truncate text-[11px] text-white/30">{t.specialty}</p>
            </div>
            <button
              type="button"
              onClick={() => onCycle?.(t)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all hover:brightness-125',
                STATUS_STYLE[t.status] || STATUS_STYLE.Off
              )}
            >
              {t.status}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[10px] text-white/25">Tocca lo stato per aggiornarlo.</p>
    </section>
  );
}