import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { progressTrend } from '../../data/mockData.js';

const projectColor = (progress) => {
  if (progress >= 80) return '#10b981';
  if (progress >= 50) return '#2563eb';
  if (progress >= 30) return '#f59e0b';
  return '#ef4444';
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-panel">
      <p className="font-extrabold text-ink">{item.name}</p>
      <p className="mt-0.5 text-slate-500">{item.location}</p>
      <p className="mt-1 font-bold" style={{ color: projectColor(item.progress) }}>
        Progress: {item.progress}%
      </p>
      {item.budget > 0 && (
        <p className="text-slate-500">Budget: ${item.budget.toLocaleString()}</p>
      )}
    </div>
  );
}

export default function ProgressChart({ projects = [] }) {
  const hasRealData = projects.length > 0;

  const chartData = hasRealData
    ? projects.map((p) => ({
        name: (p.projectName || p.name || 'Project').slice(0, 18),
        fullName: p.projectName || p.name,
        location: p.location || '',
        progress: Math.round(Number(p.progress || 0)),
        budget: Number(p.budget || 0),
        status: p.status,
      }))
    : progressTrend.map((item) => ({ name: item.month, progress: item.actual, budget: 0, location: '' }));

  const avgProgress = hasRealData && projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + Number(p.progress || 0), 0) / projects.length)
    : null;

  return (
    <div className="panel-pad">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-ink">
            {hasRealData ? 'Project Progress Overview' : 'Progress Trend'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {hasRealData ? `${projects.length} active projects` : 'Sample data — no projects loaded yet'}
          </p>
        </div>
        {avgProgress !== null && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${avgProgress >= 70 ? 'bg-emerald-50 text-emerald-700' : avgProgress >= 40 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
            Avg {avgProgress}%
          </span>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={hasRealData ? <CustomTooltip /> : undefined} />
            <Bar dataKey="progress" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={projectColor(entry.progress)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {hasRealData && (
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { label: 'On Track ≥80%', color: 'bg-emerald-500' },
            { label: 'In Progress 50–79%', color: 'bg-blue-600' },
            { label: 'Behind 30–49%', color: 'bg-amber-500' },
            { label: 'At Risk <30%', color: 'bg-red-500' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
