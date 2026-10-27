import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateIt, daysUntil, memberStatus, statusMeta } from '@/lib/gym';
import { cn } from '@/lib/utils';

export default function ExpiringCard({ members = [], onRenew }) {
  const expiring = members
    .filter((m) => ['in scadenza', 'scaduto'].includes(memberStatus(m)))
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
    .slice(0, 4);

  return (
    <section className="glass anim-rise rounded-3xl p-5" style={{ animationDelay: '240ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#FFB020]/20 bg-[#FFB020]/10 text-[#FFB020]">
            <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-white">
              Abbonamenti
            </h2>
            <p className="text-[11px] text-white/35">{expiring.length} da rinnovare</p>
          </div>
        </div>
        <Link
          to="/membri"
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-[#C6F94E]"
        >
          Tutti
        </Link>
      </div>

      {expiring.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-6 text-center text-sm text-white/30">
          Tutti gli abbonamenti sono in regola.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {expiring.map((m) => {
            const status = memberStatus(m);
            const meta = statusMeta(status);
            const left = daysUntil(m.end_date);
            return (
              <li
                key={m.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/12"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/90">{m.full_name}</p>
                    <p className="text-[11px] text-white/35">
                      {m.plan} · scade {formatDateIt(m.end_date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      meta.className
                    )}
                  >
                    {left < 0 ? `-${Math.abs(left)} g` : `${left} g`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRenew?.(m)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-[11px] font-semibold text-white/70 transition-all hover:border-[#C6F94E]/30 hover:bg-[#C6F94E]/10 hover:text-[#C6F94E]"
                >
                  <RefreshCw className="h-3 w-3" />
                  Rinnova abbonamento
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}