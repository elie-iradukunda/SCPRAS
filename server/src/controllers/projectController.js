import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Attendance, EvidenceFile, Material, MaterialIssue, MaterialReceipt, Project, ProjectAssignment, ProjectDocument, ProjectPhase, User, WorkActivity, Worker } from '../models/index.js';

const projectFields = [
  'projectName',
  'projectCode',
  'clientName',
  'clientPhone',
  'clientEmail',
  'contractRef',
  'location',
  'projectType',
  'budget',
  'currency',
  'startDate',
  'deadline',
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
];

function cleanNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function projectBody(body) {
  const payload = {};
  projectFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) payload[field] = body[field];
  });

  if (Object.prototype.hasOwnProperty.call(payload, 'budget')) payload.budget = cleanNumber(payload.budget, 0);
  ['totalBuiltArea', 'internalFloorArea', 'frontPorchArea', 'rearVerandaArea', 'wallThicknessExternal', 'wallThicknessInternal'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) payload[field] = cleanNumber(payload[field]);
  });
  ['floors', 'bedrooms', 'bathrooms'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) payload[field] = cleanNumber(payload[field]);
  });

  return payload;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectUploadPath = path.resolve(__dirname, '../../uploads/projects');

export async function listProjects(req, res, next) {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Material,
          attributes: ['id', 'materialCode', 'materialName', 'category', 'plannedQuantity', 'usedQuantity', 'unit', 'estimatedCost', 'actualCost', 'plannedPhase', 'priority'],
        },
        {
          model: ProjectPhase,
          attributes: ['id', 'name', 'startDate', 'endDate', 'progress', 'status'],
        },
        {
          model: ProjectDocument,
          attributes: ['id', 'originalName', 'mimeType', 'size', 'category', 'url'],
        },
        {
          model: ProjectAssignment,
          include: [{ model: Worker, include: [{ model: User, attributes: ['fullName', 'email'] }] }],
        },
        {
          model: Attendance,
          attributes: ['id', 'workerId'],
        },
      ],
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Material,
          attributes: ['id', 'materialCode', 'materialName', 'category', 'specification', 'plannedQuantity', 'receivedQuantity', 'usedQuantity', 'remainingStock', 'unit', 'unitCost', 'estimatedCost', 'actualCost', 'supplier', 'storageLocation', 'plannedPhase', 'priority', 'bomStatus'],
          include: [{ model: MaterialIssue }],
        },
        {
          model: ProjectPhase,
        },
        {
          model: ProjectDocument,
        },
        {
          model: ProjectAssignment,
          include: [{ model: Worker, include: [{ model: User, attributes: ['fullName', 'email', 'phone'] }] }],
        },
        {
          model: Attendance,
          include: [
            {
              model: Worker,
              include: [{ model: User, attributes: ['fullName'] }],
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { projectName, location, budget, deadline, status, priority, phases = [], workerIds = [] } = req.body;

    if (!projectName || !location || !budget || !deadline) {
      return res.status(400).json({ message: 'projectName, location, budget, and deadline are required.' });
    }

    const project = await Project.create({
      ...projectBody(req.body),
      status: status ? String(status).toLowerCase() : 'planning',
      priority: priority ? String(priority).toLowerCase() : 'normal',
    });

    if (Array.isArray(phases) && phases.length > 0) {
      await ProjectPhase.bulkCreate(phases.map((phase) => ({
        projectId: project.id,
        name: phase.name,
        startDate: phase.startDate || null,
        endDate: phase.endDate || null,
        progress: Number(phase.progress || 0),
        status: phase.status || 'planned',
        description: phase.description || '',
      })));
    }

    if (Array.isArray(workerIds) && workerIds.length > 0) {
      await ProjectAssignment.bulkCreate(workerIds.map((workerId) => ({
        projectId: project.id,
        workerId,
      })), { ignoreDuplicates: true });
    }

    const createdProject = await Project.findByPk(project.id, {
      include: [ProjectPhase, ProjectAssignment, ProjectDocument, Material],
    });

    res.status(201).json(createdProject);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const {
      status, priority, progress, phases, workerIds,
    } = req.body;

    Object.assign(project, projectBody(req.body));
    if (status) project.status = String(status).toLowerCase();
    if (priority) project.priority = String(priority).toLowerCase();
    if (progress !== undefined) project.progress = progress;

    await project.save();

    // Update phases if provided
    if (Array.isArray(phases) && phases.length > 0) {
      await ProjectPhase.destroy({ where: { projectId: project.id } });
      await ProjectPhase.bulkCreate(phases.map((phase) => ({
        projectId: project.id,
        name: phase.name,
        startDate: phase.startDate || null,
        endDate: phase.endDate || null,
        progress: Number(phase.progress || 0),
        status: phase.status || 'planned',
        description: phase.description || '',
      })));
    }

    // Update worker assignments if provided
    if (Array.isArray(workerIds)) {
      await ProjectAssignment.destroy({ where: { projectId: project.id } });
      if (workerIds.length > 0) {
        await ProjectAssignment.bulkCreate(workerIds.map((workerId) => ({
          projectId: project.id,
          workerId,
        })), { ignoreDuplicates: true });
      }
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function listProjectPhases(req, res, next) {
  try {
    const phases = await ProjectPhase.findAll({
      where: { projectId: req.params.id },
      order: [['startDate', 'ASC'], ['id', 'ASC']],
    });

    res.json(phases);
  } catch (error) {
    next(error);
  }
}

export async function createProjectPhase(req, res, next) {
  try {
    const { name, startDate, endDate, progress, status, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Phase name is required.' });
    }

    const phase = await ProjectPhase.create({
      projectId: req.params.id,
      name,
      startDate,
      endDate,
      progress: Number(progress || 0),
      status: status || 'planned',
      description: description || '',
    });

    return res.status(201).json(phase);
  } catch (error) {
    return next(error);
  }
}

export async function updateProjectPhase(req, res, next) {
  try {
    const phase = await ProjectPhase.findOne({
      where: { id: req.params.phaseId, projectId: req.params.id },
    });

    if (!phase) {
      return res.status(404).json({ message: 'Project phase not found.' });
    }

    const { name, startDate, endDate, progress, status, description } = req.body;

    if (name) phase.name = name;
    if (startDate !== undefined) phase.startDate = startDate;
    if (endDate !== undefined) phase.endDate = endDate;
    if (progress !== undefined) phase.progress = Number(progress);
    if (status) phase.status = status;
    if (description !== undefined) phase.description = description;

    await phase.save();
    return res.json(phase);
  } catch (error) {
    return next(error);
  }
}

export async function deleteProjectPhase(req, res, next) {
  try {
    const deleted = await ProjectPhase.destroy({
      where: { id: req.params.phaseId, projectId: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Project phase not found.' });
    }

    return res.json({ message: 'Project phase deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function listProjectDocuments(req, res, next) {
  try {
    const documents = await ProjectDocument.findAll({
      where: { projectId: req.params.id },
      order: [['createdAt', 'DESC']],
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
}

export async function uploadProjectDocuments(req, res, next) {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ message: 'At least one document file is required.' });
    }

    const documents = await ProjectDocument.bulkCreate(files.map((file) => ({
      projectId: req.params.id,
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      category: req.body.category || 'other',
      url: `/uploads/projects/${file.filename}`,
      drawingTitle: req.body.drawingTitle || file.originalname,
      drawingType: req.body.drawingType || (req.body.category === 'blueprint' ? 'architectural' : 'other'),
      drawingNumber: req.body.drawingNumber || '',
      revisionNumber: req.body.revisionNumber || '',
    })));

    return res.status(201).json(documents);
  } catch (error) {
    return next(error);
  }
}

export async function deleteProjectDocument(req, res, next) {
  try {
    const document = await ProjectDocument.findOne({
      where: { id: req.params.documentId, projectId: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Project document not found.' });
    }

    const uploadPath = path.join(projectUploadPath, document.fileName);
    await document.destroy();
    await fs.unlink(uploadPath).catch(() => undefined);

    return res.json({ message: 'Project document deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function listProjectAssignments(req, res, next) {
  try {
    const assignments = await ProjectAssignment.findAll({
      where: { projectId: req.params.id },
      include: [{ model: Worker, include: [{ model: User, attributes: ['fullName', 'email', 'phone'] }] }],
    });

    return res.json(assignments);
  } catch (error) {
    return next(error);
  }
}

export async function replaceProjectAssignments(req, res, next) {
  try {
    const { workerIds = [] } = req.body;

    await ProjectAssignment.destroy({ where: { projectId: req.params.id } });

    if (Array.isArray(workerIds) && workerIds.length > 0) {
      await ProjectAssignment.bulkCreate(workerIds.map((workerId) => ({
        projectId: req.params.id,
        workerId,
      })));
    }

    return listProjectAssignments(req, res, next);
  } catch (error) {
    return next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const documents = await ProjectDocument.findAll({ where: { projectId: project.id } });

    await Promise.all([
      ProjectPhase.destroy({ where: { projectId: project.id } }),
      ProjectDocument.destroy({ where: { projectId: project.id } }),
      ProjectAssignment.destroy({ where: { projectId: project.id } }),
      MaterialIssue.destroy({ where: { projectId: project.id } }),
      MaterialReceipt.destroy({ where: { projectId: project.id } }),
      WorkActivity.destroy({ where: { projectId: project.id } }),
      EvidenceFile.destroy({ where: { projectId: project.id } }),
      Material.destroy({ where: { projectId: project.id } }),
      Attendance.destroy({ where: { projectId: project.id } }),
    ]);
    await Promise.all(documents.map((document) => fs.unlink(path.join(projectUploadPath, document.fileName)).catch(() => undefined)));
    await project.destroy();

    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getProjectStats(req, res, next) {
  try {
    const projectId = req.params.id;

    const project = await Project.findByPk(projectId, {
      include: [
        { model: Material, attributes: ['id', 'usedQuantity'] },
        {
          model: Attendance,
          include: [{ model: Worker }],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const totalWorkers = new Set(project.Attendances.map((a) => a.workerId)).size;
    const totalMaterials = project.Materials.length;

    res.json({
      projectId: project.id,
      projectName: project.projectName,
      progress: project.progress,
      status: project.status,
      totalWorkers,
      totalMaterials,
      budget: project.budget,
    });
  } catch (error) {
    next(error);
  }
}
