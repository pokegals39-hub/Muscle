import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, Wrench, RefreshCw } from 'lucide-react';
import EquipmentDialog from '@/components/courses/EquipmentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import { formatDateIt } from '@/lib/gym';
import { asList } from '@/lib/gymActions';
import { iconBtn, primaryBtn } from '@/lib/uiClasses';
import { cn } from '@/lib/utils';

const STATUS_TONE = {
  Disponibile: 'border-[#C6F94E]/25 bg-[#C6F94E]/10 text-[#C6F94E]',
  'In uso': 'border-[#FF7A3C]/25 bg-[#FF7A3C]/10 text-[#FF7A3C]',
  Manutenzione: 'border-[#FFB020]/25 bg-[#FFB020]/10 text-[#FFB020]',
};

const NEXT_STATUS = {
  Disponibile: 'In uso',
  'In uso': 'Manutenzione',
  Manutenzione: 'Disponibile',
};

export default function EquipmentTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const res = await base44.entities.Equipment.filter({}, { sort: 'name', limit: 300 });
    setItems(asList(res));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const counts = useMemo(() => {
    const c = { Disponibile: 0, 'In uso': 0, Manutenzione: 0 };
    items.forEach((i) => {
      if (c[i.status] !== undefined) c[i.status] += 1;
    });
    return c;
  }, [items]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const cycleStatus = async (item) => {
    const next = NEXT_STATUS[item.status] || 'Disponibile';
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: next } : i)));
    await base44.entities.Equipment.update(item.id, { status: next });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await base44.entities.Equipment.delete(deleteTarget.id);
    setDeleteTarget(null);
    await load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {[
            { label: 'Totale', value: items.length, tone: 'border-white/10 bg-white/[0.05] text-white/70' },
            { label: 'Disponibili', value: counts.Disponibile, tone: STATUS_TONE.Disponibile },
            { label: 'In uso', value: counts['In uso'], tone: STATUS_TONE['In uso'] },
            { label: 'Manutenzione', value: counts.Manutenzione, tone: STATUS_TONE.Manutenzione },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold',
                s.tone
              )}
            >
              <span className="text-sm">{s.value}</span>
              <span className="opacity-70">{s.label}</span>
            </div>
          ))}
        </div>
        <button type="button" className={primaryBtn} onClick={openNew}>
          <Plus className="h-4 w-4" strokeWidth={2.6} />
          Nuova attrezzatura
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/30">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-3xl px-6 py-16 text-center">
          <p className="font-display text-base text-white/70">Nessuna attrezzatura censita</p>
          <p className="mt-1 text-sm text-white/30">Aggiungi macchine, pesi e materiale delle sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="glass glass-hover group rounded-3xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/45">
                    {item.category}
                  </span>
                  <span className="rounded-full border border-white/[0.07] px-2.5 py-1 text-[10px] text-white/30">
                    {item.room || 'Sala'}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" className={iconBtn} onClick={() => openEdit(item)} title="Modifica">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className={cn(iconBtn, 'hover:border-[#FF5A5A]/30 hover:bg-[#FF5A5A]/10 hover:text-[#FF8A8A]')}
                    onClick={() => setDeleteTarget(item)}
                    title="Elimina"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-white">
                {item.name}
              </h3>
              <p className="mt-1 text-[11px] text-white/30">
                Quantità {item.quantity ?? 1} · Manutenzione {formatDateIt(item.last_maintenance)}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleStatus(item)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all hover:brightness-125',
                    STATUS_TONE[item.status] || STATUS_TONE.Disponibile
                  )}
                  title="Cambia stato"
                >
                  {item.status === 'Manutenzione' ? (
                    <Wrench className="h-3 w-3" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  {item.status || 'Disponibile'}
                </button>
                <span className="text-[10px] text-white/20">tocca per aggiornare</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editing}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-[#0B0C0E] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-white">
              Eliminare {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-white/40">
              L'attrezzatura verrà rimossa dall'inventario della sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#FF5A5A] text-white hover:bg-[#FF7373]">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}