import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Loader2, CalendarDays, Dumbbell } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ClassCard from '@/components/courses/ClassCard';
import ClassDialog from '@/components/courses/ClassDialog';
import BookingDialog from '@/components/courses/BookingDialog';
import EquipmentTab from '@/components/courses/EquipmentTab';
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
import {
  WEEKDAYS,
  formatLongDate,
  parseISO,
  startOfWeek,
  toISODate,
  todayISO,
  weekdayKey,
} from '@/lib/gym';
import { asList } from '@/lib/gymActions';
import { primaryBtn } from '@/lib/uiClasses';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'corsi', label: 'Corsi & Prenotazioni', icon: CalendarDays },
  { key: 'attrezzatura', label: 'Attrezzatura', icon: Dumbbell },
];

export default function Courses() {
  const { toast } = useToast();
  const [tab, setTab] = useState('corsi');
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [weekOffset, setWeekOffset] = useState(0);

  const [classOpen, setClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [bookingClass, setBookingClass] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadBase = useCallback(async () => {
    const [classRes, memberRes] = await Promise.all([
      base44.entities.GymClass.filter({}, { sort: 'start_time', limit: 300 }),
      base44.entities.Member.filter({}, { sort: 'full_name', limit: 500 }),
    ]);
    setClasses(asList(classRes));
    setMembers(asList(memberRes));
  }, []);

  const loadBookings = useCallback(async (date) => {
    const res = await base44.entities.Booking.filter({ class_date: date }, { limit: 500 });
    setBookings(asList(res));
  }, []);

  useEffect(() => {
    loadBase().finally(() => setLoading(false));
  }, [loadBase]);

  useEffect(() => {
    loadBookings(selectedDate);
  }, [selectedDate, loadBookings]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return WEEKDAYS.map((d, i) => {
      const dt = new Date(start);
      dt.setDate(dt.getDate() + i);
      return { ...d, iso: toISODate(dt), dayNum: dt.getDate() };
    });
  }, [weekOffset]);

  const dayKey = weekdayKey(parseISO(selectedDate));

  const dayClasses = useMemo(
    () =>
      classes
        .filter((c) => c.day === dayKey)
        .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
    [classes, dayKey]
  );

  const bookingsByClass = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (b.status === 'Cancellato') return;
      map[b.class_id] = (map[b.class_id] || 0) + 1;
    });
    return map;
  }, [bookings]);

  const openNewClass = () => {
    setEditingClass(null);
    setClassOpen(true);
  };

  const openEditClass = (gymClass) => {
    setEditingClass(gymClass);
    setClassOpen(true);
  };

  const openBooking = (gymClass) => {
    setBookingClass(gymClass);
    setBookingOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!deleteTarget) return;
    try {
      await base44.entities.GymClass.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadBase();
      await loadBookings(selectedDate);
      toast({ title: 'Corso eliminato' });
    } catch (err) {
      toast({ title: 'Eliminazione non riuscita', description: err?.message, variant: 'destructive' });
    }
  };

  const handleBooked = async () => {
    await loadBookings(selectedDate);
    toast({ title: 'Prenotazione confermata' });
  };

  const shiftWeek = (dir) => {
    const next = weekOffset + dir;
    setWeekOffset(next);
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + next * 7);
    setSelectedDate(toISODate(start));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sala & Corsi"
        title="Corsi & Attrezzatura"
        subtitle="Calendario settimanale, prenotazioni e stato delle sale."
        action={
          tab === 'corsi' ? (
            <button type="button" className={primaryBtn} onClick={openNewClass}>
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Nuovo corso
            </button>
          ) : null
        }
      />

      <div className="mb-5 flex w-full gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5 sm:w-auto sm:self-start">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:flex-none',
              tab === key
                ? 'bg-[#C6F94E] text-[#0A0B0D] shadow-[0_0_24px_-10px_rgba(198,249,78,0.9)]'
                : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'attrezzatura' ? (
        <EquipmentTab />
      ) : (
        <>
          <div className="glass rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftWeek(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/50 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-xs font-medium text-white/55">{formatLongDate(parseISO(selectedDate))}</p>
              <button
                type="button"
                onClick={() => shiftWeek(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/50 transition-colors hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((d) => {
                const active = d.iso === selectedDate;
                const isToday = d.iso === todayISO();
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setSelectedDate(d.iso)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-2xl border py-2.5 transition-all',
                      active
                        ? 'border-[#C6F94E]/40 bg-[#C6F94E]/12 text-[#C6F94E]'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/45 hover:border-white/15 hover:text-white/80'
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                      {d.label}
                    </span>
                    <span
                      className={cn(
                        'font-display text-sm font-semibold',
                        isToday && !active ? 'text-[#C6F94E]' : ''
                      )}
                    >
                      {d.dayNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-white/30">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : dayClasses.length === 0 ? (
              <div className="glass rounded-3xl px-6 py-16 text-center">
                <p className="font-display text-base text-white/70">Nessun corso in programma</p>
                <p className="mt-1 text-sm text-white/30">
                  Aggiungi un corso per {WEEKDAYS.find((d) => d.key === dayKey)?.full.toLowerCase()}.
                </p>
                <button type="button" className={cn(primaryBtn, 'mt-4')} onClick={openNewClass}>
                  <Plus className="h-4 w-4" />
                  Nuovo corso
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {dayClasses.map((gymClass) => (
                  <ClassCard
                    key={gymClass.id}
                    gymClass={gymClass}
                    booked={bookingsByClass[gymClass.id] || 0}
                    onBook={openBooking}
                    onEdit={openEditClass}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ClassDialog
        open={classOpen}
        onOpenChange={setClassOpen}
        gymClass={editingClass}
        defaultDay={dayKey}
        onSaved={async () => {
          await loadBase();
        }}
      />

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        gymClass={bookingClass}
        date={selectedDate}
        members={members}
        existingBookings={bookings.filter(
          (b) => b.class_id === bookingClass?.id && b.status !== 'Cancellato'
        )}
        onSaved={handleBooked}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-[#0B0C0E] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-white">
              Eliminare {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-white/40">
              Il corso verrà rimosso dal calendario settimanale della palestra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
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