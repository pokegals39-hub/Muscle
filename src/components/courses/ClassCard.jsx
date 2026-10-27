import { Clock, MapPin, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { iconBtn, primaryBtn } from '@/lib/uiClasses';
import { cn } from '@/lib/utils';

const DISCIPLINE_TONE = {
  CrossFit: 'border-[#FF7A3C]/25 bg-[#FF7A3C]/10 text-[#FF7A3C]',
  Functional: 'border-[#4ED9C9]/25 bg-[#4ED9C9]/10 text-[#4ED9C9]',
  HIIT: 'border-[#FF5A5A]/25 bg-[#FF5A5A]/10 text-[#FF8A8A]',
  Spinning: 'border-[#A78BFA]/25 bg-[#A78BFA]/10 text-[#A78BFA]',
  Yoga: 'border-[#7DD3FC]/25 bg-[#7DD3FC]/10 text-[#7DD3FC]',
  Boxe: 'border-[#FFB020]/25 bg-[#FFB020]/10 text-[#FFB020]',
  Pilates: 'border-[#F9A8D4]/25 bg-[#F9A8D4]/10 text-[#F9A8D4]',
  'Sala Pesi': 'border-[#C6F94E]/25 bg-[#C6F94E]/10 text-[#C6F94E]',
};

export default function ClassCard({ gymClass, booked = 0, onBook, onEdit, onDelete }) {
  const capacity = gymClass.capacity || 0;
  const pct = capacity ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
  const full = capacity > 0 && booked >= capacity;

  return (
    <div className="glass glass-hover group flex flex-col rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
              DISCIPLINE_TONE[gymClass.discipline] || DISCIPLINE_TONE['Sala Pesi']
            )}
          >
            {gymClass.discipline || 'Corso'}
          </span>
          {gymClass.level && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/40">
              {gymClass.level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" className={iconBtn} title="Modifica" onClick={() => onEdit(gymClass)}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(iconBtn, 'hover:border-[#FF5A5A]/30 hover:bg-[#FF5A5A]/10 hover:text-[#FF8A8A]')}
            title="Elimina"
            onClick={() => onDelete(gymClass)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-white">
        {gymClass.name}
      </h3>

      <div className="mt-2 space-y-1 text-[11px] text-white/35">
        <p className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {gymClass.start_time} · {gymClass.duration || 45} min
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          {gymClass.room || 'Sala'} · {gymClass.trainer || 'Trainer da assegnare'}
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-white/35">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {booked}/{capacity || '∞'} prenotati
          </span>
          <span className={cn(full ? 'text-[#FFB020]' : 'text-white/35')}>
            {full ? 'Completo' : `${Math.max(0, capacity - booked)} posti`}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9BE22B] to-[#C6F94E] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        disabled={full}
        onClick={() => onBook(gymClass)}
        className={cn(primaryBtn, 'mt-4 w-full py-2.5 text-xs')}
      >
        <UserPlus className="h-3.5 w-3.5" />
        {full ? 'Nessun posto' : 'Prenota iscritto'}
      </button>
    </div>
  );
}