import { base44 } from '@/api/base44Client';
import { PLANS, daysUntil, endDateForPlan, todayISO } from '@/lib/gym';

export async function renewMembership(member) {
  const baseDate = daysUntil(member.end_date) < 0 ? todayISO() : member.end_date;
  const newEnd = endDateForPlan(baseDate, member.plan);
  const plan = PLANS.find((p) => p.name === member.plan);

  await base44.entities.Member.update(member.id, { end_date: newEnd, status: 'Attivo' });
  await base44.entities.Payment.create({
    member_id: member.id,
    member_name: member.full_name,
    amount: plan?.price ?? member.plan_price ?? 0,
    date: todayISO(),
    method: 'Carta',
    plan: member.plan,
  });

  return newEnd;
}

export async function registerCheckIn(member) {
  return base44.entities.CheckIn.create({
    member_id: member.id,
    member_name: member.full_name,
    timestamp: new Date().toISOString(),
  });
}

export function asList(res) {
  if (Array.isArray(res)) return res;
  return res?.items || [];
}