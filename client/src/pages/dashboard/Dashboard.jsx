import {
  AlertTriangle,
  Boxes,
  BriefcaseBusiness,
  Cloud,
  DollarSign,
  HardHat,
  Info,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  ShieldCheck,
  UserCog,
  MonitorSmartphone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import ProgressChart from '../../components/dashboard/ProgressChart.jsx';
import ProjectTable from '../../components/dashboard/ProjectTable.jsx';
import { insights as fallbackInsights, projects as fallbackProjects } from '../../data/mockData.js';
import { api, getSessionUser } from '../../services/api.js';
import { ROLE_LABELS, ROLES } from '../../config/roles.js';

const fallbackDashboard = {
  metrics: {
    projects: 4,
    overallProgress: 53,
    workers: 4,
    materials: 6,
    totalBudget: 550000,
  },
  insights: fallbackInsights,
};

const INSIGHT_CONFIG = {
  risk:    { icon: AlertTriangle, bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',    label: 'Risk' },
  delay:   { icon: TrendingDown,  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700', label: 'Delay' },
  labor:   { icon: HardHat,       bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   label: 'Labour' },
  weather: { icon: Cloud,         bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-700',     label: 'Weather' },
  budget:  { icon: DollarSign,    bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700',label: 'Budget' },
  material:{ icon: Boxes,         bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700',label: 'Material' },
  info:    { icon: Info,          bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600',  label: 'Info' },
};

function getInsightConfig(insight) {
  if (typeof insight === 'string') {
    const lower = insight.toLowerCase();
    if (lower.includes('risk') || lower.includes('danger')) return INSIGHT_CONFIG.risk;
    if (lower.includes('delay') || lower.includes('behind') || lower.includes('late')) return INSIGHT_CONFIG.delay;
    if (lower.includes('worker') || lower.includes('labor') || lower.includes('labour') || lower.includes('crew')) return INSIGHT_CONFIG.labor;
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('season')) return INSIGHT_CONFIG.weather;
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('spend')) return INSIGHT_CONFIG.budget;
    if (lower.includes('material') || lower.includes('cement') || lower.includes('steel') || lower.includes('stock')) return INSIGHT_CONFIG.material;
    return INSIGHT_CONFIG.info;
  }
  return INSIGHT_CONFIG[insight?.type] || INSIGHT_CONFIG.info;
}

function InsightCard({ insight }) {
  const text = typeof insight === 'string' ? insight : insight?.title || String(insight);
  const config = getInsightConfig(insight);
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${config.bg} ${config.border}`}>
      <div className={`mt-0.5 shrink-0 ${config.text}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-5 ${config.text}`}>{text}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${config.badge}`}>{config.label}</span>
    </div>
  );
}

export default function Dashboard() {
  const user = getSessionUser();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [projectRows, setProjectRows] = useState(fallbackProjects);
  const [adminSettings, setAdminSettings] = useState({ roles: {}, users: [], devices: [], security: {} });

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        if (isAdmin) {
          const { data } = await api.get('/settings');
          if (!ignore) setAdminSettings(data);
          return;
        }
        const [dashboardResponse, projectsResponse] = await Promise.all([
          api.get('/dashboard'),
          api.get('/projects'),
        ]);

        if (!ignore) {
          setDashboard(dashboardResponse.data);
          setProjectRows(projectsResponse.data);
        }
      } catch {
        if (!ignore) {
          setDashboard(fallbackDashboard);
          setProjectRows(fallbackProjects);
        }
      }
    }

    loadDashboard();
    return () => { ignore = true; };
  }, [isAdmin]);

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const rawInsights = dashboard.insights || fallbackDashboard.insights;
  const dashboardInsights = Array.isArray(rawInsights) ? rawInsights : [];

  const atRiskProjects = projectRows.filter((p) => {
    const status = String(p.status || '').toLowerCase().replace('_', ' ');
    return status === 'at risk' || status === 'delayed';
  });

  if (isAdmin) {
    const onlineDevices = adminSettings.devices.filter((device) => device.status === 'online').length;
    return (
      <section className="page-shell">
        <PageHeader eyebrow="Administration Dashboard" title="System Access Overview" description="Monitor SCPRAS accounts, approved roles, connected attendance devices and security status." />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Authorized Users" value={adminSettings.users.length} icon={UserCog} tone="blue" />
          <StatCard label="Approved Roles" value={Object.keys(adminSettings.roles).length} icon={ShieldCheck} tone="purple" />
          <StatCard label="Online Devices" value={onlineDevices} icon={MonitorSmartphone} tone="green" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel-pad">
            <h3 className="font-extrabold text-ink">Role Distribution</h3>
            <p className="mt-1 text-sm text-slate-500">Each account is assigned one academically defined SCPRAS role.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(adminSettings.roles).map(([role, count]) => <div key={role} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">{ROLE_LABELS[role] || role}</p><p className="mt-1 text-2xl font-extrabold text-ink">{count}</p></div>)}
            </div>
          </div>
          <div className="panel-pad">
            <h3 className="font-extrabold text-ink">Security Controls</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-800">JWT authentication is active.</p>
              <p className="rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-800">Passwords are protected with bcrypt hashing.</p>
              <p className="rounded-lg bg-blue-50 p-3 font-semibold text-blue-800">Backend and interface permissions enforce role separation.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const visibleCards = [
    { key: 'projects', roles: [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR, ROLES.CONTRACTOR_FOREMAN], node: <StatCard label="Projects" value={metrics.projects} icon={BriefcaseBusiness} tone="blue" /> },
    { key: 'progress', roles: [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR, ROLES.CONTRACTOR_FOREMAN], node: <StatCard label="Overall Progress" value={`${metrics.overallProgress}%`} icon={TrendingUp} tone="green" /> },
    { key: 'workers', roles: [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN], node: <StatCard label="Workers" value={metrics.workers} icon={Users} tone="purple" /> },
    { key: 'materials', roles: [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER], node: <StatCard label="Materials" value={metrics.materials} icon={Boxes} tone="gold" /> },
    { key: 'budget', roles: [ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR], node: <StatCard label="Budget Baseline" value={Number(metrics.totalBudget || 0).toLocaleString()} icon={DollarSign} tone="green" /> },
  ].filter((card) => card.roles.includes(user?.role));
  const showDecisionSupport = [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR].includes(user?.role);
  const showProjects = user?.role !== ROLES.STORE_OFFICER;

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow={`${ROLE_LABELS[user?.role] || 'Operational'} Dashboard`}
        title="Role Overview"
        description="SCPRAS displays only the project information and actions assigned to your role."
      />

      {atRiskProjects.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-extrabold text-amber-800">Attention required: </span>
            <span className="text-amber-700">
              {atRiskProjects.map((p) => p.projectName || p.name).join(', ')} {atRiskProjects.length === 1 ? 'is' : 'are'} delayed or at risk.
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {visibleCards.map((card) => <div key={card.key}>{card.node}</div>)}
      </div>

      <div className={`grid gap-5 ${showDecisionSupport ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
        {showProjects ? <ProgressChart projects={projectRows} /> : <div className="panel-pad"><h3 className="font-extrabold text-ink">Store Control</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use Materials to receive stock, issue approved quantities and maintain availability records. Reports provide an auditable summary of all movements.</p></div>}
        {showDecisionSupport && (
        <div className="panel-pad">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-ink">AI Insights</h3>
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700">{dashboardInsights.length} active</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {dashboardInsights.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No insights available.</p>
            ) : (
              dashboardInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))
            )}
          </div>
        </div>
        )}
      </div>

      {showProjects && <ProjectTable items={projectRows} />}
    </section>
  );
}
