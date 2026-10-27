import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import {
  PAYMENT_METHODS,
  PLANS,
  endDateForPlan,
  todayISO,
} from '@/lib/gym';

const blank = () => ({
  full_name: '',
  email: '',
  phone: '',
  plan: PLANS[0].name,
  plan_price: PLANS[0].price,
  start_date: todayISO(),
  end_date: endDateForPlan(todayISO(), PLANS[0].name),
  status: 'Attivo',
  notes: '',
  method: 'Carta',
});

export default function MemberDialog({ open, onOpenChange, member, onSaved }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      member
        ? {
            full_name: member.full_name || '',
            email: member.email || '',
            phone: member.phone || '',
            plan: member.plan || PLANS[0].name,
            plan_price: member.plan_price ?? PLANS[0].price,
            start_date: member.start_date || todayISO(),
            end_date: member.end_date || todayISO(),
            status: member.status || 'Attivo',
            notes: member.notes || '',
            method: 'Carta',
          }
        : blank()
    );
  }, [open, member]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePlan = (planName) => {
    const plan = PLANS.find((p) => p.name === planName);
    setForm((prev) => ({
      ...prev,
      plan: planName,
      plan_price: plan ? plan.price : prev.plan_price,
      end_date: endDateForPlan(prev.start_date, planName),
    }));
  };

  const handleStart = (value) => {
    setForm((prev) => ({ ...prev, start_date: value, end_date: endDateForPlan(value, prev.plan) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim()) {
      setError('Inserisci nome e cognome.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      plan: form.plan,
      plan_price: Number(form.plan_price) || 0,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      notes: form.notes,
    };
    try {
      if (member) {
        await base44.entities.Member.update(member.id, payload);
      } else {
        const created = await base44.entities.Member.create(payload);
        if (payload.plan_price > 0) {
          await base44.entities.Payment.create({
            member_id: created.id,
            member_name: payload.full_name,
            amount: payload.plan_price,
            date: payload.start_date || todayISO(),
            method: form.method,
            plan: payload.plan,
          });
        }
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Salvataggio non riuscito.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0B0C0E] sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-tight text-white">
            {member ? 'Modifica iscritto' : 'Nuovo iscritto'}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/35">
            {member
              ? 'Aggiorna i dati e la scadenza dell’abbonamento.'
              : 'Registra un nuovo iscritto e il suo primo pagamento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nome e cognome" className="sm:col-span-2">
              <input
                className={fieldClass}
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Es. Luca Bianchi"
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                className={fieldClass}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="nome@email.it"
              />
            </FormField>
            <FormField label="Telefono">
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="340 000 0000"
              />
            </FormField>
            <FormField label="Abbonamento">
              <select
                className={fieldClass}
                value={form.plan}
                onChange={(e) => handlePlan(e.target.value)}
              >
                {PLANS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-[#0B0C0E]">
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Prezzo (€)">
              <input
                type="number"
                min="0"
                step="1"
                className={fieldClass}
                value={form.plan_price}
                onChange={(e) => set('plan_price', e.target.value)}
              />
            </FormField>
            <FormField label="Inizio">
              <input
                type="date"
                className={fieldClass}
                value={form.start_date}
                onChange={(e) => handleStart(e.target.value)}
              />
            </FormField>
            <FormField label="Scadenza">
              <input
                type="date"
                className={fieldClass}
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
              />
            </FormField>
            <FormField label="Stato">
              <select
                className={fieldClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <option value="Attivo" className="bg-[#0B0C0E]">Attivo</option>
                <option value="Sospeso" className="bg-[#0B0C0E]">Sospeso</option>
              </select>
            </FormField>
            {!member && (
              <FormField label="Metodo di pagamento">
                <select
                  className={fieldClass}
                  value={form.method}
                  onChange={(e) => set('method', e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} className="bg-[#0B0C0E]">
                      {m}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField label="Note" className="sm:col-span-2">
              <textarea
                rows={2}
                className={fieldClass}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Obiettivi, infortuni, informazioni utili…"
              />
            </FormField>
          </div>

          {error && (
            <p className="rounded-xl border border-[#FF5A5A]/20 bg-[#FF5A5A]/10 px-3 py-2 text-xs text-[#FF8A8A]">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <button type="button" className={ghostBtn} onClick={() => onOpenChange(false)}>
              Annulla
            </button>
            <button type="submit" className={primaryBtn} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {member ? 'Salva modifiche' : 'Crea iscritto'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}