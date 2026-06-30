import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { singleStoreyBomItems, singleStoreyDrawing } from './singleStoreyHouseData.js';
import { createSmartCardPayload } from '../services/cardService.js';

const createdAt = '2026-06-09T08:00:00.000Z';

let nextUserId = 10;
let nextProjectId = 7;
let nextWorkerId = 9;
let nextMaterialId = 211;
let nextMaterialIssueId = 1;
let nextMaterialReceiptId = 1;
let nextAttendanceId = 31;
let nextPhaseId = 32;
let nextDocumentId = 2;
let nextAssignmentId = 17;
let nextDeviceId = 5;
let nextActivityId = 5;

const users = [
  {
    id: 1,
    fullName: 'SCPRAS Administrator',
    email: 'admin@scpras.rw',
    password: 'admin123',
    role: 'admin',
    phone: '0780000000',
    nationalId: 'BI-ADMIN',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 2,
    fullName: 'Jean Bosco',
    email: 'qs@scpras.rw',
    password: 'qs123456',
    role: 'quantity_surveyor',
    phone: '078123456',
    nationalId: '119878001',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 3,
    fullName: 'Mukamana Claudine',
    email: 'store@scpras.rw',
    password: 'store123',
    role: 'store_officer',
    phone: '078452118',
    nationalId: '119878002',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 4,
    fullName: 'Nshimiyimana Eric',
    email: 'foreman@scpras.rw',
    password: 'foreman123',
    role: 'contractor_foreman',
    phone: '078994521',
    nationalId: '119878003',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 5,
    fullName: 'Niyonzima John',
    email: 'contractor@scpras.rw',
    password: 'worker123',
    role: 'contractor_foreman',
    phone: '078001244',
    nationalId: '119878004',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 6,
    fullName: 'Hakizimana Pierre',
    email: 'manager@scpras.rw',
    password: 'manager123',
    role: 'project_manager',
    phone: '0782340001',
    nationalId: '119878005',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 7,
    fullName: 'Uwimana Vestine',
    email: 'engineer@scpras.rw',
    password: 'engineer123',
    role: 'site_engineer',
    phone: '0782340002',
    nationalId: '119878006',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 8,
    fullName: 'Habimana Gilbert',
    email: 'gilbert.habimana@scpras.rw',
    password: 'worker123',
    role: 'contractor_foreman',
    phone: '0782340003',
    nationalId: '119878007',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 9,
    fullName: 'Nzeyimana Patrick',
    email: 'patrick.nzeyimana@scpras.rw',
    password: 'worker123',
    role: 'contractor_foreman',
    phone: '0782340004',
    nationalId: '119878008',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
];

const projects = [
  {
    id: 1,
    projectName: 'Residential Building',
    clientName: 'Kigali Heights Ltd',
    location: 'Kigali, Rwanda',
    projectType: 'Residential',
    budget: 120000,
    spent: 85000,
    startDate: '2026-06-01',
    deadline: '2026-09-30',
    status: 'active',
    progress: 75,
    siteEngineer: 'Mukamana Claudine',
    projectManager: 'Jean Bosco',
    description: 'Three-floor residential project with progress, material and attendance monitoring.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 2,
    projectName: 'School Construction',
    clientName: 'Green Hills Academy',
    location: 'Musanze',
    projectType: 'School',
    budget: 80000,
    spent: 42000,
    startDate: '2026-05-10',
    deadline: '2026-09-15',
    status: 'delayed',
    progress: 45,
    siteEngineer: 'Mukamana Claudine',
    projectManager: 'Jean Bosco',
    description: 'Classroom block and sanitation upgrade with schedule risk controls.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 3,
    projectName: 'Road Construction',
    clientName: 'District Infrastructure Unit',
    location: 'Rubavu',
    projectType: 'Road Construction',
    budget: 200000,
    spent: 115000,
    startDate: '2026-04-20',
    deadline: '2026-10-30',
    status: 'active',
    progress: 60,
    siteEngineer: 'Mukamana Claudine',
    projectManager: 'Jean Bosco',
    description: 'Urban feeder road with material and workforce productivity tracking.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 4,
    projectName: 'Warehouse Project',
    clientName: 'Akagera Logistics',
    location: 'Huye',
    projectType: 'Warehouse',
    budget: 150000,
    spent: 45000,
    startDate: '2026-06-05',
    deadline: '2026-12-20',
    status: 'on_hold',
    progress: 30,
    siteEngineer: 'Mukamana Claudine',
    projectManager: 'Jean Bosco',
    description: 'Storage facility with procurement and site readiness dependencies.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 5,
    projectName: 'Demo Homes Mixed-Use Complex',
    clientName: 'Demo Homes Ltd',
    clientPhone: '+250788123456',
    clientEmail: 'info@demohomes.rw',
    contractRef: 'DHL-2026-042',
    location: 'KG 17 Ave, Kacyiru, Kigali',
    projectType: 'Mixed-Use',
    budget: 2850000,
    spent: 885000,
    startDate: '2026-03-01',
    deadline: '2027-06-30',
    status: 'active',
    priority: 'high',
    progress: 38,
    siteEngineer: 'Uwimana Vestine',
    projectManager: 'Hakizimana Pierre',
    description: '42-unit residential and commercial mixed-use complex — 3 blocks (A/B/C), podium bookshop and retail, curtain-wall facade, RC frame structure up to G+6.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 6,
    projectName: 'Single Storey Residential House',
    projectCode: 'SRH-KGL-2026-001',
    clientName: 'Private Client – Kigali',
    clientPhone: '+250 788 100 200',
    clientEmail: 'client@residentialrw.rw',
    contractRef: 'CTR-2026-SRHR-001',
    location: 'Kigali, Rwanda',
    projectType: 'Residential',
    budget: 141885000,
    currency: 'RWF',
    spent: 0,
    startDate: '2026-07-07',
    deadline: '2026-11-03',
    status: 'planning',
    priority: 'high',
    progress: 0,
    siteEngineer: 'Mukamana Claudine',
    projectManager: 'Hakizimana Pierre',
    description: 'Single storey residential house — 130.30 m² total built-up area — master bedroom + ensuite, 3 bedrooms, shared bathroom, open living/dining, kitchen, front porch (8 m²) and rear service veranda (4 m²). Full BOM (159 items) recorded for system comparison against actual material issuance. Estimated budget: 141,885,000 RWF.',
    thumbnailUrl: '/images/kigali-residential-floorplan.svg',
    floorArea: 130.30,
    totalBuiltArea: 130.30,
    internalFloorArea: 118.30,
    frontPorchArea: 8,
    rearVerandaArea: 4,
    floors: 1,
    bedrooms: 4,
    bathrooms: 2,
    wallThicknessExternal: 230,
    wallThicknessInternal: 115,
    roofType: 'Timber/steel truss with pre-painted iron sheets',
    structure: 'RC columns + concrete block masonry',
    structureType: 'Reinforced concrete frame with concrete block masonry',
    drawingRef: 'A-01 (Floor Plan 1:100, May 2024)',
    createdAt,
    updatedAt: createdAt,
  },
];

const workers = [
  {
    id: 1,
    userId: 2,
    position: 'Mason',
    salary: 850,
    productivityScore: 88,
    smartCardCode: 'BI-W-001',
    joinDate: '2026-05-01',
    department: 'Masonry',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 2,
    userId: 3,
    position: 'Carpenter',
    salary: 920,
    productivityScore: 91,
    smartCardCode: 'BI-W-002',
    joinDate: '2026-05-04',
    department: 'Carpentry',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 3,
    userId: 4,
    position: 'Helper',
    salary: 520,
    productivityScore: 62,
    smartCardCode: 'BI-W-003',
    joinDate: '2026-05-08',
    department: 'General',
    status: 'inactive',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 4,
    userId: 5,
    position: 'Steel Fixer',
    salary: 980,
    productivityScore: 84,
    smartCardCode: 'BI-W-004',
    joinDate: '2026-05-12',
    department: 'Steel Works',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 5,
    userId: 6,
    employeeCode: 'BI-W-005',
    position: 'Site Foreman',
    salary: 1850,
    dailyRate: 92,
    employmentType: 'permanent',
    skillLevel: 'expert',
    productivityScore: 94,
    smartCardCode: 'BI-W-005',
    joinDate: '2026-02-28',
    dateOfBirth: '1985-04-12',
    gender: 'male',
    department: 'Site Management',
    address: 'KG 14 Ave, Kacyiru, Kigali',
    emergencyContactName: 'Hakizimana Clementine',
    emergencyContactPhone: '0783210099',
    emergencyContactRelationship: 'Spouse',
    tradeCertification: 'RTDA Construction Site Foreman Cert. #CSF-2841',
    safetyInductionDate: '2026-02-28',
    medicalClearanceDate: '2026-02-25',
    ppeIssued: true,
    bankName: 'Bank of Kigali',
    bankAccountNumber: '0001234567',
    notes: 'Lead foreman for Demo Homes project; oversees daily workflow across all three blocks.',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 6,
    userId: 7,
    employeeCode: 'BI-W-006',
    position: 'Glazing Specialist',
    salary: 1620,
    dailyRate: 81,
    employmentType: 'contract',
    skillLevel: 'expert',
    productivityScore: 91,
    smartCardCode: 'BI-W-006',
    joinDate: '2026-05-15',
    dateOfBirth: '1990-08-22',
    gender: 'female',
    department: 'Facade Works',
    address: 'KN 4 Ave, Kiyovu, Kigali',
    emergencyContactName: 'Uwimana Emmanuel',
    emergencyContactPhone: '0787654321',
    emergencyContactRelationship: 'Brother',
    tradeCertification: 'AGC Certified Glazier #GL-0445; OHSA Curtain-Wall Safety',
    safetyInductionDate: '2026-05-15',
    medicalClearanceDate: '2026-05-12',
    ppeIssued: true,
    bankName: 'Equity Bank Rwanda',
    bankAccountNumber: '0009876543',
    notes: 'Specialist for curtain-wall installation and IGU quality control on Block A facade.',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 7,
    userId: 8,
    employeeCode: 'BI-W-007',
    position: 'Lead Bricklayer',
    salary: 1240,
    dailyRate: 62,
    employmentType: 'contract',
    skillLevel: 'skilled',
    productivityScore: 89,
    smartCardCode: 'BI-W-007',
    joinDate: '2026-03-05',
    dateOfBirth: '1988-11-30',
    gender: 'male',
    department: 'Masonry',
    address: 'KG 23 Ave, Kimihurura, Kigali',
    emergencyContactName: 'Habimana Therese',
    emergencyContactPhone: '0785559988',
    emergencyContactRelationship: 'Spouse',
    tradeCertification: 'TVET Bricklaying Level III #BL-7821',
    safetyInductionDate: '2026-03-05',
    medicalClearanceDate: '2026-03-03',
    ppeIssued: true,
    bankName: 'I&M Bank Rwanda',
    bankAccountNumber: '0002468101',
    notes: 'Leads the brickwork team for Blocks A and B; targets 4,000 bricks per team per day.',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 8,
    userId: 9,
    employeeCode: 'BI-W-008',
    position: 'Electrician',
    salary: 1380,
    dailyRate: 69,
    employmentType: 'contract',
    skillLevel: 'skilled',
    productivityScore: 86,
    smartCardCode: 'BI-W-008',
    joinDate: '2026-04-01',
    dateOfBirth: '1992-03-18',
    gender: 'male',
    department: 'MEP',
    address: 'KK 11 Ave, Nyamirambo, Kigali',
    emergencyContactName: 'Nzeyimana Assumpta',
    emergencyContactPhone: '0781234567',
    emergencyContactRelationship: 'Sister',
    tradeCertification: 'REMA Licensed Electrician #EL-3312; 11kV Safe Working Cert.',
    safetyInductionDate: '2026-04-01',
    medicalClearanceDate: '2026-03-30',
    ppeIssued: true,
    bankName: 'Bank of Kigali',
    bankAccountNumber: '0008765432',
    notes: 'MEP electrical lead; currently mobilised for temporary power supply and conduit pre-installation.',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  },
];

const materials = [
  {
    id: 1,
    projectId: 1,
    materialName: 'Cement (50kg)',
    plannedQuantity: 500,
    usedQuantity: 560,
    remainingStock: -60,
    unit: 'Bag',
    estimatedCost: 6500,
    actualCost: 7280,
    supplier: 'Kigali Cement Supply',
    deliveryDate: '2026-06-03',
    status: 'used',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 2,
    projectId: 1,
    materialName: 'Bricks',
    plannedQuantity: 20000,
    usedQuantity: 18500,
    remainingStock: 1500,
    unit: 'Pcs',
    estimatedCost: 5200,
    actualCost: 4810,
    supplier: 'Rwanda Clay Works',
    deliveryDate: '2026-06-05',
    status: 'received',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 3,
    projectId: 2,
    materialName: 'Sand',
    plannedQuantity: 120,
    usedQuantity: 110,
    remainingStock: 10,
    unit: 'm3',
    estimatedCost: 2400,
    actualCost: 2200,
    supplier: 'Volcano Aggregates',
    deliveryDate: '2026-05-18',
    status: 'received',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 4,
    projectId: 3,
    materialName: 'Steel Bars',
    plannedQuantity: 3.5,
    usedQuantity: 3.9,
    remainingStock: -0.4,
    unit: 'Ton',
    estimatedCost: 4800,
    actualCost: 5450,
    supplier: 'Steel Rwanda',
    deliveryDate: '2026-05-28',
    status: 'used',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 5,
    projectId: 3,
    materialName: 'Concrete',
    plannedQuantity: 80,
    usedQuantity: 70,
    remainingStock: 10,
    unit: 'm3',
    estimatedCost: 7200,
    actualCost: 6500,
    supplier: 'ReadyMix Kigali',
    deliveryDate: '2026-06-04',
    status: 'received',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 6,
    projectId: 4,
    materialName: 'Roofing Sheets',
    plannedQuantity: 260,
    usedQuantity: 90,
    remainingStock: 170,
    unit: 'Sheet',
    estimatedCost: 9100,
    actualCost: 3150,
    supplier: 'Huye Hardware',
    deliveryDate: '2026-06-08',
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
  },
  // Demo Homes Mixed-Use Complex — BOQ Materials (IDs 7–31)
  {
    id: 7, projectId: 5, materialCode: 'DHL-MAT-001',
    materialName: 'Red Clay Bricks (Machine-Pressed)',
    category: 'Material', plannedQuantity: 4000000, receivedQuantity: 2400000, usedQuantity: 1600000, remainingStock: 800000,
    minimumStock: 500000, reorderLevel: 800000, unit: 'Pcs', unitCost: 0.28, estimatedCost: 1120000, actualCost: 448000,
    supplier: 'Rwanda Clay Works Ltd', supplierContact: '+250788456789', supplierEmail: 'orders@rwandaclay.rw',
    purchaseOrderNumber: 'PO-DHL-2026-007', deliveryDate: '2026-03-20', lastReceivedDate: '2026-05-28',
    storageLocation: 'Site Compound – Brick Yard A', batchNumber: 'RCW-2026-B3',
    gradeSpecification: 'Class B Engineering Brick, Compressive ≥ 20 N/mm²',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-03-22',
    wastageAllowancePercent: 5,
    notes: 'Machine-pressed red clay bricks for all walling. 5% wastage allowance included. Batch 3 pending quality-hold release.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 8, projectId: 5, materialCode: 'DHL-MAT-002',
    materialName: 'OPC Cement 50 kg (CIMERWA)',
    category: 'Material', plannedQuantity: 18000, receivedQuantity: 10000, usedQuantity: 7200, remainingStock: 2800,
    minimumStock: 1000, reorderLevel: 2000, unit: 'Bag', unitCost: 13, estimatedCost: 234000, actualCost: 93600,
    supplier: 'CIMERWA Ltd', supplierContact: '+250788200100', supplierEmail: 'sales@cimerwa.rw',
    purchaseOrderNumber: 'PO-DHL-2026-008', deliveryDate: '2026-03-10', lastReceivedDate: '2026-06-01',
    storageLocation: 'Site Compound – Cement Store (covered)', batchNumber: 'CIMRW-Q2-2026',
    gradeSpecification: 'OPC 42.5 N – EN 197-1; moisture content < 0.5% at receipt',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-03-11',
    wastageAllowancePercent: 3,
    notes: 'Primary binding agent for mortar and concrete works. Reorder triggered when stock falls below 2,000 bags.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 9, projectId: 5, materialCode: 'DHL-MAT-003',
    materialName: 'River Sand (Washed)',
    category: 'Material', plannedQuantity: 650, receivedQuantity: 420, usedQuantity: 280, remainingStock: 140,
    minimumStock: 50, reorderLevel: 100, unit: 'm³', unitCost: 18, estimatedCost: 11700, actualCost: 5040,
    supplier: 'Nyabarongo Aggregates Ltd', supplierContact: '+250785123456', supplierEmail: 'agg@nyabarongo.rw',
    purchaseOrderNumber: 'PO-DHL-2026-009', deliveryDate: '2026-03-12', lastReceivedDate: '2026-05-20',
    storageLocation: 'Site Compound – Aggregate Bay 1', batchNumber: 'NAL-RVS-2026-04',
    gradeSpecification: 'Zone II washed river sand, FM 2.0–3.0; silt content < 4%',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-03-13',
    wastageAllowancePercent: 8,
    notes: 'Used for mortar mixes (1:4 cement:sand) and plastering works. Grading compliant with ASTM C33.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 10, projectId: 5, materialCode: 'DHL-MAT-004',
    materialName: 'Crushed Stone 20 mm (Coarse Aggregate)',
    category: 'Material', plannedQuantity: 450, receivedQuantity: 280, usedQuantity: 190, remainingStock: 90,
    minimumStock: 40, reorderLevel: 80, unit: 'm³', unitCost: 22, estimatedCost: 9900, actualCost: 4180,
    supplier: 'Volcano Aggregates Ltd', supplierContact: '+250783654321', supplierEmail: 'sales@volcanorw.com',
    purchaseOrderNumber: 'PO-DHL-2026-010', deliveryDate: '2026-03-15', lastReceivedDate: '2026-05-25',
    storageLocation: 'Site Compound – Aggregate Bay 2', batchNumber: 'VAL-20MM-2026-05',
    gradeSpecification: 'Crushed basalt 20mm nominal; LA abrasion ≤ 30%; flakiness ≤ 25%',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-03-16',
    wastageAllowancePercent: 5,
    notes: 'Coarse aggregate for all structural concrete mixes (C30 and C25). Separate stockpile from fine aggregate.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 11, projectId: 5, materialCode: 'DHL-MAT-005',
    materialName: 'Y12 Deformed Rebar 12 m',
    category: 'Material', plannedQuantity: 320, receivedQuantity: 200, usedQuantity: 145, remainingStock: 55,
    minimumStock: 20, reorderLevel: 40, unit: 'Tonne', unitCost: 950, estimatedCost: 304000, actualCost: 137750,
    supplier: 'Steel Industries Rwanda Ltd', supplierContact: '+250789001122', supplierEmail: 'procurement@steelrw.com',
    purchaseOrderNumber: 'PO-DHL-2026-011', deliveryDate: '2026-03-18', lastReceivedDate: '2026-05-30',
    storageLocation: 'Site Compound – Rebar Yard (covered tarpaulin)', batchNumber: 'SIR-Y12-2026-B2',
    gradeSpecification: 'Grade 500B Deformed Rebar to BS 4449:2005+A3:2016; Fy ≥ 500 MPa',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-03-20',
    wastageAllowancePercent: 3,
    notes: 'Primary structural reinforcement for columns, beams, and slab distribution steel. Mill certificates verified per batch.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 12, projectId: 5, materialCode: 'DHL-MAT-006',
    materialName: 'Y16 Deformed Rebar 12 m',
    category: 'Material', plannedQuantity: 180, receivedQuantity: 110, usedQuantity: 82, remainingStock: 28,
    minimumStock: 15, reorderLevel: 30, unit: 'Tonne', unitCost: 1050, estimatedCost: 189000, actualCost: 86100,
    supplier: 'Steel Industries Rwanda Ltd', supplierContact: '+250789001122', supplierEmail: 'procurement@steelrw.com',
    purchaseOrderNumber: 'PO-DHL-2026-012', deliveryDate: '2026-03-18', lastReceivedDate: '2026-05-30',
    storageLocation: 'Site Compound – Rebar Yard', batchNumber: 'SIR-Y16-2026-B2',
    gradeSpecification: 'Grade 500B Deformed Rebar to BS 4449:2005+A3:2016; Fy ≥ 500 MPa',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-03-20',
    wastageAllowancePercent: 3,
    notes: 'Main longitudinal steel for beams and column ties. Coordinate with bar-bending schedule Rev.C.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 13, projectId: 5, materialCode: 'DHL-MAT-007',
    materialName: 'Y20 Deformed Rebar 12 m',
    category: 'Material', plannedQuantity: 95, receivedQuantity: 60, usedQuantity: 44, remainingStock: 16,
    minimumStock: 10, reorderLevel: 18, unit: 'Tonne', unitCost: 1120, estimatedCost: 106400, actualCost: 49280,
    supplier: 'Steel Industries Rwanda Ltd', supplierContact: '+250789001122', supplierEmail: 'procurement@steelrw.com',
    purchaseOrderNumber: 'PO-DHL-2026-013', deliveryDate: '2026-04-05', lastReceivedDate: '2026-05-20',
    storageLocation: 'Site Compound – Rebar Yard', batchNumber: 'SIR-Y20-2026-B1',
    gradeSpecification: 'Grade 500B Deformed Rebar; main column bars and transfer beams',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-06',
    wastageAllowancePercent: 2,
    notes: 'Heavy-section rebar for transfer beams, podium columns, and core wall starter bars. Closely managed due to high unit cost.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 14, projectId: 5, materialCode: 'DHL-MAT-008',
    materialName: 'C30 Ready-Mix Concrete',
    category: 'Material', plannedQuantity: 480, receivedQuantity: 210, usedQuantity: 210, remainingStock: 0,
    minimumStock: 0, reorderLevel: 0, unit: 'm³', unitCost: 145, estimatedCost: 69600, actualCost: 30450,
    supplier: 'ReadyMix Kigali Ltd', supplierContact: '+250787300200', supplierEmail: 'dispatch@readymixkigali.rw',
    purchaseOrderNumber: 'PO-DHL-2026-014', deliveryDate: '2026-04-01', lastReceivedDate: '2026-06-08',
    storageLocation: 'Placed in-situ (RC columns and beams)', batchNumber: 'RMK-C30-220624',
    gradeSpecification: 'C30/37 to EN 206; w/c ratio ≤ 0.50; cement content ≥ 320 kg/m³; slump 75–125 mm',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-01',
    wastageAllowancePercent: 5,
    notes: 'Structural concrete for all columns, beams, and shear walls. Batching plant on-site for QC. Cube tests every 20 m³.',
    status: 'used', createdAt, updatedAt: createdAt,
  },
  {
    id: 15, projectId: 5, materialCode: 'DHL-MAT-009',
    materialName: 'C25 Ready-Mix Concrete',
    category: 'Material', plannedQuantity: 320, receivedQuantity: 125, usedQuantity: 125, remainingStock: 0,
    minimumStock: 0, reorderLevel: 0, unit: 'm³', unitCost: 132, estimatedCost: 42240, actualCost: 16500,
    supplier: 'ReadyMix Kigali Ltd', supplierContact: '+250787300200', supplierEmail: 'dispatch@readymixkigali.rw',
    purchaseOrderNumber: 'PO-DHL-2026-015', deliveryDate: '2026-04-10', lastReceivedDate: '2026-06-05',
    storageLocation: 'Placed in-situ (slabs and staircase)', batchNumber: 'RMK-C25-150624',
    gradeSpecification: 'C25/30 to EN 206; w/c ratio ≤ 0.55; slump 100–125 mm; nominal 20 mm aggregate',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-10',
    wastageAllowancePercent: 5,
    notes: 'Used for suspended slabs, staircase flights, and non-structural infill. Ordered per floor-pour schedule.',
    status: 'used', createdAt, updatedAt: createdAt,
  },
  {
    id: 16, projectId: 5, materialCode: 'DHL-MAT-010',
    materialName: 'Aluminium Curtain Wall System',
    category: 'Material', plannedQuantity: 820, receivedQuantity: 120, usedQuantity: 60, remainingStock: 60,
    minimumStock: 20, reorderLevel: 40, unit: 'm²', unitCost: 680, estimatedCost: 557600, actualCost: 40800,
    supplier: 'Alupco Rwanda Ltd', supplierContact: '+250786500123', supplierEmail: 'contracts@alupco.rw',
    purchaseOrderNumber: 'PO-DHL-2026-016', deliveryDate: '2026-05-20', lastReceivedDate: '2026-06-06',
    storageLocation: 'Block A – Level 0 storage bay (climate controlled)', batchNumber: 'ALP-CW-DHL-2026',
    gradeSpecification: 'Alupco Series 65 stick curtain wall; thermally broken aluminium; wind load design ±3.5 kPa',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-05-22',
    wastageAllowancePercent: 2,
    notes: 'Premium facade system for Block A south and east elevations. Remaining 700 m² on deferred delivery schedule.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 17, projectId: 5, materialCode: 'DHL-MAT-011',
    materialName: 'Double-Glazed IGU 6+12+6 mm',
    category: 'Material', plannedQuantity: 650, receivedQuantity: 80, usedQuantity: 45, remainingStock: 35,
    minimumStock: 10, reorderLevel: 20, unit: 'm²', unitCost: 420, estimatedCost: 273000, actualCost: 18900,
    supplier: 'GlazTech Africa Ltd', supplierContact: '+254722456789', supplierEmail: 'orders@glaztechafrica.com',
    purchaseOrderNumber: 'PO-DHL-2026-017', deliveryDate: '2026-05-25', lastReceivedDate: '2026-06-04',
    storageLocation: 'Block A – Level 0 storage bay (vertical A-frame racks)', batchNumber: 'GTA-IGU-DHL-001',
    gradeSpecification: '6mm Low-E / 12mm Argon fill / 6mm clear toughened; U-value ≤ 1.6 W/m²K; SHGC 0.35',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-05-26',
    wastageAllowancePercent: 3,
    notes: 'High-performance glazing units for curtain wall infill. Stored vertically. Lead time 6 weeks from Nairobi — forward-order required for Levels 3–6.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 18, projectId: 5, materialCode: 'DHL-MAT-012',
    materialName: 'Ceramic Floor Tiles 600×600 mm',
    category: 'Material', plannedQuantity: 4200, receivedQuantity: 0, usedQuantity: 0, remainingStock: 0,
    minimumStock: 0, reorderLevel: 500, unit: 'm²', unitCost: 38, estimatedCost: 159600, actualCost: 0,
    supplier: 'Rwanda Ceramics Ltd', supplierContact: '+250785600200', supplierEmail: 'tiles@rwandaceramics.rw',
    purchaseOrderNumber: 'PO-DHL-2026-018', deliveryDate: '2027-01-15', lastReceivedDate: null,
    storageLocation: 'Not yet received', batchNumber: '',
    gradeSpecification: 'ISO 13006 Group BIa; breaking strength ≥ 1,300 N; slip resistance R10',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 10,
    notes: 'Scheduled for delivery at residential fit-out stage (Q1 2027). 10% waste for cutting. Colour selection pending client sign-off.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 19, projectId: 5, materialCode: 'DHL-MAT-013',
    materialName: 'External Face Brick (Textured)',
    category: 'Material', plannedQuantity: 180000, receivedQuantity: 90000, usedQuantity: 42000, remainingStock: 48000,
    minimumStock: 10000, reorderLevel: 20000, unit: 'Pcs', unitCost: 0.32, estimatedCost: 57600, actualCost: 13440,
    supplier: 'Heritage Bricks Ltd', supplierContact: '+250782100300', supplierEmail: 'orders@heritagebricks.rw',
    purchaseOrderNumber: 'PO-DHL-2026-019', deliveryDate: '2026-04-15', lastReceivedDate: '2026-05-28',
    storageLocation: 'Site Compound – Brick Yard B', batchNumber: 'HBL-EFB-2026-04',
    gradeSpecification: 'Class A Facing Brick, Compressive ≥ 25 N/mm²; frost resistant; colour matched to spec',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-04-16',
    wastageAllowancePercent: 4,
    notes: 'Textured facing brick for external elevations visible from street level. Colour matched to architectural drawing PL-EXT-04.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 20, projectId: 5, materialCode: 'DHL-MAT-014',
    materialName: 'Anti-Crack Render & Plaster (25 kg)',
    category: 'Material', plannedQuantity: 380, receivedQuantity: 200, usedQuantity: 120, remainingStock: 80,
    minimumStock: 30, reorderLevel: 60, unit: 'Bag', unitCost: 18, estimatedCost: 6840, actualCost: 2160,
    supplier: 'BuildChem Rwanda Ltd', supplierContact: '+250786200400', supplierEmail: 'supply@buildchem.rw',
    purchaseOrderNumber: 'PO-DHL-2026-020', deliveryDate: '2026-04-20', lastReceivedDate: '2026-06-03',
    storageLocation: 'Site Compound – Chemical Store', batchNumber: 'BCR-ACR-2026-06',
    gradeSpecification: 'Polymer-modified render; flexural strength ≥ 3 MPa; breathable; alkali-resistant mesh crack bridging',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-21',
    wastageAllowancePercent: 5,
    notes: 'Anti-crack plaster applied over blockwork prior to external paint. Required on all external elevations per spec clause 4.3.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 21, projectId: 5, materialCode: 'DHL-MAT-015',
    materialName: 'Exterior Waterproof Masonry Paint (20 L)',
    category: 'Material', plannedQuantity: 480, receivedQuantity: 0, usedQuantity: 0, remainingStock: 0,
    minimumStock: 0, reorderLevel: 60, unit: 'Tin', unitCost: 48, estimatedCost: 23040, actualCost: 0,
    supplier: 'Crown Paints Rwanda Ltd', supplierContact: '+250787000500', supplierEmail: 'orders@crownpaints.rw',
    purchaseOrderNumber: 'PO-DHL-2026-021', deliveryDate: '2026-11-01', lastReceivedDate: null,
    storageLocation: 'Not yet received', batchNumber: '',
    gradeSpecification: 'Sandtex Weatherguard; opacity Class I; weather resistance ≥ 2,000h QUV; BS 6150',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 8,
    notes: 'Scheduled for external finishing (Q4 2026). Colour: Sandstone Ivory (A/B), Warm White (C). Client sign-off required.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 22, projectId: 5, materialCode: 'DHL-MAT-016',
    materialName: 'DPC Sheet 1000 mm Wide (Polythene)',
    category: 'Material', plannedQuantity: 1200, receivedQuantity: 1200, usedQuantity: 980, remainingStock: 220,
    minimumStock: 50, reorderLevel: 100, unit: 'm', unitCost: 3.2, estimatedCost: 3840, actualCost: 3136,
    supplier: 'Plastico Ltd Rwanda', supplierContact: '+250783400600', supplierEmail: 'info@plasticorw.com',
    purchaseOrderNumber: 'PO-DHL-2026-022', deliveryDate: '2026-03-14', lastReceivedDate: '2026-03-14',
    storageLocation: 'Site Compound – Materials Store', batchNumber: 'PLR-DPC-2026-03',
    gradeSpecification: '1000mm × 0.3mm HDPE DPC; BS 6515; minimum overlap 150mm at joints',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-03-15',
    wastageAllowancePercent: 5,
    notes: 'Installed at foundation-to-wall junction on all external and internal load-bearing walls. Block A ground floor complete.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 23, projectId: 5, materialCode: 'DHL-MAT-017',
    materialName: '12 mm Plywood Formwork Sheets',
    category: 'Material', plannedQuantity: 620, receivedQuantity: 620, usedQuantity: 580, remainingStock: 40,
    minimumStock: 30, reorderLevel: 60, unit: 'Sheet', unitCost: 28, estimatedCost: 17360, actualCost: 16240,
    supplier: 'Bois de Gaulme Rwanda', supplierContact: '+250784500700', supplierEmail: 'sales@boisgaulme.rw',
    purchaseOrderNumber: 'PO-DHL-2026-023', deliveryDate: '2026-03-22', lastReceivedDate: '2026-03-22',
    storageLocation: 'Site Compound – Formwork Yard', batchNumber: 'BDG-PLY-2026-03',
    gradeSpecification: 'WBP phenolic-bonded plywood 12mm; face sanded; release agent applied at site',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-03-23',
    wastageAllowancePercent: 10,
    notes: 'Re-usable formwork. Average reuse cycle: 4 pours per sheet. Sheets marked and rotated. Replacement order expected for upper floors.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 24, projectId: 5, materialCode: 'DHL-MAT-018',
    materialName: 'C16 Binding Wire (Annealed)',
    category: 'Material', plannedQuantity: 2400, receivedQuantity: 1800, usedQuantity: 1100, remainingStock: 700,
    minimumStock: 100, reorderLevel: 300, unit: 'kg', unitCost: 1.85, estimatedCost: 4440, actualCost: 2035,
    supplier: 'Metal Corp Rwanda', supplierContact: '+250785700800', supplierEmail: 'orders@metalcorprw.com',
    purchaseOrderNumber: 'PO-DHL-2026-024', deliveryDate: '2026-03-20', lastReceivedDate: '2026-05-18',
    storageLocation: 'Site Compound – Rebar Yard', batchNumber: 'MCR-BW-2026-04',
    gradeSpecification: 'C16 black annealed binding wire; 1.0mm gauge; tensile strength 350–600 MPa',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-03-21',
    wastageAllowancePercent: 5,
    notes: 'Used by steel fixers for tying rebar intersections. Consumption tracked per m² of reinforced concrete poured.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 25, projectId: 5, materialCode: 'DHL-MAT-019',
    materialName: 'Class A Engineering Bricks',
    category: 'Material', plannedQuantity: 32000, receivedQuantity: 32000, usedQuantity: 28500, remainingStock: 3500,
    minimumStock: 500, reorderLevel: 2000, unit: 'Pcs', unitCost: 0.65, estimatedCost: 20800, actualCost: 18525,
    supplier: 'Heritage Bricks Ltd', supplierContact: '+250782100300', supplierEmail: 'orders@heritagebricks.rw',
    purchaseOrderNumber: 'PO-DHL-2026-025', deliveryDate: '2026-03-25', lastReceivedDate: '2026-04-10',
    storageLocation: 'Site Compound – Brick Yard C', batchNumber: 'HBL-ENG-2026-03',
    gradeSpecification: 'Class A Engineering Brick; compressive ≥ 70 N/mm²; water absorption < 4.5%; frost resistant',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-03-26',
    wastageAllowancePercent: 3,
    notes: 'Used for below-DPC and retaining wall construction, and bookshop plinth. High compressive strength required for podium base.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 26, projectId: 5, materialCode: 'DHL-MAT-020',
    materialName: 'Manufactured M-Sand (Plastering Grade)',
    category: 'Material', plannedQuantity: 180, receivedQuantity: 120, usedQuantity: 60, remainingStock: 60,
    minimumStock: 20, reorderLevel: 40, unit: 'm³', unitCost: 22, estimatedCost: 3960, actualCost: 1320,
    supplier: 'Nyabarongo Aggregates Ltd', supplierContact: '+250785123456', supplierEmail: 'agg@nyabarongo.rw',
    purchaseOrderNumber: 'PO-DHL-2026-026', deliveryDate: '2026-04-25', lastReceivedDate: '2026-06-02',
    storageLocation: 'Site Compound – Aggregate Bay 3', batchNumber: 'NAL-MS-2026-05',
    gradeSpecification: 'Manufactured sand FM 1.5–2.5; void content < 33%; dust content < 10%; plastering grade',
    qualityStatus: 'approved', inspectedBy: 'Habimana Gilbert', inspectionDate: '2026-04-26',
    wastageAllowancePercent: 6,
    notes: 'Fine sand for internal and external plaster coats. Separate stockpile from structural river sand.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 27, projectId: 5, materialCode: 'DHL-MAT-021',
    materialName: 'PVC Conduit 20 mm (Electrical)',
    category: 'Material', plannedQuantity: 4800, receivedQuantity: 0, usedQuantity: 0, remainingStock: 0,
    minimumStock: 0, reorderLevel: 600, unit: 'm', unitCost: 2.8, estimatedCost: 13440, actualCost: 0,
    supplier: 'Kabira Plastics Ltd', supplierContact: '+250786800900', supplierEmail: 'sales@kabira.rw',
    purchaseOrderNumber: 'PO-DHL-2026-027', deliveryDate: '2026-08-20', lastReceivedDate: null,
    storageLocation: 'Not yet received', batchNumber: '',
    gradeSpecification: 'PVC-U conduit 20mm; IEC 61386; medium duty grey; ≥ 750N crush resistance; UV stabilised',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 5,
    notes: 'Electrical conduit for all unit wiring and stairwell circuits. Delivery to coincide with MEP rough-in (Aug 2026).',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 28, projectId: 5, materialCode: 'DHL-MAT-022',
    materialName: 'HDPE Pipe 110 mm (Drainage)',
    category: 'Material', plannedQuantity: 2400, receivedQuantity: 0, usedQuantity: 0, remainingStock: 0,
    minimumStock: 0, reorderLevel: 300, unit: 'm', unitCost: 8.5, estimatedCost: 20400, actualCost: 0,
    supplier: 'Total Pipes Ltd Rwanda', supplierContact: '+250783900100', supplierEmail: 'pipes@totalpipes.rw',
    purchaseOrderNumber: 'PO-DHL-2026-028', deliveryDate: '2026-09-01', lastReceivedDate: null,
    storageLocation: 'Not yet received', batchNumber: '',
    gradeSpecification: 'HDPE 110mm SDR-17; PN 10; ISO 4427; welded joints; drainage network per MEP drawing M-02',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 5,
    notes: 'Main stack and branch drainage pipes for all 42 residential units and commercial spaces. Aligned to plumbing rough-in programme.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 29, projectId: 5, materialCode: 'DHL-MAT-023',
    materialName: 'Ceramic Wall Tiles 300×450 mm',
    category: 'Material', plannedQuantity: 2800, receivedQuantity: 0, usedQuantity: 0, remainingStock: 0,
    minimumStock: 0, reorderLevel: 400, unit: 'm²', unitCost: 32, estimatedCost: 89600, actualCost: 0,
    supplier: 'Rwanda Ceramics Ltd', supplierContact: '+250785600200', supplierEmail: 'tiles@rwandaceramics.rw',
    purchaseOrderNumber: 'PO-DHL-2026-029', deliveryDate: '2027-01-20', lastReceivedDate: null,
    storageLocation: 'Not yet received', batchNumber: '',
    gradeSpecification: 'ISO 13006 Group BIII; moisture expansion ≤ 0.6%; adhesion strength ≥ 0.5 N/mm²; anti-slip kitchen finish',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 12,
    notes: 'Wet area tiles for bathrooms, kitchens, and balconies across 42 units. Colour selection outstanding; delivery held pending architect sign-off.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 30, projectId: 5, materialCode: 'DHL-MAT-024',
    materialName: 'Anti-Termite Treatment (Soil Injection)',
    category: 'Material', plannedQuantity: 120, receivedQuantity: 120, usedQuantity: 115, remainingStock: 5,
    minimumStock: 0, reorderLevel: 0, unit: 'Litre', unitCost: 42, estimatedCost: 5040, actualCost: 4830,
    supplier: 'Pest Guard Africa Ltd', supplierContact: '+250789200300', supplierEmail: 'treatment@pestguard.rw',
    purchaseOrderNumber: 'PO-DHL-2026-030', deliveryDate: '2026-03-28', lastReceivedDate: '2026-03-28',
    storageLocation: 'Site Compound – Hazmat Locker (labelled)', batchNumber: 'PGA-TERM-2026-03',
    gradeSpecification: 'Chlorpyrifos 20% EC concentrate; diluted 1:19 water; applied at 5 L/m² to foundation soil',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-29',
    wastageAllowancePercent: 0,
    notes: 'Pre-construction soil treatment at foundation stage. Treatment certificate issued by Pest Guard Africa (Cert #PGA-DHL-001). COSHH data sheet on file.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 31, projectId: 5, materialCode: 'DHL-MAT-025',
    materialName: 'Structural Steel Universal I-Beam',
    category: 'Material', plannedQuantity: 28, receivedQuantity: 28, usedQuantity: 24, remainingStock: 4,
    minimumStock: 0, reorderLevel: 0, unit: 'Tonne', unitCost: 1380, estimatedCost: 38640, actualCost: 33120,
    supplier: 'ArcelorMittal South Africa', supplierContact: '+27118611000', supplierEmail: 'rwandadesk@arcelormittal.com',
    purchaseOrderNumber: 'PO-DHL-2026-031', deliveryDate: '2026-04-08', lastReceivedDate: '2026-04-08',
    storageLocation: 'Site Compound – Steel Yard (crane slab area)', batchNumber: 'AML-UB-2026-04',
    gradeSpecification: 'UC 203×203×46 and UC 254×254×73 sections; S355 JR to EN 10025; hot-rolled; corrosion primed',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-09',
    wastageAllowancePercent: 1,
    notes: 'Used for transfer beams above bookshop openings and staircase support steel. Gusset plates fabricated on-site.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  // Demo Homes Mixed-Use Complex — Equipment (IDs 32–39)
  {
    id: 32, projectId: 5, materialCode: 'DHL-EQP-001',
    materialName: 'Tower Crane TC7052 (55 m jib)',
    category: 'Equipment', plannedQuantity: 15, receivedQuantity: 15, usedQuantity: 4, remainingStock: 11,
    minimumStock: 0, reorderLevel: 0, unit: 'Month', unitCost: 8500, estimatedCost: 127500, actualCost: 34000,
    supplier: 'Kranemann Plant Hire Rwanda', supplierContact: '+250787100200', supplierEmail: 'hire@kranemann.rw',
    purchaseOrderNumber: 'PO-DHL-2026-032', deliveryDate: '2026-03-01', lastReceivedDate: '2026-03-01',
    storageLocation: 'Block A – Tower Base (foundation anchor)', batchNumber: 'KPH-TC7052-DHL-01',
    gradeSpecification: 'Potain MDT 178 (equiv.) 55 m jib; max radius load 1.4T; free-standing height 42 m',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-02',
    wastageAllowancePercent: 0,
    notes: 'Primary lifting equipment for concrete pours, rebar, and facade panels. Monthly inspection maintained. Operator: Kayiranga Felix (certified).',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 33, projectId: 5, materialCode: 'DHL-EQP-002',
    materialName: 'Concrete Batching Plant 35 m³/hr',
    category: 'Equipment', plannedQuantity: 12, receivedQuantity: 12, usedQuantity: 4, remainingStock: 8,
    minimumStock: 0, reorderLevel: 0, unit: 'Month', unitCost: 4200, estimatedCost: 50400, actualCost: 16800,
    supplier: 'Kigali Plant Hire Ltd', supplierContact: '+250785200300', supplierEmail: 'hire@kigaliplant.rw',
    purchaseOrderNumber: 'PO-DHL-2026-033', deliveryDate: '2026-03-05', lastReceivedDate: '2026-03-05',
    storageLocation: 'Site Compound – North Perimeter', batchNumber: 'KPL-BATCH-DHL-01',
    gradeSpecification: 'Twin-shaft mixer batching plant; output 35 m³/hr; computer-controlled; ±2% aggregate accuracy',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-03-06',
    wastageAllowancePercent: 0,
    notes: 'On-site batching eliminates transit-mix logistics. Water and cement dosage logged per batch. Calibration cert. valid to Dec 2026.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 34, projectId: 5, materialCode: 'DHL-EQP-003',
    materialName: 'Ringlock Scaffolding System (2,400 m²)',
    category: 'Equipment', plannedQuantity: 18, receivedQuantity: 18, usedQuantity: 4, remainingStock: 14,
    minimumStock: 0, reorderLevel: 0, unit: 'Month', unitCost: 2800, estimatedCost: 50400, actualCost: 11200,
    supplier: 'SafeScaff Rwanda Ltd', supplierContact: '+250786400400', supplierEmail: 'scaffolding@safescaff.rw',
    purchaseOrderNumber: 'PO-DHL-2026-034', deliveryDate: '2026-03-12', lastReceivedDate: '2026-03-12',
    storageLocation: 'Site Perimeter – Block A/B External Faces', batchNumber: 'SSR-RING-DHL-01',
    gradeSpecification: 'Ringlock system; galvanised steel standards; EN 12811-1; TUV load certificate 2.0 kN/m²',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-13',
    wastageAllowancePercent: 0,
    notes: 'External access scaffolding on Blocks A and B. Weekly inspection by SafeScaff supervisor. Tie-back: 2.0m V × 3.0m H.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 35, projectId: 5, materialCode: 'DHL-EQP-004',
    materialName: 'Poker Vibrators 45 mm (Internal)',
    category: 'Equipment', plannedQuantity: 4, receivedQuantity: 4, usedQuantity: 4, remainingStock: 0,
    minimumStock: 0, reorderLevel: 0, unit: 'Unit', unitCost: 380, estimatedCost: 1520, actualCost: 1520,
    supplier: 'Bosch Tools Rwanda', supplierContact: '+250787900500', supplierEmail: 'tools@bosch.rw',
    purchaseOrderNumber: 'PO-DHL-2026-035', deliveryDate: '2026-03-10', lastReceivedDate: '2026-03-10',
    storageLocation: 'Site Compound – Plant Store', batchNumber: 'BTR-PV45-2026-03',
    gradeSpecification: 'Bosch GBM 13 HRE 45mm poker; frequency 180Hz; 240V; IP44; max insertion depth 6m',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-10',
    wastageAllowancePercent: 0,
    notes: '2 units active, 2 spares. PAT tested monthly. Vibration protocol: max 600mm insertion spacing.',
    status: 'used', createdAt, updatedAt: createdAt,
  },
  {
    id: 36, projectId: 5, materialCode: 'DHL-EQP-005',
    materialName: '125 kVA Diesel Generator (Standby)',
    category: 'Equipment', plannedQuantity: 16, receivedQuantity: 16, usedQuantity: 4, remainingStock: 12,
    minimumStock: 0, reorderLevel: 0, unit: 'Month', unitCost: 1800, estimatedCost: 28800, actualCost: 7200,
    supplier: 'AggrePower Rwanda Ltd', supplierContact: '+250789300600', supplierEmail: 'power@aggrepower.rw',
    purchaseOrderNumber: 'PO-DHL-2026-036', deliveryDate: '2026-03-03', lastReceivedDate: '2026-03-03',
    storageLocation: 'Site Compound – Generator Bay (ventilated enclosure)', batchNumber: 'APR-125KVA-DHL-01',
    gradeSpecification: 'Perkins 1104A-44TG2; 125 kVA / 100 kW; IP44; 400V 3-phase; automatic transfer switch',
    qualityStatus: 'approved', inspectedBy: 'Nzeyimana Patrick', inspectionDate: '2026-03-04',
    wastageAllowancePercent: 0,
    notes: '2 units on-site — primary in continuous service, standby for outage backup. Weekly load-bank tests performed.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 37, projectId: 5, materialCode: 'DHL-EQP-006',
    materialName: 'Articulated Boom Lift 24 m (JLG)',
    category: 'Equipment', plannedQuantity: 10, receivedQuantity: 10, usedQuantity: 1, remainingStock: 9,
    minimumStock: 0, reorderLevel: 0, unit: 'Month', unitCost: 5200, estimatedCost: 52000, actualCost: 5200,
    supplier: 'Cranab Plant Hire Rwanda', supplierContact: '+250782300700', supplierEmail: 'hire@cranab.rw',
    purchaseOrderNumber: 'PO-DHL-2026-037', deliveryDate: '2026-06-05', lastReceivedDate: '2026-06-05',
    storageLocation: 'Site Perimeter – Block A South', batchNumber: 'CPR-JLG-DHL-01',
    gradeSpecification: 'JLG 660SJ; working height 24.2m; platform capacity 230kg; 4WD diesel; unrestricted use',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-06-05',
    wastageAllowancePercent: 0,
    notes: 'Mobilised for glazing installation from Level 2 upward. Boom-lift operator licence required. Daily pre-use checklist mandatory.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 38, projectId: 5, materialCode: 'DHL-EQP-007',
    materialName: 'Bar Bending Machine (Electric)',
    category: 'Equipment', plannedQuantity: 1, receivedQuantity: 1, usedQuantity: 1, remainingStock: 0,
    minimumStock: 0, reorderLevel: 0, unit: 'Unit', unitCost: 2400, estimatedCost: 2400, actualCost: 2400,
    supplier: 'Tools & Equipment Ltd Rwanda', supplierContact: '+250784100800', supplierEmail: 'sales@toolsrw.com',
    purchaseOrderNumber: 'PO-DHL-2026-038', deliveryDate: '2026-03-08', lastReceivedDate: '2026-03-08',
    storageLocation: 'Site Compound – Rebar Fabrication Bay', batchNumber: 'TER-BBM-2026-03',
    gradeSpecification: 'Max bar diameter 40mm; bending radius 2.5×D min; 3-phase 380V; CE marked',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-08',
    wastageAllowancePercent: 0,
    notes: 'Purchased (not hired). Used daily in rebar fabrication area. Operated by senior steel fixers. Monthly maintenance by plant team.',
    status: 'used', createdAt, updatedAt: createdAt,
  },
  {
    id: 39, projectId: 5, materialCode: 'DHL-EQP-008',
    materialName: 'Concrete Pump 40 m Line',
    category: 'Equipment', plannedQuantity: 12, receivedQuantity: 12, usedQuantity: 4, remainingStock: 8,
    minimumStock: 0, reorderLevel: 0, unit: 'Month', unitCost: 3600, estimatedCost: 43200, actualCost: 14400,
    supplier: 'ReadyMix Kigali Ltd', supplierContact: '+250787300200', supplierEmail: 'dispatch@readymixkigali.rw',
    purchaseOrderNumber: 'PO-DHL-2026-039', deliveryDate: '2026-04-01', lastReceivedDate: '2026-04-01',
    storageLocation: 'Site Compound – Next to batching plant', batchNumber: 'RMK-PUMP-DHL-01',
    gradeSpecification: 'Trailer-mounted concrete pump; 40m hose; max output 45 m³/hr; cylinder bore 200mm',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-04-01',
    wastageAllowancePercent: 0,
    notes: 'Enables concrete placement at upper floors and confined column zones. Operators rotate per shift. Daily greasing and pipeline flush log maintained.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  // Demo Homes Mixed-Use Complex — Labour BOQ (IDs 40–51)
  {
    id: 40, projectId: 5, materialCode: 'DHL-LAB-001',
    materialName: 'Lead Masons & Brickwork Team (8 masons)',
    category: 'Labor', plannedQuantity: 2560, receivedQuantity: 2560, usedQuantity: 920, remainingStock: 1640,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 28, estimatedCost: 71680, actualCost: 25760,
    supplier: 'Kigali Labour Bureau', supplierContact: '+250788500900', supplierEmail: 'labour@kigalilabour.rw',
    purchaseOrderNumber: 'PO-DHL-2026-040', deliveryDate: '2026-03-05', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Blocks A and B)', batchNumber: 'KLB-MAS-DHL-01',
    gradeSpecification: 'TVET Bricklaying Level II/III; min. 3 years experience; target output 500 bricks/WD/mason',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-05',
    wastageAllowancePercent: 0,
    notes: 'Core bricklaying gang of 8 masons led by Gilbert (Worker 7). Gang achieves 4,000–4,400 bricks/day. Attendance confirmed via QR scan.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 41, projectId: 5, materialCode: 'DHL-LAB-002',
    materialName: 'Steel Fixers (6 workers)',
    category: 'Labor', plannedQuantity: 1440, receivedQuantity: 1440, usedQuantity: 580, remainingStock: 860,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 35, estimatedCost: 50400, actualCost: 20300,
    supplier: 'Kigali Labour Bureau', supplierContact: '+250788500900', supplierEmail: 'labour@kigalilabour.rw',
    purchaseOrderNumber: 'PO-DHL-2026-041', deliveryDate: '2026-04-01', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Rebar Yard and RC Frame)', batchNumber: 'KLB-SF-DHL-02',
    gradeSpecification: 'Certified steel fixers; bar-bending schedule literacy; tying productivity ≥ 100 kg rebar/WD',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-01',
    wastageAllowancePercent: 0,
    notes: 'Steel fixing team works from structural drawings and bar-bending schedule. Rebar volumes tracked weekly.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 42, projectId: 5, materialCode: 'DHL-LAB-003',
    materialName: 'RC Frame Carpenters / Formworkers (5 workers)',
    category: 'Labor', plannedQuantity: 900, receivedQuantity: 900, usedQuantity: 380, remainingStock: 520,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 32, estimatedCost: 28800, actualCost: 12160,
    supplier: 'Kigali Labour Bureau', supplierContact: '+250788500900', supplierEmail: 'labour@kigalilabour.rw',
    purchaseOrderNumber: 'PO-DHL-2026-042', deliveryDate: '2026-04-01', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Formwork Yard and RC Frame)', batchNumber: 'KLB-CARP-DHL-03',
    gradeSpecification: 'TVET Carpentry Level II; formwork erection/striking experience; able to read structural drawings',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-01',
    wastageAllowancePercent: 0,
    notes: 'Formwork carpenters work in tandem with steel fixers per pour sequence. Stripping not permitted before cube test confirms 10 N/mm².',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 43, projectId: 5, materialCode: 'DHL-LAB-004',
    materialName: 'Glazing Technicians (4 workers)',
    category: 'Labor', plannedQuantity: 640, receivedQuantity: 640, usedQuantity: 48, remainingStock: 592,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 48, estimatedCost: 30720, actualCost: 2304,
    supplier: 'GlazTech Africa Ltd', supplierContact: '+254722456789', supplierEmail: 'orders@glaztechafrica.com',
    purchaseOrderNumber: 'PO-DHL-2026-043', deliveryDate: '2026-05-20', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Block A Facade)', batchNumber: 'GTA-TECH-DHL-04',
    gradeSpecification: 'AGC Certified Curtain-Wall Installers; working-at-height cert.; boom-lift operator licence',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-05-22',
    wastageAllowancePercent: 0,
    notes: 'Specialist glazing crew from GlazTech Africa (Nairobi). Currently on Block A south elevation. Target: 30 m²/WD per team.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 44, projectId: 5, materialCode: 'DHL-LAB-005',
    materialName: 'Site Supervisors (3 persons)',
    category: 'Labor', plannedQuantity: 900, receivedQuantity: 900, usedQuantity: 360, remainingStock: 540,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 55, estimatedCost: 49500, actualCost: 19800,
    supplier: 'Direct Hire', supplierContact: '+250782000001', supplierEmail: 'hr@scpras.rw',
    purchaseOrderNumber: 'PO-DHL-2026-044', deliveryDate: '2026-03-01', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Site Office)', batchNumber: 'DHR-SUP-DHL-05',
    gradeSpecification: 'RTDA Site Supervisor Cert.; minimum 5 years supervisory experience; safety-officer qualified',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-01',
    wastageAllowancePercent: 0,
    notes: 'Three shift supervisors (morning/afternoon/split-day) for 10-hr site coverage. Daily site diary maintained.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 45, projectId: 5, materialCode: 'DHL-LAB-006',
    materialName: 'General Labourers (20 workers)',
    category: 'Labor', plannedQuantity: 8000, receivedQuantity: 8000, usedQuantity: 2400, remainingStock: 5600,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 18, estimatedCost: 144000, actualCost: 43200,
    supplier: 'Kigali Labour Bureau', supplierContact: '+250788500900', supplierEmail: 'labour@kigalilabour.rw',
    purchaseOrderNumber: 'PO-DHL-2026-045', deliveryDate: '2026-03-05', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (All blocks)', batchNumber: 'KLB-GL-DHL-06',
    gradeSpecification: 'Unskilled general labourers; induction training mandatory on day 1; PPE issued by site',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-05',
    wastageAllowancePercent: 0,
    notes: 'Materials movement, site cleaning, concrete support, scaffold loading. Average 20/day; peaks to 28 on pour days.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 46, projectId: 5, materialCode: 'DHL-LAB-007',
    materialName: 'Electricians (4 workers)',
    category: 'Labor', plannedQuantity: 800, receivedQuantity: 800, usedQuantity: 0, remainingStock: 800,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 45, estimatedCost: 36000, actualCost: 0,
    supplier: 'Power Systems Rwanda Ltd', supplierContact: '+250788100200', supplierEmail: 'contracts@powersystems.rw',
    purchaseOrderNumber: 'PO-DHL-2026-046', deliveryDate: '2026-08-20', lastReceivedDate: null,
    storageLocation: 'Not yet mobilised', batchNumber: 'PSR-ELEC-DHL-07',
    gradeSpecification: 'REMA Licensed Electricians; IEE 17th Ed.; 11kV safe working; testing & commissioning capability',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 0,
    notes: 'Electrical sub-contract for permanent wiring, panels, and testing. Mobilisation with MEP rough-in (Aug 2026). Patrick (Worker 8) leads site coordination.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 47, projectId: 5, materialCode: 'DHL-LAB-008',
    materialName: 'Plumbers (4 workers)',
    category: 'Labor', plannedQuantity: 800, receivedQuantity: 800, usedQuantity: 0, remainingStock: 800,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 42, estimatedCost: 33600, actualCost: 0,
    supplier: 'Plumb Rwanda Ltd', supplierContact: '+250783200300', supplierEmail: 'contracts@plumbrw.com',
    purchaseOrderNumber: 'PO-DHL-2026-047', deliveryDate: '2026-09-01', lastReceivedDate: null,
    storageLocation: 'Not yet mobilised', batchNumber: 'PRW-PLMB-DHL-08',
    gradeSpecification: 'Certified plumbers; RURA licensed; multi-storey water riser and drainage stack experience',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 0,
    notes: 'Plumbing sub-contract: water supply risers, drainage stacks (42 units + commercial), and fire suppression rough-in. Drawings M-02 issued.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 48, projectId: 5, materialCode: 'DHL-LAB-009',
    materialName: 'Tilers & Finishers (8 workers)',
    category: 'Labor', plannedQuantity: 1920, receivedQuantity: 1920, usedQuantity: 0, remainingStock: 1920,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 30, estimatedCost: 57600, actualCost: 0,
    supplier: 'Finishers Guild Rwanda', supplierContact: '+250782600400', supplierEmail: 'guild@finishersrw.com',
    purchaseOrderNumber: 'PO-DHL-2026-048', deliveryDate: '2027-01-05', lastReceivedDate: null,
    storageLocation: 'Not yet mobilised', batchNumber: 'FGR-TIL-DHL-09',
    gradeSpecification: 'TVET Plastering/Tiling Level II; painters with texture and skim coat finishes experience',
    qualityStatus: 'pending_inspection', inspectedBy: '', inspectionDate: null,
    wastageAllowancePercent: 0,
    notes: 'Internal finishing team for residential fit-out (Jan–May 2027): floor/wall tiling, plastering, skim coat, and painting across all 42 units.',
    status: 'pending', createdAt, updatedAt: createdAt,
  },
  {
    id: 49, projectId: 5, materialCode: 'DHL-LAB-010',
    materialName: 'External Scaffold Crew (6 workers)',
    category: 'Labor', plannedQuantity: 1080, receivedQuantity: 1080, usedQuantity: 380, remainingStock: 700,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 22, estimatedCost: 23760, actualCost: 8360,
    supplier: 'SafeScaff Rwanda Ltd', supplierContact: '+250786400400', supplierEmail: 'scaffolding@safescaff.rw',
    purchaseOrderNumber: 'PO-DHL-2026-049', deliveryDate: '2026-03-12', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Block A/B external scaffold)', batchNumber: 'SSR-CREW-DHL-10',
    gradeSpecification: 'NASC-trained scaffold erectors; working-at-height certificate; site-specific risk assessment done',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-12',
    wastageAllowancePercent: 0,
    notes: 'Scaffold crew handles erection, adaptation, and dismantling as works progress floor-by-floor. Inspection log per NASC TG20.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 50, projectId: 5, materialCode: 'DHL-LAB-011',
    materialName: 'Concrete Pump Operators (2 workers)',
    category: 'Labor', plannedQuantity: 240, receivedQuantity: 240, usedQuantity: 96, remainingStock: 144,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 38, estimatedCost: 9120, actualCost: 3648,
    supplier: 'ReadyMix Kigali Ltd', supplierContact: '+250787300200', supplierEmail: 'dispatch@readymixkigali.rw',
    purchaseOrderNumber: 'PO-DHL-2026-050', deliveryDate: '2026-04-01', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (concrete pump area)', batchNumber: 'RMK-OPR-DHL-11',
    gradeSpecification: 'Certified concrete pump operators; mix-design and slump testing knowledge; site safety trained',
    qualityStatus: 'approved', inspectedBy: 'Uwimana Vestine', inspectionDate: '2026-04-01',
    wastageAllowancePercent: 0,
    notes: 'Two operators rotate to cover continuous pour operations. Responsible for pump maintenance log, line-cleaning, and post-pour checks.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  {
    id: 51, projectId: 5, materialCode: 'DHL-LAB-012',
    materialName: 'Safety & QC Inspector (2 persons)',
    category: 'Labor', plannedQuantity: 600, receivedQuantity: 600, usedQuantity: 240, remainingStock: 360,
    minimumStock: 0, reorderLevel: 0, unit: 'WD', unitCost: 52, estimatedCost: 31200, actualCost: 12480,
    supplier: 'BuildSafe Rwanda Ltd', supplierContact: '+250781500500', supplierEmail: 'qhse@buildsaferw.com',
    purchaseOrderNumber: 'PO-DHL-2026-051', deliveryDate: '2026-03-01', lastReceivedDate: '2026-06-09',
    storageLocation: 'On-site (Site Office – QC/HS Station)', batchNumber: 'BSR-QHSE-DHL-12',
    gradeSpecification: 'NEBOSH IGC certified; QHSE auditor qualification; ISO 9001 quality management awareness',
    qualityStatus: 'approved', inspectedBy: 'Hakizimana Pierre', inspectionDate: '2026-03-01',
    wastageAllowancePercent: 0,
    notes: 'QHSE team conducting daily safety inspections, near-miss reporting, concrete cube tests, and incoming material QC checks. Monthly report submitted to client.',
    status: 'received', createdAt, updatedAt: createdAt,
  },
  ...singleStoreyBomItems.map((item, index) => ({
    id: 1000 + index,
    projectId: 6,
    ...item,
    createdAt,
    updatedAt: createdAt,
  })),
];

const materialIssues = [];
const materialReceipts = [];

const attendance = [
  {
    id: 1,
    workerId: 1,
    projectId: 1,
    checkIn: '2026-06-09T05:30:00.000Z',
    checkOut: '2026-06-09T15:30:00.000Z',
    hoursWorked: 10,
    status: 'present',
    notes: 'Completed walling section A.',
    location: 'Kigali, Rwanda',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 2,
    workerId: 2,
    projectId: 1,
    checkIn: '2026-06-09T05:40:00.000Z',
    checkOut: '2026-06-09T15:10:00.000Z',
    hoursWorked: 9.5,
    status: 'present',
    notes: 'Door frame works.',
    location: 'Kigali, Rwanda',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 3,
    workerId: 3,
    projectId: 2,
    checkIn: '2026-06-09T06:00:00.000Z',
    checkOut: null,
    hoursWorked: 0,
    status: 'absent',
    notes: 'No check-in recorded.',
    location: 'Musanze',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 4,
    workerId: 4,
    projectId: 3,
    checkIn: '2026-06-09T05:35:00.000Z',
    checkOut: '2026-06-09T15:05:00.000Z',
    hoursWorked: 9.5,
    status: 'present',
    notes: 'Rebar placement.',
    location: 'Rubavu',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 5,
    workerId: 1,
    projectId: 3,
    checkIn: '2026-06-08T05:35:00.000Z',
    checkOut: '2026-06-08T15:05:00.000Z',
    hoursWorked: 9.5,
    status: 'present',
    notes: 'Roadside drainage.',
    location: 'Rubavu',
    createdAt,
    updatedAt: createdAt,
  },
  // Worker 5 (Pierre — Site Foreman) on Demo Homes, Jun 4–9
  { id: 6,  workerId: 5, projectId: 5, checkIn: '2026-06-04T05:30:00.000Z', checkOut: '2026-06-04T15:15:00.000Z', hoursWorked: 9.75, status: 'present', notes: 'Site-wide daily briefing; coordinated concrete pour for Block A columns C7–C12.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 7,  workerId: 5, projectId: 5, checkIn: '2026-06-05T05:28:00.000Z', checkOut: '2026-06-05T15:10:00.000Z', hoursWorked: 9.7,  status: 'present', notes: 'Inspected formwork stripping for Block B Level 2; supervised rebar placement on columns B4–B8.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 8,  workerId: 5, projectId: 5, checkIn: '2026-06-06T05:35:00.000Z', checkOut: '2026-06-06T15:20:00.000Z', hoursWorked: 9.75, status: 'present', notes: 'Managed delivery of 200 bags CIMERWA cement; updated daily progress report for client.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 9,  workerId: 5, projectId: 5, checkIn: '2026-06-07T05:30:00.000Z', checkOut: '2026-06-07T15:00:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Conducted site safety inspection; resolved scaffold tie-back issue on Block A Level 3.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 10, workerId: 5, projectId: 5, checkIn: '2026-06-08T05:32:00.000Z', checkOut: '2026-06-08T15:08:00.000Z', hoursWorked: 9.6,  status: 'present', notes: 'Coordinated glazing team mobilisation; verified curtain-wall anchor positions on Block A south facade.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 11, workerId: 5, projectId: 5, checkIn: '2026-06-09T05:30:00.000Z', checkOut: '2026-06-09T15:15:00.000Z', hoursWorked: 9.75, status: 'present', notes: 'Weekly progress meeting with client representative; reviewed Block C pile-cap reinforcement works.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  // Worker 6 (Vestine — Glazing Specialist) on Demo Homes, Jun 4–8
  { id: 12, workerId: 6, projectId: 5, checkIn: '2026-06-04T06:00:00.000Z', checkOut: '2026-06-04T15:30:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Set up curtain-wall installation rig on Block A Level 1; checked mullion alignment against drawing CW-01.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 13, workerId: 6, projectId: 5, checkIn: '2026-06-05T05:55:00.000Z', checkOut: '2026-06-05T15:25:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Installed 18 curtain-wall panels on Block A south facade; quality check passed with no deviations.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 14, workerId: 6, projectId: 5, checkIn: '2026-06-06T06:02:00.000Z', checkOut: '2026-06-06T15:28:00.000Z', hoursWorked: 9.4,  status: 'present', notes: 'Supervised IGU delivery inspection; 24 double-glazed units verified to spec and placed in A-frame racks.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 15, workerId: 6, projectId: 5, checkIn: '2026-06-07T05:58:00.000Z', checkOut: '2026-06-07T15:22:00.000Z', hoursWorked: 9.4,  status: 'present', notes: 'Installed 12 additional curtain-wall panels; conducted wind-load deflection test — all within tolerance.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 16, workerId: 6, projectId: 5, checkIn: '2026-06-08T06:00:00.000Z', checkOut: '2026-06-08T15:30:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Block A facade Level 1 glazing complete (30 m²); snagging list compiled — 3 panels require seal reapplication.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  // Worker 7 (Gilbert — Lead Bricklayer) on Demo Homes, Jun 4–9
  { id: 17, workerId: 7, projectId: 5, checkIn: '2026-06-04T05:20:00.000Z', checkOut: '2026-06-04T14:50:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Led team of 8 masons; completed brickwork courses 14–18 on Block A Grid 3–5. Plumb checked and approved.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 18, workerId: 7, projectId: 5, checkIn: '2026-06-05T05:25:00.000Z', checkOut: '2026-06-05T14:55:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Brickwork Block A Grid 6–8; team productivity 4,200 bricks/day against 4,000 target. Mortar mix 1:4 confirmed.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 19, workerId: 7, projectId: 5, checkIn: '2026-06-06T05:22:00.000Z', checkOut: '2026-06-06T14:52:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Brickwork Block B Grid 1–3 started; mortar mix ratio spot-checked by site engineer and verified compliant.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 20, workerId: 7, projectId: 5, checkIn: '2026-06-07T05:20:00.000Z', checkOut: '2026-06-07T14:48:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Block A brickwork snagging — corrected 2 plumb deviations; quoin brickwork and soldier courses completed.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 21, workerId: 7, projectId: 5, checkIn: '2026-06-08T05:18:00.000Z', checkOut: '2026-06-08T14:46:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Block B Level 1 brickwork complete; 3,800 bricks placed, lintel beams cast in-place over openings.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 22, workerId: 7, projectId: 5, checkIn: '2026-06-09T05:25:00.000Z', checkOut: '2026-06-09T14:55:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Block A Level 2 brickwork progressed to 60%; conducted gang training on DPC sheet installation method.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  // Worker 8 (Patrick — Electrician) on Demo Homes, Jun 4–7
  { id: 23, workerId: 8, projectId: 5, checkIn: '2026-06-04T06:10:00.000Z', checkOut: '2026-06-04T15:40:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Installed temporary site power distribution board; connected 3-phase 125A supply to tower crane and batching plant.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 24, workerId: 8, projectId: 5, checkIn: '2026-06-05T06:08:00.000Z', checkOut: '2026-06-05T15:38:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Pre-installed conduit sleeves through Block A Level 1 slab; 48 conduit runs placed ahead of concrete pour.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 25, workerId: 8, projectId: 5, checkIn: '2026-06-06T06:05:00.000Z', checkOut: '2026-06-06T15:35:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Earthing system installation for site compound completed; generator commissioning test passed (both units).', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 26, workerId: 8, projectId: 5, checkIn: '2026-06-07T06:12:00.000Z', checkOut: '2026-06-07T15:42:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Block A Level 1 DB panel rough-in started; co-ordinated riser shaft sizing with structural engineer.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  // Worker 1 (Jean Bosco — Mason) supporting Demo Homes, Jun 8–9
  { id: 27, workerId: 1, projectId: 5, checkIn: '2026-06-08T05:35:00.000Z', checkOut: '2026-06-08T15:05:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Support to Block B brickwork team; placed 1,800 bricks on south elevation with Gilbert\'s gang.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 28, workerId: 1, projectId: 5, checkIn: '2026-06-09T05:38:00.000Z', checkOut: '2026-06-09T15:08:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Block B Level 2 starter bars checked for position and spacing; assisted with DPC sheet installation on return wall.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  // Worker 2 (Claudine — Site Engineer) supporting Demo Homes, Jun 8–9
  { id: 29, workerId: 2, projectId: 5, checkIn: '2026-06-08T05:45:00.000Z', checkOut: '2026-06-08T15:15:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Structural inspection of Block A RC frame joints at Level 2; signed off columns A4–A9 for pour on 10 Jun.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
  { id: 30, workerId: 2, projectId: 5, checkIn: '2026-06-09T05:42:00.000Z', checkOut: '2026-06-09T15:12:00.000Z', hoursWorked: 9.5,  status: 'present', notes: 'Reviewed Block C pile cap reinforcement drawings; issued revised bar bending schedule to steel fixing team.', location: 'KG 17 Ave, Kacyiru, Kigali', createdAt, updatedAt: createdAt },
];

const projectPhases = [
  { id: 1, projectId: 1, name: 'Foundation', startDate: '2026-06-01', endDate: '2026-06-20', progress: 100, status: 'completed', createdAt, updatedAt: createdAt },
  { id: 2, projectId: 1, name: 'Walling', startDate: '2026-06-21', endDate: '2026-07-20', progress: 65, status: 'active', createdAt, updatedAt: createdAt },
  { id: 3, projectId: 1, name: 'Roofing', startDate: '2026-07-21', endDate: '2026-08-10', progress: 0, status: 'planned', createdAt, updatedAt: createdAt },
  { id: 4, projectId: 2, name: 'Classroom Block', startDate: '2026-05-10', endDate: '2026-08-25', progress: 45, status: 'delayed', createdAt, updatedAt: createdAt },
  { id: 5, projectId: 3, name: 'Drainage Works', startDate: '2026-04-20', endDate: '2026-07-15', progress: 60, status: 'active', createdAt, updatedAt: createdAt },
  { id: 6,  projectId: 4, name: 'Site Preparation',                          startDate: '2026-06-05', endDate: '2026-07-05', progress: 30, status: 'active',    createdAt, updatedAt: createdAt },
  // Demo Homes Mixed-Use Complex phases (IDs 7–18)
  { id: 7,  projectId: 5, name: 'Site Preparation & Demolition',             startDate: '2026-03-01', endDate: '2026-03-15', progress: 100, status: 'completed', createdAt, updatedAt: createdAt },
  { id: 8,  projectId: 5, name: 'Foundation & Basement Slab',                startDate: '2026-03-16', endDate: '2026-04-30', progress: 100, status: 'completed', createdAt, updatedAt: createdAt },
  { id: 9,  projectId: 5, name: 'RC Frame & Structural Columns',             startDate: '2026-05-01', endDate: '2026-07-15', progress: 95,  status: 'active',    createdAt, updatedAt: createdAt },
  { id: 10, projectId: 5, name: 'Block A Brickwork & Walling',               startDate: '2026-05-15', endDate: '2026-08-31', progress: 60,  status: 'active',    createdAt, updatedAt: createdAt },
  { id: 11, projectId: 5, name: 'Block B Tower Shell',                       startDate: '2026-06-01', endDate: '2026-09-30', progress: 40,  status: 'active',    createdAt, updatedAt: createdAt },
  { id: 12, projectId: 5, name: 'Block C Podium Shell',                      startDate: '2026-06-10', endDate: '2026-10-31', progress: 15,  status: 'active',    createdAt, updatedAt: createdAt },
  { id: 13, projectId: 5, name: 'Curtain Wall & Glazing Installation',       startDate: '2026-07-01', endDate: '2026-10-31', progress: 10,  status: 'active',    createdAt, updatedAt: createdAt },
  { id: 14, projectId: 5, name: 'Roof Structure & Waterproofing',            startDate: '2026-08-01', endDate: '2026-10-15', progress: 5,   status: 'planned',   createdAt, updatedAt: createdAt },
  { id: 15, projectId: 5, name: 'MEP Rough-in (Electrical & Plumbing)',      startDate: '2026-08-15', endDate: '2027-01-31', progress: 0,   status: 'planned',   createdAt, updatedAt: createdAt },
  { id: 16, projectId: 5, name: 'Interior Common Areas Fit-out',             startDate: '2026-11-01', endDate: '2027-03-31', progress: 0,   status: 'planned',   createdAt, updatedAt: createdAt },
  { id: 17, projectId: 5, name: 'Interior Residential Fit-out (42 Units)',   startDate: '2027-01-01', endDate: '2027-05-31', progress: 0,   status: 'planned',   createdAt, updatedAt: createdAt },
  { id: 18, projectId: 5, name: 'External Works, Landscaping & Commissioning', startDate: '2027-03-01', endDate: '2027-06-30', progress: 0, status: 'planned',   createdAt, updatedAt: createdAt },
  // Single Storey Residential House — 13 phases (IDs 19–31)
  { id: 19, projectId: 6, name: 'Phase 1 — Preliminaries & Site Setup',         startDate: '2026-07-07', endDate: '2026-07-11', progress: 0, status: 'planned', description: 'Site clearing, temporary store, toilet, water, electricity, setting out, safety signage, transport mobilisation, drawings printing, permits.', createdAt, updatedAt: createdAt },
  { id: 20, projectId: 6, name: 'Phase 2 — Excavation & Earthworks',            startDate: '2026-07-14', endDate: '2026-07-18', progress: 0, status: 'planned', description: 'Strip foundation excavation (65 m³), septic/soakaway excavation, soil disposal, hardcore filling, murram backfill.', createdAt, updatedAt: createdAt },
  { id: 21, projectId: 6, name: 'Phase 3–4 — Foundation & Ground Slab',         startDate: '2026-07-21', endDate: '2026-08-01', progress: 0, status: 'planned', description: 'Sand blinding, DPM membrane, anti-termite treatment, foundation concrete (16 m³), foundation masonry, DPC, ground slab.', createdAt, updatedAt: createdAt },
  { id: 22, projectId: 6, name: 'Phase 4–5 — Walling & Masonry',                startDate: '2026-08-04', endDate: '2026-08-22', progress: 0, status: 'planned', description: 'External wall blocks (200 mm, 1700 pcs), internal wall blocks (150 mm, 2500 pcs), mortar, wall ties, vent blocks.', createdAt, updatedAt: createdAt },
  { id: 23, projectId: 6, name: 'Phase 5–6 — Lintels, Columns & Ring Beam',     startDate: '2026-08-18', endDate: '2026-08-29', progress: 0, status: 'planned', description: 'Lintel concrete (3 m³), column concrete (5 m³), ring beam (8 m³), reinforcement steel Y8/Y10/Y12/Y16, formwork.', createdAt, updatedAt: createdAt },
  { id: 24, projectId: 6, name: 'Phase 6 — Electrical & Plumbing First Fix',    startDate: '2026-08-25', endDate: '2026-09-05', progress: 0, status: 'planned', description: 'PVC conduits, junction boxes, PPR water pipes, PVC waste/soil pipes, electrical cable rough-in.', createdAt, updatedAt: createdAt },
  { id: 25, projectId: 6, name: 'Phase 7 — Roofing Works',                      startDate: '2026-09-01', endDate: '2026-09-12', progress: 0, status: 'planned', description: 'Timber/steel trusses (1 LS), purlins (280 m), roofing sheets (165 m²), ridge caps, flashings, gutters, downpipes.', createdAt, updatedAt: createdAt },
  { id: 26, projectId: 6, name: 'Phase 8 — Plastering',                         startDate: '2026-09-08', endDate: '2026-09-26', progress: 0, status: 'planned', description: 'Internal plaster (520 m²), external plaster (180 m²), floor screed (130 m²).', createdAt, updatedAt: createdAt },
  { id: 27, projectId: 6, name: 'Phase 9 — Doors, Windows & Metal Works',       startDate: '2026-09-15', endDate: '2026-09-26', progress: 0, status: 'planned', description: 'Main entrance door, rear door, 4 bedroom doors, 2 bathroom doors, kitchen door, 9 frames, locks, W1/W2/W3 aluminium windows, burglar proofing.', createdAt, updatedAt: createdAt },
  { id: 28, projectId: 6, name: 'Phase 10 — Tiling & Ceiling',                  startDate: '2026-09-22', endDate: '2026-10-10', progress: 0, status: 'planned', description: 'Floor tiles (living, bedrooms, kitchen, bathrooms, porch), wall tiles (bathrooms, kitchen), tile adhesive/grout, gypsum ceiling (130 m²), skirting.', createdAt, updatedAt: createdAt },
  { id: 29, projectId: 6, name: 'Phase 11 — Plumbing & Electrical Second Fix',  startDate: '2026-10-05', endDate: '2026-10-17', progress: 0, status: 'planned', description: 'Sanitary ware (WC, basins, showers), kitchen sink, water pump/tank, DB panel, sockets, switches, light points, heater connections.', createdAt, updatedAt: createdAt },
  { id: 30, projectId: 6, name: 'Phase 12 — Painting & Decoration',             startDate: '2026-10-13', endDate: '2026-10-24', progress: 0, status: 'planned', description: 'Interior/exterior primer, emulsion paint (interior 180L), weatherproof exterior paint (100L), ceiling paint, metal paint, putty/filler.', createdAt, updatedAt: createdAt },
  { id: 31, projectId: 6, name: 'Phase 13 — External Works & Handover',         startDate: '2026-10-20', endDate: '2026-11-03', progress: 0, status: 'planned', description: 'Septic tank construction, soakaway pit, inspection chambers, storm drainage, concrete apron, walkway/paving, compound levelling, landscaping, boundary/gate.', createdAt, updatedAt: createdAt },
];

const projectDocuments = [
  {
    id: 1,
    projectId: 6,
    ...singleStoreyDrawing,
    createdAt,
    updatedAt: createdAt,
  },
];

const projectAssignments = [
  { id: 1, projectId: 1, workerId: 1, role: 'Mason', createdAt, updatedAt: createdAt },
  { id: 2, projectId: 1, workerId: 2, role: 'Carpenter', createdAt, updatedAt: createdAt },
  { id: 3, projectId: 2, workerId: 3, role: 'Helper', createdAt, updatedAt: createdAt },
  { id: 4, projectId: 3, workerId: 4, role: 'Steel Fixer', createdAt, updatedAt: createdAt },
  { id: 5,  projectId: 3, workerId: 1, role: 'Mason',             createdAt, updatedAt: createdAt },
  // Demo Homes Mixed-Use Complex assignments (IDs 6–13)
  { id: 6,  projectId: 5, workerId: 5, role: 'Site Foreman',      createdAt, updatedAt: createdAt },
  { id: 7,  projectId: 5, workerId: 6, role: 'Glazing Specialist', createdAt, updatedAt: createdAt },
  { id: 8,  projectId: 5, workerId: 7, role: 'Lead Bricklayer',   createdAt, updatedAt: createdAt },
  { id: 9,  projectId: 5, workerId: 8, role: 'Electrician',       createdAt, updatedAt: createdAt },
  { id: 10, projectId: 5, workerId: 1, role: 'Mason',             createdAt, updatedAt: createdAt },
  { id: 11, projectId: 5, workerId: 2, role: 'Site Engineer',     createdAt, updatedAt: createdAt },
  { id: 12, projectId: 5, workerId: 3, role: 'General Labourer',  createdAt, updatedAt: createdAt },
  { id: 13, projectId: 5, workerId: 4, role: 'Steel Fixer',       createdAt, updatedAt: createdAt },
  // Single Storey Residential House assignments
  { id: 14, projectId: 6, workerId: 3, role: 'Site Engineer',     createdAt, updatedAt: createdAt },
  { id: 15, projectId: 6, workerId: 5, role: 'Project Manager',   createdAt, updatedAt: createdAt },
  { id: 16, projectId: 6, workerId: 1, role: 'Lead Mason',        createdAt, updatedAt: createdAt },
];

const workActivities = [
  { id: 1, projectId: 1, activityCode: 'ACT-001', activityName: 'Walling works', description: 'External blockwork completed to window level.', constraints: '', phase: 'Walling', plannedStartDate: '2026-06-21', plannedEndDate: '2026-07-20', actualStartDate: '2026-06-21', actualEndDate: null, plannedProgress: 70, actualProgress: 65, status: 'ongoing', responsiblePerson: 'Uwimana Vestine', createdAt, updatedAt: createdAt },
  { id: 2, projectId: 2, activityCode: 'ACT-002', activityName: 'Classroom roofing', description: 'Truss erection is behind the approved programme.', constraints: 'Delivery of roofing sheets delayed by supplier.', phase: 'Classroom Block', plannedStartDate: '2026-06-10', plannedEndDate: '2026-06-28', actualStartDate: '2026-06-12', actualEndDate: null, plannedProgress: 70, actualProgress: 45, status: 'delayed', responsiblePerson: 'Nshimiyimana Eric', createdAt, updatedAt: createdAt },
  { id: 3, projectId: 3, activityCode: 'ACT-003', activityName: 'Road drainage installation', description: 'Culvert and side-drain work progressing in the eastern section.', constraints: '', phase: 'Drainage Works', plannedStartDate: '2026-05-20', plannedEndDate: '2026-07-15', actualStartDate: '2026-05-22', actualEndDate: null, plannedProgress: 62, actualProgress: 60, status: 'ongoing', responsiblePerson: 'Uwimana Vestine', createdAt, updatedAt: createdAt },
  { id: 4, projectId: 5, activityCode: 'ACT-004', activityName: 'RC frame and columns', description: 'Level-two columns checked and approved for concrete placement.', constraints: 'Concrete pump allocation must be confirmed before the pour.', phase: 'RC Frame & Structural Columns', plannedStartDate: '2026-05-01', plannedEndDate: '2026-07-15', actualStartDate: '2026-05-01', actualEndDate: null, plannedProgress: 95, actualProgress: 90, status: 'ongoing', responsiblePerson: 'Uwimana Vestine', createdAt, updatedAt: createdAt },
];

const devices = [
  { id: 1, name: 'Main Gate QR Scanner', type: 'qr', location: 'Kigali, Rwanda', status: 'online', lastSeen: createdAt, createdAt, updatedAt: createdAt },
  { id: 2, name: 'Warehouse RFID Reader', type: 'rfid', location: 'Huye', status: 'online', lastSeen: createdAt, createdAt, updatedAt: createdAt },
  { id: 3, name: 'Mobile Site Supervisor App',       type: 'mobile', location: 'Rubavu',                    status: 'maintenance', lastSeen: createdAt, createdAt, updatedAt: createdAt },
  { id: 4, name: 'Demo Homes Site Entry Scanner',   type: 'qr',     location: 'KG 17 Ave, Kacyiru, Kigali', status: 'online',      lastSeen: createdAt, createdAt, updatedAt: createdAt },
];

const reportTemplates = [
  { id: 1, name: 'Project Progress Report',  format: 'PDF',   status: 'Ready', type: 'progress'  },
  { id: 2, name: 'Material Tracking Report', format: 'Excel', status: 'Ready', type: 'material'   },
  { id: 3, name: 'Attendance Report',        format: 'PDF',   status: 'Ready', type: 'attendance' },
  { id: 4, name: 'AI Insights Report',       format: 'JSON',  status: 'Ready', type: 'ai'         },
  { id: 5, name: 'Workforce Report',         format: 'PDF',   status: 'Ready', type: 'workforce'  },
  { id: 6, name: 'Financial Summary Report', format: 'Excel', status: 'Ready', type: 'financial'  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const hasValue = (source, field) => Object.prototype.hasOwnProperty.call(source, field);
const roundQuantity = (value) => Math.round(value * 1000) / 1000;
const demoMaterialCode = () => `BI-MAT-${String(nextMaterialId).padStart(3, '0')}`;
const materialStatuses = ['pending', 'received', 'used', 'damaged'];

function demoMaterialStatus(status, receivedQuantity, usedQuantity, fallback = 'pending') {
  if (materialStatuses.includes(status)) return status;
  if (fallback === 'damaged') return fallback;
  if (receivedQuantity <= 0) return 'pending';
  if (usedQuantity >= receivedQuantity) return 'used';
  return 'received';
}

function normalizeDemoMaterial(material) {
  const plannedQuantity = toNumber(material.plannedQuantity);
  const usedQuantity = toNumber(material.usedQuantity);
  const receivedQuantity = hasValue(material, 'receivedQuantity') ? toNumber(material.receivedQuantity) : plannedQuantity;
  const unitCost = hasValue(material, 'unitCost') ? toNumber(material.unitCost) : toNumber(material.estimatedCost) / Math.max(1, plannedQuantity);

  return {
    materialCode: '',
    category: '',
    receivedQuantity,
    minimumStock: 0,
    reorderLevel: 0,
    unitCost,
    supplierContact: '',
    supplierEmail: '',
    purchaseOrderNumber: '',
    invoiceNumber: '',
    lastReceivedDate: material.deliveryDate || null,
    storageLocation: '',
    batchNumber: '',
    gradeSpecification: '',
    qualityStatus: 'approved',
    inspectedBy: '',
    inspectionDate: null,
    wastageAllowancePercent: 0,
    notes: '',
    ...material,
    receivedQuantity,
    remainingStock: hasValue(material, 'remainingStock') ? material.remainingStock : roundQuantity(receivedQuantity - usedQuantity),
    unitCost,
  };
}

const publicUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const generateDemoToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, demo: true },
  env.jwtSecret,
  { expiresIn: env.jwtExpiresIn },
);

const getUser = (userId) => users.find((user) => user.id === Number(userId));
const getProject = (projectId) => projects.find((project) => project.id === Number(projectId));
const getWorker = (workerId) => workers.find((worker) => worker.id === Number(workerId));

function withWorkerRelations(worker) {
  return {
    ...worker,
    User: publicUser(getUser(worker.userId)),
    Attendances: attendance.filter((record) => record.workerId === worker.id),
  };
}

function withMaterialRelations(material) {
  const normalized = normalizeDemoMaterial(material);

  return {
    ...normalized,
    Project: getProject(normalized.projectId) || null,
  };
}

function withAttendanceRelations(record) {
  const worker = getWorker(record.workerId);
  return {
    ...record,
    Worker: worker ? withWorkerRelations(worker) : null,
    Project: getProject(record.projectId) || null,
  };
}

function withProjectRelations(project) {
  return {
    ...project,
    Materials: materials.filter((material) => material.projectId === project.id),
    Attendances: attendance.filter((record) => record.projectId === project.id),
    ProjectPhases: projectPhases.filter((phase) => phase.projectId === project.id),
    ProjectDocuments: projectDocuments.filter((document) => document.projectId === project.id),
    ProjectAssignments: projectAssignments
      .filter((assignment) => assignment.projectId === project.id)
      .map((assignment) => ({ ...assignment, Worker: withWorkerRelations(getWorker(assignment.workerId)) })),
  };
}

function materialVariance(material) {
  if (!material.plannedQuantity) return 0;
  return Math.round(((material.usedQuantity - material.plannedQuantity) / material.plannedQuantity) * 1000) / 10;
}

export function findDemoUserByCredentials(email, password) {
  const user = users.find((item) => item.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || user.password !== password) return null;
  return publicUser(user);
}

export function getDemoUserById(id) {
  return publicUser(getUser(id));
}

export function createDemoUser(body) {
  const user = {
    id: nextUserId,
    fullName: body.fullName,
    email: body.email,
    password: body.password,
    role: body.role || 'contractor_foreman',
    phone: body.phone || '',
    nationalId: body.nationalId || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  nextUserId += 1;
  users.push(user);
  return publicUser(user);
}

export function updateDemoUserAccount(id, body) {
  const user = getUser(id);
  if (!user) return null;
  for (const field of ['fullName', 'email', 'password', 'role', 'phone', 'status']) {
    if (body[field] !== undefined && body[field] !== '') user[field] = body[field];
  }
  user.updatedAt = new Date().toISOString();
  return publicUser(user);
}

export function deleteDemoUserAccount(id, currentUserId) {
  if (Number(id) === Number(currentUserId)) return 'self';
  const index = users.findIndex((user) => user.id === Number(id));
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

export function getDemoProjects() {
  return clone(projects.map(withProjectRelations).sort((a, b) => b.id - a.id));
}

export function getDemoActivities(projectId) {
  return clone(workActivities
    .filter((activity) => !projectId || activity.projectId === Number(projectId))
    .map((activity) => ({ ...activity, Project: { projectName: getProject(activity.projectId)?.projectName || 'Unknown project' } }))
    .sort((a, b) => b.id - a.id));
}

export function createDemoActivity(body) {
  const now = new Date().toISOString();
  const activity = {
    id: nextActivityId,
    projectId: Number(body.projectId),
    activityCode: body.activityCode || `ACT-${String(nextActivityId).padStart(3, '0')}`,
    activityName: body.activityName,
    description: body.description || '',
    constraints: body.constraints || '',
    phase: body.phase || '',
    plannedStartDate: body.plannedStartDate || null,
    plannedEndDate: body.plannedEndDate || null,
    actualStartDate: body.actualStartDate || null,
    actualEndDate: body.actualEndDate || null,
    plannedProgress: toNumber(body.plannedProgress),
    actualProgress: toNumber(body.actualProgress),
    status: body.status || 'not_started',
    responsiblePerson: body.responsiblePerson || '',
    createdAt: now,
    updatedAt: now,
  };
  nextActivityId += 1;
  workActivities.unshift(activity);
  return getDemoActivities().find((item) => item.id === activity.id);
}

export function updateDemoActivity(id, body) {
  const activity = workActivities.find((item) => item.id === Number(id));
  if (!activity) return null;
  Object.entries(body).forEach(([field, value]) => {
    if (field !== 'id' && field !== 'Project' && value !== undefined) activity[field] = value;
  });
  activity.projectId = Number(activity.projectId);
  activity.plannedProgress = toNumber(activity.plannedProgress);
  activity.actualProgress = toNumber(activity.actualProgress);
  activity.updatedAt = new Date().toISOString();
  return getDemoActivities().find((item) => item.id === activity.id);
}

export function deleteDemoActivity(id) {
  const index = workActivities.findIndex((activity) => activity.id === Number(id));
  if (index === -1) return false;
  workActivities.splice(index, 1);
  return true;
}

export function getDemoProjectById(id) {
  const project = getProject(id);
  return project ? clone(withProjectRelations(project)) : null;
}

export function createDemoProject(body) {
  const now = new Date().toISOString();
  const project = {
    id: nextProjectId,
    projectName: body.projectName,
    clientName: body.clientName || '',
    clientPhone: body.clientPhone || '',
    clientEmail: body.clientEmail || '',
    contractRef: body.contractRef || '',
    location: body.location,
    projectType: body.projectType || 'Residential',
    budget: toNumber(body.budget),
    spent: toNumber(body.spent),
    startDate: body.startDate || now.slice(0, 10),
    deadline: body.deadline,
    status: body.status || 'planning',
    priority: body.priority || 'normal',
    progress: toNumber(body.progress),
    siteEngineer: body.siteEngineer || '',
    projectManager: body.projectManager || '',
    description: body.description || '',
    createdAt: now,
    updatedAt: now,
  };
  nextProjectId += 1;
  projects.unshift(project);

  if (Array.isArray(body.phases)) {
    body.phases.forEach((phase) => {
      projectPhases.push({
        id: nextPhaseId,
        projectId: project.id,
        name: phase.name,
        startDate: phase.startDate,
        endDate: phase.endDate,
        progress: toNumber(phase.progress),
        status: phase.status || 'planned',
        createdAt: now,
        updatedAt: now,
      });
      nextPhaseId += 1;
    });
  }

  if (Array.isArray(body.workerIds)) {
    body.workerIds.forEach((workerId) => {
      projectAssignments.push({
        id: nextAssignmentId,
        projectId: project.id,
        workerId: toNumber(workerId),
        role: 'Site Team',
        createdAt: now,
        updatedAt: now,
      });
      nextAssignmentId += 1;
    });
  }

  return clone(withProjectRelations(project));
}

export function updateDemoProject(id, body) {
  const project = getProject(id);
  if (!project) return null;
  const { phases: newPhases, workerIds, ...rest } = body;
  Object.assign(project, {
    ...rest,
    budget: rest.budget !== undefined ? toNumber(rest.budget) : project.budget,
    spent: rest.spent !== undefined ? toNumber(rest.spent) : project.spent,
    progress: rest.progress !== undefined ? toNumber(rest.progress) : project.progress,
    updatedAt: new Date().toISOString(),
  });
  if (Array.isArray(newPhases)) {
    const existing = projectPhases.filter((phase) => phase.projectId === project.id);
    existing.forEach((phase) => {
      const idx = projectPhases.indexOf(phase);
      if (idx !== -1) projectPhases.splice(idx, 1);
    });
    newPhases.filter((p) => p.name).forEach((p) => {
      projectPhases.push({
        id: nextPhaseId++,
        projectId: project.id,
        name: p.name,
        startDate: p.startDate || null,
        endDate: p.endDate || null,
        progress: toNumber(p.progress),
        status: p.progress >= 100 ? 'completed' : p.progress > 0 ? 'active' : 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
  if (Array.isArray(workerIds)) {
    const existing = projectAssignments.filter((a) => a.projectId === project.id);
    existing.forEach((a) => {
      const idx = projectAssignments.indexOf(a);
      if (idx !== -1) projectAssignments.splice(idx, 1);
    });
    workerIds.forEach((wid) => {
      projectAssignments.push({ id: nextAssignmentId++, projectId: project.id, workerId: Number(wid), role: 'Worker' });
    });
  }
  return clone(withProjectRelations(project));
}

export function deleteDemoProject(id) {
  const index = projects.findIndex((project) => project.id === Number(id));
  if (index === -1) return false;
  projects.splice(index, 1);
  return true;
}

export function getDemoWorkers() {
  return clone(workers.map(withWorkerRelations).sort((a, b) => b.id - a.id));
}

export function getDemoWorkerById(id) {
  const worker = getWorker(id);
  return worker ? clone(withWorkerRelations(worker)) : null;
}

export function createDemoWorker(body) {
  const now = new Date().toISOString();
  let userId = toNumber(body.userId);

  if (!userId && body.fullName && body.email) {
    const user = createDemoUser({
      fullName: body.fullName,
      email: body.email,
      password: body.password || 'worker123',
      role: body.role || 'worker',
      phone: body.phone,
      nationalId: body.nationalId,
    });
    userId = user.id;
  }

  const worker = {
    id: nextWorkerId,
    userId,
    employeeCode: body.employeeCode || `BI-W-${String(nextWorkerId).padStart(3, '0')}`,
    position: body.position || body.role || 'Worker',
    salary: toNumber(body.salary),
    dailyRate: toNumber(body.dailyRate),
    employmentType: body.employmentType || 'contract',
    skillLevel: body.skillLevel || 'skilled',
    productivityScore: toNumber(body.productivityScore, 75),
    smartCardCode: body.smartCardCode || `BI-W-${String(nextWorkerId).padStart(3, '0')}`,
    joinDate: body.joinDate || now.slice(0, 10),
    dateOfBirth: body.dateOfBirth || null,
    gender: body.gender || 'not_specified',
    department: body.department || 'Site Team',
    address: body.address || '',
    emergencyContactName: body.emergencyContactName || '',
    emergencyContactPhone: body.emergencyContactPhone || '',
    emergencyContactRelationship: body.emergencyContactRelationship || '',
    tradeCertification: body.tradeCertification || '',
    safetyInductionDate: body.safetyInductionDate || null,
    medicalClearanceDate: body.medicalClearanceDate || null,
    ppeIssued: Boolean(body.ppeIssued),
    bankName: body.bankName || '',
    bankAccountNumber: body.bankAccountNumber || '',
    notes: body.notes || '',
    status: body.status || 'active',
    createdAt: now,
    updatedAt: now,
  };
  nextWorkerId += 1;
  workers.unshift(worker);
  return clone(withWorkerRelations(worker));
}

export function updateDemoWorker(id, body) {
  const worker = getWorker(id);
  if (!worker) return null;
  Object.assign(worker, {
    ...body,
    salary: body.salary !== undefined ? toNumber(body.salary) : worker.salary,
    dailyRate: body.dailyRate !== undefined ? toNumber(body.dailyRate) : worker.dailyRate,
    productivityScore: body.productivityScore !== undefined ? toNumber(body.productivityScore) : worker.productivityScore,
    updatedAt: new Date().toISOString(),
  });
  const user = getUser(worker.userId);
  if (user) {
    if (body.fullName) user.fullName = body.fullName;
    if (body.email) user.email = body.email;
    if (body.phone) user.phone = body.phone;
    if (body.nationalId) user.nationalId = body.nationalId;
    if (body.status) user.status = body.status;
    user.updatedAt = new Date().toISOString();
  }
  return clone(withWorkerRelations(worker));
}

export function deleteDemoWorker(id) {
  const index = workers.findIndex((worker) => worker.id === Number(id));
  if (index === -1) return false;
  workers.splice(index, 1);
  return true;
}

export function getDemoMaterials(projectId) {
  const filtered = projectId ? materials.filter((material) => material.projectId === Number(projectId)) : materials;
  return clone(filtered.map(withMaterialRelations).sort((a, b) => b.id - a.id));
}

export function getDemoMaterialById(id) {
  const material = materials.find((item) => item.id === Number(id));
  return material ? clone(withMaterialRelations(material)) : null;
}

export function createDemoMaterial(body) {
  const now = new Date().toISOString();
  const plannedQuantity = toNumber(body.plannedQuantity);
  const receivedQuantity = hasValue(body, 'receivedQuantity') ? toNumber(body.receivedQuantity) : plannedQuantity;
  const usedQuantity = toNumber(body.usedQuantity);
  const unitCost = toNumber(body.unitCost);
  const material = {
    id: nextMaterialId,
    projectId: toNumber(body.projectId, 1),
    materialCode: body.materialCode || demoMaterialCode(),
    materialName: body.materialName,
    category: body.category || '',
    plannedQuantity,
    receivedQuantity,
    usedQuantity,
    remainingStock: roundQuantity(receivedQuantity - usedQuantity),
    minimumStock: toNumber(body.minimumStock),
    reorderLevel: toNumber(body.reorderLevel),
    unit: body.unit || 'pcs',
    unitCost,
    estimatedCost: hasValue(body, 'estimatedCost') ? toNumber(body.estimatedCost) : plannedQuantity * unitCost,
    actualCost: hasValue(body, 'actualCost') ? toNumber(body.actualCost) : usedQuantity * unitCost,
    supplier: body.supplier || '',
    supplierContact: body.supplierContact || '',
    supplierEmail: body.supplierEmail || '',
    purchaseOrderNumber: body.purchaseOrderNumber || '',
    invoiceNumber: body.invoiceNumber || '',
    deliveryDate: body.deliveryDate || now.slice(0, 10),
    lastReceivedDate: body.lastReceivedDate || null,
    storageLocation: body.storageLocation || '',
    batchNumber: body.batchNumber || '',
    gradeSpecification: body.gradeSpecification || '',
    qualityStatus: body.qualityStatus || 'pending_inspection',
    inspectedBy: body.inspectedBy || '',
    inspectionDate: body.inspectionDate || null,
    wastageAllowancePercent: toNumber(body.wastageAllowancePercent),
    notes: body.notes || '',
    status: demoMaterialStatus(body.status, receivedQuantity, usedQuantity),
    createdAt: now,
    updatedAt: now,
  };
  nextMaterialId += 1;
  materials.unshift(material);
  return clone(withMaterialRelations(material));
}

export function updateDemoMaterial(id, body) {
  const material = materials.find((item) => item.id === Number(id));
  if (!material) return null;
  const current = normalizeDemoMaterial(material);
  const plannedQuantity = hasValue(body, 'plannedQuantity') ? toNumber(body.plannedQuantity) : current.plannedQuantity;
  const receivedQuantity = hasValue(body, 'receivedQuantity') ? toNumber(body.receivedQuantity) : current.receivedQuantity;
  const usedQuantity = hasValue(body, 'usedQuantity') ? toNumber(body.usedQuantity) : current.usedQuantity;
  Object.assign(material, {
    ...body,
    plannedQuantity,
    receivedQuantity,
    usedQuantity,
    minimumStock: hasValue(body, 'minimumStock') ? toNumber(body.minimumStock) : current.minimumStock,
    reorderLevel: hasValue(body, 'reorderLevel') ? toNumber(body.reorderLevel) : current.reorderLevel,
    unitCost: hasValue(body, 'unitCost') ? toNumber(body.unitCost) : current.unitCost,
    estimatedCost: hasValue(body, 'estimatedCost') ? toNumber(body.estimatedCost) : current.estimatedCost,
    actualCost: hasValue(body, 'actualCost') ? toNumber(body.actualCost) : current.actualCost,
    wastageAllowancePercent: hasValue(body, 'wastageAllowancePercent') ? toNumber(body.wastageAllowancePercent) : current.wastageAllowancePercent,
    status: demoMaterialStatus(body.status, receivedQuantity, usedQuantity, current.status),
    updatedAt: new Date().toISOString(),
  });
  material.remainingStock = roundQuantity(material.receivedQuantity - material.usedQuantity);
  return clone(withMaterialRelations(material));
}

export function deleteDemoMaterial(id) {
  const index = materials.findIndex((material) => material.id === Number(id));
  if (index === -1) return false;
  materials.splice(index, 1);
  return true;
}

export function getDemoMaterialIssues(query = {}) {
  let records = materialIssues;
  if (query.projectId) records = records.filter((issue) => issue.projectId === Number(query.projectId));
  if (query.materialId) records = records.filter((issue) => issue.materialId === Number(query.materialId));
  return clone(records.map((issue) => ({
    ...issue,
    Material: getDemoMaterialById(issue.materialId),
    Project: getDemoProjectById(issue.projectId),
  })));
}

export function createDemoMaterialIssue(body) {
  const material = materials.find((item) => item.id === Number(body.materialId || body.bomItemId));
  if (!material) return null;

  const issuedQuantity = toNumber(body.issuedQuantity || body.quantityToIssue);
  const usedBefore = toNumber(material.usedQuantity);
  const remainingStock = toNumber(material.remainingStock);
  const plannedRemaining = toNumber(material.plannedQuantity) - usedBefore;
  const exceedsStock = issuedQuantity > remainingStock;
  const exceedsPlan = issuedQuantity > plannedRemaining;
  const approvalStatus = body.approvalStatus || (exceedsStock || exceedsPlan ? 'pending' : 'approved');
  const now = new Date().toISOString();

  const issue = {
    id: nextMaterialIssueId++,
    projectId: toNumber(body.projectId, material.projectId),
    materialId: material.id,
    issueCode: body.issueCode || `ISS-DEMO-${String(nextMaterialIssueId).padStart(3, '0')}`,
    issuedQuantity,
    issueDate: body.issueDate || body.date || now.slice(0, 10),
    issuedTo: body.issuedTo || '',
    issuedBy: body.issuedBy || '',
    usedFor: body.usedFor || body.purpose || '',
    phase: body.phase || material.plannedPhase || '',
    siteLocation: body.siteLocation || '',
    approvalStatus,
    approvedBy: approvalStatus === 'approved' ? (body.approvedBy || body.issuedBy || '') : '',
    approvedAt: approvalStatus === 'approved' ? now : null,
    evidenceFile: body.evidenceFile || '',
    remarks: body.remarks || '',
    exceedsPlan,
    exceedsStock,
    plannedQuantityAtIssue: toNumber(material.plannedQuantity),
    usedQuantityBefore: usedBefore,
    remainingStockBefore: remainingStock,
    appliedToMaterial: false,
    createdAt: now,
    updatedAt: now,
  };

  materialIssues.unshift(issue);

  if (approvalStatus === 'approved') {
    const nextUsed = roundQuantity(usedBefore + issuedQuantity);
    Object.assign(material, {
      usedQuantity: nextUsed,
      remainingStock: roundQuantity(toNumber(material.receivedQuantity) - nextUsed),
      actualCost: nextUsed * toNumber(material.unitCost),
      status: demoMaterialStatus(material.status, toNumber(material.receivedQuantity), nextUsed),
      updatedAt: now,
    });
    issue.appliedToMaterial = true;
  }

  return clone({
    message: approvalStatus === 'approved'
      ? 'Material issued to site and deducted from stock.'
      : 'Issue recorded and pending manager approval.',
    issue,
  });
}

export function approveDemoMaterialIssue(id, body = {}) {
  const issue = materialIssues.find((record) => record.id === Number(id));
  if (!issue) return null;
  const material = materials.find((item) => item.id === issue.materialId);
  if (!material) return null;
  const now = new Date().toISOString();

  if (!issue.appliedToMaterial) {
    const nextUsed = roundQuantity(toNumber(material.usedQuantity) + toNumber(issue.issuedQuantity));
    Object.assign(material, {
      usedQuantity: nextUsed,
      remainingStock: roundQuantity(toNumber(material.receivedQuantity) - nextUsed),
      actualCost: nextUsed * toNumber(material.unitCost),
      status: demoMaterialStatus(material.status, toNumber(material.receivedQuantity), nextUsed),
      updatedAt: now,
    });
  }

  Object.assign(issue, {
    approvalStatus: 'approved',
    approvedBy: body.approvedBy || issue.approvedBy || 'Manager',
    approvedAt: now,
    appliedToMaterial: true,
    updatedAt: now,
  });

  return clone({ message: 'Material issue approved and applied.', issue });
}

export function rejectDemoMaterialIssue(id, body = {}) {
  const issue = materialIssues.find((record) => record.id === Number(id));
  if (!issue) return null;
  Object.assign(issue, {
    approvalStatus: 'rejected',
    remarks: [issue.remarks, body.decisionComment].filter(Boolean).join('\n'),
    updatedAt: new Date().toISOString(),
  });
  return clone({ message: 'Material issue rejected.', issue });
}

export function getDemoMaterialReceipts(query = {}) {
  let records = materialReceipts;
  if (query.projectId) records = records.filter((receipt) => receipt.projectId === Number(query.projectId));
  if (query.materialId) records = records.filter((receipt) => receipt.materialId === Number(query.materialId));
  return clone(records);
}

export function getDemoAttendance(query = {}) {
  let records = attendance;
  if (query.projectId) records = records.filter((record) => record.projectId === Number(query.projectId));
  if (query.workerId) records = records.filter((record) => record.workerId === Number(query.workerId));
  return clone(records.map(withAttendanceRelations).sort((a, b) => b.id - a.id));
}

export function getDemoAttendanceById(id) {
  const record = attendance.find((item) => item.id === Number(id));
  return record ? clone(withAttendanceRelations(record)) : null;
}

export function createDemoCheckIn(body) {
  const workerId = toNumber(body.workerId);
  const projectId = toNumber(body.projectId);
  const now = new Date().toISOString();
  const record = {
    id: nextAttendanceId,
    workerId,
    projectId,
    checkIn: now,
    checkOut: null,
    hoursWorked: 0,
    status: 'present',
    notes: body.notes || '',
    location: body.location || getProject(projectId)?.location || '',
    createdAt: now,
    updatedAt: now,
  };
  nextAttendanceId += 1;
  attendance.unshift(record);
  return clone(withAttendanceRelations(record));
}

export function checkoutDemoAttendance(attendanceId) {
  const record = attendance.find((item) => item.id === Number(attendanceId));
  if (!record || record.checkOut) return record ? clone(withAttendanceRelations(record)) : null;
  const checkOut = new Date();
  const checkIn = new Date(record.checkIn);
  record.checkOut = checkOut.toISOString();
  record.hoursWorked = Math.round(((checkOut - checkIn) / (1000 * 60 * 60)) * 100) / 100;
  record.updatedAt = checkOut.toISOString();
  return clone(withAttendanceRelations(record));
}

export function updateDemoAttendance(id, body) {
  const record = attendance.find((item) => item.id === Number(id));
  if (!record) return null;
  Object.assign(record, {
    ...body,
    hoursWorked: body.hoursWorked !== undefined ? toNumber(body.hoursWorked) : record.hoursWorked,
    updatedAt: new Date().toISOString(),
  });
  return clone(withAttendanceRelations(record));
}

export function deleteDemoAttendance(id) {
  const index = attendance.findIndex((record) => record.id === Number(id));
  if (index === -1) return false;
  attendance.splice(index, 1);
  return true;
}

export function getDemoDashboard() {
  const activeProjects = projects.filter((project) => project.status === 'active').length;
  const overallProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / projects.length)
    : 0;
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget || 0), 0);

  return {
    metrics: {
      projects: projects.length,
      activeProjects,
      overallProgress,
      workers: workers.length,
      materials: materials.length,
      totalBudget,
      users: users.length,
    },
    projectsByStatus: {
      planning: projects.filter((project) => project.status === 'planning').length,
      active: activeProjects,
      delayed: projects.filter((project) => project.status === 'delayed').length,
      completed: projects.filter((project) => project.status === 'completed').length,
      on_hold: projects.filter((project) => project.status === 'on_hold').length,
    },
    workersByRole: {
      admin: users.filter((user) => user.role === 'admin').length,
      project_manager: users.filter((user) => user.role === 'project_manager').length,
      site_engineer: users.filter((user) => user.role === 'site_engineer').length,
      worker: users.filter((user) => user.role === 'worker').length,
    },
    insights: getDemoInsights().recommendations,
  };
}

export function getDemoProjectMetrics() {
  return clone(projects.map((project) => {
    const projectMaterials = materials.filter((material) => material.projectId === project.id);
    const projectAttendance = attendance.filter((record) => record.projectId === project.id);
    const actualBudget = projectMaterials.reduce((sum, material) => sum + Number(material.actualCost || 0), 0);
    return {
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      progress: project.progress,
      plannedBudget: project.budget,
      actualBudget,
      budgetVariance: project.budget - actualBudget,
      totalHoursWorked: projectAttendance.reduce((sum, record) => sum + Number(record.hoursWorked || 0), 0),
      deadline: project.deadline,
    };
  }));
}

export function getDemoWorkerMetrics() {
  return clone(workers.map((worker) => {
    const records = attendance.filter((record) => record.workerId === worker.id);
    const presentDays = records.filter((record) => record.status === 'present').length;
    const attendanceRate = records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0;
    return {
      id: worker.id,
      fullName: getUser(worker.userId)?.fullName,
      position: worker.position,
      totalHoursWorked: records.reduce((sum, record) => sum + Number(record.hoursWorked || 0), 0),
      presentDays,
      absentDays: records.filter((record) => record.status === 'absent').length,
      attendanceRate,
      productivityScore: worker.productivityScore,
    };
  }));
}

export function getDemoBudgetAnalysis() {
  const projectsAnalysis = getDemoProjectMetrics().map((project) => ({
    id: project.id,
    projectName: project.projectName,
    plannedBudget: project.plannedBudget,
    actualBudget: project.actualBudget,
    variance: project.budgetVariance,
    variancePercent: project.plannedBudget > 0 ? Math.round((project.budgetVariance / project.plannedBudget) * 100) : 0,
    status: project.budgetVariance >= 0 ? 'under_budget' : 'over_budget',
  }));

  const totalPlannedBudget = projectsAnalysis.reduce((sum, project) => sum + project.plannedBudget, 0);
  const totalActualBudget = projectsAnalysis.reduce((sum, project) => sum + project.actualBudget, 0);

  return {
    summary: {
      totalPlannedBudget,
      totalActualBudget,
      totalVariance: totalPlannedBudget - totalActualBudget,
    },
    projectsAnalysis,
  };
}

export function getDemoMaterialReport(projectId) {
  const scopedMaterials = (projectId ? materials.filter((material) => material.projectId === Number(projectId)) : materials).map(normalizeDemoMaterial);
  const totalPlannedCost = scopedMaterials.reduce((total, material) => total + Number(material.estimatedCost || 0), 0);
  const totalActualCost = scopedMaterials.reduce((total, material) => total + Number(material.actualCost || 0), 0);
  const totalInventoryValue = scopedMaterials.reduce((total, material) => total + Math.max(0, Number(material.remainingStock || 0)) * Number(material.unitCost || 0), 0);
  return {
    totalMaterials: scopedMaterials.length,
    totalPlannedCost,
    totalActualCost,
    totalInventoryValue,
    costVariance: totalPlannedCost - totalActualCost,
    lowStockMaterials: scopedMaterials.filter((material) => material.remainingStock <= 0 || (material.reorderLevel > 0 && material.remainingStock <= material.reorderLevel)).length,
    damagedMaterials: scopedMaterials.filter((material) => material.status === 'damaged').length,
    pendingInspections: scopedMaterials.filter((material) => material.qualityStatus === 'pending_inspection').length,
    materials: clone(scopedMaterials.map(withMaterialRelations)),
  };
}

export function getDemoAttendanceReport(query = {}) {
  const records = getDemoAttendance(query);
  return {
    totalRecords: records.length,
    present: records.filter((record) => record.status === 'present').length,
    absent: records.filter((record) => record.status === 'absent').length,
    late: records.filter((record) => record.status === 'late').length,
    on_leave: records.filter((record) => record.status === 'on_leave').length,
    half_day: records.filter((record) => record.status === 'half_day').length,
    totalHoursWorked: records.reduce((total, record) => total + Number(record.hoursWorked || 0), 0),
    details: records,
  };
}

export function getDemoReports(role) {
  const reportAccess = {
    admin: ['progress', 'material', 'attendance', 'ai', 'workforce', 'financial'],
    project_manager: ['progress', 'material', 'attendance', 'ai', 'workforce', 'financial'],
    site_engineer: ['progress', 'attendance', 'ai'],
    quantity_surveyor: ['material', 'ai', 'financial'],
    store_officer: ['material'],
    contractor_foreman: ['progress', 'attendance', 'workforce'],
  };
  const allowed = reportAccess[role];
  return clone(allowed ? reportTemplates.filter((report) => allowed.includes(report.type)) : reportTemplates);
}

export function getDemoSettings() {
  const roles = users.reduce((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
    return counts;
  }, {});

  return {
    roles,
    users: clone(users.map(publicUser)),
    devices: clone(devices),
    security: {
      auth: 'JWT enabled',
      passwordHashing: 'bcrypt enabled',
      demoMode: true,
    },
  };
}

export function generateDemoReport(type, query = {}) {
  const generatedAt = new Date().toISOString();
  if (type === 'progress') {
    return {
      title: 'Project Progress Report',
      generatedAt,
      projects: getDemoProjects().map((project) => ({
        id: project.id,
        projectName: project.projectName,
        location: project.location,
        status: project.status,
        progress: project.progress,
        budget: project.budget,
        deadline: project.deadline,
        totalMaterials: project.Materials.length,
        totalHoursWorked: project.Attendances.reduce((sum, record) => sum + Number(record.hoursWorked || 0), 0),
        materialsUsed: project.Materials.filter((material) => material.usedQuantity > 0).length,
      })),
    };
  }
  if (type === 'material' || type === 'materials') {
    return {
      title: 'Material Tracking Report',
      generatedAt,
      summary: getDemoMaterialReport(query.projectId),
    };
  }
  if (type === 'attendance') {
    return {
      title: 'Attendance Report',
      generatedAt,
      summary: getDemoAttendanceReport(query),
    };
  }
  if (type === 'budget') {
    return {
      title: 'Budget Analysis Report',
      generatedAt,
      ...getDemoBudgetAnalysis(),
    };
  }
  if (type === 'workforce') {
    return {
      title: 'Workforce Report',
      generatedAt,
      summary: {
        totalWorkers: workers.length,
        activeWorkers: workers.filter((worker) => worker.status === 'active').length,
        totalPayroll: workers.reduce((sum, worker) => sum + Number(worker.salary || 0), 0),
      },
      workers: getDemoWorkerMetrics(),
    };
  }
  if (type === 'ai') {
    return {
      title: 'AI Insights Report',
      generatedAt,
      ...getDemoInsights(),
      analysis: analyzeDemoBaseline(),
    };
  }
  if (type === 'financial' || type === 'budget') {
    return {
      title: 'Financial Summary Report',
      generatedAt,
      ...getDemoBudgetAnalysis(),
    };
  }
  return {
    title: 'SCPRAS Report',
    generatedAt,
    reports: getDemoReports(),
  };
}

export function getDemoInsights() {
  const highVarianceMaterials = materials
    .map((material) => ({ ...material, variance: materialVariance(material), Project: getProject(material.projectId) }))
    .filter((material) => material.variance > 10);
  const delayedProjects = projects.filter((project) => project.status === 'delayed' || project.progress < 50);
  const overBudget = getDemoBudgetAnalysis().projectsAnalysis.filter((project) => project.status === 'over_budget');

  return {
    completionProbability: delayedProjects.length > 0 ? 87 : 94,
    recommendations: [
      ...highVarianceMaterials.map((material) => `${material.materialName} usage is ${material.variance}% above plan in ${material.Project?.projectName || 'the project'}.`),
      ...delayedProjects.map((project) => `${project.projectName} needs schedule recovery before ${project.deadline}.`),
      ...overBudget.map((project) => `${project.projectName} is trending over budget by $${Math.abs(project.variance).toLocaleString()}.`),
      'Review workforce allocation before concrete and walling milestones.',
    ].slice(0, 6),
    risks: {
      materialVariance: highVarianceMaterials.length,
      delayedProjects: delayedProjects.length,
      overBudgetProjects: overBudget.length,
    },
  };
}

export function analyzeDemoBaseline(body = {}) {
  const plannedProgress = toNumber(body.plannedProgress, 75);
  const actualProgress = toNumber(body.actualProgress, 68);
  const plannedBudget = toNumber(body.plannedBudget, 245000);
  const actualSpend = toNumber(body.actualSpend, 247000);
  const materialVariancePercent = toNumber(body.materialVariancePercent, 12);
  const scheduleVarianceDays = toNumber(body.scheduleVarianceDays, 5);

  const progressGap = actualProgress - plannedProgress;
  const budgetVariance = plannedBudget - actualSpend;
  const completionProbability = Math.max(
    45,
    Math.min(98, 90 + progressGap - Math.max(0, scheduleVarianceDays * 2) - Math.max(0, materialVariancePercent - 5)),
  );

  const recommendations = [];
  if (progressGap < 0) {
    recommendations.push(`Actual progress is ${Math.abs(progressGap)}% behind plan. Prioritize critical path tasks this week.`);
  } else {
    recommendations.push(`Actual progress is ${progressGap}% ahead of plan. Protect the current material supply rhythm.`);
  }
  if (budgetVariance < 0) {
    recommendations.push(`Actual spend is $${Math.abs(budgetVariance).toLocaleString()} over baseline. Review procurement approvals.`);
  }
  if (materialVariancePercent > 8) {
    recommendations.push(`Material consumption variance is ${materialVariancePercent}%. Audit stock issue records and site wastage.`);
  }
  if (scheduleVarianceDays > 0) {
    recommendations.push(`Schedule is ${scheduleVarianceDays} days late. Add labor to the next high-volume activity.`);
  }

  return {
    completionProbability,
    progressGap,
    budgetVariance,
    recommendations,
  };
}

export function handleDemoFallback(req, res) {
  const url = new URL(req.originalUrl, 'http://scpras.local');
  const path = url.pathname.replace(/\/$/, '');
  const method = req.method.toUpperCase();
  const segments = path.split('/').filter(Boolean);
  const id = segments[2];

  if (method === 'POST' && path === '/api/auth/login') {
    const user = findDemoUserByCredentials(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    return res.json({ token: generateDemoToken(user), user });
  }

  if (method === 'POST' && path === '/api/auth/register') {
    const user = createDemoUser(req.body);
    return res.status(201).json({ token: generateDemoToken(user), user });
  }

  if (method === 'GET' && path === '/api/auth/me') {
    const user = getDemoUserById(req.user?.id || 1);
    return user ? res.json(user) : res.status(404).json({ message: 'User not found.' });
  }

  if (method === 'GET' && path === '/api/dashboard') return res.json(getDemoDashboard());
  if (method === 'GET' && path === '/api/dashboard/projects') return res.json(getDemoProjectMetrics());
  if (method === 'GET' && path === '/api/dashboard/workers') return res.json(getDemoWorkerMetrics());
  if (method === 'GET' && path === '/api/dashboard/budget') return res.json(getDemoBudgetAnalysis());

  if (path === '/api/projects' && method === 'GET') return res.json(getDemoProjects());
  if (path === '/api/projects' && method === 'POST') return res.status(201).json(createDemoProject(req.body));
  if (segments[1] === 'projects' && id && segments[3] === 'stats' && method === 'GET') {
    const project = getDemoProjectById(id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    return res.json({
      projectId: project.id,
      projectName: project.projectName,
      progress: project.progress,
      status: project.status,
      totalWorkers: new Set(project.Attendances.map((record) => record.workerId)).size,
      totalMaterials: project.Materials.length,
      budget: project.budget,
    });
  }
  if (segments[1] === 'projects' && id && segments[3] === 'phases' && method === 'GET') {
    return res.json(clone(projectPhases.filter((phase) => phase.projectId === Number(id))));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'phases' && method === 'POST') {
    const now = new Date().toISOString();
    const phase = {
      id: nextPhaseId,
      projectId: Number(id),
      name: req.body.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      progress: toNumber(req.body.progress),
      status: req.body.status || 'planned',
      createdAt: now,
      updatedAt: now,
    };
    nextPhaseId += 1;
    projectPhases.push(phase);
    return res.status(201).json(clone(phase));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'documents' && method === 'GET') {
    return res.json(clone(projectDocuments.filter((document) => document.projectId === Number(id))));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'documents' && method === 'POST') {
    const now = new Date().toISOString();
    const uploaded = (req.files || []).map((file) => {
      const document = {
        id: nextDocumentId,
        projectId: Number(id),
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        category: req.body.category || 'other',
        url: `/uploads/projects/${file.filename}`,
        createdAt: now,
        updatedAt: now,
      };
      nextDocumentId += 1;
      projectDocuments.push(document);
      return document;
    });
    return res.status(201).json(clone(uploaded));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'workers' && method === 'GET') {
    return res.json(clone(projectAssignments
      .filter((assignment) => assignment.projectId === Number(id))
      .map((assignment) => ({ ...assignment, Worker: withWorkerRelations(getWorker(assignment.workerId)) }))));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'workers' && method === 'PUT') {
    for (let index = projectAssignments.length - 1; index >= 0; index -= 1) {
      if (projectAssignments[index].projectId === Number(id)) projectAssignments.splice(index, 1);
    }
    (req.body.workerIds || []).forEach((workerId) => {
      projectAssignments.push({
        id: nextAssignmentId,
        projectId: Number(id),
        workerId: toNumber(workerId),
        role: 'Site Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      nextAssignmentId += 1;
    });
    return res.json(clone(projectAssignments.filter((assignment) => assignment.projectId === Number(id))));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'phases' && segments[4] && ['PUT', 'PATCH'].includes(method)) {
    const phaseId = Number(segments[4]);
    const phaseIdx = projectPhases.findIndex((p) => p.id === phaseId && p.projectId === Number(id));
    if (phaseIdx === -1) return res.status(404).json({ message: 'Phase not found.' });
    Object.assign(projectPhases[phaseIdx], req.body, { updatedAt: new Date().toISOString() });
    return res.json(clone(projectPhases[phaseIdx]));
  }
  if (segments[1] === 'projects' && id && segments[3] === 'phases' && segments[4] && method === 'DELETE') {
    const phaseId = Number(segments[4]);
    const phaseIdx = projectPhases.findIndex((p) => p.id === phaseId && p.projectId === Number(id));
    if (phaseIdx === -1) return res.status(404).json({ message: 'Phase not found.' });
    projectPhases.splice(phaseIdx, 1);
    return res.json({ message: 'Phase deleted successfully.' });
  }
  if (segments[1] === 'projects' && id && segments[3] === 'documents' && segments[4] && method === 'DELETE') {
    const docId = Number(segments[4]);
    const docIdx = projectDocuments.findIndex((d) => d.id === docId && d.projectId === Number(id));
    if (docIdx === -1) return res.status(404).json({ message: 'Document not found.' });
    projectDocuments.splice(docIdx, 1);
    return res.json({ message: 'Document deleted successfully.' });
  }
  if (segments[1] === 'projects' && id && !segments[3] && method === 'GET') {
    const project = getDemoProjectById(id);
    return project ? res.json(project) : res.status(404).json({ message: 'Project not found.' });
  }
  if (segments[1] === 'projects' && id && !segments[3] && ['PUT', 'PATCH'].includes(method)) {
    const project = updateDemoProject(id, req.body);
    return project ? res.json(project) : res.status(404).json({ message: 'Project not found.' });
  }
  if (segments[1] === 'projects' && id && !segments[3] && method === 'DELETE') {
    return deleteDemoProject(id) ? res.json({ message: 'Project deleted successfully.' }) : res.status(404).json({ message: 'Project not found.' });
  }

  if (path === '/api/workers' && method === 'GET') return res.json(getDemoWorkers());
  if (path === '/api/workers' && method === 'POST') return res.status(201).json(createDemoWorker(req.body));
  if (segments[1] === 'workers' && id && segments[3] === 'attendance' && method === 'GET') {
    return res.json(getDemoAttendance({ workerId: id }));
  }
  if (segments[1] === 'workers' && id && segments[3] === 'stats' && method === 'GET') {
    const worker = getDemoWorkerById(id);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });
    const metrics = getDemoWorkerMetrics().find((item) => item.id === Number(id));
    return res.json(metrics);
  }
  if (segments[1] === 'workers' && id && segments[3] === 'smart-card' && method === 'POST') {
    const worker = getDemoWorkerById(id);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });
    (async () => {
      try {
        const card = await createSmartCardPayload(worker, worker.smartCardCode);
        const record = workers.find((w) => w.id === Number(id));
        if (record) record.smartCardCode = card.code;
        res.json({ worker: getDemoWorkerById(id), card });
      } catch {
        res.status(500).json({ message: 'Smart card generation failed.' });
      }
    })();
    return true;
  }
  if (segments[1] === 'workers' && segments[2] === 'card' && segments[3] && method === 'GET') {
    const code = segments[3];
    const record = workers.find((w) => w.smartCardCode === code);
    if (!record) return res.status(404).json({ message: 'Smart card not found.' });
    const workerData = withWorkerRelations(record);
    const workerAttendance = attendance.filter((a) => a.workerId === record.id);
    const totalHoursWorked = workerAttendance.reduce((total, a) => total + Number(a.hoursWorked || 0), 0);
    (async () => {
      try {
        const card = await createSmartCardPayload(workerData, code);
        res.json({
          worker: clone(workerData),
          card,
          attendanceSummary: {
            recentRecords: clone(workerAttendance.slice(0, 10)),
            recentRecordsCount: Math.min(workerAttendance.length, 10),
            totalHoursWorked,
            lastCheckIn: workerAttendance[0]?.checkIn || null,
            lastCheckOut: workerAttendance[0]?.checkOut || null,
          },
        });
      } catch {
        res.status(500).json({ message: 'Smart card lookup failed.' });
      }
    })();
    return true;
  }
  if (segments[1] === 'workers' && id && method === 'GET') {
    const worker = getDemoWorkerById(id);
    return worker ? res.json(worker) : res.status(404).json({ message: 'Worker not found.' });
  }
  if (segments[1] === 'workers' && id && ['PUT', 'PATCH'].includes(method)) {
    const worker = updateDemoWorker(id, req.body);
    return worker ? res.json(worker) : res.status(404).json({ message: 'Worker not found.' });
  }
  if (segments[1] === 'workers' && id && method === 'DELETE') {
    return deleteDemoWorker(id) ? res.json({ message: 'Worker deleted successfully.' }) : res.status(404).json({ message: 'Worker not found.' });
  }

  if (path === '/api/activities' && method === 'GET') return res.json(getDemoActivities(req.query.projectId));
  if (path === '/api/activities' && method === 'POST') {
    if (!req.body.projectId || !req.body.activityName) return res.status(400).json({ message: 'projectId and activityName are required.' });
    return res.status(201).json(createDemoActivity(req.body));
  }
  if (segments[1] === 'activities' && id && ['PUT', 'PATCH'].includes(method)) {
    const activity = updateDemoActivity(id, req.body);
    return activity ? res.json(activity) : res.status(404).json({ message: 'Activity not found.' });
  }
  if (segments[1] === 'activities' && id && method === 'DELETE') {
    return deleteDemoActivity(id) ? res.json({ message: 'Activity deleted successfully.' }) : res.status(404).json({ message: 'Activity not found.' });
  }

  if (path === '/api/materials' && method === 'GET') return res.json(getDemoMaterials(req.query.projectId));
  if (path === '/api/materials' && method === 'POST') return res.status(201).json(createDemoMaterial(req.body));
  if (path === '/api/materials/report' && method === 'GET') return res.json(getDemoMaterialReport(req.query.projectId));
  if (path === '/api/materials/issues' && method === 'GET') return res.json(getDemoMaterialIssues(req.query));
  if (path === '/api/materials/issues' && method === 'POST') {
    const created = createDemoMaterialIssue(req.body);
    return created ? res.status(201).json(created) : res.status(404).json({ message: 'Material not found.' });
  }
  if (segments[1] === 'materials' && segments[2] === 'issues' && segments[3] && segments[4] === 'approve' && ['PUT', 'PATCH'].includes(method)) {
    const approved = approveDemoMaterialIssue(segments[3], req.body);
    return approved ? res.json(approved) : res.status(404).json({ message: 'Material issue not found.' });
  }
  if (segments[1] === 'materials' && segments[2] === 'issues' && segments[3] && segments[4] === 'reject' && ['PUT', 'PATCH'].includes(method)) {
    const rejected = rejectDemoMaterialIssue(segments[3], req.body);
    return rejected ? res.json(rejected) : res.status(404).json({ message: 'Material issue not found.' });
  }
  if (path === '/api/materials/receipts' && method === 'GET') return res.json(getDemoMaterialReceipts(req.query));
  if (path === '/api/materials/receive' && method === 'POST') {
    const existing = getDemoMaterialById(req.body.materialId);
    const incomingQuantity = toNumber(req.body.receivedQuantity);
    const receivedQuantity = req.body.mode === 'add'
      ? toNumber(existing?.receivedQuantity) + incomingQuantity
      : incomingQuantity;
    const material = updateDemoMaterial(req.body.materialId, {
      receivedQuantity,
      status: 'received',
      lastReceivedDate: req.body.lastReceivedDate || new Date().toISOString().slice(0, 10),
      invoiceNumber: req.body.invoiceNumber,
      batchNumber: req.body.batchNumber,
      storageLocation: req.body.storageLocation,
    });
    if (material) {
      materialReceipts.unshift({
        id: nextMaterialReceiptId++,
        projectId: material.projectId,
        materialId: material.id,
        receiptCode: req.body.receiptCode || `RCV-DEMO-${String(nextMaterialReceiptId).padStart(3, '0')}`,
        itemCode: material.materialCode,
        itemName: material.materialName,
        unit: material.unit,
        quantityReceived: incomingQuantity,
        unitCost: toNumber(req.body.unitCost, material.unitCost),
        deliveryNoteNo: req.body.deliveryNoteNo || req.body.invoiceNumber || '',
        receiptNo: req.body.receiptNo || '',
        receivedDate: req.body.lastReceivedDate || new Date().toISOString().slice(0, 10),
        receivedBy: req.body.receivedBy || '',
        storageLocation: req.body.storageLocation || material.storageLocation || '',
        remarks: req.body.remarks || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return material ? res.json(material) : res.status(404).json({ message: 'Material not found.' });
  }
  if (segments[1] === 'materials' && id && method === 'GET') {
    const material = getDemoMaterialById(id);
    return material ? res.json(material) : res.status(404).json({ message: 'Material not found.' });
  }
  if (segments[1] === 'materials' && id && ['PUT', 'PATCH'].includes(method)) {
    const material = updateDemoMaterial(id, req.body);
    return material ? res.json(material) : res.status(404).json({ message: 'Material not found.' });
  }
  if (segments[1] === 'materials' && id && method === 'DELETE') {
    return deleteDemoMaterial(id) ? res.json({ message: 'Material deleted successfully.' }) : res.status(404).json({ message: 'Material not found.' });
  }

  if (path === '/api/attendance' && method === 'GET') return res.json(getDemoAttendance(req.query));
  if (path === '/api/attendance/report' && method === 'GET') return res.json(getDemoAttendanceReport(req.query));
  if (path === '/api/attendance/check-in' && method === 'POST') return res.status(201).json(createDemoCheckIn(req.body));
  if (path === '/api/attendance/check-out' && method === 'POST') {
    const record = checkoutDemoAttendance(req.body.attendanceId);
    return record ? res.json(record) : res.status(404).json({ message: 'Attendance record not found.' });
  }
  if (segments[1] === 'attendance' && id && method === 'GET') {
    const record = getDemoAttendanceById(id);
    return record ? res.json(record) : res.status(404).json({ message: 'Attendance record not found.' });
  }
  if (segments[1] === 'attendance' && id && ['PUT', 'PATCH'].includes(method)) {
    const record = updateDemoAttendance(id, req.body);
    return record ? res.json(record) : res.status(404).json({ message: 'Attendance record not found.' });
  }
  if (segments[1] === 'attendance' && id && method === 'DELETE') {
    return deleteDemoAttendance(id) ? res.json({ message: 'Attendance record deleted successfully.' }) : res.status(404).json({ message: 'Attendance record not found.' });
  }

  if (path === '/api/reports' && method === 'GET') return res.json(getDemoReports(req.user?.role));
  if (segments[1] === 'reports' && method === 'GET') {
    return res.json(generateDemoReport(segments[2], req.query));
  }

  if (path === '/api/ai/insights' && method === 'GET') return res.json(getDemoInsights());
  if (path === '/api/ai/analyze' && method === 'POST') return res.json(analyzeDemoBaseline(req.body));

  if (path === '/api/workforce/forecast' && method === 'POST') {
    const quantity           = toNumber(req.body.quantity, 20000);
    const completedQty       = toNumber(req.body.completedQuantity, 0);
    const dailyProductivity  = toNumber(req.body.dailyProductivity, 500);
    const currentCrewSize    = toNumber(req.body.currentWorkers, 4);
    const days               = Math.max(1, toNumber(req.body.days, 20));
    const laborRate          = toNumber(req.body.laborRate, 30);
    const workingHours       = Math.max(1, toNumber(req.body.workingHours, 8));
    const overtimeHours      = toNumber(req.body.overtimeHours, 0);
    const complexityFactor   = Math.max(0.1, toNumber(req.body.complexityFactor, 1));
    const weatherRisk        = req.body.weatherRisk || 'low';
    const bufferPercent      = toNumber(req.body.bufferPercent, 10);
    const overheadPercent    = toNumber(req.body.overheadPercent, 0);
    const startDateStr       = req.body.startDate || new Date().toISOString().slice(0, 10);
    const unit               = req.body.unit || 'units';

    const remainingQuantity    = Math.max(0, quantity - completedQty);
    const effectiveProductivity = Math.max(1, dailyProductivity / complexityFactor);
    const bufferedQuantity     = Math.ceil(remainingQuantity * (1 + bufferPercent / 100));
    const requiredWorkers      = Math.max(1, Math.ceil(bufferedQuantity / Math.max(1, effectiveProductivity * days)));
    const workerGap            = Math.max(0, requiredWorkers - currentCrewSize);
    const dailyTarget          = Math.ceil(remainingQuantity / days);
    const currentCrewDays      = currentCrewSize > 0 ? Math.ceil(bufferedQuantity / (effectiveProductivity * currentCrewSize)) : days;

    const startDate            = new Date(startDateStr);
    const targetFinish         = new Date(startDate); targetFinish.setDate(targetFinish.getDate() + days);
    const forecastFinish       = new Date(startDate); forecastFinish.setDate(forecastFinish.getDate() + currentCrewDays);

    const regularLaborCost     = requiredWorkers * days * laborRate;
    const overtimeCost         = overtimeHours > 0 ? requiredWorkers * days * (overtimeHours / workingHours) * laborRate * 1.5 : 0;
    const overheadCost         = overheadPercent > 0 ? (regularLaborCost + overtimeCost) * (overheadPercent / 100) : 0;
    const laborCost            = regularLaborCost + overtimeCost + overheadCost;

    let riskLevel = 'low';
    if (workerGap > 2 || weatherRisk === 'high') riskLevel = 'high';
    else if (workerGap > 0 || weatherRisk === 'medium') riskLevel = 'medium';

    const crewRatio            = currentCrewSize / Math.max(1, requiredWorkers);
    const completionProbability = Math.min(98, Math.max(40, Math.round(crewRatio * 94)));

    const totalPeriods = 6;
    const daysPerPeriod = Math.max(1, Math.ceil(days / totalPeriods));
    const schedule = Array.from({ length: totalPeriods }, (_, i) => {
      const startDay = i * daysPerPeriod + 1;
      const endDay = Math.min((i + 1) * daysPerPeriod, days);
      const pct = Math.round(((i + 1) / totalPeriods) * 100);
      return { period: `Days ${startDay}-${endDay}`, targetQuantity: Math.round((bufferedQuantity * pct) / 100), cumulativePercent: pct };
    });

    const recommendations = [];
    if (workerGap > 0) recommendations.push(`Add ${workerGap} more worker${workerGap > 1 ? 's' : ''} to meet the ${days}-day target.`);
    else recommendations.push(`Current crew of ${currentCrewSize} can meet or exceed the ${days}-day target.`);
    if (weatherRisk === 'high') recommendations.push('High weather risk — build a 2-3 day contingency buffer.');
    if (bufferPercent > 0) recommendations.push(`${bufferPercent}% buffer applied: effective target is ${bufferedQuantity.toLocaleString()} ${unit}.`);
    if (overtimeHours > 0) recommendations.push(`${overtimeHours}h/day overtime adds $${Math.round(overtimeCost).toLocaleString()} to cost.`);
    if (recommendations.length < 2) recommendations.push('Track daily output against period targets to catch variance early.');

    return res.json({
      requiredWorkers,
      plannedWorkers: requiredWorkers,
      currentWorkers: currentCrewSize,
      workerGap,
      dailyTarget,
      remainingQuantity,
      bufferedQuantity,
      estimatedDuration: days,
      estimatedDurationWithCurrentCrew: currentCrewDays,
      laborCost: Math.round(laborCost),
      regularLaborCost: Math.round(regularLaborCost),
      overtimeCost: Math.round(overtimeCost),
      overheadCost: Math.round(overheadCost),
      completionProbability,
      riskLevel,
      targetFinishDate: targetFinish.toISOString().slice(0, 10),
      forecastFinishDate: forecastFinish.toISOString().slice(0, 10),
      currentCrewFinishDate: forecastFinish.toISOString().slice(0, 10),
      effectiveProductivity: Math.round(effectiveProductivity),
      unit,
      recommendations,
      schedule,
    });
  }

  if (path === '/api/settings' && method === 'GET') return res.json(getDemoSettings());
  if (path === '/api/settings/users' && method === 'POST') {
    const user = createDemoUser(req.body);
    return res.status(201).json(user);
  }
  if (segments[1] === 'settings' && segments[2] === 'users' && segments[3] && method === 'PATCH') {
    const user = updateDemoUserAccount(segments[3], req.body);
    return user ? res.json(user) : res.status(404).json({ message: 'User not found.' });
  }
  if (segments[1] === 'settings' && segments[2] === 'users' && segments[3] && method === 'DELETE') {
    const deleted = deleteDemoUserAccount(segments[3], req.user?.id);
    if (deleted === 'self') return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    return deleted ? res.json({ message: 'User account deleted successfully.' }) : res.status(404).json({ message: 'User not found.' });
  }
  if (path === '/api/settings/devices' && method === 'POST') {
    const now = new Date().toISOString();
    const device = {
      id: nextDeviceId,
      name: req.body.name,
      type: req.body.type || 'qr',
      location: req.body.location || '',
      status: req.body.status || 'online',
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };
    nextDeviceId += 1;
    devices.unshift(device);
    return res.status(201).json(clone(device));
  }
  if (segments[1] === 'settings' && segments[2] === 'devices' && segments[3] && method === 'PATCH') {
    const device = devices.find((item) => item.id === Number(segments[3]));
    if (!device) return res.status(404).json({ message: 'Device not found.' });
    Object.assign(device, req.body, { lastSeen: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return res.json(clone(device));
  }
  if (segments[1] === 'settings' && segments[2] === 'devices' && segments[3] && method === 'DELETE') {
    const index = devices.findIndex((item) => item.id === Number(segments[3]));
    if (index === -1) return res.status(404).json({ message: 'Device not found.' });
    devices.splice(index, 1);
    return res.json({ message: 'Device deleted successfully.' });
  }

  return false;
}
