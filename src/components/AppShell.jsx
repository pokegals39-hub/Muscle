import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, LogOut, Menu, X, Dumbbell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { initials, formatLongDate } from '@/lib/gym';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/membri', label: 'Iscritti', icon: Users },
  { to: '/corsi', label: 'Corsi & Sala', icon: CalendarDays },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D7FF63] to-[#9BE22B] shadow-[0_0_28px_-8px_rgba(198,249,78,0.7)]">
        <Dumbbell className="h-5 w-5 text-[#0A0B0D]" strokeWidth={2.6} />
      </div>
      <div className="leading-none">
        <p className="font-display text-[17px] font-semibold tracking-tight text-white">
          MIX MUSCLE
        </p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white/35">
          Strength Studio
        </p>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }) {
  return (
    <nav className="mt-9 flex flex-col gap-1.5">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300',
              isActive
                ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-white/45 hover:bg-white/[0.035] hover:text-white/85'
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#C6F94E] transition-all duration-300',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
              />
              <Icon
                className={cn(
                  'h-[18px] w-[18px] transition-colors',
                  isActive ? 'text-[#C6F94E]' : 'text-white/40 group-hover:text-white/70'
                )}
                strokeWidth={2}
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserBlock({ user }) {
  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <div className="mt-auto space-y-4 pt-8">
      <div className="rounded-2xl border border-[#C6F94E]/15 bg-[#C6F94E]/[0.05] p-3.5">
        <div className="flex items-center gap-2">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#C6F94E]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C6F94E]">
            Sala aperta
          </p>
        </div>
        <p className="mt-1.5 text-xs text-white/40">06:30 — 23:00 · 4 trainer in turno</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-xs font-semibold text-white/80">
          {initials(user?.full_name || 'Mix Muscle')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/90">{user?.full_name || 'Staff'}</p>
          <p className="truncate text-[11px] text-white/35">{user?.email || 'staff@mixmuscle.it'}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Esci"
          className="rounded-lg p-2 text-white/35 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-white/[0.06] bg-[#0A0B0D]/85 px-5 py-6 backdrop-blur-2xl lg:flex">
        <Brand />
        <NavItems />
        <UserBlock user={user} />
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0A0B0D]/85 px-4 backdrop-blur-2xl lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/70 transition-colors hover:text-white"
          aria-label="Apri menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="anim-rise absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-white/10 bg-[#0A0B0D] px-5 py-6">
            <div className="flex items-start justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/50 hover:text-white"
                aria-label="Chiudi menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
            <UserBlock user={user} />
          </div>
        </div>
      )}

      <main className="lg:pl-[268px]">
        <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-9">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/30">
              {formatLongDate()}
            </p>
            <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/45">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#C6F94E]" />
              Sistema operativo
            </span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}