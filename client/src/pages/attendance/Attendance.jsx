import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  LogOut,
  QrCode,
  ScanLine,
  Trash2,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { workers as fallbackWorkers } from '../../data/mockData.js';
import { api, apiErrorMessage } from '../../services/api.js';

const fallbackAttendance = fallbackWorkers.map((worker, index) => ({
  id: worker.name,
  workerId: index + 1,
  projectId: 1,
  checkIn: '2026-06-09T07:30:00.000Z',
  checkOut: worker.status === 'Absent' ? null : '2026-06-09T17:30:00.000Z',
  hoursWorked: worker.hours,
  status: worker.status.toLowerCase(),
  Worker: { User: { fullName: worker.name }, position: worker.role },
}));

const formatTime = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const formatHours = (value) => {
  const n = Number(value || 0);
  if (!n) return '—';
  return `${n.toFixed(1)}h`;
};

const recordDate = (record) => {
  const raw = record.checkIn || record.date;
  if (!raw) return '';
  return new Date(raw).toISOString().slice(0, 10);
};

const workerName = (record) => record.Worker?.User?.fullName || record.workerName || 'Worker';
const workerRole = (record) => record.Worker?.position || record.role || '—';

const STATUS_STYLE = {
  present:  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Present' },
  absent:   { badge: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500',     label: 'Absent' },
  late:     { badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   label: 'Late' },
  half_day: { badge: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    label: 'Half Day' },
  on_leave: { badge: 'bg-purple-50 text-purple-700 border-purple-200',    dot: 'bg-purple-500',  label: 'On Leave' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status?.toLowerCase()] || STATUS_STYLE.absent;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold tabular-nums text-white">
        {time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="mt-1 text-sm text-slate-300">
        {time.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function Attendance() {
  const [attendance, setAttendance] = useState(fallbackAttendance);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workerId, setWorkerId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dateFilter, setDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));

  const today = new Date().toISOString().slice(0, 10);

  const loadAttendance = async () => {
    try {
      const [attendanceResponse, workersResponse, projectsResponse] = await Promise.all([
        api.get('/attendance'),
        api.get('/workers'),
        api.get('/projects'),
      ]);
      setAttendance(attendanceResponse.data);
      setWorkers(workersResponse.data);
      setProjects(projectsResponse.data);
      setWorkerId((current) => current || workersResponse.data[0]?.id || '');
      setProjectId((current) => current || projectsResponse.data[0]?.id || '');
    } catch {
      setAttendance(fallbackAttendance);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialAttendance() {
      try {
        const [attendanceResponse, workersResponse, projectsResponse] = await Promise.all([
          api.get('/attendance'),
          api.get('/workers'),
          api.get('/projects'),
        ]);
        if (!ignore) {
          setAttendance(attendanceResponse.data);
          setWorkers(workersResponse.data);
          setProjects(projectsResponse.data);
          setWorkerId(workersResponse.data[0]?.id || '');
          setProjectId(projectsResponse.data[0]?.id || '');
        }
      } catch {
        if (!ignore) setAttendance(fallbackAttendance);
      }
    }
    loadInitialAttendance();
    return () => { ignore = true; };
  }, []);

  const filteredAttendance = useMemo(() => {
    if (dateFilter === 'all') return attendance;
    const filterDate = dateFilter === 'custom' ? customDate : today;
    return attendance.filter((record) => recordDate(record) === filterDate);
  }, [attendance, dateFilter, customDate, today]);

  const stats = useMemo(() => {
    const todayRecords = attendance.filter((r) => recordDate(r) === today);
    const present = todayRecords.filter((r) => r.status === 'present').length;
    const absent = todayRecords.filter((r) => r.status === 'absent').length;
    const onSite = todayRecords.filter((r) => r.checkIn && !r.checkOut).length;
    const smartCards = workers.filter((w) => w.smartCardCode).length || fallbackWorkers.length;
    const totalHours = todayRecords.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0);
    return { present, absent, onSite, smartCards, totalHours };
  }, [attendance, workers, today]);

  const selectedWorker = workers.find((w) => Number(w.id) === Number(workerId));
  const selectedProject = projects.find((p) => Number(p.id) === Number(projectId));

  const recordCheckIn = async () => {
    if (!workerId || !projectId) {
      setStatus({ type: 'error', message: 'Select a worker and project before check-in.' });
      return;
    }
    setIsSaving(true);
    setStatus(null);
    try {
      await api.post('/attendance/check-in', { workerId, projectId, location: selectedProject?.location });
      await loadAttendance();
      const name = selectedWorker?.User?.fullName || selectedWorker?.fullName || 'Worker';
      setStatus({ type: 'success', message: `Check-in recorded for ${name} at ${new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}.` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const recordCheckOut = async (attendanceId) => {
    setStatus(null);
    try {
      await api.post('/attendance/check-out', { attendanceId });
      await loadAttendance();
      setStatus({ type: 'success', message: 'Check-out recorded.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const deleteAttendance = async (attendanceId) => {
    setStatus(null);
    setDeleteConfirm(null);
    try {
      await api.delete(`/attendance/${attendanceId}`);
      await loadAttendance();
      setStatus({ type: 'success', message: 'Attendance record deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="Smart Card Attendance"
        title="QR, RFID and NFC Check-in"
        description="Authorized site personnel record arrivals and departures. SCPRAS calculates hours worked, overtime and attendance summaries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present Today" value={stats.present} icon={CheckCircle2} tone="green" />
        <StatCard label="Absent Today" value={stats.absent} icon={XCircle} tone="gold" />
        <StatCard label="Currently On Site" value={stats.onSite} icon={UserCheck} tone="blue" />
        <StatCard label="Smart Cards" value={stats.smartCards} icon={QrCode} tone="purple" />
      </div>

      {stats.totalHours > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
          <Clock size={16} className="text-blue-600" />
          <span className="font-semibold text-blue-800">Today's total: <strong>{stats.totalHours.toFixed(1)} hours</strong> logged across {stats.present} workers.</span>
        </div>
      )}

      {status && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={18} className="shrink-0 text-red-500" />}
          <span>{status.message}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setStatus(null)}><X size={16} /></button>
        </div>
      )}

      {deleteConfirm && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle size={18} className="text-amber-600" />
            Delete this attendance record? This cannot be undone.
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700" onClick={() => deleteAttendance(deleteConfirm)}>Yes, Delete</button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        {/* Scanner panel */}
        <div className="space-y-4">
          <div className="rounded-xl bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-lg tracking-wide">SCP<span className="text-gold">RAS</span></span>
              <QrCode size={22} />
            </div>
            <div className="mt-5">
              <LiveClock />
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold text-ink">
                <ScanLine size={30} />
              </div>
              <div>
                <p className="font-extrabold">{selectedWorker?.User?.fullName || selectedWorker?.fullName || 'Select a worker'}</p>
                <p className="text-sm text-slate-300">{selectedWorker?.position || '—'} · ID: {selectedWorker?.id || '—'}</p>
              </div>
            </div>
          </div>

          <div className="panel-pad space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Worker</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
                <option value="">Select worker</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>{w.User?.fullName || w.fullName || `Worker ${w.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Project</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectName || p.name}</option>
                ))}
              </select>
            </div>
            <button className="primary-button w-full" disabled={isSaving} onClick={recordCheckIn} type="button">
              <ScanLine size={18} /> {isSaving ? 'Recording...' : 'Record Check-in'}
            </button>
          </div>
        </div>

        {/* Attendance table */}
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="muted-label">Attendance Records</p>
              <h3 className="font-extrabold text-ink">{filteredAttendance.length} records</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="all">All Records</option>
                <option value="custom">Pick Date</option>
              </select>
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3 text-left">Worker</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Check In</th>
                  <th className="px-4 py-3 text-left">Check Out</th>
                  <th className="px-4 py-3 text-left">Hours</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={8}>
                      {dateFilter === 'today' ? 'No attendance recorded today.' : 'No records found for this date.'}
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id}>
                      <td className="table-cell font-semibold text-ink">{workerName(record)}</td>
                      <td className="table-cell text-slate-600">{workerRole(record)}</td>
                      <td className="table-cell">
                        <span className="flex items-center gap-1 text-slate-600">
                          <CalendarDays size={13} />{formatDate(record.checkIn)}
                        </span>
                      </td>
                      <td className="table-cell font-semibold text-emerald-700">{formatTime(record.checkIn)}</td>
                      <td className="table-cell font-semibold text-slate-700">{formatTime(record.checkOut)}</td>
                      <td className="table-cell">
                        <span className={`font-bold ${record.hoursWorked >= 8 ? 'text-emerald-700' : record.hoursWorked > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                          {formatHours(record.hoursWorked)}
                        </span>
                      </td>
                      <td className="table-cell"><StatusBadge status={record.status} /></td>
                      <td className="table-cell text-center">
                        <div className="flex justify-center gap-1.5">
                          {!record.checkOut && (
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                              onClick={() => recordCheckOut(record.id)}
                              type="button"
                            >
                              <LogOut size={13} /> Check Out
                            </button>
                          )}
                          <button
                            className="icon-button h-8 w-8 text-red-500 hover:border-red-200 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(record.id)}
                            type="button"
                            aria-label="Delete attendance"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
