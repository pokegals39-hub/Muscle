import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Dumbbell, Euro, Loader2, ScanLine, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import CheckInPanel from '@/components/dashboard/CheckInPanel';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import StaffCard from '@/components/dashboard/StaffCard';
import ExpiringCard from '@/components/dashboard/ExpiringCard';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  formatCurrency,
  formatTime,
  memberStatus,
  monthStartISO,
  todayISO,
  weekdayKey,
} from '@/lib/gym';
import { asList, registerCheckIn, renewMembership } from '@/lib/gymActions';
import { ghostBtn } from '@/lib/uiClasses';

export default function Dashboard() {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookingsByClass, setBookingsByClass] = useState({});
  const [trainers, setTrainers] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const [memberRes, checkinRes, classRes, bookingRes, trainerRes, revenueRes] =
      await Promise.all([
        base44.entities.Member.filter({}, { sort: 'full_name', limit: 500 }),
        base44.entities.CheckIn.filter(
          { timestamp: { $gte: dayStart.toISOString() } },
          { sort: '-timestamp', limit: 60 }
        ),
        base44.entities.GymClass.filter({}, { sort: 'start_time', limit: 300 }),
        base44.entities.Booking.filter({ class_date: todayISO() }, { limit: 500 }),
        base44.entities.Trainer.filter({}, { sort: 'name', limit: 50 }),
        base44.entities.Payment.aggregate({
          query: { date: { $gte: monthStartISO() } },
          sum: ['amount'],
        }),
      ]);

    setMembers(asList(memberRes));
    setCheckIns(asList(checkinRes));
    setClasses(asList(classRes));
    setTrainers(asList(trainerRes));
    setRevenue(revenueRes?.rows?.[0]?.sum_amount || 0);

    const map = {};
    asList(bookingRes).forEach((b) => {
      if (b.status === 'Cancellato') return;
      map[b.class_id] = (map[b.class_id] || 0) + 1;
    });
    setBookingsByClass(map);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const activeMembers = members.filter((m) =>
    ['attivo', 'in scadenza'].includes(memberStatus(m))
  ).length;

  const expiringCount = members.filter((m) => memberStatus(m) === 'in scadenza').length;

  const todayClasses = useMemo(
    () =>
      classes
        .filter((c) => c.day === weekdayKey(new Date()))
        .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
    [classes]
  );

  const availableTrainers = trainers.filter((t) => t.status === 'Disponibile').length;

  const checkInSpark = useMemo(() => {
    const buckets = Array(7).fill(0);
    checkIns.forEach((ci) => {
      const hour = new Date(ci.timestamp).getHours();
      const index = Math.min(6, Math.max(0, Math.floor((hour - 8) / 2)));
      buckets[index] += 1;
    });
    const max = Math.max(1, ...buckets);
    return buckets.map((b) => Math.round((b / max) * 100));
  }, [checkIns]);

  const handleCheckIn = async (member) => {
    setBusyId(member.id);
    try {
      const created = await registerCheckIn(member);
      setCheckIns((prev) => [created, ...prev]);
      toast({ title: 'Ingresso registrato', description: member.full_name });
    } catch (err) {
      toast({ title: 'Check-in non riuscito', description: err?.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleRenew = async (member) => {
    try {
      await renewMembership(member);
      await load();
      toast({ title: 'Abbonamento rinnovato', description: member.full_name });
    } catch (err) {
      toast({ title: 'Rinnovo non riuscito', description: err?.message, variant: 'destructive' });
    }
  };

  const cycleTrainer = async (trainer) => {
    const next =
      trainer.status === 'Disponibile'
        ? 'In lezione'
        : trainer.status === 'In lezione'
          ? 'Off'
          : 'Disponibile';
    setTrainers((prev) =>
      prev.map((t) => (t.id === trainer.id ? { ...t, status: next } : t))
    );
    await base44.entities.Trainer.update(trainer.id, { status: next });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-white/30">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mix Muscle · Strength Studio"
        title="Panoramica"
        subtitle="Tutto ciò che accade in sala, aggiornato in tempo reale."
        action={
          <Link to="/membri" className={ghostBtn}>
            Anagrafica iscritti
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Iscritti attivi"
          value={activeMembers}
          hint={`${expiringCount} in scadenza`}
          icon={Users}
          tone="lime"
        />
        <StatCard
          index={1}
          label="Entrate del mese"
          value={formatCurrency(revenue)}
          hint="Incassi registrati da inizio mese"
          icon={Euro}
          tone="orange"
        />
        <StatCard
          index={2}
          label="Ingressi oggi"
          value={checkIns.length}
          hint={
            checkIns.length > 0
              ? `Ultimo ingresso ${formatTime(checkIns[0].timestamp)}`
              : 'Nessun ingresso registrato'
          }
          icon={ScanLine}
          tone="cyan"
          spark={checkInSpark}
        />
        <StatCard
          index={3}
          label="Trainer disponibili"
          value={`${availableTrainers}/${trainers.length}`}
          hint={`${todayClasses.length} corsi in programma oggi`}
          icon={Dumbbell}
          tone="violet"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <CheckInPanel
            members={members}
            checkIns={checkIns}
            onCheckIn={handleCheckIn}
            busyId={busyId}
          />
          <TodaySchedule classes={todayClasses} bookingsByClass={bookingsByClass} />
        </div>
        <div className="space-y-5">
          <StaffCard trainers={trainers} onCycle={cycleTrainer} />
          <ExpiringCard members={members} onRenew={handleRenew} />
        </div>
      </div>
    </div>
  );
}