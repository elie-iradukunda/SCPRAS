import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  HardHat,
  PackageCheck,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { ROLES } from '../../config/roles.js';
import { reports as fallbackReports } from '../../data/mockData.js';
import { api, apiErrorMessage, getSessionUser } from '../../services/api.js';

const REPORT_ACCESS = {
  [ROLES.ADMIN]: ['progress', 'material', 'attendance', 'ai', 'workforce', 'financial'],
  [ROLES.PROJECT_MANAGER]: ['progress', 'material', 'attendance', 'ai', 'workforce', 'financial'],
  [ROLES.SITE_ENGINEER]: ['progress', 'attendance', 'ai'],
  [ROLES.QUANTITY_SURVEYOR]: ['material', 'ai', 'financial'],
  [ROLES.STORE_OFFICER]: ['material'],
  [ROLES.CONTRACTOR_FOREMAN]: ['progress', 'attendance', 'workforce'],
};
const NO_REPORTS = [];

const REPORT_META = {
  progress:   { icon: BarChart3,      color: 'text-blue-700',   bg: 'bg-blue-50',   label: 'Progress Report',    description: 'Project completion %, phase milestones, schedule variance and timeline overview.' },
  material:   { icon: PackageCheck,   color: 'text-emerald-700',bg: 'bg-emerald-50',label: 'Material Report',    description: 'Inventory levels, planned vs used quantities, stock health and procurement status.' },
  attendance: { icon: Users,          color: 'text-purple-700', bg: 'bg-purple-50', label: 'Attendance Report',  description: 'Daily check-in/out records, hours worked, present/absent counts and workforce utilization.' },
  ai:         { icon: Bot,            color: 'text-amber-700',  bg: 'bg-amber-50',  label: 'AI Insights Report', description: 'Predicted delays, budget risks, labor shortfalls and AI-generated recommendations.' },
  workforce:  { icon: HardHat,        color: 'text-indigo-700', bg: 'bg-indigo-50', label: 'Workforce Report',   description: 'Labor forecasts, crew sizes, productivity rates and completion probability.' },
  financial:  { icon: FileSpreadsheet,color: 'text-rose-700',   bg: 'bg-rose-50',   label: 'Financial Report',   description: 'Budget utilization, actual vs estimated costs, BOQ variance and expenditure breakdown.' },
};

const STATUS_BADGE = {
  Ready:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  ready:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft:      'bg-amber-50 text-amber-700 border-amber-200',
  draft:      'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
};

const FORMAT_BADGE = {
  PDF:   'bg-red-50 text-red-700',
  Excel: 'bg-emerald-50 text-emerald-700',
  JSON:  'bg-slate-100 text-slate-700',
  CSV:   'bg-blue-50 text-blue-700',
};

const normalizeReport = (report) => ({
  id: report.id || report.name,
  name: report.name,
  owner: report.owner || report.type || 'Project Manager',
  format: report.format || 'JSON',
  status: report.status || 'Ready',
  type: report.type || String(report.name || '').toLowerCase().split(' ')[0],
});

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return 'No data';
  const keys = Object.keys(data[0]);
  const rows = data.map((row) => keys.map((k) => JSON.stringify(row[k] ?? '')).join(','));
  return [keys.join(','), ...rows].join('\n');
}

export default function Reports() {
  const user = getSessionUser();
  const allowedReportTypes = REPORT_ACCESS[user?.role] ?? NO_REPORTS;
  const filterReports = useCallback(
    (rows) => rows.map(normalizeReport).filter((report) => allowedReportTypes.includes(report.type)),
    [allowedReportTypes],
  );
  const [reports, setReports] = useState(filterReports(fallbackReports));
  const [status, setStatus] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadReports() {
      try {
        const { data } = await api.get('/reports');
        if (!ignore) setReports(filterReports(data));
      } catch {
        if (!ignore) setReports(filterReports(fallbackReports));
      }
    }
    loadReports();
    return () => { ignore = true; };
  }, [filterReports]);

  const stats = useMemo(() => ({
    total: reports.length,
    ready: reports.filter((r) => r.status.toLowerCase() === 'ready').length,
    draft: reports.filter((r) => r.status.toLowerCase() === 'draft').length,
  }), [reports]);

  const downloadReport = async (type = 'progress', format = 'json') => {
    setStatus(null);
    setDownloading(`${type}-${format}`);
    try {
      const { data } = await api.get(`/reports/${type}`);
      let blob, filename;

      if (format === 'csv') {
        const rows = Array.isArray(data) ? data : (data.rows || data.data || [data]);
        blob = new Blob([convertToCSV(rows)], { type: 'text/csv' });
        filename = `scpras-${type}-report.csv`;
      } else {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `scpras-${type}-report.json`;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: `${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded as ${format.toUpperCase()}.` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setDownloading(null);
    }
  };

  const allReportTypes = useMemo(() => {
    const fromData = reports.map((r) => r.type).filter(Boolean);
    const extras = Object.keys(REPORT_META).filter((k) => allowedReportTypes.includes(k) && !fromData.includes(k));
    return [...new Set([...fromData, ...extras])];
  }, [allowedReportTypes, reports]);

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="Reports and Documents"
        title="Progress, Material, Attendance and AI Reports"
        description="Generate intelligent reports and export documents for clients, managers and site teams."
        action={allowedReportTypes.length > 0 ?
          <button className="primary-button" onClick={() => downloadReport(allowedReportTypes[0], 'json')} type="button" disabled={downloading !== null}>
            <Download size={18} /> {downloading ? 'Downloading...' : 'Quick Export'}
          </button>
        : null}
      />

      {status && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={18} className="shrink-0 text-red-500" />}
          <span>{status.message}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setStatus(null)}><X size={16} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel-pad flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText size={22} /></div>
          <div><p className="text-xs font-bold text-slate-500">Total Reports</p><p className="text-2xl font-extrabold text-ink">{stats.total}</p></div>
        </div>
        <div className="panel-pad flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 size={22} /></div>
          <div><p className="text-xs font-bold text-slate-500">Ready to Export</p><p className="text-2xl font-extrabold text-ink">{stats.ready}</p></div>
        </div>
        <div className="panel-pad flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Clock size={22} /></div>
          <div><p className="text-xs font-bold text-slate-500">Draft / Processing</p><p className="text-2xl font-extrabold text-ink">{stats.draft}</p></div>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allReportTypes.map((type) => {
          const meta = REPORT_META[type] || REPORT_META.progress;
          const Icon = meta.icon;
          const reportRow = reports.find((r) => r.type === type);
          const isDownloading = downloading?.startsWith(type);

          return (
            <div key={type} className="panel overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-ink">{meta.label}</h3>
                    {reportRow && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${STATUS_BADGE[reportRow.status] || STATUS_BADGE.Ready}`}>
                          {reportRow.status}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${FORMAT_BADGE[reportRow.format] || FORMAT_BADGE.JSON}`}>
                          {reportRow.format}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-500">{meta.description}</p>
                {reportRow?.owner && (
                  <p className="mt-2 text-xs text-slate-400">Owner: <span className="font-semibold text-slate-600 capitalize">{reportRow.owner}</span></p>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
                <button
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold transition hover:border-blue-400 hover:text-blue-700 ${isDownloading ? 'opacity-60' : ''}`}
                  disabled={isDownloading}
                  onClick={() => downloadReport(type, 'json')}
                  type="button"
                >
                  <Download size={14} /> JSON
                </button>
                <button
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold transition hover:border-emerald-400 hover:text-emerald-700 ${isDownloading ? 'opacity-60' : ''}`}
                  disabled={isDownloading}
                  onClick={() => downloadReport(type, 'csv')}
                  type="button"
                >
                  <FileSpreadsheet size={14} /> CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table view */}
      <div className="panel overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="muted-label">Report Register</p>
          <h3 className="font-extrabold text-ink">All Report Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Report</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Format</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Export</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={5}>No reports available.</td></tr>
              ) : (
                reports.map((report) => {
                  const meta = REPORT_META[report.type] || REPORT_META.progress;
                  const Icon = meta.icon;
                  return (
                    <tr key={report.id}>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-2 font-semibold ${meta.color}`}>
                          <Icon size={16} /> {report.name}
                        </span>
                      </td>
                      <td className="table-cell capitalize text-slate-600">{report.owner}</td>
                      <td className="table-cell">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${FORMAT_BADGE[report.format] || FORMAT_BADGE.JSON}`}>{report.format}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_BADGE[report.status] || STATUS_BADGE.Ready}`}>{report.status}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline" onClick={() => downloadReport(report.type, 'json')} type="button">
                            <Download size={14} /> JSON
                          </button>
                          <button className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline" onClick={() => downloadReport(report.type, 'csv')} type="button">
                            <FileSpreadsheet size={14} /> CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
