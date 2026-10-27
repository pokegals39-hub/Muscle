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
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES, todayISO } from '@/lib/gym';

const blank = () => ({
  name: '',
  category: EQUIPMENT_CATEGORIES[0],
  room: 'Sala Pesi',
  status: 'Disponibile',
  quantity: 1,
  last_maintenance: todayISO(),
  notes: '',
});

export default function EquipmentDialog({ open, onOpenChange, equipment, onSaved }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      equipment
        ? {
            name: equipment.name || '',
            category: equipment.category || EQUIPMENT_CATEGORIES[0],
            room: equipment.room || '',
            status: equipment.status || 'Disponibile',
            quantity: equipment.quantity ?? 1,
            last_maintenance: equipment.last_maintenance || todayISO(),
            notes: equipment.notes || '',
          }
        : blank()
    );
  }, [open, equipment]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Inserisci il nome dell’attrezzatura.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      name: form.name.trim(),
      quantity: Number(form.quantity) || 1,
    };
    try {
      if (equipment) {
        await base44.entities.Equipment.update(equipment.id, payload);
      } else {
        await base44.entities.Equipment.create(payload);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0B0C0E] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-tight text-white">
            {equipment ? 'Modifica attrezzatura' : 'Nuova attrezzatura'}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/35">
            Tieni traccia di macchine, pesi e materiale delle sale.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nome" className="col-span-2">
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Es. Rack squat"
              />
            </FormField>
            <FormField label="Categoria">
              <select
                className={fieldClass}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0B0C0E]">
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Stato">
              <select
                className={fieldClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {EQUIPMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#0B0C0E]">
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Sala">
              <input
                className={fieldClass}
                value={form.room}
                onChange={(e) => set('room', e.target.value)}
                placeholder="Sala Pesi"
              />
            </FormField>
            <FormField label="Quantità">
              <input
                type="number"
                min="1"
                className={fieldClass}
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
              />
            </FormField>
            <FormField label="Ultima manutenzione" className="col-span-2">
              <input
                type="date"
                className={fieldClass}
                value={form.last_maintenance}
                onChange={(e) => set('last_maintenance', e.target.value)}
              />
            </FormField>
            <FormField label="Note" className="col-span-2">
              <textarea
                rows={2}
                className={fieldClass}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Usura, ricambi, interventi…"
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
              {equipment ? 'Salva' : 'Aggiungi'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}