import { CalendarDays, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TodaySchedule({ classes = [], bookingsByClass = {} }) {
  return (
    <section className="glass anim-rise rounded-3xl p-5" style={{ animationDelay: '120ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70">
            <CalendarDays className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-white">
              Oggi in sala
            </h2>
            <p className="text-[11px] text-white/35">{classes.length} corsi in programma</p>
          </div>
        </div>
        <Link
          to="/corsi"
          className="group flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-[#C6F94E]"
        >
          Calendario
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {classes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-white/30">
          Nessun corso previsto per oggi.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.05]">
          {classes.map((c) => {
            const booked = bookingsByClass[c.id] ?? c.booked ?? 0;
            const capacity = c.capacity || 0;
            const pct = capacity ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
            return (
              <li key={c.id} className="flex items-center gap-4 py-3 first:pt-1 last:pb-1">
                <div className="w-14 shrink-0">
                  <p className="font-display text-sm font-semibold text-white">{c.start_time}</p>
                  <p className="text-[10px] text-white/30">{c.duration} min</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/90">{c.name}</p>
                  <p className="flex items-center gap-2 truncate text-[11px] text-white/35">
                    <span>{c.trainer}</span>
                    <span className="text-white/15">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.room}
                    </span>
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="mb-1 flex items-center justify-between text-[10px] text-white/35">
                    <span>
                      {booked}/{capacity}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#9BE22B] to-[#C6F94E] transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}