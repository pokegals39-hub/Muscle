import { useMemo, useState } from 'react';
import { Search, ScanLine, Check, AlertTriangle, Clock } from 'lucide-react';
import { memberStatus, statusMeta, initials, formatTime } from '@/lib/gym';
import { cn } from '@/lib/utils';

export default function CheckInPanel({ members = [], checkIns = [], onCheckIn, busyId }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter((m) => `${m.full_name || ''} ${m.email || ''} ${m.phone || ''}`.toLowerCase().includes(q))
      .slice(0, 5);
  }, [members, query]);

  const handleCheckIn = (member) => {
    onCheckIn?.(member);
    setQuery('');
  };

  return (
    <section className="glass anim-rise overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#C6F94E]/20 bg-[#C6F94E]/10 text-[#C6F94E]">
            <ScanLine className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-white">
              Check-in rapido
            </h2>
            <p className="text-[11px] text-white/35">Registra l'ingresso in un tap</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#C6F94E]" />
          <span className="text-[11px] font-semibold text-white/70">{checkIns.length} oggi</span>
        </div>
      </div>

      <div className="p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca iscritto per nome, email o telefono…"
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 transition-colors focus:border-[#C6F94E]/40 focus:bg-white/[0.05] focus:outline-none"
          />
        </div>

        {query.trim().length > 0 && (
          <div className="mt-3 space-y-2">
            {results.length === 0 && (
              <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-sm text-white/35">
                Nessun iscritto trovato con questa ricerca.
              </p>
            )}
            {results.map((member) => {
              const status = memberStatus(member);
              const meta = statusMeta(status);
              const blocked = status === 'scaduto' || status === 'sospeso';
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 transition-colors hover:border-white/15"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[11px] font-semibold text-white/75">
                    {initials(member.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">{member.full_name}</p>
                    <p className="truncate text-[11px] text-white/35">
                      {member.plan} · <span className={meta.className.split(' ').pop()}>{meta.label}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={blocked || busyId === member.id}
                    onClick={() => handleCheckIn(member)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                      blocked
                        ? 'cursor-not-allowed bg-white/[0.04] text-white/30'
                        : 'bg-[#C6F94E] text-[#0A0B0D] hover:bg-[#D7FF63] active:scale-95'
                    )}
                  >
                    {blocked ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" /> Bloccato
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Check-in
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Ingressi di oggi
          </p>
          {checkIns.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-6 text-center text-sm text-white/30">
              Nessun ingresso registrato. Cerca un iscritto per iniziare.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {checkIns.slice(0, 6).map((ci) => (
                <li
                  key={ci.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C6F94E]/10 text-[#C6F94E]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 truncate text-sm text-white/75">{ci.member_name}</span>
                  <span className="flex items-center gap-1 text-[11px] text-white/30">
                    <Clock className="h-3 w-3" />
                    {formatTime(ci.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}