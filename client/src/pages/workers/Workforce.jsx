import { AlertTriangle, BarChart3, Calculator, CheckCircle2, Download, HardHat, Timer, TrendingUp, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { api, apiErrorMessage } from '../../services/api.js';

const initialForecast = {
  requiredWorkers: 4,
  plannedWorkers: 4,
  currentWorkers: 4,
  workerGap: 0,
  dailyTarget: 500,
  remainingQuantity: 20000,
  bufferedQuantity: 22000,
  estimatedDuration: 20,
  estimatedDurationWithCurrentCrew: 20,
  laborCost: 2400,
  regularLaborCost: 2400,
  overtimeCost: 0,
  overheadCost: 0,
  completionProbability: 87,
  riskLevel: 'low',
  targetFinishDate: '2026-06-29',
  forecastFinishDate: '2026-06-29',
  effectiveProductivity: 500,
  recommendations: ['Current crew size can meet or exceed the target duration.'],
  schedule: [
    { period: 'Days 1-3', targetQuantity: 3300, cumulativePercent: 15 },
    { period: 'Days 4-6', targetQuantity: 6600, cumulativePercent: 30 },
    { period: 'Days 7-10', targetQuantity: 11000, cumulativePercent: 50 },
    { period: 'Days 11-13', targetQuantity: 14300, cumulativePercent: 65 },
    { period: 'Days 14-16', targetQuantity: 17600, cumulativePercent: 80 },
    { period: 'Days 17-20', targetQuantity: 22000, cumulativePercent: 100 },
  ],
};

const defaultForm = {
  projectId: '',
  task: 'Brick Wall Construction',
  unit: 'bricks',
  quantity: 20000,
  completedQuantity: 0,
  dailyProductivity: 500,
  currentWorkers: 4,
  days: 20,
  startDate: new Date().toISOString().slice(0, 10),
  laborRate: 30,
  workingHours: 8,
  overtimeHours: 0,
  complexityFactor: 1,
  weatherRisk: 'low',
  bufferPercent: 10,
  overheadPercent: 0,
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

const riskTone = {
  low: 'text-emerald-700 bg-emerald-50',
  medium: 'text-amber-700 bg-amber-50',
  high: 'text-red-700 bg-red-50',
};

export default function Workforce() {
  const [form, setForm] = useState(defaultForm);
  const [forecast, setForecast] = useState(initialForecast);
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [status, setStatus] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadContext() {
      try {
        const [projectsResponse, workersResponse, forecastResponse] = await Promise.all([
          api.get('/projects'),
          api.get('/workers'),
          api.post('/workforce/forecast', defaultForm),
        ]);

        if (!ignore) {
          const activeWorkers = workersResponse.data.filter((worker) => worker.status === 'active').length;
          setProjects(projectsResponse.data);
          setWorkers(workersResponse.data);
          setForm((current) => ({
            ...current,
            projectId: projectsResponse.data[0]?.id || '',
            currentWorkers: activeWorkers || current.currentWorkers,
          }));
          setForecast(forecastResponse.data);
        }
      } catch (error) {
        if (!ignore) setStatus({ type: 'error', message: apiErrorMessage(error) });
      }
    }

    loadContext();
    return () => {
      ignore = true;
    };
  }, []);

  const activeWorkers = useMemo(() => workers.filter((worker) => worker.status === 'active'), [workers]);
  const departmentCounts = useMemo(() => {
    return activeWorkers.reduce((counts, worker) => {
      const department = worker.department || 'Site Team';
      counts[department] = (counts[department] || 0) + 1;
      return counts;
    }, {});
  }, [activeWorkers]);
  const selectedProject = projects.find((project) => Number(project.id) === Number(form.projectId));
  const completionWidth = `${forecast.completionProbability || 0}%`;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const calculate = async () => {
    setIsCalculating(true);
    setStatus(null);

    try {
      const { data } = await api.post('/workforce/forecast', {
        ...form,
        quantity: Number(form.quantity || 0),
        completedQuantity: Number(form.completedQuantity || 0),
        dailyProductivity: Number(form.dailyProductivity || 1),
        currentWorkers: Number(form.currentWorkers || 0),
        days: Number(form.days || 1),
        laborRate: Number(form.laborRate || 0),
        workingHours: Number(form.workingHours || 8),
        overtimeHours: Number(form.overtimeHours || 0),
        complexityFactor: Number(form.complexityFactor || 1),
        bufferPercent: Number(form.bufferPercent || 0),
        overheadPercent: Number(form.overheadPercent || 0),
      });
      setForecast(data);
      setStatus({ type: 'success', message: 'Workforce plan calculated successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsCalculating(false);
    }
  };

  const exportPlan = () => {
    const payload = {
      project: selectedProject?.projectName || 'Unassigned project',
      assumptions: form,
      forecast,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `scpras-workforce-plan-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="Workforce Forecasting"
        title="Labor Planning and Completion Estimates"
        description="Plan site labor by project, work package, productivity, available crew, schedule risk and labor cost."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="primary-button" disabled={isCalculating} onClick={calculate} type="button">
              <Calculator size={18} /> {isCalculating ? 'Calculating...' : 'Calculate Plan'}
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700" onClick={exportPlan} type="button">
              <Download size={18} /> Export
            </button>
          </div>
        }
      />
      {status && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={18} className="shrink-0 text-red-500" />}
          <span>{status.message}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setStatus(null)} type="button"><X size={16} /></button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Required Workers" value={forecast.requiredWorkers} icon={Users} tone="blue" />
        <StatCard label="Worker Gap" value={forecast.workerGap} icon={HardHat} tone={forecast.workerGap > 0 ? 'gold' : 'green'} />
        <StatCard label="Duration" value={`${forecast.estimatedDuration} days`} icon={Timer} tone="purple" />
        <StatCard label="Completion" value={`${forecast.completionProbability}%`} icon={TrendingUp} tone="green" />
        <StatCard label="Labor Cost" value={`$${Number(forecast.laborCost || 0).toLocaleString()}`} icon={BarChart3} tone="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Planning Inputs</p>
                <h3 className="text-lg font-extrabold text-ink">Work Package Assumptions</h3>
              </div>
              <Calculator className="text-blue-700" size={24} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project">
                <SelectInput value={form.projectId} onChange={(event) => updateForm('projectId', event.target.value)}>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.projectName}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Work Type">
                <SelectInput value={form.task} onChange={(event) => updateForm('task', event.target.value)}>
                  <option>Brick Wall Construction</option>
                  <option>Concrete Casting</option>
                  <option>Roofing</option>
                  <option>Finishing Works</option>
                  <option>Excavation</option>
                  <option>Steel Fixing</option>
                  <option>Plastering</option>
                </SelectInput>
              </Field>
              <Field label="Total Quantity">
                <TextInput type="number" value={form.quantity} onChange={(event) => updateForm('quantity', event.target.value)} />
              </Field>
              <Field label="Completed Quantity">
                <TextInput type="number" value={form.completedQuantity} onChange={(event) => updateForm('completedQuantity', event.target.value)} />
              </Field>
              <Field label="Unit">
                <TextInput value={form.unit} onChange={(event) => updateForm('unit', event.target.value)} />
              </Field>
              <Field label="Start Date">
                <TextInput type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} />
              </Field>
              <Field label="Target Days">
                <TextInput type="number" value={form.days} onChange={(event) => updateForm('days', event.target.value)} />
              </Field>
              <Field label="Current Crew">
                <TextInput type="number" value={form.currentWorkers} onChange={(event) => updateForm('currentWorkers', event.target.value)} />
              </Field>
              <Field label="Productivity / Worker / Day">
                <TextInput type="number" value={form.dailyProductivity} onChange={(event) => updateForm('dailyProductivity', event.target.value)} />
              </Field>
              <Field label="Labor Rate / Day">
                <TextInput type="number" value={form.laborRate} onChange={(event) => updateForm('laborRate', event.target.value)} />
              </Field>
              <Field label="Working Hours / Day">
                <TextInput type="number" value={form.workingHours} onChange={(event) => updateForm('workingHours', event.target.value)} />
              </Field>
              <Field label="Overtime Hours / Day">
                <TextInput type="number" value={form.overtimeHours} onChange={(event) => updateForm('overtimeHours', event.target.value)} />
              </Field>
              <Field label="Complexity Factor">
                <SelectInput value={form.complexityFactor} onChange={(event) => updateForm('complexityFactor', event.target.value)}>
                  <option value="0.85">Simple / repetitive</option>
                  <option value="1">Normal</option>
                  <option value="1.25">Complex</option>
                  <option value="1.5">Very complex</option>
                </SelectInput>
              </Field>
              <Field label="Weather Risk">
                <SelectInput value={form.weatherRisk} onChange={(event) => updateForm('weatherRisk', event.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </SelectInput>
              </Field>
              <Field label="Contingency Buffer %">
                <TextInput type="number" value={form.bufferPercent} onChange={(event) => updateForm('bufferPercent', event.target.value)} />
              </Field>
              <Field label="Overhead %">
                <TextInput type="number" value={form.overheadPercent} onChange={(event) => updateForm('overheadPercent', event.target.value)} />
              </Field>
            </div>
          </div>

          <div className="panel-pad">
            <p className="muted-label">Available Crew</p>
            <h3 className="mt-1 text-lg font-extrabold text-ink">{activeWorkers.length} active workers</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(departmentCounts).map(([department, count]) => (
                <div key={department} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-bold text-ink">{department}</p>
                  <p className="mt-1 text-2xl font-extrabold text-blue-700">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="panel-pad">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="muted-label">System Recommendation</p>
                  <h3 className="mt-1 text-lg font-extrabold text-ink">{forecast.plannedWorkers} workers assigned</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${riskTone[forecast.riskLevel] || riskTone.low}`}>{forecast.riskLevel} risk</span>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3"><dt>Remaining work</dt><dd className="font-bold">{Number(forecast.remainingQuantity || 0).toLocaleString()} {forecast.unit}</dd></div>
                <div className="flex justify-between gap-3"><dt>Daily target</dt><dd className="font-bold">{Number(forecast.dailyTarget || 0).toLocaleString()} {forecast.unit}</dd></div>
                <div className="flex justify-between gap-3"><dt>Effective productivity</dt><dd className="font-bold">{Number(forecast.effectiveProductivity || 0).toLocaleString()} / worker</dd></div>
                <div className="flex justify-between gap-3"><dt>Current crew finish</dt><dd className="font-bold">{forecast.currentCrewFinishDate || '-'}</dd></div>
                <div className="flex justify-between gap-3"><dt>Forecast finish</dt><dd className="font-bold">{forecast.forecastFinishDate}</dd></div>
                <div className="flex justify-between gap-3"><dt>Target finish</dt><dd className="font-bold">{forecast.targetFinishDate}</dd></div>
              </dl>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
                  <span>Completion confidence</span>
                  <span>{forecast.completionProbability}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-emerald-600" style={{ width: completionWidth }} />
                </div>
              </div>
            </div>

            <div className="panel-pad">
              <p className="muted-label">Cost Breakdown</p>
              <h3 className="mt-1 text-lg font-extrabold text-ink">${Number(forecast.laborCost || 0).toLocaleString()}</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><dt>Regular labor</dt><dd className="font-bold">${Number(forecast.regularLaborCost || 0).toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt>Overtime</dt><dd className="font-bold">${Number(forecast.overtimeCost || 0).toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt>Overhead</dt><dd className="font-bold">${Number(forecast.overheadCost || 0).toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt>Worker gap</dt><dd className="font-bold">{forecast.workerGap}</dd></div>
              </dl>
            </div>
          </div>

          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="muted-label">Recommendations</p>
                <h3 className="font-extrabold text-ink">Execution Guidance</h3>
              </div>
              <HardHat className="text-gold" size={34} />
            </div>
            <div className="space-y-3">
              {forecast.recommendations.map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Schedule Curve</p>
                <h3 className="font-extrabold text-ink">{selectedProject?.projectName || 'Project'} - {form.task}</h3>
              </div>
              <BarChart3 className="text-blue-700" size={24} />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast.schedule}>
                  <XAxis dataKey="period" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="cumulativePercent" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <p className="muted-label">Daily / Period Targets</p>
          <h3 className="font-extrabold text-ink">Execution Schedule</h3>
        </div>
        <table className="w-full min-w-[720px]">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Cumulative Target</th>
              <th className="px-4 py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {forecast.schedule.map((row) => (
              <tr key={row.period}>
                <td className="table-cell font-semibold text-ink">{row.period}</td>
                <td className="table-cell">{Number(row.targetQuantity || 0).toLocaleString()} {forecast.unit}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-40 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${row.cumulativePercent}%` }} />
                    </div>
                    {row.cumulativePercent}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
