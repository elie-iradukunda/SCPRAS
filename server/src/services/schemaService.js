import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const workerColumns = {
  employeeCode: { type: DataTypes.STRING, unique: true },
  dailyRate: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  employmentType: { type: DataTypes.ENUM('permanent', 'contract', 'casual', 'subcontractor'), defaultValue: 'contract' },
  skillLevel: { type: DataTypes.ENUM('trainee', 'junior', 'skilled', 'foreman', 'supervisor'), defaultValue: 'skilled' },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('male', 'female', 'other', 'not_specified'), defaultValue: 'not_specified' },
  address: { type: DataTypes.STRING },
  emergencyContactName: { type: DataTypes.STRING },
  emergencyContactPhone: { type: DataTypes.STRING },
  emergencyContactRelationship: { type: DataTypes.STRING },
  tradeCertification: { type: DataTypes.STRING },
  safetyInductionDate: { type: DataTypes.DATEONLY },
  medicalClearanceDate: { type: DataTypes.DATEONLY },
  ppeIssued: { type: DataTypes.BOOLEAN, defaultValue: false },
  bankName: { type: DataTypes.STRING },
  bankAccountNumber: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
};

const materialColumns = {
  materialCode: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  specification: { type: DataTypes.TEXT },
  receivedQuantity: { type: DataTypes.FLOAT, defaultValue: 0 },
  minimumStock: { type: DataTypes.FLOAT, defaultValue: 0 },
  reorderLevel: { type: DataTypes.FLOAT, defaultValue: 0 },
  unitCost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  supplierContact: { type: DataTypes.STRING },
  supplierEmail: { type: DataTypes.STRING },
  purchaseOrderNumber: { type: DataTypes.STRING },
  invoiceNumber: { type: DataTypes.STRING },
  lastReceivedDate: { type: DataTypes.DATEONLY },
  storageLocation: { type: DataTypes.STRING },
  batchNumber: { type: DataTypes.STRING },
  gradeSpecification: { type: DataTypes.STRING },
  qualityStatus: { type: DataTypes.STRING, defaultValue: 'pending_inspection' },
  inspectedBy: { type: DataTypes.STRING },
  inspectionDate: { type: DataTypes.DATEONLY },
  wastageAllowancePercent: { type: DataTypes.FLOAT, defaultValue: 0 },
  plannedPhase: { type: DataTypes.STRING },
  plannedStartDate: { type: DataTypes.DATEONLY },
  plannedEndDate: { type: DataTypes.DATEONLY },
  priority: { type: DataTypes.ENUM('low', 'normal', 'high', 'critical'), defaultValue: 'normal' },
  bomStatus: { type: DataTypes.ENUM('planned', 'approved', 'revised', 'cancelled'), defaultValue: 'planned' },
  notes: { type: DataTypes.TEXT },
};

const projectColumns = {
  projectCode: { type: DataTypes.STRING },
  currency: { type: DataTypes.STRING, defaultValue: 'USD' },
  totalBuiltArea: { type: DataTypes.FLOAT },
  internalFloorArea: { type: DataTypes.FLOAT },
  frontPorchArea: { type: DataTypes.FLOAT },
  rearVerandaArea: { type: DataTypes.FLOAT },
  floors: { type: DataTypes.INTEGER },
  bedrooms: { type: DataTypes.INTEGER },
  bathrooms: { type: DataTypes.INTEGER },
  roofType: { type: DataTypes.STRING },
  structureType: { type: DataTypes.STRING },
  wallThicknessExternal: { type: DataTypes.FLOAT },
  wallThicknessInternal: { type: DataTypes.FLOAT },
  drawingRef: { type: DataTypes.STRING },
  thumbnailUrl: { type: DataTypes.STRING },
};

const projectPhaseColumns = {
  description: { type: DataTypes.TEXT },
};

const projectDocumentColumns = {
  drawingTitle: { type: DataTypes.STRING },
  drawingType: { type: DataTypes.ENUM('architectural', 'structural', 'electrical', 'plumbing', 'mechanical', 'site_plan', 'other'), defaultValue: 'other' },
  drawingNumber: { type: DataTypes.STRING },
  revisionNumber: { type: DataTypes.STRING },
};

const workActivityColumns = {
  constraints: { type: DataTypes.TEXT },
};

async function addMissingColumns(tableName, columns) {
  const queryInterface = sequelize.getQueryInterface();
  let existingColumns;

  try {
    existingColumns = await queryInterface.describeTable(tableName);
  } catch {
    return;
  }

  for (const [columnName, definition] of Object.entries(columns)) {
    if (!existingColumns[columnName]) {
      await queryInterface.addColumn(tableName, columnName, definition);
    }
  }
}

async function backfillMaterialColumns() {
  try {
    await sequelize.query(`
      UPDATE Materials
      SET receivedQuantity = COALESCE(usedQuantity, 0) + COALESCE(remainingStock, 0)
      WHERE COALESCE(receivedQuantity, 0) = 0
        AND (COALESCE(usedQuantity, 0) + COALESCE(remainingStock, 0)) > 0
    `);
    await sequelize.query(`
      UPDATE Materials
      SET unitCost = estimatedCost / plannedQuantity
      WHERE COALESCE(unitCost, 0) = 0
        AND COALESCE(plannedQuantity, 0) > 0
        AND COALESCE(estimatedCost, 0) > 0
    `);
  } catch {
    // Schema backfills are best effort for databases that already have the table.
  }
}

async function widenUserRoleEnum() {
  try {
    await sequelize.query(`
      ALTER TABLE Users
      MODIFY COLUMN role ENUM(
        'admin','project_manager','site_engineer','quantity_surveyor','store_officer','contractor_foreman',
        'engineer','storekeeper','supervisor','accountant','client','worker'
      ) NOT NULL
    `);
    await sequelize.query(`
      UPDATE Users SET role = CASE
        WHEN role IN ('worker','supervisor') THEN 'contractor_foreman'
        WHEN role = 'engineer' THEN 'site_engineer'
        WHEN role = 'storekeeper' THEN 'store_officer'
        WHEN role = 'accountant' THEN 'quantity_surveyor'
        WHEN role = 'client' THEN 'project_manager'
        ELSE role
      END
    `);
    await sequelize.query(`
      UPDATE Users
      SET fullName = CASE WHEN email = 'admin@buildintel.rw' THEN 'SCPRAS Administrator' ELSE fullName END,
          email = REPLACE(email, '@buildintel.rw', '@scpras.rw')
      WHERE email LIKE '%@buildintel.rw'
    `);
    await sequelize.query(`
      ALTER TABLE Users
      MODIFY COLUMN role ENUM('admin','project_manager','site_engineer','quantity_surveyor','store_officer','contractor_foreman') NOT NULL
    `);
  } catch {
    // Best effort: fresh databases get the wider enum from the Sequelize model.
  }
}

export async function ensureSchema() {
  await addMissingColumns('Workers', workerColumns);
  await widenUserRoleEnum();
  await addMissingColumns('Projects', projectColumns);
  await addMissingColumns('Materials', materialColumns);
  await addMissingColumns('ProjectPhases', projectPhaseColumns);
  await addMissingColumns('ProjectDocuments', projectDocumentColumns);
  await addMissingColumns('WorkActivities', workActivityColumns);
  await backfillMaterialColumns();
}
