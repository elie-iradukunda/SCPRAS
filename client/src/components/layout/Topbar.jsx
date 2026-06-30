import { LogOut, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getSessionUser } from '../../services/api.js';
import { canAccess, ROLE_LABELS } from '../../config/roles.js';

const SEARCH_ROUTES = [
  { keywords: ['dashboard', 'overview', 'command', 'center'], path: '/dashboard' },
  { keywords: ['project', 'baseline', 'boq', 'plan', 'phases'], path: '/projects' },
  { keywords: ['site update', 'progress', 'constraint', 'activity'], path: '/site-updates' },
  { keywords: ['worker', 'staff', 'employee', 'team', 'smart card'], path: '/workers' },
  { keywords: ['attendance', 'check in', 'check-in', 'scan', 'present'], path: '/attendance' },
  { keywords: ['material', 'stock', 'inventory', 'cement', 'brick', 'supply'], path: '/materials' },
  { keywords: ['workforce', 'forecast', 'labour', 'labor', 'crew', 'productivity'], path: '/workforce' },
  { keywords: ['ai', 'insight', 'prediction', 'risk', 'analytics'], path: '/ai-insights' },
  { keywords: ['report', 'export', 'document'], path: '/reports' },
  { keywords: ['setting', 'device', 'security', 'admin', 'role'], path: '/settings' },
];

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [query, setQuery] = useState('');

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const lower = query.trim().toLowerCase();
    if (!lower) return;
    const match = SEARCH_ROUTES.filter((route) => canAccess(user?.role, route.path)).find((route) =>
      route.keywords.some((kw) => lower.includes(kw)),
    );
    navigate(match ? match.path : '/dashboard');
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="icon-button lg:hidden" onClick={onMenuClick} type="button" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-500">Smart Construction Progress & Resource Analysis</p>
            <h1 className="text-lg font-extrabold text-ink sm:text-xl">SCPRAS Command Centre</h1>
          </div>
        </div>

        <form className="hidden min-w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex" onSubmit={handleSearch}>
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Search projects, workers, reports…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={14} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span className="text-sm font-semibold">{user?.fullName || 'User'} · {ROLE_LABELS[user?.role] || 'Authorized role'}</span>
          </div>
          <button className="icon-button" onClick={logout} type="button" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
