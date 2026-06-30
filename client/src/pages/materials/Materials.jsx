import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  MapPin,
  PackageCheck,
  PackagePlus,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { ROLES } from '../../config/roles.js';
import { materials as fallbackMaterials } from '../../data/mockData.js';
import { api, apiErrorMessage, getSessionUser } from '../../services/api.js';

const emptyMaterial = {
  projectId: '',
  materialCode: '',
  materialName: '',
  category: 'Structural',
  specification: '',
  unit: 'pcs',
  plannedQuantity: '',
  receivedQuantity: '',
  usedQuantity: 0,
  minimumStock: '',
  reorderLevel: '',
  unitCost: '',
  estimatedCost: '',
  actualCost: '',
  supplier: '',
  supplierContact: '',
  supplierEmail: '',
  purchaseOrderNumber: '',
  invoiceNumber: '',
  deliveryDate: '',
  lastReceivedDate: '',
  storageLocation: '',
  batchNumber: '',
  gradeSpecification: '',
  qualityStatus: 'pending_inspection',
  inspectedBy: '',
  inspectionDate: '',
  wastageAllowancePercent: 5,
  plannedPhase: '',
  plannedStartDate: '',
  plannedEndDate: '',
  priority: 'normal',
  bomStatus: 'planned',
  status: 'received',
  notes: '',
};

const stockTone = {
  healthy: 'bg-emerald-50 text-emerald-700 whitespace-nowrap',
  low: 'bg-amber-50 text-amber-700 whitespace-nowrap',
  reorder: 'bg-orange-50 text-orange-700 whitespace-nowrap',
  stockout: 'bg-red-50 text-red-700 whitespace-nowrap',
};

const stockLabel = {
  healthy: 'Healthy',
  low: 'Low stock',
  reorder: 'Reorder',
  stockout: 'Stock out',
};

const qualityLabel = {
  pending_inspection: 'Pending inspection',
  approved: 'Approved',
  conditional: 'Conditional',
  rejected: 'Rejected',
};

const qualityTone = {
  pending_inspection: 'bg-slate-100 text-slate-700',
  approved: 'bg-emerald-50 text-emerald-700',
  conditional: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
};

const numberValue = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatNumber = (value) => numberValue(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
const formatCurrency = (value) => `$${numberValue(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function getStockHealth(material) {
  if (material.remaining <= 0) return 'stockout';
  if (material.reorderLevel > 0 && material.remaining <= material.reorderLevel) return 'reorder';
  if (material.minimumStock > 0 && material.remaining <= material.minimumStock) return 'low';
  return 'healthy';
}

const normalizeMaterial = (material) => {
  const planned = numberValue(material.plannedQuantity ?? material.planned);
  const used = numberValue(material.usedQuantity ?? material.used);
  const storedRemaining = numberValue(material.remainingStock ?? material.remaining);
  const rawReceived = material.receivedQuantity ?? material.received;
  const inferredReceived = used + storedRemaining;
  const received = rawReceived !== undefined && rawReceived !== null && (numberValue(rawReceived) > 0 || material.status === 'pending')
    ? numberValue(rawReceived)
    : (inferredReceived > 0 ? inferredReceived : planned);
  const remaining = numberValue(material.remainingStock ?? material.remaining ?? (received - used));
  const unitCost = numberValue(material.unitCost, planned > 0 ? numberValue(material.estimatedCost) / planned : 0);
  const variance = planned > 0 ? ((used - planned) / planned) * 100 : numberValue(material.variance);
  const normalized = {
    id: material.id || material.name,
    projectId: material.projectId || material.Project?.id || '',
    materialCode: material.materialCode || '',
    name: material.materialName || material.name,
    category: material.category || 'General',
    planned,
    received,
    used,
    remaining,
    variance,
    minimumStock: numberValue(material.minimumStock),
    reorderLevel: numberValue(material.reorderLevel),
    status: material.status || 'pending',
    qualityStatus: material.qualityStatus || 'pending_inspection',
    unit: material.unit || 'pcs',
    unitCost,
    estimatedCost: numberValue(material.estimatedCost ?? planned * unitCost),
    actualCost: numberValue(material.actualCost ?? used * unitCost),
    supplier: material.supplier || '',
    supplierContact: material.supplierContact || '',
    supplierEmail: material.supplierEmail || '',
    purchaseOrderNumber: material.purchaseOrderNumber || '',
    invoiceNumber: material.invoiceNumber || '',
    deliveryDate: material.deliveryDate || '',
    lastReceivedDate: material.lastReceivedDate || '',
    storageLocation: material.storageLocation || '',
    batchNumber: material.batchNumber || '',
    gradeSpecification: material.gradeSpecification || '',
    inspectedBy: material.inspectedBy || '',
    inspectionDate: material.inspectionDate || '',
    wastageAllowancePercent: numberValue(material.wastageAllowancePercent),
    notes: material.notes || '',
    specification: material.specification || material.gradeSpecification || '',
    plannedPhase: material.plannedPhase || '',
    plannedStartDate: material.plannedStartDate || '',
    plannedEndDate: material.plannedEndDate || '',
    priority: material.priority || 'normal',
    bomStatus: material.bomStatus || 'planned',
    currency: material.Project?.currency || 'USD',
    issueCount: Array.isArray(material.MaterialIssues) ? material.MaterialIssues.length : 0,
    pendingIssueCount: Array.isArray(material.MaterialIssues) ? material.MaterialIssues.filter((issue) => issue.approvalStatus === 'pending').length : 0,
    latestIssue: Array.isArray(material.MaterialIssues) && material.MaterialIssues.length > 0 ? material.MaterialIssues[0] : null,
    projectName: material.Project?.projectName || '',
    projectLocation: material.Project?.location || '',
  };

  return {
    ...normalized,
    stockHealth: getStockHealth(normalized),
    inventoryValue: Math.max(0, remaining) * unitCost,
  };
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  );
}

function TextAreaInput(props) {
  return (
    <textarea
      {...props}
      className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  );
}

function SectionTitle({ icon: Icon, eyebrow, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="muted-label">{eyebrow}</p>
        <h3 className="truncate text-base font-extrabold text-ink">{title}</h3>
      </div>
    </div>
  );
}

function IconAction({ label, icon: Icon, tone = 'slate', ...props }) {
  const tones = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
    slate: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  };

  return (
    <button
      {...props}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone] || tones.slate}`}
      title={label}
      type="button"
    >
      <Icon size={17} />
    </button>
  );
}

const emptyIssueForm = {
  quantityToIssue: '',
  phase: '',
  date: new Date().toISOString().slice(0, 10),
  purpose: '',
  issuedBy: '',
};

const formatMoney = (value, currency = 'USD') => {
  if (currency === 'RWF') return `RWF ${numberValue(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return formatCurrency(value);
};

export default function Materials() {
  const currentUser = getSessionUser();
  const canManageBaseline = [ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR].includes(currentUser?.role);
  const canManageStock = [ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER].includes(currentUser?.role);
  const canDeleteMaterial = currentUser?.role === ROLES.QUANTITY_SURVEYOR;
  const [materialList, setMaterialList] = useState(fallbackMaterials.map(normalizeMaterial));
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyMaterial);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [usageEdits, setUsageEdits] = useState({});
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issuingMaterial, setIssuingMaterial] = useState(null);
  const [issueForm, setIssueForm] = useState(emptyIssueForm);
  const [issuePhases, setIssuePhases] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applyLoadedData = useCallback((materialsData, projectsData) => {
    const normalizedMaterials = materialsData.map(normalizeMaterial);
    setMaterialList(normalizedMaterials);
    setUsageEdits(Object.fromEntries(normalizedMaterials.map((material) => [material.id, material.used])));
    if (Array.isArray(projectsData)) {
      setProjects(projectsData);
      setForm((current) => ({ ...current, projectId: current.projectId || projectsData[0]?.id || '' }));
    }
  }, []);

  const loadMaterials = async () => {
    try {
      const [materialsResponse, projectsResponse] = await Promise.all([
        api.get('/materials'),
        api.get('/projects'),
      ]);

      applyLoadedData(materialsResponse.data, projectsResponse.data);
    } catch {
      applyLoadedData(fallbackMaterials);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialMaterials() {
      try {
        const [materialsResponse, projectsResponse] = await Promise.all([
          api.get('/materials'),
          api.get('/projects'),
        ]);

        if (!ignore) applyLoadedData(materialsResponse.data, projectsResponse.data);
      } catch {
        if (!ignore) applyLoadedData(fallbackMaterials);
      }
    }

    loadInitialMaterials();
    return () => {
      ignore = true;
    };
  }, [applyLoadedData]);

  useEffect(() => {
    if (!isFormOpen && !isIssueOpen && !deleteTarget) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [deleteTarget, isFormOpen, isIssueOpen]);

  const filteredMaterials = useMemo(() => {
    const search = query.trim().toLowerCase();
    return materialList.filter((material) => {
      const matchesSearch = !search
        || [material.name, material.materialCode, material.category, material.supplier, material.projectName, material.storageLocation]
          .some((value) => String(value || '').toLowerCase().includes(search));
      const matchesProject = projectFilter === 'all' || material.projectName === projectFilter;
      const matchesStatus = statusFilter === 'all' || material.stockHealth === statusFilter || material.status === statusFilter;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [materialList, projectFilter, query, statusFilter]);

  const stats = useMemo(() => {
    const received = materialList.filter((material) => material.received > 0).length;
    const lowStock = materialList.filter((material) => material.stockHealth !== 'healthy').length;
    const inventoryValue = materialList.reduce((total, material) => total + material.inventoryValue, 0);

    return { total: materialList.length, received, lowStock, inventoryValue };
  }, [materialList]);

  const riskMaterials = useMemo(() => {
    return materialList.filter((material) => material.stockHealth !== 'healthy' || material.qualityStatus === 'rejected').slice(0, 4);
  }, [materialList]);

  const modalSummary = useMemo(() => {
    const planned = numberValue(form.plannedQuantity);
    const received = form.receivedQuantity === '' ? planned : numberValue(form.receivedQuantity);
    const used = numberValue(form.usedQuantity);
    const unitCost = numberValue(form.unitCost);
    const estimatedCost = form.estimatedCost === '' ? planned * unitCost : numberValue(form.estimatedCost);
    const actualCost = form.actualCost === '' ? used * unitCost : numberValue(form.actualCost);

    return {
      planned,
      received,
      used,
      remaining: received - used,
      estimatedCost,
      actualCost,
      inventoryValue: Math.max(0, received - used) * unitCost,
    };
  }, [form]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openMaterialForm = (materialToEdit = null) => {
    setStatus(null);
    if (materialToEdit) {
      setEditingMaterialId(materialToEdit.id);
      setForm({
        projectId: materialToEdit.projectId || projects[0]?.id || '',
        materialCode: materialToEdit.materialCode || '',
        materialName: materialToEdit.name || '',
        category: materialToEdit.category || 'Structural',
        specification: materialToEdit.specification || '',
        unit: materialToEdit.unit || 'pcs',
        plannedQuantity: materialToEdit.planned ?? '',
        receivedQuantity: materialToEdit.received ?? '',
        usedQuantity: materialToEdit.used ?? 0,
        minimumStock: materialToEdit.minimumStock ?? '',
        reorderLevel: materialToEdit.reorderLevel ?? '',
        unitCost: materialToEdit.unitCost ?? '',
        estimatedCost: materialToEdit.estimatedCost ?? '',
        actualCost: materialToEdit.actualCost ?? '',
        supplier: materialToEdit.supplier || '',
        supplierContact: materialToEdit.supplierContact || '',
        supplierEmail: materialToEdit.supplierEmail || '',
        purchaseOrderNumber: materialToEdit.purchaseOrderNumber || '',
        invoiceNumber: materialToEdit.invoiceNumber || '',
        deliveryDate: materialToEdit.deliveryDate || '',
        lastReceivedDate: materialToEdit.lastReceivedDate || '',
        storageLocation: materialToEdit.storageLocation || '',
        batchNumber: materialToEdit.batchNumber || '',
        gradeSpecification: materialToEdit.gradeSpecification || '',
        qualityStatus: materialToEdit.qualityStatus || 'pending_inspection',
        inspectedBy: materialToEdit.inspectedBy || '',
        inspectionDate: materialToEdit.inspectionDate || '',
        wastageAllowancePercent: materialToEdit.wastageAllowancePercent ?? 5,
        plannedPhase: materialToEdit.plannedPhase || '',
        plannedStartDate: materialToEdit.plannedStartDate || '',
        plannedEndDate: materialToEdit.plannedEndDate || '',
        priority: materialToEdit.priority || 'normal',
        bomStatus: materialToEdit.bomStatus || 'planned',
        status: materialToEdit.status || 'received',
        notes: materialToEdit.notes || '',
      });
    } else {
      setEditingMaterialId(null);
      setForm((current) => ({
        ...emptyMaterial,
        projectId: current.projectId || projects[0]?.id || '',
        deliveryDate: new Date().toISOString().slice(0, 10),
        lastReceivedDate: new Date().toISOString().slice(0, 10),
      }));
    }
    setIsFormOpen(true);
  };

  const closeMaterialForm = () => {
    if (!isSaving) {
      setIsFormOpen(false);
      setEditingMaterialId(null);
    }
  };

  const materialPayload = () => ({
    ...form,
    projectId: Number(form.projectId),
    plannedQuantity: numberValue(form.plannedQuantity),
    receivedQuantity: form.receivedQuantity === '' ? numberValue(form.plannedQuantity) : numberValue(form.receivedQuantity),
    usedQuantity: numberValue(form.usedQuantity),
    minimumStock: numberValue(form.minimumStock),
    reorderLevel: numberValue(form.reorderLevel),
    unitCost: numberValue(form.unitCost),
    estimatedCost: form.estimatedCost === '' ? modalSummary.estimatedCost : numberValue(form.estimatedCost),
    actualCost: form.actualCost === '' ? modalSummary.actualCost : numberValue(form.actualCost),
    wastageAllowancePercent: numberValue(form.wastageAllowancePercent),
    deliveryDate: form.deliveryDate || null,
    lastReceivedDate: form.lastReceivedDate || null,
    inspectionDate: form.inspectionDate || null,
    plannedStartDate: form.plannedStartDate || null,
    plannedEndDate: form.plannedEndDate || null,
  });

  const saveMaterial = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      if (editingMaterialId) {
        await api.put(`/materials/${editingMaterialId}`, materialPayload());
        await loadMaterials();
        setIsFormOpen(false);
        setEditingMaterialId(null);
        setStatus({ type: 'success', message: 'Material record updated successfully.' });
      } else {
        await api.post('/materials', materialPayload());
        await loadMaterials();
        setIsFormOpen(false);
        setStatus({ type: 'success', message: 'Material registered with procurement, stock and quality details.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const updateUsage = async (material) => {
    setStatus(null);

    try {
      const usedQuantity = numberValue(usageEdits[material.id]);
      await api.patch(`/materials/${material.id}`, {
        usedQuantity,
        actualCost: usedQuantity * numberValue(material.unitCost),
      });
      await loadMaterials();
      setStatus({ type: 'success', message: 'Material usage updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const receiveMaterial = async (material) => {
    setStatus(null);

    try {
      await api.post('/materials/receive', {
        materialId: material.id,
        receivedQuantity: material.planned,
        status: 'received',
        lastReceivedDate: new Date().toISOString().slice(0, 10),
      });
      await loadMaterials();
      setStatus({ type: 'success', message: 'Material receipt updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const openIssueModal = async (material) => {
    setIssuingMaterial(material);
    setIssueForm({ ...emptyIssueForm, date: new Date().toISOString().slice(0, 10) });
    setIssuePhases([]);
    if (material.projectId) {
      try {
        const { data } = await api.get(`/projects/${material.projectId}/phases`);
        setIssuePhases(Array.isArray(data) ? data : []);
      } catch { setIssuePhases([]); }
    }
    setIsIssueOpen(true);
  };

  const _issueToSite = async () => {
    const qty = numberValue(issueForm.quantityToIssue);
    if (!qty || qty <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid quantity to issue.' });
      return;
    }
    if (qty > issuingMaterial.remaining) {
      setStatus({ type: 'error', message: `Cannot issue ${qty} — only ${issuingMaterial.remaining} ${issuingMaterial.unit} remaining in stock.` });
      return;
    }
    setIsSaving(true);
    try {
      const newUsed = issuingMaterial.used + qty;
      const issuanceNote = `[ISSUED ${qty} ${issuingMaterial.unit} on ${issueForm.date}${issueForm.phase ? ` → ${issueForm.phase}` : ''}${issueForm.issuedBy ? ` by ${issueForm.issuedBy}` : ''}${issueForm.purpose ? `: ${issueForm.purpose}` : ''}]`;
      await api.patch(`/materials/${issuingMaterial.id}`, {
        usedQuantity: newUsed,
        actualCost: newUsed * issuingMaterial.unitCost,
        notes: [issuingMaterial.notes, issuanceNote].filter(Boolean).join('\n'),
      });
      await loadMaterials();
      setIsIssueOpen(false);
      const newVariance = issuingMaterial.planned > 0
        ? (((newUsed - issuingMaterial.planned) / issuingMaterial.planned) * 100).toFixed(1)
        : '0.0';
      setStatus({ type: 'success', message: `Issued ${qty} ${issuingMaterial.unit} of ${issuingMaterial.name}. New cumulative used: ${newUsed.toLocaleString()} ${issuingMaterial.unit} (${newVariance > 0 ? '+' : ''}${newVariance}% vs plan).` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const issueToSiteViaLedger = async () => {
    const qty = numberValue(issueForm.quantityToIssue);
    if (!qty || qty <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid quantity to issue.' });
      return;
    }
    if (qty > issuingMaterial.remaining) {
      setStatus({ type: 'error', message: `Cannot issue ${qty}; only ${issuingMaterial.remaining} ${issuingMaterial.unit} remaining in stock.` });
      return;
    }
    setIsSaving(true);
    try {
      const { data } = await api.post('/materials/issues', {
        projectId: issuingMaterial.projectId,
        materialId: issuingMaterial.id,
        issuedQuantity: qty,
        issueDate: issueForm.date,
        phase: issueForm.phase,
        issuedBy: issueForm.issuedBy,
        usedFor: issueForm.purpose,
        remarks: issueForm.purpose,
      });
      await loadMaterials();
      setIsIssueOpen(false);
      const approvalStatus = data?.issue?.approvalStatus || 'approved';
      setStatus({
        type: approvalStatus === 'pending' ? 'error' : 'success',
        message: data?.message || `Issued ${qty} ${issuingMaterial.unit} of ${issuingMaterial.name}.`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    setStatus(null);

    try {
      await api.delete(`/materials/${materialId}`);
      await loadMaterials();
      setDeleteTarget(null);
      setStatus({ type: 'success', message: 'Material deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  return (
    <section className="page-shell ">
      <PageHeader
        eyebrow="Material Tracking"
        title="Inventory, Usage and Loss Alerts"
        description="Compare planned vs actual material usage, detect overuse, manage stock and generate material reports."
        action={canManageBaseline ? <button className="primary-button " disabled={isSaving} onClick={openMaterialForm} type="button"><Plus size={18} /> Add Material</button> : null}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Items" value={stats.total} icon={Boxes} tone="blue" />
        <StatCard label="Received Items" value={stats.received} icon={PackageCheck} tone="green" />
        <StatCard label="Low / Reorder" value={stats.lowStock} icon={AlertTriangle} tone="gold" />
        <StatCard label="Stock Value" value={formatCurrency(stats.inventoryValue)} icon={DollarSign} tone="purple" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.42fr]">
        <div className="panel-pad">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="muted-label">Inventory Register</p>
              <h3 className="text-lg font-extrabold text-ink">Material Ledger</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Showing {filteredMaterials.length} of {materialList.length} records
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:w-[720px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Search materials"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
                <option value="all">All projects</option>
                {[...new Set(materialList.map((material) => material.projectName).filter(Boolean))].map((projectName) => (
                  <option key={projectName} value={projectName}>{projectName}</option>
                ))}
              </select>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All status</option>
                <option value="healthy">Healthy</option>
                <option value="low">Low stock</option>
                <option value="reorder">Reorder</option>
                <option value="stockout">Stock out</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="used">Used</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel-pad">
          <p className="muted-label">Procurement Watch</p>
          <h3 className="mt-1 text-lg font-extrabold text-ink">{riskMaterials.length} items need attention</h3>
          <div className="mt-3 space-y-2">
            {riskMaterials.length ? riskMaterials.map((material) => (
              <div key={material.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <p className="min-w-0 truncate font-bold text-ink">{material.name}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${stockTone[material.stockHealth]}`}>{stockLabel[material.stockHealth]}</span>
              </div>
            )) : (
              <p className="text-sm font-medium text-slate-600">All tracked material stock levels look healthy.</p>
            )}
          </div>
        </div>
      </div>

      {status && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={18} className="shrink-0 text-red-500" />}
          <span>{status.message}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setStatus(null)} type="button"><X size={16} /></button>
        </div>
      )}

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px]">
            <thead className="table-head sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Project / Supplier</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td className="px-4 py-14 text-center" colSpan={7}>
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <Boxes size={38} className="text-slate-300" />
                      <p className="mt-3 text-base font-extrabold text-slate-500">No material records match the current filters.</p>
                      <p className="mt-1 text-sm text-slate-400">Clear search or change project/status filters to see more records.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMaterials.map((material) => (
                <tr key={material.id} className="bg-white transition hover:bg-slate-50/80">
                  <td className="table-cell align-top">
                    <p className="font-extrabold text-ink">{material.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{material.materialCode || material.category}</p>
                    {material.plannedPhase ? <p className="mt-1 text-xs font-bold text-blue-700">Phase: {material.plannedPhase}</p> : null}
                    {material.priority ? <p className="mt-1 text-xs font-semibold capitalize text-slate-500">Priority: {material.priority}</p> : null}
                    {material.storageLocation ? <p className="mt-2 text-xs text-slate-500">Store: {material.storageLocation}</p> : null}
                  </td>
                  <td className="table-cell align-top">
                    <p className="font-semibold text-ink">{material.projectName || 'Unassigned project'}</p>
                    <p className="mt-1 text-slate-500">{material.supplier || 'No supplier recorded'}</p>
                    {material.deliveryDate ? <p className="mt-1 text-xs text-slate-500">Due: {material.deliveryDate}</p> : null}
                  </td>
                  <td className="table-cell align-top">
                    <div className="grid gap-1 text-sm">
                      <span>Planned: <strong>{formatNumber(material.planned)} {material.unit}</strong></span>
                      <span>Received: <strong>{formatNumber(material.received)} {material.unit}</strong></span>
                      <label className="flex items-center gap-2">
                        Used:
                        <input
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
                          type="number"
                          value={usageEdits[material.id] ?? material.used}
                          onChange={(event) => setUsageEdits((current) => ({ ...current, [material.id]: event.target.value }))}
                        />
                        {material.unit}
                      </label>
                      <span>Remaining: <strong>{formatNumber(material.remaining)} {material.unit}</strong></span>
                    </div>
                  </td>
                  <td className="table-cell align-top">
                    <p>Unit: <strong>{formatMoney(material.unitCost, material.currency)}</strong></p>
                    <p className="mt-1">Planned: {formatMoney(material.estimatedCost, material.currency)}</p>
                    <p className="mt-1">Actual: {formatMoney(material.actualCost, material.currency)}</p>
                    <p className={material.variance > 0 ? 'mt-1 font-bold text-red-600' : 'mt-1 font-bold text-emerald-700'}>{material.variance.toFixed(1)}% variance</p>
                  </td>
                  <td className="table-cell align-top">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${qualityTone[material.qualityStatus] || qualityTone.pending_inspection}`}>
                      {qualityLabel[material.qualityStatus] || material.qualityStatus}
                    </span>
                    {material.batchNumber ? <p className="mt-2 text-xs text-slate-500">Batch: {material.batchNumber}</p> : null}
                    {material.gradeSpecification ? <p className="mt-1 text-xs text-slate-500">{material.gradeSpecification}</p> : null}
                  </td>
                  <td className="table-cell align-top">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${stockTone[material.stockHealth]}`}>{stockLabel[material.stockHealth]}</span>
                    <p className="mt-2 font-bold capitalize text-slate-700">{material.status}</p>
                    {material.issueCount > 0 ? (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {material.issueCount} issue{material.issueCount === 1 ? '' : 's'}
                        {material.pendingIssueCount > 0 ? `, ${material.pendingIssueCount} pending` : ''}
                      </p>
                    ) : null}
                  </td>
                  <td className="table-cell align-top">
                    <div className="flex w-40 flex-col gap-2">
                      {canManageStock && <button
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                          onClick={() => openIssueModal(material)}
                          type="button"
                          title="Issue materials to site"
                        >
                          <PackagePlus size={14} /> Issue
                        </button>}
                      {canManageStock && <button
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100"
                          onClick={() => receiveMaterial(material)}
                          type="button"
                          title="Receive planned stock"
                        >
                          <Truck size={14} /> Receive
                        </button>}
                      {(canManageBaseline || canManageStock || canDeleteMaterial) ? <div className="grid grid-cols-3 gap-2">
                        {canManageBaseline && <IconAction label="Edit material" icon={Pencil} tone="blue" onClick={() => openMaterialForm(material)} />}
                        {canManageStock && <IconAction label="Save inline usage" icon={Save} tone="slate" onClick={() => updateUsage(material)} />}
                        {canDeleteMaterial && <IconAction label="Delete material" icon={Trash2} tone="red" onClick={() => setDeleteTarget(material)} />}
                      </div> : <span className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-500">Read only</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Issue to Site Modal ── */}
      {deleteTarget ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isSaving) setDeleteTarget(null);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wide text-red-700">Delete material record</p>
                <h2 className="mt-1 text-lg font-extrabold text-ink">Confirm before removing</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  This will remove the material from the active register for this project.
                </p>
              </div>
              <button
                aria-label="Close delete confirmation"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-base font-extrabold text-ink">{deleteTarget.name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{deleteTarget.code || 'No material code'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">
                    {deleteTarget.category || 'General'}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{deleteTarget.projectName || 'No project assigned'}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white px-2 py-3 ring-1 ring-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Planned</p>
                    <p className="mt-1 text-sm font-extrabold text-ink">{formatNumber(deleteTarget.planned)} {deleteTarget.unit}</p>
                  </div>
                  <div className="rounded-lg bg-white px-2 py-3 ring-1 ring-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Used</p>
                    <p className="mt-1 text-sm font-extrabold text-amber-700">{formatNumber(deleteTarget.used)} {deleteTarget.unit}</p>
                  </div>
                  <div className="rounded-lg bg-white px-2 py-3 ring-1 ring-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Issues</p>
                    <p className="mt-1 text-sm font-extrabold text-blue-700">{deleteTarget.issueCount || 0}</p>
                  </div>
                </div>
              </div>

              {(Number(deleteTarget.used) > 0 || Number(deleteTarget.issueCount) > 0) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-5 text-amber-900">
                  This record already has site usage or issue history. Review it carefully before deleting.
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
              <button
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-extrabold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={() => deleteMaterial(deleteTarget.id)}
                type="button"
              >
                <Trash2 size={16} />
                {isSaving ? 'Deleting...' : 'Delete material'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}

      {isIssueOpen && issuingMaterial && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsIssueOpen(false); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 bg-ink px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-ink">
                  <PackagePlus size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Issue to Site</p>
                  <h2 className="font-extrabold text-white">{issuingMaterial.name}</h2>
                  <p className="text-xs text-slate-400">{issuingMaterial.projectName || 'No project'} · {issuingMaterial.category}</p>
                </div>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setIsIssueOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stock status strip */}
            <div className="grid grid-cols-4 gap-px border-b border-slate-200 bg-slate-200">
              {[
                { label: 'Planned', value: issuingMaterial.planned, color: 'text-blue-700' },
                { label: 'Received', value: issuingMaterial.received, color: 'text-indigo-700' },
                { label: 'Used', value: issuingMaterial.used, color: 'text-amber-700' },
                { label: 'Available', value: issuingMaterial.remaining, color: issuingMaterial.remaining > 0 ? 'text-emerald-700' : 'text-red-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 py-3 text-center">
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className={`mt-0.5 text-lg font-extrabold ${color}`}>{formatNumber(value)}</p>
                  <p className="text-xs text-slate-400">{issuingMaterial.unit}</p>
                </div>
              ))}
            </div>

            {/* Variance bar */}
            <div className="border-b border-slate-200 bg-white px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Used vs Plan</span>
                <span className={`font-extrabold ${issuingMaterial.variance > 15 ? 'text-red-700' : issuingMaterial.variance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {issuingMaterial.variance > 0 ? '+' : ''}{issuingMaterial.variance.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full transition-all ${issuingMaterial.variance > 15 ? 'bg-red-500' : issuingMaterial.variance > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, Math.max(0, (issuingMaterial.used / Math.max(issuingMaterial.planned, 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Quantity to Issue <span className="font-normal text-slate-400">(max {formatNumber(issuingMaterial.remaining)} {issuingMaterial.unit})</span>
                </label>
                <input
                  autoFocus
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-base font-bold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  max={issuingMaterial.remaining}
                  min="0.01"
                  placeholder="0"
                  step="0.01"
                  type="number"
                  value={issueForm.quantityToIssue}
                  onChange={(e) => setIssueForm((f) => ({ ...f, quantityToIssue: e.target.value }))}
                />
                {issueForm.quantityToIssue !== '' && (
                  <div className={`mt-2 rounded-lg px-3 py-2 text-sm font-semibold ${numberValue(issueForm.quantityToIssue) > issuingMaterial.remaining ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {numberValue(issueForm.quantityToIssue) > issuingMaterial.remaining
                      ? `Exceeds available stock by ${(numberValue(issueForm.quantityToIssue) - issuingMaterial.remaining).toFixed(2)} ${issuingMaterial.unit}`
                      : `After issue: ${(issuingMaterial.remaining - numberValue(issueForm.quantityToIssue)).toFixed(2)} ${issuingMaterial.unit} remaining · Total used: ${(issuingMaterial.used + numberValue(issueForm.quantityToIssue)).toFixed(2)} ${issuingMaterial.unit}`
                    }
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Phase / Activity</label>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    value={issueForm.phase}
                    onChange={(e) => setIssueForm((f) => ({ ...f, phase: e.target.value }))}
                  >
                    <option value="">General site work</option>
                    {issuePhases.map((p) => (
                      <option key={p.id || p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Date of Issue</label>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    type="date"
                    value={issueForm.date}
                    onChange={(e) => setIssueForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Issued By</label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Engineer or storekeeper name"
                  value={issueForm.issuedBy}
                  onChange={(e) => setIssueForm((f) => ({ ...f, issuedBy: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Purpose / Description</label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="e.g. Foundation slab pour, Column casting"
                  value={issueForm.purpose}
                  onChange={(e) => setIssueForm((f) => ({ ...f, purpose: e.target.value }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-slate-200 bg-white px-5 py-4">
              <button
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={isSaving}
                onClick={() => setIsIssueOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                disabled={isSaving || !issueForm.quantityToIssue || numberValue(issueForm.quantityToIssue) <= 0 || numberValue(issueForm.quantityToIssue) > issuingMaterial.remaining}
                onClick={issueToSiteViaLedger}
                type="button"
              >
                <PackagePlus size={16} />
                {isSaving ? 'Recording...' : `Issue ${issueForm.quantityToIssue || '—'} ${issuingMaterial.unit}`}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {isFormOpen ? createPortal((
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative flex h-[92vh] max-h-[900px] w-full max-w-6xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl">
            <form className="flex min-h-0 w-full flex-col" onSubmit={saveMaterial}>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-ink px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-ink">
                    {editingMaterialId ? <Pencil size={24} /> : <PackagePlus size={24} />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{editingMaterialId ? 'Edit Material Record' : 'Material Registration'}</p>
                    <h2 className="text-xl font-extrabold text-white">{editingMaterialId ? `Editing: ${form.materialName}` : 'Professional Material Profile'}</h2>
                  </div>
                </div>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/20" onClick={closeMaterialForm} type="button" aria-label="Close material form">
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden bg-slate-50">
                <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
                    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                      {[
                        ['Identity', FileText],
                        ['Supplier', ClipboardCheck],
                        ['Stock', Boxes],
                        ['Quality', ShieldCheck],
                      ].map(([label, Icon]) => (
                        <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600">
                          <Icon size={15} className="text-blue-700" />
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <SectionTitle icon={FileText} eyebrow="Identity" title="Material and Project Details" />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Project">
                          <SelectInput required value={form.projectId} onChange={(event) => updateForm('projectId', event.target.value)}>
                            <option value="">Select project</option>
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>{project.projectName}</option>
                            ))}
                          </SelectInput>
                        </Field>
                        <Field label="Material Name">
                          <TextInput required placeholder="Cement 42.5R, Y12 steel bars..." value={form.materialName} onChange={(event) => updateForm('materialName', event.target.value)} />
                        </Field>
                        <Field label="Material Code">
                          <TextInput placeholder="Auto generated if empty" value={form.materialCode} onChange={(event) => updateForm('materialCode', event.target.value)} />
                        </Field>
                        <Field label="Category">
                          <SelectInput value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
                            <option>Site Setup</option>
                            <option>Earthworks and Foundation</option>
                            <option>Concrete and Steel</option>
                            <option>Masonry</option>
                            <option>Roofing</option>
                            <option>Doors and Windows</option>
                            <option>Plumbing</option>
                            <option>Electrical</option>
                            <option>Finishing</option>
                            <option>Painting</option>
                            <option>External Works</option>
                            <option>Labour</option>
                            <option>Tools and PPE</option>
                            <option>Other</option>
                          </SelectInput>
                        </Field>
                        <Field label="Unit">
                          <SelectInput value={form.unit} onChange={(event) => updateForm('unit', event.target.value)}>
                            <option value="pcs">pcs</option>
                            <option value="Pc">Pc</option>
                            <option value="Bag">Bag</option>
                            <option value="m">m</option>
                            <option value="m2">m2</option>
                            <option value="m3">m3</option>
                            <option value="Ton">Ton</option>
                            <option value="Kg">Kg</option>
                            <option value="Litre">Litre</option>
                            <option value="Sheet">Sheet</option>
                            <option value="Roll">Roll</option>
                            <option value="LS">LS</option>
                            <option value="Set">Set</option>
                            <option value="Pair">Pair</option>
                            <option value="Month">Month</option>
                          </SelectInput>
                        </Field>
                        <Field label="Grade / Specification">
                          <TextInput placeholder="C25, BS4449, 50kg, 0-20mm..." value={form.specification || form.gradeSpecification} onChange={(event) => { updateForm('specification', event.target.value); updateForm('gradeSpecification', event.target.value); }} />
                        </Field>
                        <Field label="Planned Phase">
                          <TextInput placeholder="Week 3-12, Roofing, First fix..." value={form.plannedPhase} onChange={(event) => updateForm('plannedPhase', event.target.value)} />
                        </Field>
                        <Field label="BOM Priority">
                          <SelectInput value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                            <option value="low">Low</option>
                          </SelectInput>
                        </Field>
                        <Field label="BOM Status">
                          <SelectInput value={form.bomStatus} onChange={(event) => updateForm('bomStatus', event.target.value)}>
                            <option value="planned">Planned</option>
                            <option value="approved">Approved</option>
                            <option value="revised">Revised</option>
                            <option value="cancelled">Cancelled</option>
                          </SelectInput>
                        </Field>
                      </div>
                    </section>

                    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <SectionTitle icon={ClipboardCheck} eyebrow="Procurement" title="Supplier, PO and Costing" />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Supplier">
                          <TextInput placeholder="Supplier company" value={form.supplier} onChange={(event) => updateForm('supplier', event.target.value)} />
                        </Field>
                        <Field label="Supplier Phone">
                          <TextInput placeholder="+250..." value={form.supplierContact} onChange={(event) => updateForm('supplierContact', event.target.value)} />
                        </Field>
                        <Field label="Supplier Email">
                          <TextInput type="email" placeholder="supplier@example.com" value={form.supplierEmail} onChange={(event) => updateForm('supplierEmail', event.target.value)} />
                        </Field>
                        <Field label="Purchase Order No.">
                          <TextInput value={form.purchaseOrderNumber} onChange={(event) => updateForm('purchaseOrderNumber', event.target.value)} />
                        </Field>
                        <Field label="Invoice / Delivery Note">
                          <TextInput value={form.invoiceNumber} onChange={(event) => updateForm('invoiceNumber', event.target.value)} />
                        </Field>
                        <Field label="Expected Delivery">
                          <TextInput type="date" value={form.deliveryDate} onChange={(event) => updateForm('deliveryDate', event.target.value)} />
                        </Field>
                        <Field label="Unit Cost">
                          <TextInput min="0" step="0.01" type="number" value={form.unitCost} onChange={(event) => updateForm('unitCost', event.target.value)} />
                        </Field>
                        <Field label="Estimated Total Cost">
                          <TextInput min="0" step="0.01" type="number" value={form.estimatedCost} onChange={(event) => updateForm('estimatedCost', event.target.value)} />
                        </Field>
                        <Field label="Actual Cost">
                          <TextInput min="0" step="0.01" type="number" value={form.actualCost} onChange={(event) => updateForm('actualCost', event.target.value)} />
                        </Field>
                      </div>
                    </section>

                    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <SectionTitle icon={Boxes} eyebrow="Inventory" title="Quantities and Stock Controls" />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Planned Quantity">
                          <TextInput required min="0" step="0.01" type="number" value={form.plannedQuantity} onChange={(event) => updateForm('plannedQuantity', event.target.value)} />
                        </Field>
                        <Field label="Received Quantity">
                          <TextInput min="0" step="0.01" type="number" value={form.receivedQuantity} onChange={(event) => updateForm('receivedQuantity', event.target.value)} />
                        </Field>
                        <Field label="Used Quantity">
                          <TextInput min="0" step="0.01" type="number" value={form.usedQuantity} onChange={(event) => updateForm('usedQuantity', event.target.value)} />
                        </Field>
                        <Field label="Minimum Stock">
                          <TextInput min="0" step="0.01" type="number" value={form.minimumStock} onChange={(event) => updateForm('minimumStock', event.target.value)} />
                        </Field>
                        <Field label="Reorder Level">
                          <TextInput min="0" step="0.01" type="number" value={form.reorderLevel} onChange={(event) => updateForm('reorderLevel', event.target.value)} />
                        </Field>
                        <Field label="Wastage Allowance %">
                          <TextInput min="0" step="0.1" type="number" value={form.wastageAllowancePercent} onChange={(event) => updateForm('wastageAllowancePercent', event.target.value)} />
                        </Field>
                      </div>
                    </section>

                    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <SectionTitle icon={ShieldCheck} eyebrow="Quality" title="Storage, Batch and Inspection" />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Storage Location">
                          <TextInput placeholder="Main store, Zone B..." value={form.storageLocation} onChange={(event) => updateForm('storageLocation', event.target.value)} />
                        </Field>
                        <Field label="Batch / Lot Number">
                          <TextInput value={form.batchNumber} onChange={(event) => updateForm('batchNumber', event.target.value)} />
                        </Field>
                        <Field label="Last Received Date">
                          <TextInput type="date" value={form.lastReceivedDate} onChange={(event) => updateForm('lastReceivedDate', event.target.value)} />
                        </Field>
                        <Field label="Quality Status">
                          <SelectInput value={form.qualityStatus} onChange={(event) => updateForm('qualityStatus', event.target.value)}>
                            <option value="pending_inspection">Pending inspection</option>
                            <option value="approved">Approved</option>
                            <option value="conditional">Conditional approval</option>
                            <option value="rejected">Rejected</option>
                          </SelectInput>
                        </Field>
                        <Field label="Inspected By">
                          <TextInput value={form.inspectedBy} onChange={(event) => updateForm('inspectedBy', event.target.value)} />
                        </Field>
                        <Field label="Inspection Date">
                          <TextInput type="date" value={form.inspectionDate} onChange={(event) => updateForm('inspectionDate', event.target.value)} />
                        </Field>
                        <Field label="Inventory Status">
                          <SelectInput value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="used">Used</option>
                            <option value="damaged">Damaged</option>
                          </SelectInput>
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Notes">
                            <TextAreaInput value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
                          </Field>
                        </div>
                      </div>
                    </section>
                    </div>
                  </div>

                  <aside className="min-h-0 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0">
                    <div className="sticky top-0 space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="muted-label">Registration Summary</p>
                      <h3 className="mt-1 text-lg font-extrabold text-ink">{form.materialName || 'New material'}</h3>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-3"><dt>Planned</dt><dd className="font-bold">{formatNumber(modalSummary.planned)} {form.unit}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Received</dt><dd className="font-bold">{formatNumber(modalSummary.received)} {form.unit}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Used</dt><dd className="font-bold">{formatNumber(modalSummary.used)} {form.unit}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Remaining</dt><dd className="font-bold">{formatNumber(modalSummary.remaining)} {form.unit}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Estimated cost</dt><dd className="font-bold">{formatCurrency(modalSummary.estimatedCost)}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Inventory value</dt><dd className="font-bold">{formatCurrency(modalSummary.inventoryValue)}</dd></div>
                      </dl>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-700" size={22} />
                        <div>
                          <p className="muted-label">Storage</p>
                          <p className="font-bold text-ink">{form.storageLocation || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-700" size={22} />
                        <div>
                          <p className="muted-label">Quality</p>
                          <p className="font-bold text-ink">{qualityLabel[form.qualityStatus]}</p>
                        </div>
                      </div>
                    </div>
                    </div>
                  </aside>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
                <button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400" disabled={isSaving} onClick={closeMaterialForm} type="button">
                  Cancel
                </button>
                <button className="primary-button" disabled={isSaving} type="submit">
                  {editingMaterialId ? <Pencil size={18} /> : <PackagePlus size={18} />}
                  {isSaving ? 'Saving...' : editingMaterialId ? 'Update Material' : 'Register Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ), document.body) : null}
    </section>
  );
}
