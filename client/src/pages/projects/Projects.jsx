import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  BarChart2,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Eye,
  FileSpreadsheet,
  FileText,
  FileUp,
  HardHat,
  Info,
  Layers3,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { ROLES } from '../../config/roles.js';
import { api, apiErrorMessage, getSessionUser } from '../../services/api.js';

// ─────────────────────────────────────────────
// Static defaults
// ─────────────────────────────────────────────

const defaultPhases = [
  { name: 'Phase 1 - Preliminaries & Site Setup', startDate: '2026-07-07', endDate: '2026-07-11', progress: 0, description: 'Site clearing, temporary store, utilities, setting out and permits.' },
  { name: 'Phase 2 - Excavation & Earthworks', startDate: '2026-07-14', endDate: '2026-07-18', progress: 0, description: 'Strip foundation excavation, septic/soakaway excavation and backfill.' },
  { name: 'Phase 3-4 - Foundation & Ground Slab', startDate: '2026-07-21', endDate: '2026-08-01', progress: 0, description: 'DPM, anti-termite treatment, foundation concrete, masonry and slab.' },
  { name: 'Phase 4-5 - Walling & Masonry', startDate: '2026-08-04', endDate: '2026-08-22', progress: 0, description: 'External/internal blocks, mortar, ties, vents and scaffolding.' },
  { name: 'Phase 5-6 - Lintels, Columns & Ring Beam', startDate: '2026-08-18', endDate: '2026-08-29', progress: 0, description: 'Rebar, formwork, lintels, columns and ring beam.' },
  { name: 'Phase 6 - Electrical & Plumbing First Fix', startDate: '2026-08-25', endDate: '2026-09-05', progress: 0, description: 'Conduits, boxes, water pipes, waste pipes and soil pipes.' },
  { name: 'Phase 7 - Roofing Works', startDate: '2026-09-01', endDate: '2026-09-12', progress: 0, description: 'Trusses, purlins, sheets, flashings, gutters and insulation.' },
  { name: 'Phase 8 - Plastering', startDate: '2026-09-08', endDate: '2026-09-26', progress: 0, description: 'Internal plaster, external plaster and floor screed.' },
  { name: 'Phase 9 - Doors, Windows & Metal Works', startDate: '2026-09-15', endDate: '2026-09-26', progress: 0, description: 'Doors, frames, locks, windows and burglar proofing.' },
  { name: 'Phase 10 - Tiling & Ceiling', startDate: '2026-09-22', endDate: '2026-10-10', progress: 0, description: 'Floor tiles, wall tiles, adhesive, grout, ceiling and joinery.' },
  { name: 'Phase 11 - Plumbing & Electrical Second Fix', startDate: '2026-10-05', endDate: '2026-10-17', progress: 0, description: 'Sanitary ware, DB, sockets, switches, lights, pump and testing.' },
  { name: 'Phase 12 - Painting & Decoration', startDate: '2026-10-13', endDate: '2026-10-24', progress: 0, description: 'Primer, paint, putty, filler and painting accessories.' },
  { name: 'Phase 13 - External Works & Handover', startDate: '2026-10-20', endDate: '2026-11-03', progress: 0, description: 'Septic tank, drainage, apron, paving, landscaping and handover.' },
];

const defaultMaterials = [
  { material: 'Cement 50kg', materialCode: 'STR-001', category: 'Concrete and Steel', supplier: 'Kigali Cement Supply', unit: 'Bag', plannedQuantity: 650, unitCost: 14000, estimatedCost: 9100000, specification: 'Concrete, mortar and plaster use', plannedPhase: 'Week 3-12', priority: 'critical' },
  { material: 'River sand', materialCode: 'STR-002', category: 'Concrete and Steel', supplier: 'Volcano Aggregates', unit: 'm3', plannedQuantity: 55, unitCost: 45000, estimatedCost: 2475000, specification: 'Concrete, mortar and plaster', plannedPhase: 'Week 3-12', priority: 'critical' },
  { material: 'Aggregate/gravel 20mm', materialCode: 'STR-003', category: 'Concrete and Steel', supplier: 'Volcano Aggregates', unit: 'm3', plannedQuantity: 45, unitCost: 55000, estimatedCost: 2475000, specification: '20mm aggregate for concrete', plannedPhase: 'Week 3-10', priority: 'high' },
  { material: 'Reinforcement steel Y12', materialCode: 'STR-006', category: 'Concrete and Steel', supplier: 'Steel Industries Rwanda', unit: 'Kg', plannedQuantity: 1300, unitCost: 2400, estimatedCost: 3120000, specification: 'Beams and columns', plannedPhase: 'Week 3-8', priority: 'critical' },
  { material: 'External wall blocks 200mm', materialCode: 'MAS-001', category: 'Masonry', supplier: 'Rwanda Clay Works', unit: 'Pc', plannedQuantity: 1700, unitCost: 900, estimatedCost: 1530000, specification: 'Concrete blocks', plannedPhase: 'Week 5-7', priority: 'critical' },
  { material: 'Internal wall blocks 150/115mm', materialCode: 'MAS-002', category: 'Masonry', supplier: 'Rwanda Clay Works', unit: 'Pc', plannedQuantity: 2500, unitCost: 750, estimatedCost: 1875000, specification: 'Concrete blocks', plannedPhase: 'Week 5-7', priority: 'critical' },
  { material: 'Roofing sheets', materialCode: 'ROF-003', category: 'Roofing', supplier: 'Huye Hardware', unit: 'm2', plannedQuantity: 165, unitCost: 18000, estimatedCost: 2970000, specification: 'Pre-painted iron sheets, 0.45mm+', plannedPhase: 'Week 10', priority: 'critical' },
  { material: 'Electrical conduits', materialCode: 'ELE-003', category: 'Electrical', supplier: 'Power Systems Rwanda', unit: 'm', plannedQuantity: 500, unitCost: 800, estimatedCost: 400000, specification: '20mm and 25mm PVC conduits', plannedPhase: 'Week 8-9', priority: 'normal' },
  { material: 'PPR cold water pipes', materialCode: 'PLB-001', category: 'Plumbing', supplier: 'Plumb Rwanda', unit: 'm', plannedQuantity: 120, unitCost: 3000, estimatedCost: 360000, specification: '20mm and 25mm mixed', plannedPhase: 'Week 8-13', priority: 'normal' },
  { material: 'Internal plaster', materialCode: 'FIN-001', category: 'Finishing', supplier: '', unit: 'm2', plannedQuantity: 520, unitCost: 7000, estimatedCost: 3640000, specification: 'Cement-sand plaster', plannedPhase: 'Week 10-12', priority: 'normal' },
];

const defaultEquipment = [
  { name: 'Concrete Mixer (300L)', type: 'Mixing Plant', unit: 'Day', unitRate: 35, duration: 30, ownership: 'Rental' },
  { name: 'Scaffolding System (Full Set)', type: 'Temporary Works', unit: 'Month', unitRate: 150, duration: 3, ownership: 'Rental' },
  { name: 'Bar Bending Machine', type: 'Fabrication', unit: 'Day', unitRate: 25, duration: 20, ownership: 'Rental' },
  { name: 'Water Pump (2")', type: 'Dewatering', unit: 'Day', unitRate: 15, duration: 15, ownership: 'Rental' },
];

const defaultLabor = [
  { trade: 'Mason (Skilled)', skillLevel: 'Skilled', workers: 4, targetDays: 60, dailyRate: 25 },
  { trade: 'Carpenter', skillLevel: 'Skilled', workers: 2, targetDays: 30, dailyRate: 22 },
  { trade: 'General Helper / Labourer', skillLevel: 'Unskilled', workers: 6, targetDays: 90, dailyRate: 12 },
  { trade: 'Steel Fixer', skillLevel: 'Skilled', workers: 2, targetDays: 20, dailyRate: 20 },
  { trade: 'Electrician (Certified)', skillLevel: 'Specialist', workers: 1, targetDays: 25, dailyRate: 35 },
  { trade: 'Plumber (Certified)', skillLevel: 'Specialist', workers: 1, targetDays: 20, dailyRate: 35 },
];

const defaultProjectForm = {
  projectName: 'Single Storey Residential House',
  projectCode: 'SRH-KGL-2026-001',
  clientName: 'Private Client - Kigali',
  clientPhone: '+250 788 100 200',
  clientEmail: 'client@residentialrw.rw',
  contractRef: 'CTR-2026-SRHR-001',
  location: 'Kigali, Rwanda',
  projectType: 'Residential',
  currency: 'RWF',
  priority: 'High',
  projectStatus: 'planning',
  budget: 141885000,
  startDate: '2026-07-07',
  deadline: '2026-11-03',
  siteEngineer: 'Mukamana Claudine',
  projectManager: 'Hakizimana Pierre',
  totalBuiltArea: 130.3,
  internalFloorArea: 118.3,
  frontPorchArea: 8,
  rearVerandaArea: 4,
  floors: 1,
  bedrooms: 4,
  bathrooms: 2,
  roofType: 'Timber or light steel roof frame with pre-painted iron sheets',
  structureType: 'Reinforced concrete frame with concrete block masonry',
  wallThicknessExternal: 230,
  wallThicknessInternal: 115,
  drawingRef: 'A-01 Floor Plan 1:100, May 2024',
  thumbnailUrl: '/images/kigali-residential-floorplan.svg',
  description: 'Single-storey residential house with master bedroom and ensuite, three additional bedrooms, shared bathroom, open living and dining room, kitchen, front porch and rear service veranda.',
};

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'bg-slate-100 text-slate-700' },
  { value: 'on_track', label: 'On Track', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'delayed', label: 'Delayed', color: 'bg-amber-50 text-amber-700' },
  { value: 'at_risk', label: 'At Risk', color: 'bg-red-50 text-red-700' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-50 text-blue-700' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-purple-50 text-purple-700' },
];

const MATERIAL_CATEGORIES = ['Site Setup', 'Earthworks and Foundation', 'Concrete and Steel', 'Masonry', 'Roofing', 'Doors and Windows', 'Plumbing', 'Electrical', 'Finishing', 'Painting', 'External Works', 'Labour', 'Tools and PPE', 'Other'];

const EQUIPMENT_TYPES = [
  'Mixing Plant',
  'Temporary Works',
  'Earthmoving',
  'Lifting',
  'Fabrication',
  'Dewatering',
  'Transport',
  'Safety',
  'Other',
];

const OWNERSHIP_OPTIONS = ['Rental', 'Owned', 'Hire-Purchase'];

const DURATION_UNITS = ['Day', 'Week', 'Month'];

const SKILL_LEVELS = ['Specialist', 'Skilled', 'Semi-skilled', 'Unskilled'];

// ─────────────────────────────────────────────
// Normalizers
// ─────────────────────────────────────────────

const normalizeProject = (project) => ({
  id: project.id != null ? project.id : null,
  name: project.projectName || project.name || 'Unnamed Project',
  location: project.location || '',
  progress: Number(project.progress || 0),
  budget: Number(project.budget || 0),
  spent: Number(project.spent || 0),
  currency: project.currency || 'USD',
  status: String(project.status || 'planning').replace('_', ' '),
  priority: project.priority ? (project.priority.charAt(0).toUpperCase() + project.priority.slice(1).toLowerCase()) : 'Medium',
  startDate: project.startDate || '',
  deadline: project.deadline || '',
  phaseCount: project.ProjectPhases?.length || 0,
  materialCount: project.Materials?.length || 0,
  documentCount: project.ProjectDocuments?.length || 0,
  workerCount: project.ProjectAssignments?.length || 0,
  thumbnailUrl: project.thumbnailUrl || project.ProjectDocuments?.find((doc) => doc.category === 'blueprint' || doc.drawingType === 'architectural')?.url || '',
  totalBuiltArea: Number(project.totalBuiltArea || project.floorArea || 0),
  bedrooms: Number(project.bedrooms || 0),
  bathrooms: Number(project.bathrooms || 0),
});

const normalizeWorker = (worker) => ({
  id: worker.id || worker.name,
  name: worker.User?.fullName || worker.fullName || worker.name,
  role: worker.position || worker.role || 'Worker',
});

const money = (value, currency = 'USD') => {
  const number = Number(value || 0);
  if (currency === 'RWF') return `RWF ${number.toLocaleString()}`;
  return `$${number.toLocaleString()}`;
};

// ─────────────────────────────────────────────
// Reusable UI primitives
// ─────────────────────────────────────────────

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon ? <Icon size={16} className="text-slate-400" /> : null}
        {label}
      </span>
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

function SelectInput({ className, ...props }) {
  return (
    <select
      {...props}
      className={`rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className || 'w-full'}`}
    />
  );
}

function StatusBadge({ status }) {
  const option =
    STATUS_OPTIONS.find((s) => s.value === status?.toLowerCase().replace(' ', '_')) ||
    STATUS_OPTIONS[0];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${option.color}`}>
      {option.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    High: 'bg-red-50 text-red-700',
    Medium: 'bg-amber-50 text-amber-700',
    Low: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colors[priority] || colors.Medium}`}>
      {priority}
    </span>
  );
}

function InfoNote({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-700">
      <Info size={15} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function Projects() {
  const currentUser = getSessionUser();
  const canManageProjects = currentUser?.role === ROLES.PROJECT_MANAGER;
  const canUpdateProgress = [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN].includes(currentUser?.role);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [projectForm, setProjectForm] = useState(defaultProjectForm);
  const [phases, setPhases] = useState(defaultPhases);
  const [materials, setMaterials] = useState(defaultMaterials);
  const [equipment, setEquipment] = useState(defaultEquipment);
  const [labor, setLabor] = useState(defaultLabor);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [rawProjects, setRawProjects] = useState([]); // full API data for instant detail/edit
  const [workerOptions, setWorkerOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // project id pending delete
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [viewingProject, setViewingProject] = useState(null); // full project data for detail modal

  // ── Load workspace data ──────────────────────
  const loadAllProjects = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data: projects } = await api.get('/projects');
      const arr = Array.isArray(projects) ? projects : [];
      setRawProjects(arr);
      setSavedProjects(arr.map(normalizeProject));
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || 'Could not connect to server.');
      setSavedProjects([]);
      setRawProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadWorkspace() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [projectsResult, workersResult] = await Promise.allSettled([
          api.get('/projects'),
          api.get('/workers'),
        ]);

        if (projectsResult.status === 'fulfilled') {
          const arr = Array.isArray(projectsResult.value.data) ? projectsResult.value.data : [];
          setRawProjects(arr);
          setSavedProjects(arr.map(normalizeProject));
        } else {
          const msg = projectsResult.reason?.response?.data?.message || projectsResult.reason?.message || 'Could not load projects.';
          setLoadError(msg);
          setSavedProjects([]);
          setRawProjects([]);
        }

        if (workersResult.status === 'fulfilled') {
          const normalizedWorkers = Array.isArray(workersResult.value.data) ? workersResult.value.data.map(normalizeWorker) : [];
          setWorkerOptions(normalizedWorkers);
          setSelectedWorkerIds(normalizedWorkers.slice(0, 2).map((w) => w.id));
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspace();
  }, []);

  // ── Derived values ───────────────────────────

  const totalMaterialCost = useMemo(
    () => materials.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0),
    [materials],
  );

  const totalEquipmentCost = useMemo(
    () => equipment.reduce((sum, e) => sum + Number(e.duration || 0) * Number(e.unitRate || 0), 0),
    [equipment],
  );

  const totalLaborCost = useMemo(
    () =>
      labor.reduce(
        (sum, l) =>
          sum + Number(l.workers || 0) * Number(l.targetDays || 0) * Number(l.dailyRate || 0),
        0,
      ),
    [labor],
  );

  const grandBoqTotal = useMemo(
    () => totalMaterialCost + totalEquipmentCost + totalLaborCost,
    [totalMaterialCost, totalEquipmentCost, totalLaborCost],
  );

  const boqBudgetDiff = useMemo(
    () => grandBoqTotal - Number(projectForm.budget || 0),
    [grandBoqTotal, projectForm.budget],
  );

  const avgPhaseProgress = useMemo(() => {
    if (!phases.length) return 0;
    return Math.round(
      phases.reduce((sum, p) => sum + Number(p.progress || 0), 0) / phases.length,
    );
  }, [phases]);

  const filteredProjects = useMemo(() => {
    return savedProjects.filter((project) => {
      const matchesSearch =
        projectSearch === '' ||
        project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        project.location.toLowerCase().includes(projectSearch.toLowerCase());
      const matchesStatus =
        projectStatusFilter === 'all' ||
        project.status.toLowerCase().replace(' ', '_') === projectStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [savedProjects, projectSearch, projectStatusFilter]);

  const projectDuration = useMemo(() => {
    if (!projectForm.startDate || !projectForm.deadline) return null;
    const start = new Date(projectForm.startDate);
    const end = new Date(projectForm.deadline);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;
    return days < 30 ? `${days} days` : `${Math.round(days / 30)} months`;
  }, [projectForm.startDate, projectForm.deadline]);

  // ── Event handlers ───────────────────────────

  const handleProjectChange = (field, value) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  const handleFiles = (event) => {
    const uploadedFiles = Array.from(event.target.files || []).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setDocuments((current) => [...current, ...uploadedFiles]);
    event.target.value = '';
  };

  // Phases
  const updatePhase = (index, field, value) => {
    setPhases((current) =>
      current.map((phase, i) => (i === index ? { ...phase, [field]: value } : phase)),
    );
  };

  const addPhase = () => {
    setPhases((current) => [
      ...current,
      { name: '', startDate: projectForm.startDate, endDate: projectForm.deadline, progress: 0 },
    ]);
  };

  const removePhase = (index) => {
    setPhases((current) => current.filter((_, i) => i !== index));
  };

  // Materials
  const updateMaterial = (index, field, value) => {
    setMaterials((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // auto-recalc estimated cost when unitCost or plannedQuantity changes
        if (field === 'unitCost' || field === 'plannedQuantity') {
          const qty = field === 'plannedQuantity' ? Number(value || 0) : Number(updated.plannedQuantity || 0);
          const cost = field === 'unitCost' ? Number(value || 0) : Number(updated.unitCost || 0);
          updated.estimatedCost = parseFloat((qty * cost).toFixed(2));
        }
        return updated;
      }),
    );
  };

  const addMaterial = () => {
    setMaterials((current) => [
      ...current,
      { material: '', category: 'Structural', supplier: '', unit: 'Pcs', plannedQuantity: 0, unitCost: 0, estimatedCost: 0 },
    ]);
  };

  const removeMaterial = (index) => {
    setMaterials((current) => current.filter((_, i) => i !== index));
  };

  // Equipment
  const updateEquipment = (index, field, value) => {
    setEquipment((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addEquipment = () => {
    setEquipment((current) => [
      ...current,
      { name: '', type: 'Mixing Plant', unit: 'Day', unitRate: 0, duration: 0, ownership: 'Rental' },
    ]);
  };

  const removeEquipment = (index) => {
    setEquipment((current) => current.filter((_, i) => i !== index));
  };

  // Labor
  const updateLabor = (index, field, value) => {
    setLabor((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLabor = () => {
    setLabor((current) => [
      ...current,
      { trade: '', skillLevel: 'Skilled', workers: 1, targetDays: 1, dailyRate: 0 },
    ]);
  };

  const removeLabor = (index) => {
    setLabor((current) => current.filter((_, i) => i !== index));
  };

  // Workers
  const toggleWorker = (id) => {
    setSelectedWorkerIds((current) =>
      current.includes(id) ? current.filter((wid) => wid !== id) : [...current, id],
    );
  };

  const startEditProject = (projectId) => {
    const data = rawProjects.find((p) => p.id === projectId);
    if (!data) { setStatus({ type: 'error', message: 'Project not found.' }); return; }
    setStatus(null);
    setProjectForm({
      projectName: data.projectName || '',
      projectCode: data.projectCode || '',
      clientName: data.clientName || '',
      clientPhone: data.clientPhone || '',
      clientEmail: data.clientEmail || '',
      contractRef: data.contractRef || '',
      location: data.location || '',
      projectType: data.projectType || 'Residential',
      currency: data.currency || 'USD',
      priority: data.priority ? (data.priority.charAt(0).toUpperCase() + data.priority.slice(1).toLowerCase()) : 'Medium',
      projectStatus: data.status || 'planning',
      budget: data.budget || '',
      startDate: data.startDate || '',
      deadline: data.deadline || '',
      siteEngineer: data.siteEngineer || '',
      projectManager: data.projectManager || '',
      totalBuiltArea: data.totalBuiltArea || data.floorArea || '',
      internalFloorArea: data.internalFloorArea || '',
      frontPorchArea: data.frontPorchArea || '',
      rearVerandaArea: data.rearVerandaArea || '',
      floors: data.floors || '',
      bedrooms: data.bedrooms || '',
      bathrooms: data.bathrooms || '',
      roofType: data.roofType || '',
      structureType: data.structureType || data.structure || '',
      wallThicknessExternal: data.wallThicknessExternal || '',
      wallThicknessInternal: data.wallThicknessInternal || '',
      drawingRef: data.drawingRef || '',
      thumbnailUrl: data.thumbnailUrl || '',
      description: data.description || '',
    });
    if (Array.isArray(data.ProjectPhases) && data.ProjectPhases.length > 0) {
      setPhases(data.ProjectPhases.map((phase) => ({
        name: phase.name || '',
        startDate: phase.startDate || '',
        endDate: phase.endDate || '',
        progress: Number(phase.progress || 0),
        description: phase.description || '',
      })));
    }
    if (Array.isArray(data.ProjectAssignments)) {
      setSelectedWorkerIds(data.ProjectAssignments.map((a) => a.workerId || a.Worker?.id).filter(Boolean));
    }
    if (Array.isArray(data.ProjectDocuments) && data.ProjectDocuments.length > 0) {
      setDocuments(data.ProjectDocuments.map((doc) => ({
        name: doc.originalName || doc.fileName || 'document',
        size: doc.size || 0,
        url: doc.url || null,
        id: doc.id,
        // no `file` property = already uploaded, not pending
      })));
    } else {
      setDocuments([]);
    }
    setEditingProjectId(projectId);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setView('list');
    resetForm();
  };

  const viewProjectDetail = (projectId) => {
    const data = rawProjects.find((p) => p.id === projectId);
    setViewingProject(data || null);
  };

  // Reset form to the house baseline so a new project starts from the supplied plan.
  const resetForm = () => {
    setProjectForm(defaultProjectForm);
    setPhases(defaultPhases);
    setMaterials(defaultMaterials);
    setEquipment([{ name: '', type: 'Mixing Plant', unit: 'Day', unitRate: 0, duration: 0, ownership: 'Rental' }]);
    setLabor([{ trade: '', skillLevel: 'Skilled', workers: 1, targetDays: 1, dailyRate: 0 }]);
    setSelectedWorkerIds(workerOptions.slice(0, 2).map((w) => w.id));
    setDocuments([]);
    setStatus(null);
  };

  // Refresh saved projects list
  const refreshProjects = async () => {
    await loadAllProjects();
  };

  const updatePhaseProgress = async (projectId, phaseId, progressValue) => {
    const progress = Math.max(0, Math.min(100, Number(progressValue)));
    const phaseStatus = progress >= 100 ? 'completed' : progress > 0 ? 'active' : 'planned';
    setStatus(null);
    try {
      const { data: updatedPhase } = await api.patch(`/projects/${projectId}/phases/${phaseId}`, {
        progress,
        status: phaseStatus,
      });
      setViewingProject((current) => current ? {
        ...current,
        ProjectPhases: current.ProjectPhases.map((phase) => phase.id === phaseId ? { ...phase, ...updatedPhase } : phase),
      } : current);
      await refreshProjects();
      setStatus({ type: 'success', message: `Phase progress recorded at ${progress}%.` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  // Save (create or update) project + materials + equipment + labor + documents
  const saveProject = async () => {
    setIsSaving(true);
    setStatus(null);

    try {
      const projectPayload = {
        ...projectForm,
        budget: Number(projectForm.budget || 0),
        status: projectForm.projectStatus || 'planning',
        progress: avgPhaseProgress,
        phases: phases
          .filter((phase) => phase.name)
          .map((phase) => ({ ...phase, progress: Number(phase.progress || 0) })),
        workerIds: selectedWorkerIds,
      };

      if (editingProjectId) {
        await api.put(`/projects/${editingProjectId}`, projectPayload);
        const newFiles = documents.filter((doc) => doc.file);
        if (newFiles.length > 0) {
          const formData = new FormData();
          newFiles.forEach((doc) => formData.append('documents', doc.file));
          formData.append('category', 'blueprint');
          await api.post(`/projects/${editingProjectId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        await refreshProjects();
        setEditingProjectId(null);
        setView('list');
        resetForm();
        setStatus({ type: 'success', message: `"${projectForm.projectName}" updated successfully.` });
        setIsSaving(false);
        return;
      }

      const { data: project } = await api.post('/projects', projectPayload);

      const materialRows = materials.filter((item) => item.material);
      const equipmentRows = equipment.filter((e) => e.name);
      const laborRows = labor.filter((l) => l.trade);

      const materialSaves = materialRows.map((item) =>
        api.post('/materials', {
          projectId: project.id,
          materialCode: item.materialCode || '',
          materialName: item.material,
          category: item.category,
          specification: item.specification || '',
          unit: item.unit,
          plannedQuantity: Number(item.plannedQuantity || 0),
          unitCost: Number(item.unitCost || 0),
          estimatedCost: Number(item.estimatedCost || 0),
          supplier: item.supplier || '',
          plannedPhase: item.plannedPhase || '',
          priority: item.priority || 'normal',
          bomStatus: 'planned',
          notes: item.supplier ? `Supplier: ${item.supplier}` : undefined,
        }),
      );

      const equipmentSaves = equipmentRows.map((e) =>
        api.post('/materials', {
          projectId: project.id,
          materialName: e.name,
          category: 'Equipment',
          unit: e.unit,
          plannedQuantity: Number(e.duration || 0),
          unitCost: Number(e.unitRate || 0),
          estimatedCost: Number(e.duration || 0) * Number(e.unitRate || 0),
          notes: `Type: ${e.type} | ${e.ownership}`,
        }),
      );

      const laborSaves = laborRows.map((l) =>
        api.post('/materials', {
          projectId: project.id,
          materialName: l.trade,
          category: 'Labor',
          unit: 'Worker-Day',
          plannedQuantity: Number(l.workers || 0) * Number(l.targetDays || 0),
          unitCost: Number(l.dailyRate || 0),
          estimatedCost: Number(l.workers || 0) * Number(l.targetDays || 0) * Number(l.dailyRate || 0),
          notes: `${l.workers} workers × ${l.targetDays} days | ${l.skillLevel}`,
        }),
      );

      await Promise.all([...materialSaves, ...equipmentSaves, ...laborSaves]);

      const filesToUpload = documents.filter((doc) => doc.file);
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((doc) => formData.append('documents', doc.file));
        formData.append('category', 'blueprint');
        await api.post(`/projects/${project.id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await refreshProjects();
      setView('list');

      const totalBoqItems = materialRows.length + equipmentRows.length + laborRows.length;
      setStatus({
        type: 'success',
        message: `"${projectForm.projectName}" saved with ${phases.filter((p) => p.name).length} phases, ${totalBoqItems} BOQ items (${materialRows.length} materials, ${equipmentRows.length} equipment, ${laborRows.length} labor) and ${selectedWorkerIds.length} workers assigned.`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (projectId) => {
    setStatus(null);
    setDeleteConfirm(null);

    try {
      await api.delete(`/projects/${projectId}`);
      await refreshProjects();
      setStatus({ type: 'success', message: 'Project deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <section className="page-shell">
      {/* ── Page Header ── */}
      <PageHeader
        eyebrow={view === 'list' ? 'Projects Overview' : editingProjectId ? 'Edit Project' : 'New Project'}
        title={view === 'list' ? 'All Projects' : editingProjectId ? `Editing: ${projectForm.projectName || 'Project'}` : 'Register New Project'}
        description={
          view === 'list'
            ? 'View, manage and track all construction projects. Click a project to see full details.'
            : 'Enter the approved project plan as a digital baseline. Record BOQ materials, equipment, labor, construction phases and design documents.'
        }
        action={canManageProjects ? (
          <div className="flex items-center gap-3">
            {view === 'list' ? (
              <button
                className="primary-button"
                onClick={() => { resetForm(); setView('form'); }}
                type="button"
              >
                <Plus size={18} /> New Project
              </button>
            ) : (
              <>
                <button
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  onClick={cancelEditProject}
                  type="button"
                >
                  <X size={16} /> {editingProjectId ? 'Cancel Edit' : 'Back to Projects'}
                </button>
                <button
                  className="primary-button"
                  disabled={isSaving}
                  onClick={saveProject}
                  type="button"
                >
                  {editingProjectId ? <Pencil size={18} /> : <Save size={18} />}
                  {isSaving ? 'Saving...' : editingProjectId ? 'Update Project' : 'Save Project'}
                </button>
              </>
            )}
          </div>
        ) : null}
      />

      {/* ── Status banner ── */}
      {status && (
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
          )}
          <span>{status.message}</span>
          <button
            className="ml-auto shrink-0 opacity-60 hover:opacity-100"
            onClick={() => setStatus(null)}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Edit mode banner ── */}
      {editingProjectId && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 shadow-sm">
          <Pencil size={16} className="shrink-0 text-blue-600" />
          <span>Editing project — update the details below and click <strong>Update Project</strong> to save. BOQ materials are managed from the Materials page.</span>
          <button className="ml-auto shrink-0 text-blue-600 hover:text-blue-900" onClick={cancelEditProject} type="button"><X size={16} /></button>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {canManageProjects && deleteConfirm && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle size={18} className="text-amber-600" />
            Delete this project? This action cannot be undone.
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              onClick={() => setDeleteConfirm(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              onClick={() => deleteProject(deleteConfirm)}
              type="button"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* LIST VIEW                                  */}
      {/* ══════════════════════════════════════════ */}
      {view === 'list' && (
        <div className="space-y-5">
          {/* Search & filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm min-w-[200px]">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search projects by name or location..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
              {projectSearch && (
                <button onClick={() => setProjectSearch('')} type="button">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              onClick={refreshProjects}
              type="button"
              title="Reload projects from server"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <SelectInput
              className="w-44"
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </SelectInput>
            <span className="text-sm font-semibold text-slate-500">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Summary stat row */}
          {savedProjects.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total Projects', value: savedProjects.length, icon: Building2, color: 'text-blue-700 bg-blue-50' },
                { label: 'Active', value: savedProjects.filter(p => ['on track', 'on_track', 'active'].includes(p.status?.toLowerCase())).length, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
                { label: 'At Risk / Delayed', value: savedProjects.filter(p => ['at risk', 'at_risk', 'delayed'].includes(p.status?.toLowerCase())).length, icon: AlertTriangle, color: 'text-amber-700 bg-amber-50' },
                { label: 'Total Budget', value: `$${savedProjects.reduce((s, p) => s + p.budget, 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-700 bg-purple-50' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="text-lg font-extrabold text-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Project cards grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <RefreshCw size={36} className="mb-4 animate-spin text-blue-500" />
              <p className="text-base font-bold text-slate-500">Loading projects from database...</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-20 text-center">
              <AlertTriangle size={36} className="mb-4 text-red-400" />
              <p className="text-base font-bold text-red-700">Could not load projects</p>
              <p className="mt-1 max-w-md text-sm text-red-500">{loadError}</p>
              <button className="primary-button mt-6" onClick={loadAllProjects} type="button">
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
              <Building2 size={48} className="mb-4 text-slate-300" />
              <p className="text-lg font-extrabold text-slate-400">
                {savedProjects.length === 0 ? 'No projects yet' : 'No projects match your search'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {savedProjects.length === 0 ? 'Click "New Project" to create your first project.' : 'Try clearing the search or filter.'}
              </p>
              {savedProjects.length === 0 && canManageProjects && (
                <button className="primary-button mt-6" onClick={() => { resetForm(); setView('form'); }} type="button">
                  <Plus size={18} /> New Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <article key={project.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-blue-200">
                  {/* Card top colour bar based on status */}
                  <div className={`h-1.5 w-full ${
                    project.status?.toLowerCase().includes('complet') ? 'bg-emerald-500' :
                    project.status?.toLowerCase().includes('risk') || project.status?.toLowerCase().includes('delay') ? 'bg-amber-500' :
                    project.status?.toLowerCase().includes('track') || project.status?.toLowerCase() === 'active' ? 'bg-blue-500' :
                    'bg-slate-300'
                  }`} />

                  {project.thumbnailUrl ? (
                    <button
                      className="block aspect-[16/9] w-full overflow-hidden bg-slate-50"
                      onClick={() => viewProjectDetail(project.id)}
                      type="button"
                      aria-label={`Open ${project.name} details`}
                    >
                      <img
                        alt={`${project.name} floor plan`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        src={project.thumbnailUrl}
                      />
                    </button>
                  ) : null}

                  <div className="flex flex-1 flex-col p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-extrabold text-ink">{project.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={11} />
                          {project.location}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusBadge status={project.status} />
                        <PriorityBadge priority={project.priority} />
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500">
                        <span>Progress</span>
                        <span className="font-extrabold text-ink">{project.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            project.progress >= 80 ? 'bg-emerald-500' :
                            project.progress >= 40 ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta grid */}
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <DollarSign size={11} className="text-slate-400" />
                        {money(project.budget, project.currency)} budget
                      </span>
                      {project.spent > 0 && (
                        <span className="flex items-center gap-1 font-semibold">
                          <TrendingUp size={11} className="text-slate-400" />
                          {money(project.spent, project.currency)} spent
                        </span>
                      )}
                      {project.totalBuiltArea > 0 && (
                        <span className="flex items-center gap-1">
                          <Building2 size={11} className="text-slate-400" />
                          {project.totalBuiltArea.toLocaleString()} m2
                        </span>
                      )}
                      {(project.bedrooms > 0 || project.bathrooms > 0) && (
                        <span className="flex items-center gap-1">
                          <HardHat size={11} className="text-slate-400" />
                          {project.bedrooms || 0} bed / {project.bathrooms || 0} bath
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Layers3 size={11} className="text-slate-400" />
                        {project.phaseCount} phases
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} className="text-slate-400" />
                        {project.workerCount} workers
                      </span>
                      {(project.startDate || project.deadline) && (
                        <span className="col-span-2 flex items-center gap-1">
                          <CalendarDays size={11} className="text-slate-400" />
                          {project.startDate && project.deadline
                            ? `${project.startDate} → ${project.deadline}`
                            : project.startDate || project.deadline}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                      {project.id != null ? (
                        <>
                          <button
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                            onClick={() => viewProjectDetail(project.id)}
                            type="button"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          {canManageProjects && (
                            <>
                              <button
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                                onClick={() => startEditProject(project.id)}
                                type="button"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                className="icon-button h-8 w-8 shrink-0"
                                onClick={() => setDeleteConfirm(project.id)}
                                type="button"
                                aria-label="Delete project"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Demo data — save a real project to enable actions</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* FORM VIEW                                  */}
      {/* ══════════════════════════════════════════ */}
      {view === 'form' && (
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">

        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div className="space-y-5">

          {/* ── Step 1: Project Information ── */}
          <div className="panel-pad">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Step 1</p>
                <h3 className="text-lg font-extrabold text-ink">Project Information</h3>
              </div>
              <Building2 className="text-blue-700" size={26} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project Name" icon={Building2}>
                <TextInput
                  value={projectForm.projectName}
                  onChange={(e) => handleProjectChange('projectName', e.target.value)}
                  placeholder="e.g. Residential Building Block A"
                />
              </Field>

              <Field label="Project Code" icon={Tag}>
                <TextInput
                  value={projectForm.projectCode || ''}
                  onChange={(e) => handleProjectChange('projectCode', e.target.value)}
                  placeholder="SRH-KGL-2026-001"
                />
              </Field>

              <Field label="Client / Company" icon={ClipboardList}>
                <TextInput
                  value={projectForm.clientName}
                  onChange={(e) => handleProjectChange('clientName', e.target.value)}
                  placeholder="e.g. Kigali Heights Ltd"
                />
              </Field>

              <Field label="Client Phone" icon={Phone}>
                <TextInput
                  value={projectForm.clientPhone}
                  placeholder="+250 788 000 000"
                  onChange={(e) => handleProjectChange('clientPhone', e.target.value)}
                />
              </Field>

              <Field label="Client Email" icon={Mail}>
                <TextInput
                  type="email"
                  value={projectForm.clientEmail}
                  placeholder="client@email.com"
                  onChange={(e) => handleProjectChange('clientEmail', e.target.value)}
                />
              </Field>

              <Field label="Location" icon={MapPin}>
                <TextInput
                  value={projectForm.location}
                  onChange={(e) => handleProjectChange('location', e.target.value)}
                  placeholder="e.g. Kigali, Rwanda"
                />
              </Field>

              <Field label="Contract / Reference No." icon={Tag}>
                <TextInput
                  value={projectForm.contractRef}
                  placeholder="CTR-2026-001"
                  onChange={(e) => handleProjectChange('contractRef', e.target.value)}
                />
              </Field>

              <Field label="Project Type" icon={Layers3}>
                <SelectInput
                  value={projectForm.projectType}
                  onChange={(e) => handleProjectChange('projectType', e.target.value)}
                >
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>School</option>
                  <option>Road Construction</option>
                  <option>Warehouse</option>
                  <option>Industrial</option>
                </SelectInput>
              </Field>

              <Field label="Project Status" icon={CheckCircle2}>
                <SelectInput
                  value={projectForm.projectStatus}
                  onChange={(e) => handleProjectChange('projectStatus', e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Priority" icon={AlertTriangle}>
                <SelectInput
                  value={projectForm.priority}
                  onChange={(e) => handleProjectChange('priority', e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </SelectInput>
              </Field>

              <Field label={`Budget (${projectForm.currency || 'USD'})`} icon={FileSpreadsheet}>
                <TextInput
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => handleProjectChange('budget', e.target.value)}
                  placeholder="0"
                />
              </Field>

              <Field label="Currency" icon={DollarSign}>
                <SelectInput
                  value={projectForm.currency || 'USD'}
                  onChange={(e) => handleProjectChange('currency', e.target.value)}
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                </SelectInput>
              </Field>

              <Field label="Start Date" icon={CalendarDays}>
                <TextInput
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => handleProjectChange('startDate', e.target.value)}
                />
              </Field>

              <Field label="Deadline" icon={CalendarDays}>
                <TextInput
                  type="date"
                  value={projectForm.deadline}
                  onChange={(e) => handleProjectChange('deadline', e.target.value)}
                />
              </Field>

              <Field label="Project Manager" icon={HardHat}>
                <SelectInput
                  value={projectForm.projectManager}
                  onChange={(e) => handleProjectChange('projectManager', e.target.value)}
                >
                  {workerOptions.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} — {w.role}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Site Engineer" icon={HardHat}>
                <TextInput
                  value={projectForm.siteEngineer}
                  placeholder="Site Engineer Name"
                  onChange={(e) => handleProjectChange('siteEngineer', e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="muted-label">Building Baseline</p>
                  <h4 className="font-extrabold text-ink">House Areas and Technical Specs</h4>
                </div>
                <Layers3 className="text-blue-700" size={22} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Total Built Area (m2)">
                  <TextInput type="number" value={projectForm.totalBuiltArea || ''} onChange={(e) => handleProjectChange('totalBuiltArea', e.target.value)} />
                </Field>
                <Field label="Internal Floor Area (m2)">
                  <TextInput type="number" value={projectForm.internalFloorArea || ''} onChange={(e) => handleProjectChange('internalFloorArea', e.target.value)} />
                </Field>
                <Field label="Front Porch Area (m2)">
                  <TextInput type="number" value={projectForm.frontPorchArea || ''} onChange={(e) => handleProjectChange('frontPorchArea', e.target.value)} />
                </Field>
                <Field label="Rear Veranda Area (m2)">
                  <TextInput type="number" value={projectForm.rearVerandaArea || ''} onChange={(e) => handleProjectChange('rearVerandaArea', e.target.value)} />
                </Field>
                <Field label="Floors">
                  <TextInput type="number" value={projectForm.floors || ''} onChange={(e) => handleProjectChange('floors', e.target.value)} />
                </Field>
                <Field label="Bedrooms / Bathrooms">
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput type="number" value={projectForm.bedrooms || ''} onChange={(e) => handleProjectChange('bedrooms', e.target.value)} placeholder="Beds" />
                    <TextInput type="number" value={projectForm.bathrooms || ''} onChange={(e) => handleProjectChange('bathrooms', e.target.value)} placeholder="Baths" />
                  </div>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Structure Type">
                    <TextInput value={projectForm.structureType || ''} onChange={(e) => handleProjectChange('structureType', e.target.value)} />
                  </Field>
                </div>
                <Field label="Drawing Reference">
                  <TextInput value={projectForm.drawingRef || ''} onChange={(e) => handleProjectChange('drawingRef', e.target.value)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Roof Type">
                    <TextInput value={projectForm.roofType || ''} onChange={(e) => handleProjectChange('roofType', e.target.value)} />
                  </Field>
                </div>
                <Field label="Wall Thickness (mm)">
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput type="number" value={projectForm.wallThicknessExternal || ''} onChange={(e) => handleProjectChange('wallThicknessExternal', e.target.value)} placeholder="External" />
                    <TextInput type="number" value={projectForm.wallThicknessInternal || ''} onChange={(e) => handleProjectChange('wallThicknessInternal', e.target.value)} placeholder="Internal" />
                  </div>
                </Field>
              </div>
            </div>

            <div className="mt-4">
              <Field label="Project Description" icon={FileText}>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  value={projectForm.description}
                  onChange={(e) => handleProjectChange('description', e.target.value)}
                  placeholder="Describe the scope, objectives and key milestones of this project."
                />
              </Field>
            </div>
          </div>

          {/* ── Step 2: Blueprint & BOQ Uploads ── */}
          <div className="panel-pad">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Step 2</p>
                <h3 className="text-lg font-extrabold text-ink">Blueprint and BOQ Uploads</h3>
              </div>
              <FileUp className="text-blue-700" size={26} />
            </div>

            {projectForm.thumbnailUrl ? (
              <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img
                  alt={`${projectForm.projectName || 'Project'} floor plan`}
                  className="h-auto w-full"
                  src={projectForm.thumbnailUrl}
                />
              </div>
            ) : null}

            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50">
              <UploadCloud size={42} className="text-blue-700" />
              <span className="mt-3 text-base font-extrabold text-ink">
                Upload blueprints, BOQ, BOM or permits
              </span>
              <span className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                PDF, DWG exports, Excel BOQ sheets, images, permits and project documents. Files upload when you save.
              </span>
              <input
                className="sr-only"
                multiple
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.dwg"
                onChange={handleFiles}
              />
            </label>

            {documents.length === 0 ? (
              <p className="mt-4 text-center text-sm text-slate-400">No documents added yet.</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {documents.map((doc, index) => (
                  <div
                    key={`${doc.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          {doc.file
                            ? `${(doc.size / 1024 / 1024).toFixed(2)} MB — pending upload`
                            : doc.size > 0
                              ? `${(doc.size / 1024 / 1024).toFixed(2)} MB — saved`
                              : 'Saved on server'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="icon-button h-9 w-9"
                      onClick={async () => {
                        if (doc.id && editingProjectId) {
                          await api.delete(`/projects/${editingProjectId}/documents/${doc.id}`).catch(() => {});
                        }
                        setDocuments((current) => current.filter((_, i) => i !== index));
                      }}
                      type="button"
                      aria-label="Remove document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Step 3: Construction Phases ── */}
          <div className="panel-pad">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Step 3</p>
                <h3 className="text-lg font-extrabold text-ink">Construction Phases</h3>
              </div>
              <button className="primary-button" onClick={addPhase} type="button">
                <Plus size={18} /> Add Phase
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3 text-left">Phase</th>
                    <th className="px-4 py-3 text-left">Start</th>
                    <th className="px-4 py-3 text-left">End</th>
                    <th className="px-4 py-3 text-left">Progress</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase, index) => (
                    <tr key={`phase-${index}`}>
                      <td className="table-cell">
                        <TextInput
                          value={phase.name}
                          placeholder="e.g. Foundation"
                          onChange={(e) => updatePhase(index, 'name', e.target.value)}
                        />
                      </td>
                      <td className="table-cell">
                        <TextInput
                          type="date"
                          value={phase.startDate}
                          onChange={(e) => updatePhase(index, 'startDate', e.target.value)}
                        />
                      </td>
                      <td className="table-cell">
                        <TextInput
                          type="date"
                          value={phase.endDate}
                          onChange={(e) => updatePhase(index, 'endDate', e.target.value)}
                        />
                      </td>
                      <td className="table-cell min-w-[160px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              className="flex-1"
                              max="100"
                              min="0"
                              type="range"
                              value={phase.progress}
                              onChange={(e) => updatePhase(index, 'progress', e.target.value)}
                            />
                            <span className="w-10 text-right text-sm font-bold text-ink">
                              {phase.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                Number(phase.progress) >= 80
                                  ? 'bg-emerald-500'
                                  : Number(phase.progress) >= 40
                                  ? 'bg-blue-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <button
                          className="icon-button h-9 w-9"
                          onClick={() => removePhase(index)}
                          type="button"
                          aria-label="Remove phase"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {phases.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                <span className="font-semibold text-slate-600">Average Phase Completion</span>
                <span className="font-extrabold text-ink">{avgPhaseProgress}%</span>
              </div>
            )}
          </div>

          {/* ── Step 4: BOQ Materials ── */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Step 4</p>
                <h3 className="text-lg font-extrabold text-ink">BOQ Materials</h3>
              </div>
              <button className="primary-button" onClick={addMaterial} type="button">
                <Plus size={18} /> Add Item
              </button>
            </div>

            <InfoNote>
              Enter planned materials from your approved BOQ document. Unit Cost × Planned Quantity sets the baseline cost. The Materials module will deduct actual usage from these figures in real time.
            </InfoNote>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1060px]">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3 text-left">Material Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-left">Unit</th>
                    <th className="px-4 py-3 text-left">Unit Cost</th>
                    <th className="px-4 py-3 text-left">Planned Qty</th>
                    <th className="px-4 py-3 text-left">Est. Cost</th>
                    <th className="px-4 py-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((item, index) => (
                    <tr key={`mat-${index}`}>
                      <td className="table-cell">
                        <TextInput
                          value={item.material}
                          placeholder="e.g. Cement (50kg)"
                          onChange={(e) => updateMaterial(index, 'material', e.target.value)}
                        />
                      </td>
                      <td className="table-cell">
                        <SelectInput
                          value={item.category || 'Structural'}
                          onChange={(e) => updateMaterial(index, 'category', e.target.value)}
                        >
                          {MATERIAL_CATEGORIES.map((cat) => (
                            <option key={cat}>{cat}</option>
                          ))}
                        </SelectInput>
                      </td>
                      <td className="table-cell">
                        <TextInput
                          value={item.supplier || ''}
                          placeholder="Supplier name"
                          onChange={(e) => updateMaterial(index, 'supplier', e.target.value)}
                        />
                      </td>
                      <td className="table-cell">
                        <TextInput
                          value={item.unit}
                          placeholder="Bag / m3 / Ton"
                          onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                        />
                      </td>
                      <td className="table-cell">
                        <TextInput
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateMaterial(index, 'unitCost', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="table-cell">
                        <TextInput
                          type="number"
                          value={item.plannedQuantity}
                          onChange={(e) => updateMaterial(index, 'plannedQuantity', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="table-cell">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-bold text-ink">
                          {money(item.estimatedCost, projectForm.currency)}
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <button
                          className="icon-button h-9 w-9"
                          onClick={() => removeMaterial(index)}
                          type="button"
                          aria-label="Remove material"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {materials.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 text-sm font-bold text-ink" colSpan={6}>
                        Materials Baseline Total
                      </td>
                      <td className="px-4 py-3 text-sm font-extrabold text-ink">
                        {money(totalMaterialCost, projectForm.currency)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ── Step 5: Equipment & Plant ── */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Step 5</p>
                <h3 className="text-lg font-extrabold text-ink">Equipment &amp; Plant</h3>
              </div>
              <button className="primary-button" onClick={addEquipment} type="button">
                <Plus size={18} /> Add Equipment
              </button>
            </div>

            <InfoNote>
              Record construction plant and equipment from your BOQ or hire plan. Duration × Unit Rate gives the planned plant cost. Ownership type helps distinguish hire costs from owned asset depreciation.
            </InfoNote>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1020px]">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3 text-left">Equipment Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Ownership</th>
                    <th className="px-4 py-3 text-left">Unit</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Unit Rate (USD)</th>
                    <th className="px-4 py-3 text-left">Total Cost</th>
                    <th className="px-4 py-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item, index) => {
                    const totalCost =
                      Number(item.duration || 0) * Number(item.unitRate || 0);
                    return (
                      <tr key={`equip-${index}`}>
                        <td className="table-cell">
                          <TextInput
                            value={item.name}
                            placeholder="e.g. Concrete Mixer"
                            onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <SelectInput
                            value={item.type}
                            onChange={(e) => updateEquipment(index, 'type', e.target.value)}
                          >
                            {EQUIPMENT_TYPES.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </SelectInput>
                        </td>
                        <td className="table-cell">
                          <SelectInput
                            value={item.ownership}
                            onChange={(e) => updateEquipment(index, 'ownership', e.target.value)}
                          >
                            {OWNERSHIP_OPTIONS.map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </SelectInput>
                        </td>
                        <td className="table-cell">
                          <SelectInput
                            value={item.unit}
                            onChange={(e) => updateEquipment(index, 'unit', e.target.value)}
                          >
                            {DURATION_UNITS.map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </SelectInput>
                        </td>
                        <td className="table-cell">
                          <TextInput
                            type="number"
                            value={item.duration}
                            placeholder="0"
                            onChange={(e) => updateEquipment(index, 'duration', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <TextInput
                            type="number"
                            value={item.unitRate}
                            placeholder="0"
                            onChange={(e) => updateEquipment(index, 'unitRate', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-bold text-ink">
                            {money(totalCost, projectForm.currency)}
                          </div>
                        </td>
                        <td className="table-cell text-center">
                          <button
                            className="icon-button h-9 w-9"
                            onClick={() => removeEquipment(index)}
                            type="button"
                            aria-label="Remove equipment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {equipment.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 text-sm font-bold text-ink" colSpan={6}>
                        Equipment &amp; Plant Total
                      </td>
                      <td className="px-4 py-3 text-sm font-extrabold text-ink">
                        {money(totalEquipmentCost, projectForm.currency)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ── Step 6: Labor Requirements ── */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="muted-label">Step 6</p>
                <h3 className="text-lg font-extrabold text-ink">Labor Requirements</h3>
              </div>
              <button className="primary-button" onClick={addLabor} type="button">
                <Plus size={18} /> Add Trade
              </button>
            </div>

            <InfoNote>
              Enter planned workforce trades and crew sizes from your BOQ labor schedule. These form the baseline the AI Workforce Planning module uses to compare against actual site productivity.
            </InfoNote>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3 text-left">Trade / Role</th>
                    <th className="px-4 py-3 text-left">Skill Level</th>
                    <th className="px-4 py-3 text-left">Workers</th>
                    <th className="px-4 py-3 text-left">Target Days</th>
                    <th className="px-4 py-3 text-left">Daily Rate (USD)</th>
                    <th className="px-4 py-3 text-left">Total Cost</th>
                    <th className="px-4 py-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {labor.map((item, index) => {
                    const totalCost =
                      Number(item.workers || 0) *
                      Number(item.targetDays || 0) *
                      Number(item.dailyRate || 0);
                    return (
                      <tr key={`labor-${index}`}>
                        <td className="table-cell">
                          <TextInput
                            value={item.trade}
                            placeholder="e.g. Mason, Carpenter"
                            onChange={(e) => updateLabor(index, 'trade', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <SelectInput
                            value={item.skillLevel}
                            onChange={(e) => updateLabor(index, 'skillLevel', e.target.value)}
                          >
                            {SKILL_LEVELS.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </SelectInput>
                        </td>
                        <td className="table-cell">
                          <TextInput
                            type="number"
                            value={item.workers}
                            placeholder="0"
                            onChange={(e) => updateLabor(index, 'workers', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <TextInput
                            type="number"
                            value={item.targetDays}
                            placeholder="0"
                            onChange={(e) => updateLabor(index, 'targetDays', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <TextInput
                            type="number"
                            value={item.dailyRate}
                            placeholder="0"
                            onChange={(e) => updateLabor(index, 'dailyRate', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-bold text-ink">
                            {money(totalCost, projectForm.currency)}
                          </div>
                        </td>
                        <td className="table-cell text-center">
                          <button
                            className="icon-button h-9 w-9"
                            onClick={() => removeLabor(index)}
                            type="button"
                            aria-label="Remove labor row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {labor.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 text-sm font-bold text-ink" colSpan={5}>
                        Planned Labor Total
                      </td>
                      <td className="px-4 py-3 text-sm font-extrabold text-ink">
                        {money(totalLaborCost, projectForm.currency)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT SIDEBAR ════════════════ */}
        <aside className="space-y-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pb-5">

          {/* ── Live Project Summary ── */}
          <div className="panel-pad">
            <p className="muted-label">Live Project Summary</p>
            <div className="mt-1 flex items-start justify-between gap-2">
              <h3 className="text-2xl font-extrabold text-ink">
                {projectForm.projectName || 'New Project'}
              </h3>
              <PriorityBadge priority={projectForm.priority} />
            </div>

            {projectForm.clientName && (
              <p className="mt-1 text-sm font-semibold text-slate-500">{projectForm.clientName}</p>
            )}
            {projectForm.location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={12} />
                {projectForm.location}
              </p>
            )}
            <p className="mt-2 text-sm leading-6 text-slate-600">{projectForm.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">Budget</p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {money(projectForm.budget, projectForm.currency)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">Phase Progress</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{avgPhaseProgress}%</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${avgPhaseProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">Team Assigned</p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {selectedWorkerIds.length} workers
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">Documents</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{documents.length} files</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">Phases</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{phases.length} phases</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">BOQ Items</p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {materials.length + equipment.length + labor.length} items
                </p>
              </div>
            </div>

            {projectDuration && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
                <CalendarDays size={16} className="text-slate-400" />
                <span className="text-slate-600">
                  {projectForm.startDate} → {projectForm.deadline}
                </span>
                <span className="ml-auto font-bold text-ink">{projectDuration}</span>
              </div>
            )}

            {projectForm.siteEngineer && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
                <HardHat size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Site Engineer</p>
                  <p className="font-bold text-ink">{projectForm.siteEngineer}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── BOQ Cost Breakdown ── */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="muted-label">BOQ Cost Breakdown</p>
                <h3 className="text-lg font-extrabold text-ink">Baseline Budget</h3>
              </div>
              <BarChart2 className="text-blue-700" size={24} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <FileSpreadsheet size={15} className="text-slate-400" />
                  Materials Baseline
                </div>
                <span className="text-sm font-bold text-ink">
                  {money(totalMaterialCost, projectForm.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Wrench size={15} className="text-slate-400" />
                  Equipment &amp; Plant
                </div>
                <span className="text-sm font-bold text-ink">
                  {money(totalEquipmentCost, projectForm.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Users size={15} className="text-slate-400" />
                  Planned Labor
                </div>
                <span className="text-sm font-bold text-ink">
                  {money(totalLaborCost, projectForm.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
                  <DollarSign size={15} className="text-blue-600" />
                  Grand BOQ Total
                </div>
                <span className="text-base font-extrabold text-ink">
                  {money(grandBoqTotal, projectForm.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm font-semibold text-slate-600">Budget</span>
                <span className="text-sm font-bold text-ink">
                  {money(projectForm.budget, projectForm.currency)}
                </span>
              </div>

              {grandBoqTotal > 0 && (
                <div
                  className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                    boqBudgetDiff > 0 ? 'bg-red-50' : 'bg-emerald-50'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm font-semibold ${
                      boqBudgetDiff > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {boqBudgetDiff > 0 ? (
                      <TrendingUp size={15} />
                    ) : (
                      <TrendingDown size={15} />
                    )}
                    Variance
                  </div>
                  <span
                    className={`text-sm font-extrabold ${
                      boqBudgetDiff > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {boqBudgetDiff > 0
                      ? `+${money(boqBudgetDiff, projectForm.currency)} over`
                      : `-${money(Math.abs(boqBudgetDiff), projectForm.currency)} under`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Assign Workers ── */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="muted-label">Site Team</p>
                <h3 className="text-lg font-extrabold text-ink">Assign Workers</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {selectedWorkerIds.length} selected
                </span>
                <Users className="text-blue-700" size={22} />
              </div>
            </div>

            <div className="space-y-3">
              {workerOptions.map((worker) => {
                const checked = selectedWorkerIds.includes(worker.id);
                return (
                  <label
                    key={worker.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                      checked
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">{worker.name}</p>
                      <p className="text-xs text-slate-500">{worker.role}</p>
                    </div>
                    <input
                      checked={checked}
                      onChange={() => toggleWorker(worker.id)}
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Blueprint Preview ── */}
          <div className="panel-pad">
            <p className="muted-label">Blueprint Preview</p>
            {documents.filter((d) => /\.(pdf|dwg|png|jpg|jpeg)$/i.test(d.name)).length > 0 ? (
              <div className="mt-4 space-y-2">
                {documents
                  .filter((d) => /\.(pdf|dwg|png|jpg|jpeg)$/i.test(d.name))
                  .map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5"
                    >
                      <FileText size={18} className="text-blue-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-blue-800">{doc.name}</p>
                        <p className="text-xs text-blue-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="mt-4 aspect-[4/3] rounded-lg border border-slate-200 bg-[linear-gradient(90deg,_#dbe3ee_1px,_transparent_1px),linear-gradient(#dbe3ee_1px,_transparent_1px)] bg-[size:28px_28px] p-5">
                <div className="h-full rounded-lg border-2 border-slate-700 bg-white/75 p-4">
                  <div className="grid h-full grid-cols-3 grid-rows-3 gap-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div key={index} className="rounded border border-slate-500 bg-white/80" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick project switcher while in form view */}
          <div className="panel-pad">
            <p className="muted-label">Other Projects</p>
            <h3 className="mb-3 text-base font-extrabold text-ink">Quick Switch</h3>
            <div className="space-y-2">
              {savedProjects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition hover:bg-slate-50 ${editingProjectId === project.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                  onClick={() => startEditProject(project.id)}
                  type="button"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Building2 size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-ink">{project.name}</p>
                    <p className="truncate text-xs text-slate-500">{project.progress}% complete</p>
                  </div>
                </button>
              ))}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                onClick={cancelEditProject}
                type="button"
              >
                <Eye size={13} /> View all projects
              </button>
            </div>
          </div>
        </aside>
      </div>
      )} {/* end view === 'form' */}

      {/* ── Project Detail Modal ── */}
      {viewingProject && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950/80 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setViewingProject(null); }}>
          <div className="relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-ink px-6 py-5 text-white">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold text-ink">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project Detail</p>
                  <h2 className="text-xl font-extrabold text-white">{viewingProject.projectName}</h2>
                  <p className="mt-1 text-sm text-slate-300">{viewingProject.clientName}</p>
                </div>
              </div>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/20" onClick={() => setViewingProject(null)} type="button">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Budget', value: money(viewingProject.budget, viewingProject.currency), icon: DollarSign, tone: 'blue' },
                  { label: 'Spent', value: money(viewingProject.spent, viewingProject.currency), icon: TrendingUp, tone: 'amber' },
                  { label: 'Progress', value: `${viewingProject.progress || 0}%`, icon: BarChart2, tone: 'emerald' },
                  { label: 'Priority', value: viewingProject.priority || 'Normal', icon: Tag, tone: 'purple' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Overall Progress</span>
                  <span className="font-bold text-ink">{viewingProject.progress || 0}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-blue-600 transition-all" style={{ width: `${viewingProject.progress || 0}%` }} />
                </div>
              </div>

              {(viewingProject.thumbnailUrl || viewingProject.ProjectDocuments?.some((doc) => doc.url)) && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    alt={`${viewingProject.projectName} floor plan`}
                    className="h-auto w-full"
                    src={viewingProject.thumbnailUrl || viewingProject.ProjectDocuments.find((doc) => doc.url)?.url}
                  />
                </div>
              )}

              {(viewingProject.totalBuiltArea || viewingProject.floorArea || viewingProject.bedrooms || viewingProject.roofType || viewingProject.structureType) && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" />
                    <h3 className="font-extrabold text-ink">House Baseline</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: 'Built Area', value: viewingProject.totalBuiltArea || viewingProject.floorArea ? `${viewingProject.totalBuiltArea || viewingProject.floorArea} m2` : '' },
                      { label: 'Internal Area', value: viewingProject.internalFloorArea ? `${viewingProject.internalFloorArea} m2` : '' },
                      { label: 'Bedrooms', value: viewingProject.bedrooms },
                      { label: 'Bathrooms', value: viewingProject.bathrooms },
                      { label: 'Floors', value: viewingProject.floors },
                      { label: 'External Wall', value: viewingProject.wallThicknessExternal ? `${viewingProject.wallThicknessExternal} mm` : '' },
                      { label: 'Internal Wall', value: viewingProject.wallThicknessInternal ? `${viewingProject.wallThicknessInternal} mm` : '' },
                      { label: 'Drawing Ref', value: viewingProject.drawingRef },
                    ].filter((item) => item.value || item.value === 0).map((item) => (
                      <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">{item.label}</p>
                        <p className="mt-1 text-sm font-extrabold text-ink">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {viewingProject.structureType && (
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">Structure</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{viewingProject.structureType}</p>
                      </div>
                    )}
                    {viewingProject.roofType && (
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">Roof</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{viewingProject.roofType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project info grid */}
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                {[
                  { label: 'Location', value: viewingProject.location, icon: MapPin },
                  { label: 'Contract Ref', value: viewingProject.contractRef, icon: FileText },
                  { label: 'Project Manager', value: viewingProject.projectManager, icon: HardHat },
                  { label: 'Site Engineer', value: viewingProject.siteEngineer, icon: Wrench },
                  { label: 'Start Date', value: viewingProject.startDate, icon: CalendarDays },
                  { label: 'Deadline', value: viewingProject.deadline, icon: CalendarDays },
                  { label: 'Client Phone', value: viewingProject.clientPhone, icon: Phone },
                  { label: 'Client Email', value: viewingProject.clientEmail, icon: Mail },
                ].filter(item => item.value).map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-2 text-sm">
                    <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-400">{label}</p>
                      <p className="font-semibold text-ink">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {viewingProject.description && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="mb-1 text-xs font-bold text-slate-500">Description</p>
                  {viewingProject.description}
                </div>
              )}

              {Array.isArray(viewingProject.ProjectDocuments) && viewingProject.ProjectDocuments.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-extrabold text-ink">
                    <FileText size={16} className="text-blue-600" /> Drawings and Documents ({viewingProject.ProjectDocuments.length})
                  </h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {viewingProject.ProjectDocuments.map((doc) => (
                      <a
                        key={doc.id || doc.url}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm transition hover:border-blue-300 hover:bg-blue-50"
                        href={doc.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{doc.drawingTitle || doc.originalName || doc.fileName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {[doc.drawingType, doc.drawingNumber, doc.revisionNumber || doc.category].filter(Boolean).join(' | ')}
                          </p>
                        </div>
                        <FileText size={16} className="shrink-0 text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Phases */}
              {Array.isArray(viewingProject.ProjectPhases) && viewingProject.ProjectPhases.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-extrabold text-ink">
                    <Layers3 size={16} className="text-blue-600" /> Construction Phases ({viewingProject.ProjectPhases.length})
                  </h3>
                  <div className="space-y-2">
                    {viewingProject.ProjectPhases.map((phase) => {
                      const statusColor = phase.status === 'completed' ? 'bg-emerald-500' : phase.status === 'active' ? 'bg-blue-600' : 'bg-slate-300';
                      return (
                        <div key={phase.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-ink">{phase.name}</p>
                              <p className="text-xs text-slate-500">{phase.startDate} → {phase.endDate}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${phase.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : phase.status === 'active' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                              {phase.status || 'planned'}
                            </span>
                            <span className="w-10 shrink-0 text-right text-sm font-extrabold text-ink">{phase.progress || 0}%</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-1.5 rounded-full transition-all ${statusColor}`} style={{ width: `${phase.progress || 0}%` }} />
                          </div>
                          {canUpdateProgress && (
                            <label className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-600">
                              Record progress
                              <select
                                className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-blue-400"
                                value={Number(phase.progress || 0)}
                                onChange={(event) => updatePhaseProgress(viewingProject.id, phase.id, event.target.value)}
                              >
                                {[0, 10, 25, 50, 75, 90, 100].map((value) => <option key={value} value={value}>{value}%</option>)}
                              </select>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assigned Workers */}
              {Array.isArray(viewingProject.ProjectAssignments) && viewingProject.ProjectAssignments.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-extrabold text-ink">
                    <Users size={16} className="text-blue-600" /> Assigned Workers ({viewingProject.ProjectAssignments.length})
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {viewingProject.ProjectAssignments.map((assignment) => {
                      const name = assignment.Worker?.User?.fullName || assignment.Worker?.fullName || `Worker #${assignment.workerId}`;
                      const role = assignment.role || assignment.Worker?.position || '';
                      return (
                        <div key={assignment.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-blue-700">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink">{name}</p>
                            <p className="text-xs text-slate-500">{role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BOQ vs Actual Comparison */}
              {Array.isArray(viewingProject.Materials) && viewingProject.Materials.length > 0 && (() => {
                const mats = viewingProject.Materials;
                const totalPlanned = mats.reduce((s, m) => s + Number(m.estimatedCost || 0), 0);
                const totalActual = mats.reduce((s, m) => s + Number(m.actualCost || 0), 0);
                const overItems = mats.filter((m) => {
                  const pq = Number(m.plannedQuantity || 0);
                  const uq = Number(m.usedQuantity || 0);
                  return pq > 0 && uq > pq;
                });
                const onTrackItems = mats.filter((m) => {
                  const pq = Number(m.plannedQuantity || 0);
                  const uq = Number(m.usedQuantity || 0);
                  return uq <= pq || pq === 0;
                });
                const totalVariancePct = totalPlanned > 0 ? ((totalActual - totalPlanned) / totalPlanned) * 100 : 0;
                return (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-extrabold text-ink">
                      <ClipboardList size={16} className="text-blue-600" /> BOQ vs Actual ({mats.length} items)
                    </h3>

                    {/* Health summary */}
                    <div className="mb-3 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                        <p className="text-xs font-bold text-emerald-600">On / Under Plan</p>
                        <p className="mt-1 text-2xl font-extrabold text-emerald-700">{onTrackItems.length}</p>
                        <p className="text-xs text-emerald-600">items</p>
                      </div>
                      <div className={`rounded-lg border p-3 text-center ${overItems.length > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`text-xs font-bold ${overItems.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>Over Plan</p>
                        <p className={`mt-1 text-2xl font-extrabold ${overItems.length > 0 ? 'text-red-700' : 'text-slate-400'}`}>{overItems.length}</p>
                        <p className={`text-xs ${overItems.length > 0 ? 'text-red-600' : 'text-slate-400'}`}>items</p>
                      </div>
                      <div className={`rounded-lg border p-3 text-center ${totalVariancePct > 5 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`text-xs font-bold ${totalVariancePct > 5 ? 'text-amber-700' : 'text-slate-500'}`}>Cost Variance</p>
                        <p className={`mt-1 text-xl font-extrabold ${totalVariancePct > 5 ? 'text-amber-700' : totalVariancePct < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {totalVariancePct > 0 ? '+' : ''}{totalVariancePct.toFixed(1)}%
                        </p>
                        <p className={`text-xs ${totalVariancePct > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {totalVariancePct > 0 ? `${money(totalActual - totalPlanned, viewingProject.currency)} over` : totalVariancePct < 0 ? `${money(totalPlanned - totalActual, viewingProject.currency)} under` : 'on budget'}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-sm">
                          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                            <tr>
                              <th className="px-4 py-2.5 text-left">Item</th>
                              <th className="px-4 py-2.5 text-left">Category</th>
                              <th className="px-4 py-2.5 text-right">Planned Qty</th>
                              <th className="px-4 py-2.5 text-right">Used Qty</th>
                              <th className="px-4 py-2.5 text-right">Planned Cost</th>
                              <th className="px-4 py-2.5 text-right">Actual Cost</th>
                              <th className="px-4 py-2.5 text-right">Variance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mats.slice(0, 20).map((mat) => {
                              const pq = Number(mat.plannedQuantity || 0);
                              const uq = Number(mat.usedQuantity || 0);
                              const pc = Number(mat.estimatedCost || 0);
                              const ac = Number(mat.actualCost || 0);
                              const varPct = pq > 0 ? ((uq - pq) / pq) * 100 : 0;
                              const isOver = varPct > 0;
                              const isSignificant = Math.abs(varPct) > 10;
                              return (
                                <tr key={mat.id} className={isOver && isSignificant ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                                  <td className="px-4 py-2.5">
                                    <p className="font-semibold text-ink">{mat.materialName || mat.name}</p>
                                    {mat.unit && <p className="text-xs text-slate-400">{mat.unit}</p>}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-500">{mat.category || '—'}</td>
                                  <td className="px-4 py-2.5 text-right text-slate-600">{pq.toLocaleString()}</td>
                                  <td className={`px-4 py-2.5 text-right font-semibold ${uq > pq ? 'text-red-700' : uq > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {uq > 0 ? uq.toLocaleString() : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-slate-600">{money(pc, viewingProject.currency)}</td>
                                  <td className={`px-4 py-2.5 text-right font-semibold ${ac > pc ? 'text-red-700' : ac > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {ac > 0 ? money(ac, viewingProject.currency) : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right">
                                    {uq > 0 ? (
                                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-extrabold ${isOver ? (isSignificant ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700') : 'bg-emerald-100 text-emerald-700'}`}>
                                        {isOver ? '+' : ''}{varPct.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400">Not used</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                            {mats.length > 20 && (
                              <tr>
                                <td colSpan={7} className="px-4 py-2.5 text-center text-xs text-slate-400">
                                  +{mats.length - 20} more items — open the Materials page for full details
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot className="bg-slate-50 font-bold">
                            <tr className="border-t-2 border-slate-200">
                              <td colSpan={4} className="px-4 py-3 text-xs font-extrabold text-slate-600">TOTALS</td>
                              <td className="px-4 py-3 text-right text-sm text-slate-700">{money(totalPlanned, viewingProject.currency)}</td>
                              <td className={`px-4 py-3 text-right text-sm ${totalActual > totalPlanned ? 'text-red-700' : totalActual > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {totalActual > 0 ? money(totalActual, viewingProject.currency) : '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {totalActual > 0 && (
                                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-extrabold ${totalVariancePct > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {totalVariancePct > 0 ? '+' : ''}{totalVariancePct.toFixed(1)}%
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
              {canManageProjects ? (
                <button
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  onClick={() => { setViewingProject(null); startEditProject(viewingProject.id); }}
                  type="button"
                >
                  <Pencil size={16} /> Edit This Project
                </button>
              ) : <span className="text-xs font-semibold text-slate-500">Read-only project baseline</span>}
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setViewingProject(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
