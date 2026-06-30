import bcrypt from 'bcryptjs';
import { singleStoreyBomItems, singleStoreyCategories, singleStoreyDrawing, singleStoreyPhases, singleStoreyProject, singleStoreySuppliers } from '../data/singleStoreyHouseData.js';
import { Attendance, BomCategory, Device, Material, Project, ProjectAssignment, ProjectDocument, ProjectPhase, Supplier, User, WorkActivity, Worker } from '../models/index.js';

const createdAt = new Date('2026-06-09T08:00:00.000Z');
const updatedAt = createdAt;

async function ensureSingleStoreyHouseBaseline() {
  const [project] = await Project.findOrCreate({
    where: { contractRef: singleStoreyProject.contractRef },
    defaults: singleStoreyProject,
  });

  const projectUpdates = {};
  [
    'projectName',
    'projectCode',
    'clientName',
    'clientPhone',
    'clientEmail',
    'location',
    'projectType',
    'budget',
    'currency',
    'startDate',
    'deadline',
    'status',
    'priority',
    'siteEngineer',
    'projectManager',
    'totalBuiltArea',
    'internalFloorArea',
    'frontPorchArea',
    'rearVerandaArea',
    'floors',
    'bedrooms',
    'bathrooms',
    'roofType',
    'structureType',
    'wallThicknessExternal',
    'wallThicknessInternal',
    'drawingRef',
    'thumbnailUrl',
    'description',
  ].forEach((field) => {
    if (project[field] === null || project[field] === undefined || project[field] === '') {
      projectUpdates[field] = singleStoreyProject[field];
    }
  });

  if (Object.keys(projectUpdates).length > 0) {
    Object.assign(project, projectUpdates);
    await project.save();
  }

  for (const category of singleStoreyCategories) {
    await BomCategory.findOrCreate({
      where: { categoryName: category.categoryName },
      defaults: category,
    });
  }

  for (const supplier of singleStoreySuppliers) {
    await Supplier.findOrCreate({
      where: { supplierName: supplier.supplierName },
      defaults: supplier,
    });
  }

  for (const [index, phase] of singleStoreyPhases.entries()) {
    const [record, created] = await ProjectPhase.findOrCreate({
      where: { projectId: project.id, name: phase.name },
      defaults: { ...phase, projectId: project.id },
    });

    if (!created && !record.description) {
      record.description = phase.description;
      await record.save();
    }

    await WorkActivity.findOrCreate({
      where: { projectId: project.id, activityCode: `ACT-${String(index + 1).padStart(3, '0')}` },
      defaults: {
        projectId: project.id,
        activityCode: `ACT-${String(index + 1).padStart(3, '0')}`,
        activityName: phase.name,
        description: phase.description,
        phase: phase.name,
        plannedStartDate: phase.startDate,
        plannedEndDate: phase.endDate,
        plannedProgress: 0,
        actualProgress: 0,
        status: 'not_started',
        responsiblePerson: singleStoreyProject.siteEngineer,
      },
    });
  }

  for (const item of singleStoreyBomItems) {
    await Material.findOrCreate({
      where: { projectId: project.id, materialCode: item.materialCode },
      defaults: { ...item, projectId: project.id },
    });
  }

  await ProjectDocument.findOrCreate({
    where: { projectId: project.id, fileName: singleStoreyDrawing.fileName },
    defaults: { ...singleStoreyDrawing, projectId: project.id },
  });

  return project.id;
}

export async function seedDemoDataIfEmpty() {
  const userCount = await User.count();
  let seeded = false;

  if (userCount === 0) {
    const [adminPassword, workerPassword] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('worker123', 10),
    ]);

    await User.bulkCreate([
    {
      id: 1,
      fullName: 'SCPRAS Administrator',
      email: 'admin@scpras.rw',
      password: adminPassword,
      role: 'admin',
      phone: '0780000000',
      nationalId: 'SCPRAS-ADMIN',
      status: 'active',
      createdAt,
      updatedAt,
    },
    {
      id: 2,
      fullName: 'Hakizimana Pierre',
      email: 'manager@scpras.rw',
      password: workerPassword,
      role: 'project_manager',
      phone: '078123456',
      nationalId: '119878001',
      status: 'active',
      createdAt,
      updatedAt,
    },
    {
      id: 3,
      fullName: 'Mukamana Claudine',
      email: 'engineer@scpras.rw',
      password: workerPassword,
      role: 'site_engineer',
      phone: '078452118',
      nationalId: '119878002',
      status: 'active',
      createdAt,
      updatedAt,
    },
    {
      id: 4,
      fullName: 'Munyaneza Alice',
      email: 'qs@scpras.rw',
      password: workerPassword,
      role: 'quantity_surveyor',
      phone: '078994521',
      nationalId: '119878003',
      status: 'active',
      createdAt,
      updatedAt,
    },
    {
      id: 5,
      fullName: 'Niyonzima John',
      email: 'store@scpras.rw',
      password: workerPassword,
      role: 'store_officer',
      phone: '078001244',
      nationalId: '119878004',
      status: 'active',
      createdAt,
      updatedAt,
    },
    {
      id: 6,
      fullName: 'Nshimiyimana Eric',
      email: 'foreman@scpras.rw',
      password: workerPassword,
      role: 'contractor_foreman',
      phone: '078994521',
      nationalId: '119878006',
      status: 'active',
      createdAt,
      updatedAt,
    },
    ]);

    await Project.bulkCreate([
    {
      id: 1,
      projectName: 'Residential Building',
      clientName: 'Kigali Heights Ltd',
      location: 'Kigali, Rwanda',
      projectType: 'Residential',
      budget: 120000,
      startDate: '2026-06-01',
      deadline: '2026-09-30',
      status: 'active',
      progress: 75,
      siteEngineer: 'Mukamana Claudine',
      projectManager: 'Jean Bosco',
      description: 'Three-floor residential project with progress, material and attendance monitoring.',
      createdAt,
      updatedAt,
    },
    {
      id: 2,
      projectName: 'School Construction',
      clientName: 'Green Hills Academy',
      location: 'Musanze',
      projectType: 'School',
      budget: 80000,
      startDate: '2026-05-10',
      deadline: '2026-09-15',
      status: 'delayed',
      progress: 45,
      siteEngineer: 'Mukamana Claudine',
      projectManager: 'Jean Bosco',
      description: 'Classroom block and sanitation upgrade with schedule risk controls.',
      createdAt,
      updatedAt,
    },
    {
      id: 3,
      projectName: 'Road Construction',
      clientName: 'District Infrastructure Unit',
      location: 'Rubavu',
      projectType: 'Road Construction',
      budget: 200000,
      startDate: '2026-04-20',
      deadline: '2026-10-30',
      status: 'active',
      progress: 60,
      siteEngineer: 'Mukamana Claudine',
      projectManager: 'Jean Bosco',
      description: 'Urban feeder road with material and workforce productivity tracking.',
      createdAt,
      updatedAt,
    },
    {
      id: 4,
      projectName: 'Warehouse Project',
      clientName: 'Akagera Logistics',
      location: 'Huye',
      projectType: 'Warehouse',
      budget: 150000,
      startDate: '2026-06-05',
      deadline: '2026-12-20',
      status: 'on_hold',
      progress: 30,
      siteEngineer: 'Mukamana Claudine',
      projectManager: 'Jean Bosco',
      description: 'Storage facility with procurement and site readiness dependencies.',
      createdAt,
      updatedAt,
    },
    ]);

    await Worker.bulkCreate([
    { id: 1, userId: 2, employeeCode: 'BI-W-001', position: 'Mason', salary: 850, dailyRate: 35, employmentType: 'contract', skillLevel: 'skilled', productivityScore: 88, smartCardCode: 'BI-W-001', joinDate: '2026-05-01', dateOfBirth: '1994-03-12', gender: 'male', department: 'Masonry', address: 'Kigali, Rwanda', emergencyContactName: 'Bosco Family Contact', emergencyContactPhone: '0781000001', emergencyContactRelationship: 'Sibling', tradeCertification: 'Masonry Level 3', safetyInductionDate: '2026-05-01', medicalClearanceDate: '2026-05-01', ppeIssued: true, bankName: 'Bank of Kigali', bankAccountNumber: '1002003001', notes: 'Experienced walling team lead.', status: 'active', createdAt, updatedAt },
    { id: 2, userId: 3, employeeCode: 'BI-W-002', position: 'Carpenter', salary: 920, dailyRate: 40, employmentType: 'contract', skillLevel: 'foreman', productivityScore: 91, smartCardCode: 'BI-W-002', joinDate: '2026-05-04', dateOfBirth: '1991-09-20', gender: 'female', department: 'Carpentry', address: 'Kigali, Rwanda', emergencyContactName: 'Claudine Contact', emergencyContactPhone: '0781000002', emergencyContactRelationship: 'Spouse', tradeCertification: 'Carpentry Level 4', safetyInductionDate: '2026-05-04', medicalClearanceDate: '2026-05-04', ppeIssued: true, bankName: 'I&M Bank', bankAccountNumber: '1002003002', notes: 'Can supervise finishing crews.', status: 'active', createdAt, updatedAt },
    { id: 3, userId: 4, employeeCode: 'BI-W-003', position: 'Helper', salary: 520, dailyRate: 22, employmentType: 'casual', skillLevel: 'junior', productivityScore: 62, smartCardCode: 'BI-W-003', joinDate: '2026-05-08', dateOfBirth: '1998-01-15', gender: 'male', department: 'General', address: 'Musanze', emergencyContactName: 'Eric Contact', emergencyContactPhone: '0781000003', emergencyContactRelationship: 'Parent', tradeCertification: '', safetyInductionDate: '2026-05-08', medicalClearanceDate: '2026-05-08', ppeIssued: true, bankName: 'Equity Bank', bankAccountNumber: '1002003003', notes: 'Requires close task supervision.', status: 'inactive', createdAt, updatedAt },
    { id: 4, userId: 5, employeeCode: 'BI-W-004', position: 'Steel Fixer', salary: 980, dailyRate: 42, employmentType: 'contract', skillLevel: 'skilled', productivityScore: 84, smartCardCode: 'BI-W-004', joinDate: '2026-05-12', dateOfBirth: '1992-07-02', gender: 'male', department: 'Steel Works', address: 'Rubavu', emergencyContactName: 'John Contact', emergencyContactPhone: '0781000004', emergencyContactRelationship: 'Sibling', tradeCertification: 'Steel Fixing Level 3', safetyInductionDate: '2026-05-12', medicalClearanceDate: '2026-05-12', ppeIssued: true, bankName: 'BK', bankAccountNumber: '1002003004', notes: 'Strong rebar placement record.', status: 'active', createdAt, updatedAt },
  ]);

    await Material.bulkCreate([
    { id: 1, projectId: 1, materialName: 'Cement (50kg)', plannedQuantity: 500, usedQuantity: 560, remainingStock: -60, unit: 'Bag', estimatedCost: 6500, actualCost: 7280, supplier: 'Kigali Cement Supply', deliveryDate: '2026-06-03', status: 'used', createdAt, updatedAt },
    { id: 2, projectId: 1, materialName: 'Bricks', plannedQuantity: 20000, usedQuantity: 18500, remainingStock: 1500, unit: 'Pcs', estimatedCost: 5200, actualCost: 4810, supplier: 'Rwanda Clay Works', deliveryDate: '2026-06-05', status: 'received', createdAt, updatedAt },
    { id: 3, projectId: 2, materialName: 'Sand', plannedQuantity: 120, usedQuantity: 110, remainingStock: 10, unit: 'm3', estimatedCost: 2400, actualCost: 2200, supplier: 'Volcano Aggregates', deliveryDate: '2026-05-18', status: 'received', createdAt, updatedAt },
    { id: 4, projectId: 3, materialName: 'Steel Bars', plannedQuantity: 3.5, usedQuantity: 3.9, remainingStock: -0.4, unit: 'Ton', estimatedCost: 4800, actualCost: 5450, supplier: 'Steel Rwanda', deliveryDate: '2026-05-28', status: 'used', createdAt, updatedAt },
    { id: 5, projectId: 3, materialName: 'Concrete', plannedQuantity: 80, usedQuantity: 70, remainingStock: 10, unit: 'm3', estimatedCost: 7200, actualCost: 6500, supplier: 'ReadyMix Kigali', deliveryDate: '2026-06-04', status: 'received', createdAt, updatedAt },
    { id: 6, projectId: 4, materialName: 'Roofing Sheets', plannedQuantity: 260, usedQuantity: 90, remainingStock: 170, unit: 'Sheet', estimatedCost: 9100, actualCost: 3150, supplier: 'Huye Hardware', deliveryDate: '2026-06-08', status: 'pending', createdAt, updatedAt },
    ]);

    await Attendance.bulkCreate([
    { id: 1, workerId: 1, projectId: 1, checkIn: new Date('2026-06-09T05:30:00.000Z'), checkOut: new Date('2026-06-09T15:30:00.000Z'), hoursWorked: 10, status: 'present', notes: 'Completed walling section A.', location: 'Kigali, Rwanda', createdAt, updatedAt },
    { id: 2, workerId: 2, projectId: 1, checkIn: new Date('2026-06-09T05:40:00.000Z'), checkOut: new Date('2026-06-09T15:10:00.000Z'), hoursWorked: 9.5, status: 'present', notes: 'Door frame works.', location: 'Kigali, Rwanda', createdAt, updatedAt },
    { id: 3, workerId: 3, projectId: 2, checkIn: new Date('2026-06-09T06:00:00.000Z'), checkOut: null, hoursWorked: 0, status: 'absent', notes: 'No check-in recorded.', location: 'Musanze', createdAt, updatedAt },
    { id: 4, workerId: 4, projectId: 3, checkIn: new Date('2026-06-09T05:35:00.000Z'), checkOut: new Date('2026-06-09T15:05:00.000Z'), hoursWorked: 9.5, status: 'present', notes: 'Rebar placement.', location: 'Rubavu', createdAt, updatedAt },
    { id: 5, workerId: 1, projectId: 3, checkIn: new Date('2026-06-08T05:35:00.000Z'), checkOut: new Date('2026-06-08T15:05:00.000Z'), hoursWorked: 9.5, status: 'present', notes: 'Roadside drainage.', location: 'Rubavu', createdAt, updatedAt },
    ]);

    seeded = true;
  }

  if (await ProjectPhase.count() === 0) {
    await ProjectPhase.bulkCreate([
      { projectId: 1, name: 'Foundation', startDate: '2026-06-01', endDate: '2026-06-20', progress: 100, status: 'completed', createdAt, updatedAt },
      { projectId: 1, name: 'Walling', startDate: '2026-06-21', endDate: '2026-07-20', progress: 65, status: 'active', createdAt, updatedAt },
      { projectId: 1, name: 'Roofing', startDate: '2026-07-21', endDate: '2026-08-10', progress: 0, status: 'planned', createdAt, updatedAt },
      { projectId: 2, name: 'Classroom Block', startDate: '2026-05-10', endDate: '2026-08-25', progress: 45, status: 'delayed', createdAt, updatedAt },
      { projectId: 3, name: 'Drainage Works', startDate: '2026-04-20', endDate: '2026-07-15', progress: 60, status: 'active', createdAt, updatedAt },
      { projectId: 4, name: 'Site Preparation', startDate: '2026-06-05', endDate: '2026-07-05', progress: 30, status: 'active', createdAt, updatedAt },
    ]);
    seeded = true;
  }

  if (await ProjectAssignment.count() === 0) {
    await ProjectAssignment.bulkCreate([
      { projectId: 1, workerId: 1, role: 'Mason', createdAt, updatedAt },
      { projectId: 1, workerId: 2, role: 'Carpenter', createdAt, updatedAt },
      { projectId: 2, workerId: 3, role: 'Helper', createdAt, updatedAt },
      { projectId: 3, workerId: 4, role: 'Steel Fixer', createdAt, updatedAt },
      { projectId: 3, workerId: 1, role: 'Mason', createdAt, updatedAt },
    ], { ignoreDuplicates: true });
    seeded = true;
  }

  if (await Device.count() === 0) {
    await Device.bulkCreate([
      { name: 'Main Gate QR Scanner', type: 'qr', location: 'Kigali, Rwanda', status: 'online', lastSeen: new Date(), createdAt, updatedAt },
      { name: 'Warehouse RFID Reader', type: 'rfid', location: 'Huye', status: 'online', lastSeen: new Date(), createdAt, updatedAt },
      { name: 'Mobile Site Supervisor App', type: 'mobile', location: 'Rubavu', status: 'maintenance', lastSeen: new Date(), createdAt, updatedAt },
    ]);
    seeded = true;
  }

  await ensureSingleStoreyHouseBaseline();

  return seeded;
}
