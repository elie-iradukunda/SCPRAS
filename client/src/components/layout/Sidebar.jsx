import {
  BarChart3,
  Bot,
  Boxes,
  CalendarCheck,
  FileText,
  Gauge,
  HardHat,
  ClipboardCheck,
  Settings,
  Users,
  Workflow,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
import { canAccess, ROLE_LABELS } from '../../config/roles.js';
import { getSessionUser } from '../../services/api.js';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/projects', label: 'Projects', icon: Workflow },
  { to: '/site-updates', label: 'Site Updates', icon: ClipboardCheck },
  { to: '/workers', label: 'Workers', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/materials', label: 'Materials', icon: Boxes },
  { to: '/workforce', label: 'Workforce Plan', icon: HardHat },
  { to: '/ai-insights', label: 'AI Insights', icon: Bot },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const user = getSessionUser();
  const visibleItems = items.filter((item) => canAccess(user?.role, item.to));
  const sidebar = (
    <aside className="flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-ink text-white">
      <div className="flex h-20 shrink-0 items-center gap-3 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold text-ink">
          <HardHat size={24} />
        </div>
        <div>
          <p className="text-xl font-extrabold tracking-wide">SCP<span className="text-gold">RAS</span></p>
          <p className="text-[10px] font-semibold leading-4 text-slate-300">Progress & Resource Analysis</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 pb-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition',
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mx-4 mb-5 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-gold">
          <BarChart3 size={18} />
          <span className="text-sm font-bold">{ROLE_LABELS[user?.role] || 'Authorized User'}</span>
        </div>
        <p className="text-sm leading-6 text-slate-300">
          Only the modules assigned to this role are shown in this workspace.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebar}</div>
      {isOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink/60" onClick={onClose} type="button" aria-label="Close menu" />
          <div className="relative z-10 h-full w-72">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}
