import { Pencil, RefreshCw, Trash2, Clock } from 'lucide-react';
import { memberStatus, statusMeta, initials, formatDateIt, daysUntil, formatCurrency } from '@/lib/gym';
import { iconBtn } from '@/lib/uiClasses';
import { cn } from '@/lib/utils';

function Actions({ member, onRenew, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" className={iconBtn} title="Rinnova" onClick={() => onRenew(member)}>
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={iconBtn} title="Modifica" onClick={() => onEdit(member)}>
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={cn(iconBtn, 'hover:border-[#FF5A5A]/30 hover:bg-[#FF5A5A]/10 hover:text-[#FF8A8A]')}
        title="Elimina"
        onClick={() => onDelete(member)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
        meta.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export default function MembersTable({ members, onRenew, onEdit, onDelete }) {
  if (members.length === 0) {
    return (
      <div className="glass rounded-3xl px-6 py-16 text-center">
        <p className="font-display text-base text-white/70">Nessun iscritto trovato</p>
        <p className="mt-1 text-sm text-white/30">
          Prova a cambiare la ricerca o aggiungi un nuovo iscritto.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass hidden overflow-hidden rounded-3xl lg:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left">
              {['Iscritto', 'Abbonamento', 'Scadenza', 'Stato', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const status = memberStatus(m);
              const left = daysUntil(m.end_date);
              return (
                <tr
                  key={m.id}
                  className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.028]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[11px] font-semibold text-white/75">
                        {initials(m.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white/90">{m.full_name}</p>
                        <p className="truncate text-[11px] text-white/30">{m.email || m.phone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white/75">{m.plan}</p>
                    <p className="text-[11px] text-white/30">{formatCurrency(m.plan_price)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white/75">{formatDateIt(m.end_date)}</p>
                    <p
                      className={cn(
                        'flex items-center gap-1 text-[11px]',
                        left < 0 ? 'text-[#FF8A8A]' : left <= 7 ? 'text-[#FFB020]' : 'text-white/30'
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {left < 0 ? `scaduto da ${Math.abs(left)} g` : `${left} giorni rimasti`}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <Actions member={m} onRenew={onRenew} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {members.map((m) => (
          <div key={m.id} className="glass rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[11px] font-semibold text-white/75">
                {initials(m.full_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white/90">{m.full_name}</p>
                <p className="truncate text-[11px] text-white/30">{m.email || m.phone || '—'}</p>
              </div>
              <StatusBadge status={memberStatus(m)} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 text-xs">
              <div>
                <p className="text-white/30">Piano</p>
                <p className="mt-0.5 text-white/75">{m.plan}</p>
              </div>
              <div>
                <p className="text-white/30">Scadenza</p>
                <p className="mt-0.5 text-white/75">{formatDateIt(m.end_date)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <Actions member={m} onRenew={onRenew} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}