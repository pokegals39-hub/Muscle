import { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import FormField, { fieldClass } from '@/components/FormField';
import { ghostBtn, primaryBtn } from '@/lib/uiClasses';
import { base44 } from '@/api/base44Client';
import { formatDateIt, memberStatus, statusMeta } from '@/lib/gym';

export default function BookingDialog({
  open,
  onOpenChange,
  gymClass,
  date,
  members = [],
  existingBookings = [],
  onSaved,
}) {
  const [memberId, setMemberId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setMemberId('');
    setError('');
  }, [open]);

  if (!gymClass) return null;

  const capacity = gymClass.capacity || 0;
  const booked = existingBookings.filter((b) => b.status !== 'Cancellato').length;
  const selected = members.find((m) => m.id === memberId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected) {
      setError('Seleziona un iscritto.');
      return;
    }
    if (booked >= capacity) {
      setError('Il corso è al completo per questa data.');
      return;
    }
    if (existingBookings.some((b) => b.member_id === selected.id && b.status !== 'Cancellato')) {
      setError('Questo iscritto ha già una prenotazione per il corso.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await base44.entities.Booking.create({
        class_id: gymClass.id,
        class_name: gymClass.name,
        member_id: selected.id,
        member_name: selected.full_name,
        class_date: date,
        status: 'Confermato',
      });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Prenotazione non riuscita.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0B0C0E] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-tight text-white">
            Prenota · {gymClass.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/35">
            {formatDateIt(date)} · {gymClass.start_time} · {gymClass.trainer || 'Trainer'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-xs">
            <span className="text-white/40">Posti occupati</span>
            <span className="font-semibold text-white/80">
              {booked}/{capacity || '∞'}
            </span>
          </div>

          <FormField label="Iscritto">
            <select
              className={fieldClass}
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="" className="bg-[#0B0C0E]">
                Seleziona un iscritto…
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0B0C0E]">
                  {m.full_name} · {m.plan}
                </option>
              ))}
            </select>
          </FormField>

          {selected && (
            <p className="flex items-center gap-2 text-[11px] text-white/35">
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta(memberStatus(selected)).dot}`} />
              {statusMeta(memberStatus(selected)).label} · scade{' '}
              {formatDateIt(selected.end_date)}
            </p>
          )}

          {existingBookings.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                Già prenotati
              </p>
              <div className="flex flex-wrap gap-1.5">
                {existingBookings.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/55"
                  >
                    {b.member_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-[#FF5A5A]/20 bg-[#FF5A5A]/10 px-3 py-2 text-xs text-[#FF8A8A]">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-1">
            <button type="button" className={ghostBtn} onClick={() => onOpenChange(false)}>
              Annulla
            </button>
            <button type="submit" className={primaryBtn} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Conferma prenotazione
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}