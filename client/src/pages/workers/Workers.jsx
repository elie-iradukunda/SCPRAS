import {
  AlertTriangle,
  CheckCircle2,
  Download,
  IdCard,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { workers as fallbackWorkers } from '../../data/mockData.js';
import { api, apiErrorMessage } from '../../services/api.js';

const normalizeWorker = (worker) => ({
  id: worker.id || worker.name,
  employeeCode: worker.employeeCode || worker.smartCardCode || '-',
  name: worker.User?.fullName || worker.fullName || worker.name,
  email: worker.User?.email || worker.email || '',
  nationalId: worker.User?.nationalId || worker.nationalId || '',
  role: worker.position || worker.role || 'Worker',
  department: worker.department || 'Site Team',
  phone: worker.User?.phone || worker.phone || '-',
  status: worker.status || 'active',
  employmentType: worker.employmentType || 'contract',
  skillLevel: worker.skillLevel || 'skilled',
  salary: Number(worker.salary || 0),
  dailyRate: Number(worker.dailyRate || 0),
  joinDate: worker.joinDate || '',
  gender: worker.gender || 'not_specified',
  emergencyContactName: worker.emergencyContactName || '',
  emergencyContactPhone: worker.emergencyContactPhone || '',
  emergencyContactRelationship: worker.emergencyContactRelationship || '',
  safetyInductionDate: worker.safetyInductionDate || '',
  medicalClearanceDate: worker.medicalClearanceDate || '',
  ppeIssued: Boolean(worker.ppeIssued),
  hours: worker.Attendances?.reduce((total, record) => total + Number(record.hoursWorked || 0), 0) || worker.hours || 0,
  smartCardCode: worker.smartCardCode,
});

const emptyWorker = {
  fullName: '',
  email: '',
  phone: '',
  nationalId: '',
  dateOfBirth: '',
  gender: 'not_specified',
  address: '',
  employeeCode: '',
  position: 'Mason',
  department: 'Masonry',
  employmentType: 'contract',
  skillLevel: 'skilled',
  joinDate: new Date().toISOString().slice(0, 10),
  status: 'active',
  salary: 0,
  dailyRate: 0,
  bankName: '',
  bankAccountNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  tradeCertification: '',
  safetyInductionDate: new Date().toISOString().slice(0, 10),
  medicalClearanceDate: '',
  ppeIssued: true,
  notes: '',
};

const STATUS_STYLES = {
  active:   { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', label: 'Active' },
  inactive: { dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600',   label: 'Inactive' },
  on_leave: { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700',    label: 'On Leave' },
};

const SKILL_STYLES = {
  trainee:    'bg-slate-100 text-slate-600',
  junior:     'bg-blue-50 text-blue-700',
  skilled:    'bg-indigo-50 text-indigo-700',
  foreman:    'bg-purple-50 text-purple-700',
  supervisor: 'bg-emerald-50 text-emerald-700',
};

const TYPE_STYLES = {
  permanent:     'bg-emerald-50 text-emerald-700',
  contract:      'bg-blue-50 text-blue-700',
  casual:        'bg-amber-50 text-amber-700',
  subcontractor: 'bg-purple-50 text-purple-700',
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

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const drawCardLine = (context, label, value, y) => {
  context.fillStyle = '#64748b';
  context.font = '600 22px Inter, Arial, sans-serif';
  context.fillText(label, 360, y);
  context.fillStyle = '#07111f';
  context.font = '700 24px Inter, Arial, sans-serif';
  context.fillText(value || '-', 360, y + 34);
};

async function downloadSmartCardPng(card) {
  const canvas = document.createElement('canvas');
  canvas.width = 1050;
  canvas.height = 660;
  const context = canvas.getContext('2d');
  const qrImage = await loadImage(card.qrDataUrl);
  const payload = card.payload || {};
  const workerName = card.workerName || payload.fullName || 'Worker';
  const safeName = workerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  context.fillStyle = '#eef2f6';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#dbe3ee';
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(40, 40, 970, 580, 28);
  context.fill();
  context.stroke();

  context.fillStyle = '#07111f';
  context.font = '900 40px Inter, Arial, sans-serif';
  context.fillText('BUILD', 86, 110);
  context.fillStyle = '#f7b731';
  context.fillText('INTEL', 218, 110);
  context.fillStyle = '#64748b';
  context.font = '700 20px Inter, Arial, sans-serif';
  context.fillText('SMART WORKER CARD', 86, 146);

  context.drawImage(qrImage, 86, 198, 230, 230);
  context.fillStyle = '#07111f';
  context.font = '900 34px Inter, Arial, sans-serif';
  context.fillText(workerName, 360, 220);
  context.fillStyle = '#1d4ed8';
  context.font = '800 24px Inter, Arial, sans-serif';
  context.fillText(card.code, 360, 260);

  drawCardLine(context, 'Position', payload.position || card.role, 320);
  drawCardLine(context, 'Department', payload.department || card.department, 404);
  drawCardLine(context, 'Phone', payload.phone || card.phone, 488);

  context.fillStyle = '#07111f';
  context.font = '700 20px Inter, Arial, sans-serif';
  context.fillText('Scan QR to verify identity and view worker details.', 86, 500);
  context.fillStyle = '#64748b';
  context.font = '600 18px Inter, Arial, sans-serif';
  context.fillText(`Worker ID: ${payload.workerId || card.workerId || '-'}`, 86, 548);
  context.fillText(`Status: ${payload.status || card.status || '-'}`, 360, 548);
  context.fillText(`Generated: ${new Date(payload.generatedAt || Date.now()).toLocaleString()}`, 600, 548);

  const anchor = document.createElement('a');
  anchor.href = canvas.toDataURL('image/png');
  anchor.download = `scpras-smart-card-${safeName || 'worker'}.png`;
  anchor.click();
}

export default function Workers() {
  const [workerList, setWorkerList] = useState(fallbackWorkers.map(normalizeWorker));
  const [workerForm, setWorkerForm] = useState(emptyWorker);
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadWorkers = async () => {
    try {
      const { data } = await api.get('/workers');
      setWorkerList(data.map(normalizeWorker));
    } catch {
      setWorkerList(fallbackWorkers.map(normalizeWorker));
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialWorkers() {
      try {
        const { data } = await api.get('/workers');
        if (!ignore) setWorkerList(data.map(normalizeWorker));
      } catch {
        if (!ignore) setWorkerList(fallbackWorkers.map(normalizeWorker));
      }
    }
    loadInitialWorkers();
    return () => { ignore = true; };
  }, []);

  const uniqueRoles = useMemo(() => [...new Set(workerList.map((w) => w.role))], [workerList]);

  const filteredWorkers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return workerList.filter((w) => {
      const matchesSearch = !q || w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q) || w.department.toLowerCase().includes(q) || w.phone.includes(q);
      const matchesRole = roleFilter === 'all' || w.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [workerList, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    active: workerList.filter((w) => w.status === 'active').length,
    withCards: workerList.filter((w) => w.smartCardCode).length,
    ppeIssued: workerList.filter((w) => w.ppeIssued).length,
  }), [workerList]);

  const updateForm = (field, value) => {
    setWorkerForm((current) => ({ ...current, [field]: value }));
  };

  const startEditWorker = (worker) => {
    setWorkerForm({
      fullName: worker.name || '',
      email: worker.email || '',
      phone: worker.phone || '',
      nationalId: worker.nationalId || '',
      dateOfBirth: '',
      gender: worker.gender || 'not_specified',
      address: '',
      employeeCode: worker.employeeCode || '',
      position: worker.role || '',
      department: worker.department || '',
      employmentType: worker.employmentType || 'contract',
      skillLevel: worker.skillLevel || 'skilled',
      joinDate: worker.joinDate || '',
      status: worker.status || 'active',
      salary: worker.salary || 0,
      dailyRate: worker.dailyRate || 0,
      bankName: '',
      bankAccountNumber: '',
      emergencyContactName: worker.emergencyContactName || '',
      emergencyContactPhone: worker.emergencyContactPhone || '',
      emergencyContactRelationship: worker.emergencyContactRelationship || '',
      tradeCertification: '',
      safetyInductionDate: worker.safetyInductionDate || '',
      medicalClearanceDate: worker.medicalClearanceDate || '',
      ppeIssued: worker.ppeIssued !== false,
      notes: '',
    });
    setEditingWorkerId(worker.id);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditWorker = () => {
    setWorkerForm(emptyWorker);
    setEditingWorkerId(null);
    setStatus(null);
  };

  const saveWorker = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);
    const payload = {
      ...workerForm,
      salary: Number(workerForm.salary || 0),
      dailyRate: Number(workerForm.dailyRate || 0),
      ppeIssued: Boolean(workerForm.ppeIssued),
    };
    try {
      if (editingWorkerId) {
        await api.put(`/workers/${editingWorkerId}`, payload);
        setEditingWorkerId(null);
        setWorkerForm(emptyWorker);
        await loadWorkers();
        setStatus({ type: 'success', message: `${workerForm.fullName || 'Worker'} updated successfully.` });
      } else {
        await api.post('/workers', payload);
        setWorkerForm(emptyWorker);
        await loadWorkers();
        setStatus({ type: 'success', message: `${workerForm.fullName || 'Worker'} registered successfully.` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const generateCard = async (workerId) => {
    setStatus(null);
    try {
      const { data } = await api.post(`/workers/${workerId}/smart-card`);
      const worker = workerList.find((item) => item.id === workerId);
      setCardPreview({
        workerName: worker?.name || data.card.payload.fullName,
        code: data.card.code,
        qrDataUrl: data.card.qrDataUrl,
        payload: data.card.payload,
        role: worker?.role,
        department: worker?.department,
        phone: worker?.phone,
      });
      await loadWorkers();
      setStatus({ type: 'success', message: 'Smart card generated.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const downloadCard = async (worker) => {
    setStatus(null);
    try {
      let cardData;
      if (worker.smartCardCode) {
        const { data } = await api.get(`/workers/card/${encodeURIComponent(worker.smartCardCode)}`);
        cardData = {
          workerName: data.worker.User?.fullName || worker.name,
          code: data.card.code,
          qrDataUrl: data.card.qrDataUrl,
          payload: data.card.payload,
          role: data.worker.position,
          department: data.worker.department,
          phone: data.worker.User?.phone,
        };
      } else {
        const { data } = await api.post(`/workers/${worker.id}/smart-card`);
        cardData = {
          workerName: data.worker.User?.fullName || worker.name,
          code: data.card.code,
          qrDataUrl: data.card.qrDataUrl,
          payload: data.card.payload,
          role: data.worker.position,
          department: data.worker.department,
          phone: data.worker.User?.phone,
        };
        await loadWorkers();
      }
      setCardPreview(cardData);
      await downloadSmartCardPng(cardData);
      setStatus({ type: 'success', message: 'Smart card downloaded.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const deleteWorker = async (workerId) => {
    setStatus(null);
    setDeleteConfirm(null);
    try {
      await api.delete(`/workers/${workerId}`);
      await loadWorkers();
      setStatus({ type: 'success', message: 'Worker record deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="Worker Management"
        title={editingWorkerId ? 'Edit Worker Record' : 'Professional Worker Registration'}
        description="Capture full identity, employment, payroll, emergency, safety and smart-card information for site workers."
        action={
          <div className="flex items-center gap-2">
            {editingWorkerId && (
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50" onClick={cancelEditWorker} type="button">
                <X size={16} /> Cancel Edit
              </button>
            )}
            <button className="primary-button" disabled={isSaving} form="worker-form">
              {editingWorkerId ? <Pencil size={18} /> : <Plus size={18} />}
              {isSaving ? 'Saving...' : editingWorkerId ? 'Update Worker' : 'Register Worker'}
            </button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel-pad flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><UserRoundCheck size={22} /></div>
          <div><p className="text-xs font-bold text-slate-500">Active Workers</p><p className="text-2xl font-extrabold text-ink">{stats.active}</p></div>
        </div>
        <div className="panel-pad flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><IdCard size={22} /></div>
          <div><p className="text-xs font-bold text-slate-500">Smart Cards Issued</p><p className="text-2xl font-extrabold text-ink">{stats.withCards}</p></div>
        </div>
        <div className="panel-pad flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><ShieldCheck size={22} /></div>
          <div><p className="text-xs font-bold text-slate-500">PPE Issued</p><p className="text-2xl font-extrabold text-ink">{stats.ppeIssued}</p></div>
        </div>
      </div>

      {editingWorkerId && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 shadow-sm">
          <Pencil size={16} className="shrink-0 text-blue-600" />
          <span>Editing worker — update the fields below and click <strong>Update Worker</strong> to save, or <strong>Cancel Edit</strong> to discard changes.</span>
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
            Delete this worker record? This cannot be undone.
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700" onClick={() => deleteWorker(deleteConfirm)}>Yes, Delete</button>
          </div>
        </div>
      )}

      <form id="worker-form" className="space-y-5" onSubmit={saveWorker}>
        <div className="panel-pad">
          <div className="mb-4 flex items-center gap-2">
            <UserRoundCheck className="text-blue-700" size={22} />
            <h3 className="font-extrabold text-ink">Identity and Contact</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Full Name"><TextInput required placeholder="Jean Bosco" value={workerForm.fullName} onChange={(e) => updateForm('fullName', e.target.value)} /></Field>
            <Field label="Email"><TextInput required type="email" placeholder="worker@scpras.rw" value={workerForm.email} onChange={(e) => updateForm('email', e.target.value)} /></Field>
            <Field label="Phone"><TextInput required placeholder="078 123 456" value={workerForm.phone} onChange={(e) => updateForm('phone', e.target.value)} /></Field>
            <Field label="National ID"><TextInput required placeholder="1198..." value={workerForm.nationalId} onChange={(e) => updateForm('nationalId', e.target.value)} /></Field>
            <Field label="Date of Birth"><TextInput type="date" value={workerForm.dateOfBirth} onChange={(e) => updateForm('dateOfBirth', e.target.value)} /></Field>
            <Field label="Gender">
              <SelectInput value={workerForm.gender} onChange={(e) => updateForm('gender', e.target.value)}>
                <option value="not_specified">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Home Address"><TextInput placeholder="Kigali, Rwanda" value={workerForm.address} onChange={(e) => updateForm('address', e.target.value)} /></Field>
            <Field label="Employee Code"><TextInput placeholder="Auto if empty" value={workerForm.employeeCode} onChange={(e) => updateForm('employeeCode', e.target.value)} /></Field>
          </div>
        </div>

        <div className="panel-pad">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="text-blue-700" size={22} />
            <h3 className="font-extrabold text-ink">Employment and Site Assignment</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Position / Trade"><TextInput required value={workerForm.position} onChange={(e) => updateForm('position', e.target.value)} /></Field>
            <Field label="Department"><TextInput required value={workerForm.department} onChange={(e) => updateForm('department', e.target.value)} /></Field>
            <Field label="Employment Type">
              <SelectInput value={workerForm.employmentType} onChange={(e) => updateForm('employmentType', e.target.value)}>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="casual">Casual</option>
                <option value="subcontractor">Subcontractor</option>
              </SelectInput>
            </Field>
            <Field label="Skill Level">
              <SelectInput value={workerForm.skillLevel} onChange={(e) => updateForm('skillLevel', e.target.value)}>
                <option value="trainee">Trainee</option>
                <option value="junior">Junior</option>
                <option value="skilled">Skilled</option>
                <option value="foreman">Foreman</option>
                <option value="supervisor">Supervisor</option>
              </SelectInput>
            </Field>
            <Field label="Join Date"><TextInput type="date" value={workerForm.joinDate} onChange={(e) => updateForm('joinDate', e.target.value)} /></Field>
            <Field label="Status">
              <SelectInput value={workerForm.status} onChange={(e) => updateForm('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </SelectInput>
            </Field>
            <Field label="Trade Certification"><TextInput placeholder="Masonry Level 3" value={workerForm.tradeCertification} onChange={(e) => updateForm('tradeCertification', e.target.value)} /></Field>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="panel-pad">
            <h3 className="mb-4 font-extrabold text-ink">Payroll</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Monthly Salary (USD)"><TextInput type="number" value={workerForm.salary} onChange={(e) => updateForm('salary', e.target.value)} /></Field>
              <Field label="Daily Rate (USD)"><TextInput type="number" value={workerForm.dailyRate} onChange={(e) => updateForm('dailyRate', e.target.value)} /></Field>
              <Field label="Bank Name"><TextInput placeholder="Bank of Kigali" value={workerForm.bankName} onChange={(e) => updateForm('bankName', e.target.value)} /></Field>
              <Field label="Bank Account Number"><TextInput placeholder="Account number" value={workerForm.bankAccountNumber} onChange={(e) => updateForm('bankAccountNumber', e.target.value)} /></Field>
            </div>
          </div>
          <div className="panel-pad">
            <h3 className="mb-4 font-extrabold text-ink">Emergency Contact</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Contact Name"><TextInput value={workerForm.emergencyContactName} onChange={(e) => updateForm('emergencyContactName', e.target.value)} /></Field>
              <Field label="Contact Phone"><TextInput value={workerForm.emergencyContactPhone} onChange={(e) => updateForm('emergencyContactPhone', e.target.value)} /></Field>
              <Field label="Relationship"><TextInput placeholder="Spouse, parent, sibling" value={workerForm.emergencyContactRelationship} onChange={(e) => updateForm('emergencyContactRelationship', e.target.value)} /></Field>
            </div>
          </div>
        </div>

        <div className="panel-pad">
          <h3 className="mb-4 font-extrabold text-ink">Safety and Compliance</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Safety Induction Date"><TextInput type="date" value={workerForm.safetyInductionDate} onChange={(e) => updateForm('safetyInductionDate', e.target.value)} /></Field>
            <Field label="Medical Clearance Date"><TextInput type="date" value={workerForm.medicalClearanceDate} onChange={(e) => updateForm('medicalClearanceDate', e.target.value)} /></Field>
            <label className="mt-7 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
              <input checked={workerForm.ppeIssued} onChange={(e) => updateForm('ppeIssued', e.target.checked)} type="checkbox" className="h-5 w-5 rounded border-slate-300 text-blue-600" />
              PPE Kit Issued
            </label>
            <Field label="Notes"><TextInput placeholder="Health, safety or assignment notes" value={workerForm.notes} onChange={(e) => updateForm('notes', e.target.value)} /></Field>
          </div>
        </div>
      </form>

      {cardPreview && (
        <div className="panel-pad flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img className="h-32 w-32 rounded-lg border border-slate-200 bg-white p-2" src={cardPreview.qrDataUrl} alt="Generated smart card QR code" />
            <div>
              <p className="muted-label">Generated Smart Card</p>
              <h3 className="text-lg font-extrabold text-ink">{cardPreview.workerName}</h3>
              <p className="mt-1 text-sm font-bold text-blue-700">{cardPreview.code}</p>
              <p className="mt-1 text-sm text-slate-500">Scan QR to verify identity, role, phone and status.</p>
            </div>
          </div>
          <button className="primary-button" onClick={() => downloadSmartCardPng(cardPreview)} type="button">
            <Download size={18} /> Download PNG Card
          </button>
        </div>
      )}

      {/* Worker list header with search + filters */}
      <div className="panel-pad">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="muted-label">Registered Workers</p>
            <h3 className="text-lg font-extrabold text-ink">{filteredWorkers.length} of {workerList.length} workers</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <Search size={15} className="text-slate-400" />
              <input className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search workers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={13} className="text-slate-400" /></button>}
            </div>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              {uniqueRoles.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="panel-pad text-center">
          <UserRoundCheck size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-500">{workerList.length === 0 ? 'No workers registered yet.' : 'No workers match your search.'}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredWorkers.map((worker) => {
            const st = STATUS_STYLES[worker.status] || STATUS_STYLES.inactive;
            return (
              <article key={worker.id} className="panel overflow-hidden">
                {/* Card header */}
                <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-lg font-extrabold">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-extrabold text-ink">{worker.name}</h3>
                    <p className="truncate text-sm text-slate-500">{worker.role}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${st.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </div>
                </div>

                {/* Card body */}
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${SKILL_STYLES[worker.skillLevel] || 'bg-slate-100 text-slate-600'}`}>{worker.skillLevel}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${TYPE_STYLES[worker.employmentType] || 'bg-slate-100 text-slate-600'}`}>{worker.employmentType}</span>
                    {worker.ppeIssued && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">PPE ✓</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                    <div><span className="font-bold text-slate-400">Dept</span><p className="font-semibold text-ink">{worker.department}</p></div>
                    <div><span className="font-bold text-slate-400">Code</span><p className="font-semibold text-ink">{worker.employeeCode}</p></div>
                    <div><span className="font-bold text-slate-400">Phone</span><p className="font-semibold text-ink">{worker.phone}</p></div>
                    <div><span className="font-bold text-slate-400">Daily Rate</span><p className="font-semibold text-ink">${worker.dailyRate.toLocaleString()}</p></div>
                  </div>
                  {worker.smartCardCode ? (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                      <IdCard size={14} /> Card: {worker.smartCardCode}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      <IdCard size={14} /> No smart card
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <button className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900" onClick={() => generateCard(worker.id)} type="button">
                    <IdCard size={14} /> Generate Card
                  </button>
                  <div className="flex gap-1.5">
                    <button className="icon-button h-8 w-8 text-blue-600 hover:border-blue-200 hover:bg-blue-50" onClick={() => startEditWorker(worker)} type="button" aria-label="Edit worker" title="Edit worker">
                      <Pencil size={15} />
                    </button>
                    <button className="icon-button h-8 w-8" onClick={() => downloadCard(worker)} type="button" aria-label="Download smart card" title="Download smart card PNG">
                      <Download size={15} />
                    </button>
                    <button className="icon-button h-8 w-8 text-red-500 hover:border-red-200 hover:bg-red-50" onClick={() => setDeleteConfirm(worker.id)} type="button" aria-label="Delete worker">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
