import { Material, MaterialIssue, MaterialReceipt, Project } from '../models/index.js';

const statusValues = ['pending', 'received', 'used', 'damaged'];

const textFields = [
  'materialCode',
  'materialName',
  'category',
  'specification',
  'unit',
  'supplier',
  'supplierContact',
  'supplierEmail',
  'purchaseOrderNumber',
  'invoiceNumber',
  'storageLocation',
  'batchNumber',
  'gradeSpecification',
  'qualityStatus',
  'inspectedBy',
  'plannedPhase',
  'priority',
  'bomStatus',
  'notes',
];

const dateFields = ['deliveryDate', 'lastReceivedDate', 'inspectionDate', 'plannedStartDate', 'plannedEndDate'];

function hasValue(source, field) {
  return Object.prototype.hasOwnProperty.call(source, field);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function cleanDate(value) {
  return value || null;
}

function roundQuantity(value) {
  return Math.round(value * 1000) / 1000;
}

function createMaterialCode() {
  const suffix = `${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
  return `BI-MAT-${suffix}`;
}

function createIssueCode() {
  const suffix = `${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
  return `ISS-${suffix}`;
}

function createReceiptCode() {
  const suffix = `${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
  return `RCV-${suffix}`;
}

function deriveStatus(status, receivedQuantity, usedQuantity, fallback = 'pending') {
  if (statusValues.includes(status)) return status;
  if (fallback === 'damaged') return fallback;
  if (receivedQuantity <= 0) return 'pending';
  if (usedQuantity >= receivedQuantity) return 'used';
  return 'received';
}

function calculateStockHealth(material) {
  const remainingStock = toNumber(material.remainingStock);
  const minimumStock = toNumber(material.minimumStock);
  const reorderLevel = toNumber(material.reorderLevel);

  if (remainingStock <= 0) return 'stockout';
  if (reorderLevel > 0 && remainingStock <= reorderLevel) return 'reorder';
  if (minimumStock > 0 && remainingStock <= minimumStock) return 'low';
  return 'healthy';
}

function materialCosts(body, plannedQuantity, usedQuantity, fallback = {}) {
  const unitCost = hasValue(body, 'unitCost') ? toNumber(body.unitCost) : toNumber(fallback.unitCost);
  const estimatedCost = hasValue(body, 'estimatedCost')
    ? toNumber(body.estimatedCost)
    : (toNumber(fallback.estimatedCost) || plannedQuantity * unitCost);
  const actualCost = hasValue(body, 'actualCost')
    ? toNumber(body.actualCost)
    : (toNumber(fallback.actualCost) || usedQuantity * unitCost);

  return { unitCost, estimatedCost, actualCost };
}

export async function listMaterials(req, res, next) {
  try {
    const { projectId } = req.query;

    const where = {};
    if (projectId) where.projectId = projectId;

    const materials = await Material.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Project,
          attributes: ['projectName', 'location', 'currency'],
        },
        {
          model: MaterialIssue,
          attributes: ['id', 'issueCode', 'issuedQuantity', 'issueDate', 'approvalStatus', 'phase', 'usedFor'],
        },
      ],
    });

    res.json(materials);
  } catch (error) {
    next(error);
  }
}

export async function getMaterial(req, res, next) {
  try {
    const material = await Material.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          attributes: ['projectName', 'location', 'budget', 'currency'],
        },
        {
          model: MaterialIssue,
        },
        {
          model: MaterialReceipt,
        },
      ],
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
}

export async function createMaterial(req, res, next) {
  try {
    const plannedQuantity = toNumber(req.body.plannedQuantity);
    const receivedQuantity = hasValue(req.body, 'receivedQuantity') ? toNumber(req.body.receivedQuantity) : plannedQuantity;
    const usedQuantity = toNumber(req.body.usedQuantity);
    const materialName = String(req.body.materialName || '').trim();

    if (!req.body.projectId || !materialName || plannedQuantity <= 0) {
      return res.status(400).json({ message: 'projectId, materialName, and plannedQuantity greater than 0 are required.' });
    }

    const { unitCost, estimatedCost, actualCost } = materialCosts(req.body, plannedQuantity, usedQuantity);
    const material = await Material.create({
      projectId: req.body.projectId,
      materialCode: req.body.materialCode || createMaterialCode(),
      materialName,
      category: req.body.category || '',
      specification: req.body.specification || req.body.gradeSpecification || '',
      plannedQuantity,
      receivedQuantity,
      usedQuantity,
      remainingStock: roundQuantity(receivedQuantity - usedQuantity),
      minimumStock: toNumber(req.body.minimumStock),
      reorderLevel: toNumber(req.body.reorderLevel),
      unit: req.body.unit || 'pcs',
      unitCost,
      estimatedCost,
      actualCost,
      supplier: req.body.supplier || '',
      supplierContact: req.body.supplierContact || '',
      supplierEmail: req.body.supplierEmail || '',
      purchaseOrderNumber: req.body.purchaseOrderNumber || '',
      invoiceNumber: req.body.invoiceNumber || '',
      deliveryDate: cleanDate(req.body.deliveryDate),
      lastReceivedDate: cleanDate(req.body.lastReceivedDate),
      storageLocation: req.body.storageLocation || '',
      batchNumber: req.body.batchNumber || '',
      gradeSpecification: req.body.gradeSpecification || '',
      qualityStatus: req.body.qualityStatus || 'pending_inspection',
      inspectedBy: req.body.inspectedBy || '',
      inspectionDate: cleanDate(req.body.inspectionDate),
      wastageAllowancePercent: toNumber(req.body.wastageAllowancePercent),
      plannedPhase: req.body.plannedPhase || '',
      plannedStartDate: cleanDate(req.body.plannedStartDate),
      plannedEndDate: cleanDate(req.body.plannedEndDate),
      priority: req.body.priority || 'normal',
      bomStatus: req.body.bomStatus || 'planned',
      notes: req.body.notes || '',
      status: deriveStatus(req.body.status, receivedQuantity, usedQuantity),
    });

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
}

export async function updateMaterial(req, res, next) {
  try {
    const material = await Material.findByPk(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const plannedQuantity = hasValue(req.body, 'plannedQuantity') ? toNumber(req.body.plannedQuantity) : toNumber(material.plannedQuantity);
    const receivedQuantity = hasValue(req.body, 'receivedQuantity')
      ? toNumber(req.body.receivedQuantity)
      : (toNumber(material.receivedQuantity) || toNumber(material.plannedQuantity));
    const usedQuantity = hasValue(req.body, 'usedQuantity') ? toNumber(req.body.usedQuantity) : toNumber(material.usedQuantity);
    const updates = {};

    if (hasValue(req.body, 'projectId')) updates.projectId = req.body.projectId;

    textFields.forEach((field) => {
      if (hasValue(req.body, field)) updates[field] = req.body[field] || '';
    });

    dateFields.forEach((field) => {
      if (hasValue(req.body, field)) updates[field] = cleanDate(req.body[field]);
    });

    ['plannedQuantity', 'receivedQuantity', 'usedQuantity', 'minimumStock', 'reorderLevel', 'wastageAllowancePercent'].forEach((field) => {
      if (hasValue(req.body, field)) updates[field] = toNumber(req.body[field]);
    });

    const costs = materialCosts(req.body, plannedQuantity, usedQuantity, material);
    if (hasValue(req.body, 'unitCost')) updates.unitCost = costs.unitCost;
    if (hasValue(req.body, 'estimatedCost')) updates.estimatedCost = costs.estimatedCost;
    if (hasValue(req.body, 'actualCost')) updates.actualCost = costs.actualCost;
    if (!hasValue(req.body, 'actualCost') && hasValue(req.body, 'usedQuantity') && costs.unitCost > 0) {
      updates.actualCost = usedQuantity * costs.unitCost;
    }

    if (hasValue(req.body, 'plannedQuantity') || hasValue(req.body, 'receivedQuantity') || hasValue(req.body, 'usedQuantity')) {
      updates.remainingStock = roundQuantity(receivedQuantity - usedQuantity);
      updates.status = deriveStatus(req.body.status, receivedQuantity, usedQuantity, material.status);
    }

    if (hasValue(req.body, 'status')) {
      updates.status = deriveStatus(req.body.status, receivedQuantity, usedQuantity, material.status);
    }

    Object.assign(material, updates);
    await material.save();

    res.json(material);
  } catch (error) {
    next(error);
  }
}

export async function deleteMaterial(req, res, next) {
  try {
    const material = await Material.findByPk(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    await MaterialIssue.destroy({ where: { materialId: material.id } });
    await MaterialReceipt.destroy({ where: { materialId: material.id } });
    await material.destroy();

    res.json({ message: 'Material deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getMaterialReport(req, res, next) {
  try {
    const { projectId } = req.query;

    const where = {};
    if (projectId) where.projectId = projectId;

    const materials = await Material.findAll({
      where,
      include: [
        {
          model: Project,
          attributes: ['projectName', 'budget', 'currency'],
        },
      ],
    });

    const totalPlannedCost = materials.reduce((total, material) => total + Number(material.estimatedCost || 0), 0);
    const totalActualCost = materials.reduce((total, material) => total + Number(material.actualCost || 0), 0);
    const totalInventoryValue = materials.reduce((total, material) => {
      return total + Math.max(0, Number(material.remainingStock || 0)) * Number(material.unitCost || 0);
    }, 0);

    res.json({
      totalMaterials: materials.length,
      totalPlannedCost,
      totalActualCost,
      totalInventoryValue,
      costVariance: totalPlannedCost - totalActualCost,
      lowStockMaterials: materials.filter((material) => ['stockout', 'reorder', 'low'].includes(calculateStockHealth(material))).length,
      damagedMaterials: materials.filter((material) => material.status === 'damaged').length,
      pendingInspections: materials.filter((material) => material.qualityStatus === 'pending_inspection').length,
      materials,
    });
  } catch (error) {
    next(error);
  }
}

export async function receiveMaterial(req, res, next) {
  try {
    const { materialId, receivedQuantity } = req.body;
    const quantity = toNumber(receivedQuantity);

    if (!materialId || quantity <= 0) {
      return res.status(400).json({ message: 'materialId and receivedQuantity greater than 0 are required.' });
    }

    const material = await Material.findByPk(materialId);

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const currentReceived = toNumber(material.receivedQuantity);
    const nextReceived = req.body.mode === 'add' ? currentReceived + quantity : quantity;

    material.receivedQuantity = nextReceived;
    material.remainingStock = roundQuantity(nextReceived - toNumber(material.usedQuantity));
    material.lastReceivedDate = cleanDate(req.body.lastReceivedDate) || new Date().toISOString().slice(0, 10);
    material.deliveryDate = cleanDate(req.body.deliveryDate) || material.deliveryDate;
    material.status = deriveStatus(req.body.status, nextReceived, toNumber(material.usedQuantity), material.status);

    if (hasValue(req.body, 'actualCost')) material.actualCost = toNumber(req.body.actualCost);
    if (hasValue(req.body, 'invoiceNumber')) material.invoiceNumber = req.body.invoiceNumber || '';
    if (hasValue(req.body, 'batchNumber')) material.batchNumber = req.body.batchNumber || '';
    if (hasValue(req.body, 'storageLocation')) material.storageLocation = req.body.storageLocation || material.storageLocation;

    await material.save();

    await MaterialReceipt.create({
      projectId: material.projectId,
      materialId: material.id,
      receiptCode: req.body.receiptCode || createReceiptCode(),
      itemCode: material.materialCode,
      itemName: material.materialName,
      unit: material.unit,
      quantityReceived: quantity,
      unitCost: toNumber(req.body.unitCost, toNumber(material.unitCost)),
      deliveryNoteNo: req.body.deliveryNoteNo || req.body.invoiceNumber || '',
      receiptNo: req.body.receiptNo || '',
      receivedDate: cleanDate(req.body.lastReceivedDate) || new Date().toISOString().slice(0, 10),
      receivedBy: req.body.receivedBy || '',
      storageLocation: req.body.storageLocation || material.storageLocation || '',
      remarks: req.body.remarks || '',
    });

    res.json(material);
  } catch (error) {
    next(error);
  }
}

export const receiveMateria = receiveMaterial;

function issueMessage(issue) {
  if (issue.approvalStatus === 'pending') {
    if (issue.exceedsStock) return 'Issue recorded but pending approval because it exceeds available stock.';
    if (issue.exceedsPlan) return 'Issue recorded but pending manager approval because it exceeds the planned BOM quantity.';
    return 'Issue recorded and pending approval.';
  }
  return 'Material issued to site and deducted from stock.';
}

async function applyIssueToMaterial(issue, material) {
  if (issue.appliedToMaterial) return material;
  const issuedQuantity = toNumber(issue.issuedQuantity);
  const nextUsed = roundQuantity(toNumber(material.usedQuantity) + issuedQuantity);
  material.usedQuantity = nextUsed;
  material.remainingStock = roundQuantity(toNumber(material.receivedQuantity) - nextUsed);
  material.actualCost = nextUsed * toNumber(material.unitCost);
  material.status = deriveStatus(material.status, toNumber(material.receivedQuantity), nextUsed, material.status);
  await material.save();
  issue.appliedToMaterial = true;
  if (issue.approvalStatus !== 'approved') issue.approvalStatus = 'approved';
  if (!issue.approvedAt) issue.approvedAt = new Date();
  await issue.save();
  return material;
}

export async function listMaterialIssues(req, res, next) {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.materialId) where.materialId = req.query.materialId;

    const issues = await MaterialIssue.findAll({
      where,
      order: [['issueDate', 'DESC'], ['createdAt', 'DESC']],
      include: [
        { model: Material, attributes: ['materialCode', 'materialName', 'unit', 'plannedQuantity', 'usedQuantity'] },
        { model: Project, attributes: ['projectName', 'currency'] },
      ],
    });

    res.json(issues);
  } catch (error) {
    next(error);
  }
}

export async function createMaterialIssue(req, res, next) {
  try {
    const materialId = req.body.materialId || req.body.bomItemId;
    const issuedQuantity = toNumber(req.body.issuedQuantity || req.body.quantityToIssue);

    if (!materialId || issuedQuantity <= 0) {
      return res.status(400).json({ message: 'materialId and issuedQuantity greater than 0 are required.' });
    }

    const material = await Material.findByPk(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const usedBefore = toNumber(material.usedQuantity);
    const receivedQuantity = toNumber(material.receivedQuantity);
    const remainingStock = toNumber(material.remainingStock, receivedQuantity - usedBefore);
    const plannedRemaining = toNumber(material.plannedQuantity) - usedBefore;
    const exceedsStock = issuedQuantity > remainingStock;
    const exceedsPlan = issuedQuantity > plannedRemaining;
    const approvalStatus = req.body.approvalStatus || (exceedsStock || exceedsPlan ? 'pending' : 'approved');

    const issue = await MaterialIssue.create({
      projectId: req.body.projectId || material.projectId,
      materialId: material.id,
      issueCode: req.body.issueCode || createIssueCode(),
      issuedQuantity,
      issueDate: cleanDate(req.body.issueDate || req.body.date) || new Date().toISOString().slice(0, 10),
      issuedTo: req.body.issuedTo || '',
      issuedBy: req.body.issuedBy || '',
      usedFor: req.body.usedFor || req.body.purpose || '',
      phase: req.body.phase || material.plannedPhase || '',
      siteLocation: req.body.siteLocation || '',
      approvalStatus,
      approvedBy: approvalStatus === 'approved' ? (req.body.approvedBy || req.body.issuedBy || '') : '',
      approvedAt: approvalStatus === 'approved' ? new Date() : null,
      evidenceFile: req.body.evidenceFile || '',
      remarks: req.body.remarks || '',
      exceedsPlan,
      exceedsStock,
      plannedQuantityAtIssue: toNumber(material.plannedQuantity),
      usedQuantityBefore: usedBefore,
      remainingStockBefore: remainingStock,
      appliedToMaterial: false,
    });

    if (approvalStatus === 'approved') {
      await applyIssueToMaterial(issue, material);
    }

    const savedIssue = await MaterialIssue.findByPk(issue.id, {
      include: [{ model: Material }, { model: Project, attributes: ['projectName', 'currency'] }],
    });

    return res.status(201).json({
      message: issueMessage(savedIssue),
      issue: savedIssue,
    });
  } catch (error) {
    return next(error);
  }
}

export async function approveMaterialIssue(req, res, next) {
  try {
    const issue = await MaterialIssue.findByPk(req.params.issueId || req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Material issue not found.' });
    }

    const material = await Material.findByPk(issue.materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    issue.approvedBy = req.body.approvedBy || issue.approvedBy || 'Manager';
    issue.approvedAt = new Date();
    issue.approvalStatus = 'approved';
    await issue.save();
    await applyIssueToMaterial(issue, material);

    return res.json({ message: 'Material issue approved and applied.', issue });
  } catch (error) {
    return next(error);
  }
}

export async function rejectMaterialIssue(req, res, next) {
  try {
    const issue = await MaterialIssue.findByPk(req.params.issueId || req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Material issue not found.' });
    }

    issue.approvalStatus = 'rejected';
    issue.remarks = [issue.remarks, req.body.decisionComment].filter(Boolean).join('\n');
    await issue.save();

    return res.json({ message: 'Material issue rejected.', issue });
  } catch (error) {
    return next(error);
  }
}

export async function listMaterialReceipts(req, res, next) {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.materialId) where.materialId = req.query.materialId;

    const receipts = await MaterialReceipt.findAll({
      where,
      order: [['receivedDate', 'DESC'], ['createdAt', 'DESC']],
      include: [
        { model: Material, attributes: ['materialCode', 'materialName', 'unit'] },
        { model: Project, attributes: ['projectName', 'currency'] },
      ],
    });

    res.json(receipts);
  } catch (error) {
    next(error);
  }
}
