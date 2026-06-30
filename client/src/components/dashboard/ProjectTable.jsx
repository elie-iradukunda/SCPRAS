import { MapPin } from 'lucide-react';
import { projects } from '../../data/mockData.js';

const STATUS_STYLES = {
  'on track':    'bg-emerald-50 text-emerald-700',
  'planning':    'bg-blue-50 text-blue-700',
  'completed':   'bg-slate-100 text-slate-700',
  'delayed':     'bg-amber-50 text-amber-700',
  'at risk':     'bg-red-50 text-red-700',
  'on hold':     'bg-purple-50 text-purple-700',
};

function statusStyle(status) {
  return STATUS_STYLES[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600';
}

const normalizeProject = (project) => ({
  id: project.id || project.name,
  name: project.projectName || project.name,
  location: project.location || '',
  progress: Number(project.progress || 0),
  budget: Number(project.budget || 0),
  spent: Number(project.spent || project.actualBudget || 0),
  status: String(project.status || 'Planning').replace('_', ' '),
});

export default function ProjectTable({ items = projects }) {
  const rows = items.map(normalizeProject);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <h3 className="font-extrabold text-ink">Recent Projects</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{rows.length} projects</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Progress</th>
              <th className="px-4 py-3 text-left">Budget</th>
              <th className="px-4 py-3 text-left">Spent</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>No projects found.</td>
              </tr>
            ) : (
              rows.map((project) => {
                const spentPct = project.budget > 0 ? Math.min((project.spent / project.budget) * 100, 100) : 0;
                return (
                  <tr key={project.id}>
                    <td className="table-cell font-semibold text-ink">{project.name}</td>
                    <td className="table-cell">
                      {project.location ? (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={13} className="shrink-0" />{project.location}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${project.progress >= 80 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-blue-600' : 'bg-amber-500'}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-ink">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="table-cell font-semibold text-ink">${project.budget.toLocaleString()}</td>
                    <td className="table-cell">
                      <div>
                        <span className={`text-sm font-semibold ${spentPct > 90 ? 'text-red-600' : 'text-slate-700'}`}>${project.spent.toLocaleString()}</span>
                        {project.budget > 0 && (
                          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-1 rounded-full ${spentPct > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${spentPct}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(project.status)}`}>{project.status}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
