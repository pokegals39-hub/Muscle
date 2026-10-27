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
import { CLASS_LEVELS, DISCIPLINES, WEEKDAYS } from '@/lib/gym';

const blank = (day) => ({
  name: '',
  discipline: DISCIPLINES[0],
  trainer: '',
  day: day || 'lun',
  start_time: '18:00',
  duration: 50,
  capacity: 16,
  room: 'Sala Pesi',
  level: 'Intermedio',
});

export default function ClassDialog({ open, onOpenChange, gymClass, defaultDay, onSaved }) {
  const [form, setForm] = useState(() => blank(defaultDay));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      gymClass
        ? {
            name: gymClass.name || '',
            discipline: gymClass.discipline || DISCIPLINES[0],
            trainer: gymClass.trainer || '',
            day: gymClass.day || 'lun',
            start_time: gymClass.start_time || '18:00',
            duration: gymClass.duration || 50,
            capacity: gymClass.capacity || 16,
            room: gymClass.room || 'Sala Pesi',
            level: gymClass.level || 'Intermedio',
          }
        : blank(defaultDay)
    );
  }, [open, gymClass, defaultDay]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Inserisci il nome del corso.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      name: form.name.trim(),
      duration: Number(form.duration) || 45,
      capacity: Number(form.capacity) || 1,
    };
    try {
      if (gymClass) {
        await base44.entities.GymClass.update(gymClass.id, payload);
      } else {
        await base44.entities.GymClass.create(payload);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0B0C0E] sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-tight text-white">
            {gymClass ? 'Modifica corso' : 'Nuovo corso'}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/35">
            Il corso entra nel calendario settimanale della palestra.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nome corso" className="col-span-2">
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Es. CrossFit WOD"
              />
            </FormField>
            <FormField label="Disciplina">
              <select
                className={fieldClass}
                value={form.discipline}
                onChange={(e) => set('discipline', e.target.value)}
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d} className="bg-[#0B0C0E]">
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Trainer">
              <input
                className={fieldClass}
                value={form.trainer}
                onChange={(e) => set('trainer', e.target.value)}
                placeholder="Nome trainer"
              />
            </FormField>
            <FormField label="Giorno">
              <select
                className={fieldClass}
                value={form.day}
                onChange={(e) => set('day', e.target.value)}
              >
                {WEEKDAYS.map((d) => (
                  <option key={d.key} value={d.key} className="bg-[#0B0C0E]">
                    {d.full}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Orario">
              <input
                type="time"
                className={fieldClass}
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
              />
            </FormField>
            <FormField label="Durata (min)">
              <input
                type="number"
                min="15"
                step="5"
                className={fieldClass}
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
              />
            </FormField>
            <FormField label="Posti">
              <input
                type="number"
                min="1"
                className={fieldClass}
                value={form.capacity}
                onChange={(e) => set('capacity', e.target.value)}
              />
            </FormField>
            <FormField label="Sala">
              <input
                className={fieldClass}
                value={form.room}
                onChange={(e) => set('room', e.target.value)}
                placeholder="Sala Pesi"
              />
            </FormField>
            <FormField label="Livello">
              <select
                className={fieldClass}
                value={form.level}
                onChange={(e) => set('level', e.target.value)}
              >
                {CLASS_LEVELS.map((l) => (
                  <option key={l} value={l} className="bg-[#0B0C0E]">
                    {l}
                  </option>
                ))}
              </select>
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
              {gymClass ? 'Salva corso' : 'Crea corso'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}