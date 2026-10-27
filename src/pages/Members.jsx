import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Loader2, Users, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import MembersTable from '@/components/members/MembersTable';
import MemberDialog from '@/components/members/MemberDialog';
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
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { memberStatus } from '@/lib/gym';
import { asList, renewMembership } from '@/lib/gymActions';
import { primaryBtn } from '@/lib/uiClasses';
import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'tutti', label: 'Tutti' },
  { key: 'attivi', label: 'Attivi' },
  { key: 'scadenza', label: 'In scadenza' },
  { key: 'scaduti', label: 'Scaduti' },
  { key: 'sospesi', label: 'Sospesi' },
];

const matches = (status, filter) => {
  if (filter === 'tutti') return true;
  if (filter === 'attivi') return status === 'attivo' || status === 'in scadenza';
  if (filter === 'scadenza') return status === 'in scadenza';
  if (filter === 'scaduti') return status === 'scaduto';
  return status === 'sospeso';
};

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass glass-hover flex items-center gap-3 rounded-2xl px-4 py-3.5">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', tone)}>
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div>
        <p className="font-display text-lg font-semibold leading-none text-white">{value}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Members() {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('tutti');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const res = await base44.entities.Member.filter(
      {},
      { sort: 'full_name', limit: 500 }
    );
    setMembers(asList(res));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const counts = useMemo(() => {
    const result = { tutti: members.length, attivi: 0, scadenza: 0, scaduti: 0, sospesi: 0 };
    members.forEach((m) => {
      const s = memberStatus(m);
      if (s === 'attivo') result.attivi += 1;
      if (s === 'in scadenza') result.scadenza += 1;
      if (s === 'scaduto') result.scaduti += 1;
      if (s === 'sospeso') result.sospesi += 1;
    });
    result.attivi += result.scadenza;
    return result;
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const status = memberStatus(m);
      if (!matches(status, filter)) return false;
      if (!q) return true;
      return `${m.full_name || ''} ${m.email || ''} ${m.phone || ''}`.toLowerCase().includes(q);
    });
  }, [members, filter, query]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setDialogOpen(true);
  };

  const handleRenew = async (member) => {
    try {
      await renewMembership(member);
      await load();
      toast({ title: 'Abbonamento rinnovato', description: `${member.full_name} · ${member.plan}` });
    } catch (err) {
      toast({ title: 'Rinnovo non riuscito', description: err?.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await base44.entities.Member.delete(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      toast({ title: 'Iscritto eliminato' });
    } catch (err) {
      toast({ title: 'Eliminazione non riuscita', description: err?.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Anagrafica"
        title="Iscritti & Abbonamenti"
        subtitle="Gestisci tesseramenti, scadenze e rinnovi della sala."
        action={
          <button type="button" className={primaryBtn} onClick={openNew}>
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            Nuovo iscritto
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat
          icon={Users}
          label="Iscritti totali"
          value={members.length}
          tone="border-white/10 bg-white/[0.05] text-white/70"
        />
        <MiniStat
          icon={UserCheck}
          label="Attivi"
          value={counts.attivi}
          tone="border-[#C6F94E]/20 bg-[#C6F94E]/10 text-[#C6F94E]"
        />
        <MiniStat
          icon={AlertTriangle}
          label="In scadenza"
          value={counts.scadenza}
          tone="border-[#FFB020]/20 bg-[#FFB020]/10 text-[#FFB020]"
        />
        <MiniStat
          icon={UserX}
          label="Scaduti"
          value={counts.scaduti}
          tone="border-[#FF5A5A]/20 bg-[#FF5A5A]/10 text-[#FF5A5A]"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca iscritto…"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 transition-colors focus:border-[#C6F94E]/40 focus:outline-none"
          />
        </div>

        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                filter === f.key
                  ? 'border-[#C6F94E]/30 bg-[#C6F94E]/10 text-[#C6F94E]'
                  : 'border-white/[0.07] bg-white/[0.025] text-white/45 hover:border-white/15 hover:text-white/80'
              )}
            >
              {f.label}
              <span className="rounded-md bg-black/25 px-1.5 py-0.5 text-[10px] font-semibold">
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-white/30">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <MembersTable
            members={filtered}
            onRenew={handleRenew}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editing}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-[#0B0C0E] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-white">
              Eliminare {deleteTarget?.full_name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-white/40">
              L'iscritto verrà rimosso dall'anagrafica. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#FF5A5A] text-white hover:bg-[#FF7373]"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}