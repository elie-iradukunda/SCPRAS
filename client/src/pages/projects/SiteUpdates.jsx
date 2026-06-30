import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { ROLES } from '../../config/roles.js';
import { api, apiErrorMessage, getSessionUser } from '../../services/api.js';

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  projectId: '',
  activityCode: '',
  activityName: '',
  phase: '',
  description: '',
  constraints: '',
  plannedStartDate: today,
  plannedEndDate: today,
  actualStartDate: today,
  plannedProgress: 0,
  actualProgress: 0,
  status: 'ongoing',
  responsiblePerson: '',
};

const statusStyles = {
  not_started: 'bg-slate-100 text-slate-700',
  ongoing: 'bg-blue-100 text-blue-700',
  delayed: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const progressOptions = [0, 10, 25, 50, 75, 90, 100];

export default function SiteUpdates() {
  const user = getSessionUser();
  const canDelete = user?.role === ROLES.PROJECT_MANAGER;
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ ...emptyForm, responsiblePerson: user?.fullName || '' });
  const [edits, setEdits] = useState({});
  const [projectFilter, setProjectFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectResponse, activityResponse] = await Promise.all([
        api.get('/projects'),
        api.get('/activities'),
      ]);
      const projectRows = Array.isArray(projectResponse.data) ? projectResponse.data : [];
      const activityRows = Array.isArray(activityResponse.data) ? activityResponse.data : [];
      setProjects(projectRows);
      setActivities(activityRows);
      setForm((current) => ({ ...current, projectId: current.projectId || projectRows[0]?.id || '' }));
      setEdits(Object.fromEntries(activityRows.map((activity) => [activity.id, {
        actualProgress: Number(activity.actualProgress || 0),
        status: activity.status || 'not_started',
        constraints: activity.constraints || '',
      }])));
    } catch (error) {
      setNotice({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleActivities = useMemo(() => activities.filter((activity) => (
    projectFilter === 'all' || String(activity.projectId) === String(projectFilter)
  )), [activities, projectFilter]);

  const stats = useMemo(() => ({
    total: visibleActivities.length,
    ongoing: visibleActivities.filter((item) => item.status === 'ongoing').length,
    delayed: visibleActivities.filter((item) => item.status === 'delayed').length,
    constraints: visibleActivities.filter((item) => item.constraints?.trim()).length,
  }), [visibleActivities]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateEdit = (id, field, value) => setEdits((current) => ({
    ...current,
    [id]: { ...current[id], [field]: value },
  }));

  const createActivity = async (event) => {
    event.preventDefault();
    if (!form.projectId || !form.activityName.trim()) {
      setNotice({ type: 'error', message: 'Select a project and enter the activity name.' });
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/activities', {
        ...form,
        projectId: Number(form.projectId),
        plannedProgress: Number(form.plannedProgress),
        actualProgress: Number(form.actualProgress),
      });
      setForm({ ...emptyForm, projectId: form.projectId, responsiblePerson: user?.fullName || '' });
      setIsFormOpen(false);
      setNotice({ type: 'success', message: 'Site activity and progress evidence recorded.' });
      await loadData();
    } catch (error) {
      setNotice({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const saveActivityUpdate = async (activity) => {
    const change = edits[activity.id];
    if (!change) return;
    setIsSaving(true);
    try {
      await api.patch(`/activities/${activity.id}`, {
        actualProgress: Number(change.actualProgress),
        status: Number(change.actualProgress) >= 100 ? 'completed' : change.status,
        constraints: change.constraints,
      });
      setNotice({ type: 'success', message: `${activity.activityName} updated.` });
      await loadData();
    } catch (error) {
      setNotice({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteActivity = async (activity) => {
    if (!window.confirm(`Delete the update for “${activity.activityName}”?`)) return;
    try {
      await api.delete(`/activities/${activity.id}`);
      setNotice({ type: 'success', message: 'Activity removed.' });
      await loadData();
    } catch (error) {
      setNotice({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="Controlled Site Reporting"
        title="Progress and Constraint Updates"
        description="Record planned-versus-actual progress, site evidence and constraints for managerial review."
        action={<button className="primary-button" onClick={() => setIsFormOpen((open) => !open)} type="button"><Plus size={18} /> Record Update</button>}
      />

      {notice && <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
        {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        <span>{notice.message}</span>
        <button className="ml-auto" onClick={() => setNotice(null)} type="button" aria-label="Close message"><X size={16} /></button>
      </div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked Activities" value={stats.total} icon={ClipboardList} tone="blue" />
        <StatCard label="Ongoing" value={stats.ongoing} icon={RefreshCw} tone="green" />
        <StatCard label="Delayed" value={stats.delayed} icon={CalendarDays} tone="gold" />
        <StatCard label="Open Constraints" value={stats.constraints} icon={AlertTriangle} tone="purple" />
      </div>

      {isFormOpen && <form className="panel p-5" onSubmit={createActivity}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div><p className="muted-label">Authorized entry</p><h2 className="text-lg font-extrabold text-ink">New site update</h2></div>
          <button className="icon-button" onClick={() => setIsFormOpen(false)} type="button" aria-label="Close form"><X size={17} /></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-bold text-slate-700">Project
            <select className="input-field mt-1" value={form.projectId} onChange={(event) => updateForm('projectId', event.target.value)} required>
              <option value="">Select project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Activity name
            <input className="input-field mt-1" value={form.activityName} onChange={(event) => updateForm('activityName', event.target.value)} required />
          </label>
          <label className="text-sm font-bold text-slate-700">Phase
            <input className="input-field mt-1" value={form.phase} onChange={(event) => updateForm('phase', event.target.value)} />
          </label>
          <label className="text-sm font-bold text-slate-700">Responsible person
            <input className="input-field mt-1" value={form.responsiblePerson} onChange={(event) => updateForm('responsiblePerson', event.target.value)} />
          </label>
          <label className="text-sm font-bold text-slate-700">Planned progress (%)
            <input className="input-field mt-1" min="0" max="100" type="number" value={form.plannedProgress} onChange={(event) => updateForm('plannedProgress', event.target.value)} />
          </label>
          <label className="text-sm font-bold text-slate-700">Actual progress (%)
            <input className="input-field mt-1" min="0" max="100" type="number" value={form.actualProgress} onChange={(event) => updateForm('actualProgress', event.target.value)} />
          </label>
          <label className="text-sm font-bold text-slate-700">Status
            <select className="input-field mt-1" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
              {['not_started', 'ongoing', 'delayed', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Actual start date
            <input className="input-field mt-1" type="date" value={form.actualStartDate} onChange={(event) => updateForm('actualStartDate', event.target.value)} />
          </label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Work completed / evidence
            <textarea className="input-field mt-1 min-h-24" value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
          </label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Constraints requiring action
            <textarea className="input-field mt-1 min-h-24" value={form.constraints} onChange={(event) => updateForm('constraints', event.target.value)} placeholder="Leave blank when no constraint exists." />
          </label>
        </div>
        <div className="mt-4 flex justify-end"><button className="primary-button" disabled={isSaving} type="submit"><Save size={17} /> {isSaving ? 'Saving...' : 'Save Site Update'}</button></div>
      </form>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-600">Showing {visibleActivities.length} controlled progress record{visibleActivities.length === 1 ? '' : 's'}</p>
        <div className="flex gap-2">
          <select className="input-field min-w-56" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option value="all">All projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
          </select>
          <button className="icon-button" onClick={loadData} type="button" aria-label="Refresh"><RefreshCw size={17} /></button>
        </div>
      </div>

      {isLoading ? <div className="panel flex items-center justify-center py-16 text-sm font-bold text-slate-500"><RefreshCw className="mr-2 animate-spin" size={18} /> Loading site records...</div> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleActivities.map((activity) => {
            const edit = edits[activity.id] || {};
            const variance = Number(activity.actualProgress || 0) - Number(activity.plannedProgress || 0);
            return <article key={activity.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">{activity.Project?.projectName || 'Project'} · {activity.activityCode || `ACT-${activity.id}`}</p><h3 className="mt-1 text-lg font-extrabold text-ink">{activity.activityName}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{activity.phase || 'General works'} · {activity.responsiblePerson || 'Unassigned'}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${statusStyles[activity.status] || statusStyles.not_started}`}>{activity.status?.replace('_', ' ')}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Planned</p><p className="text-xl font-extrabold text-ink">{Number(activity.plannedProgress || 0)}%</p></div>
                <div className="rounded-lg bg-blue-50 p-3"><p className="text-xs font-bold text-blue-600">Actual</p><p className="text-xl font-extrabold text-blue-800">{Number(activity.actualProgress || 0)}%</p></div>
                <div className={`rounded-lg p-3 ${variance < 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}><p className={`text-xs font-bold ${variance < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>Variance</p><p className={`text-xl font-extrabold ${variance < 0 ? 'text-amber-800' : 'text-emerald-800'}`}>{variance > 0 ? '+' : ''}{variance}%</p></div>
              </div>
              {activity.description && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{activity.description}</p>}
              <div className={`mt-3 rounded-lg border p-3 text-sm ${activity.constraints ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><strong>Constraint:</strong> {activity.constraints || 'None reported'}</div>
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[120px_150px_1fr_auto]">
                <select className="input-field" value={edit.actualProgress ?? 0} onChange={(event) => updateEdit(activity.id, 'actualProgress', event.target.value)}>
                  {[...new Set([...progressOptions, Number(edit.actualProgress || 0)])].sort((a, b) => a - b).map((value) => <option key={value} value={value}>{value}%</option>)}
                </select>
                <select className="input-field" value={edit.status || 'not_started'} onChange={(event) => updateEdit(activity.id, 'status', event.target.value)}>
                  {['not_started', 'ongoing', 'delayed', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                </select>
                <input className="input-field" value={edit.constraints || ''} onChange={(event) => updateEdit(activity.id, 'constraints', event.target.value)} placeholder="Update constraint" />
                <div className="flex gap-2"><button className="primary-button h-11 px-3" disabled={isSaving} onClick={() => saveActivityUpdate(activity)} type="button"><Save size={16} /></button>{canDelete && <button className="icon-button h-11 w-11 text-red-600" onClick={() => deleteActivity(activity)} type="button" aria-label="Delete activity"><Trash2 size={16} /></button>}</div>
              </div>
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
