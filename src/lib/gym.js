export const PLANS = [
  { name: 'Mensile', months: 1, price: 49 },
  { name: 'Trimestrale', months: 3, price: 129 },
  { name: 'Semestrale', months: 6, price: 229 },
  { name: 'Annuale', months: 12, price: 399 },
  { name: 'Day Pass', months: 0, days: 1, price: 14 },
];

export const DISCIPLINES = [
  'Sala Pesi',
  'CrossFit',
  'Functional',
  'HIIT',
  'Spinning',
  'Yoga',
  'Boxe',
  'Pilates',
];

export const CLASS_LEVELS = ['Base', 'Intermedio', 'Avanzato'];

export const EQUIPMENT_CATEGORIES = ['Pesi liberi', 'Macchine', 'Cardio', 'Functional', 'Accessori'];

export const EQUIPMENT_STATUSES = ['Disponibile', 'In uso', 'Manutenzione'];

export const PAYMENT_METHODS = ['Carta', 'Contanti', 'Bonifico', 'POS'];

export const MEMBER_STATUSES = ['Attivo', 'Sospeso'];

export const WEEKDAYS = [
  { key: 'lun', label: 'Lun', full: 'Lunedì', index: 1 },
  { key: 'mar', label: 'Mar', full: 'Martedì', index: 2 },
  { key: 'mer', label: 'Mer', full: 'Mercoledì', index: 3 },
  { key: 'gio', label: 'Gio', full: 'Giovedì', index: 4 },
  { key: 'ven', label: 'Ven', full: 'Venerdì', index: 5 },
  { key: 'sab', label: 'Sab', full: 'Sabato', index: 6 },
  { key: 'dom', label: 'Dom', full: 'Domenica', index: 0 },
];

export const TRAINER_STATUSES = ['Disponibile', 'In lezione', 'Off'];

export function toISODate(date = new Date()) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return toISODate(new Date());
}

export function parseISO(iso) {
  if (!iso) return new Date();
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso, days) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(iso, months) {
  const d = parseISO(iso);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

export function formatDateIt(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseISO(iso));
}

export function formatDateShort(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(parseISO(iso));
}

export function formatLongDate(date = new Date()) {
  const label = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(d);
}

export function formatCurrency(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function daysUntil(iso) {
  if (!iso) return 0;
  const ms = parseISO(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function memberStatus(member) {
  if (!member) return 'attivo';
  if ((member.status || '').toLowerCase() === 'sospeso') return 'sospeso';
  const left = daysUntil(member.end_date);
  if (left < 0) return 'scaduto';
  if (left <= 7) return 'in scadenza';
  return 'attivo';
}

export const STATUS_META = {
  attivo: {
    label: 'Attivo',
    className: 'border-[#C6F94E]/25 bg-[#C6F94E]/10 text-[#C6F94E]',
    dot: 'bg-[#C6F94E]',
  },
  'in scadenza': {
    label: 'In scadenza',
    className: 'border-[#FFB020]/25 bg-[#FFB020]/10 text-[#FFB020]',
    dot: 'bg-[#FFB020]',
  },
  scaduto: {
    label: 'Scaduto',
    className: 'border-[#FF5A5A]/25 bg-[#FF5A5A]/10 text-[#FF5A5A]',
    dot: 'bg-[#FF5A5A]',
  },
  sospeso: {
    label: 'Sospeso',
    className: 'border-white/15 bg-white/[0.06] text-white/55',
    dot: 'bg-white/40',
  },
};

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.attivo;
}

export function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

export function endDateForPlan(startISO, planName) {
  const plan = PLANS.find((p) => p.name === planName);
  const start = startISO || todayISO();
  if (!plan) return addMonths(start, 1);
  if (plan.days) return addDays(start, plan.days);
  return addMonths(start, plan.months);
}

export function weekdayKey(date = new Date()) {
  return WEEKDAYS.find((d) => d.index === date.getDay())?.key || 'lun';
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function monthStartISO() {
  const d = new Date();
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function timeAgo(value) {
  if (!value) return '';
  const d = new Date(value);
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'ora';
  if (diffMin < 60) return `${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} g`;
}