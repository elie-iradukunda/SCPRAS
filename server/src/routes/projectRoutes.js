import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import {
  createProject,
  createProjectPhase,
  deleteProject,
  deleteProjectDocument,
  deleteProjectPhase,
  getProject,
  getProjectStats,
  listProjectAssignments,
  listProjectDocuments,
  listProjectPhases,
  listProjects,
  replaceProjectAssignments,
  updateProject,
  updateProjectPhase,
  uploadProjectDocuments,
} from '../controllers/projectController.js';
import { authorize } from '../middleware/auth.js';
import { ALL_ROLES, ROLES } from '../config/roles.js';

const router = Router();
const manageProjects = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER);
const updateProgress = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN);
const uploadEvidence = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectUploadPath = path.resolve(__dirname, '../../uploads/projects');

fs.mkdirSync(projectUploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: projectUploadPath,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
});

router.get('/', authorize(...ALL_ROLES), listProjects);
router.post('/', manageProjects, createProject);
router.get('/:id/stats', getProjectStats);
router.get('/:id/phases', listProjectPhases);
router.post('/:id/phases', manageProjects, createProjectPhase);
router.put('/:id/phases/:phaseId', updateProgress, updateProjectPhase);
router.patch('/:id/phases/:phaseId', updateProgress, updateProjectPhase);
router.delete('/:id/phases/:phaseId', manageProjects, deleteProjectPhase);
router.get('/:id/documents', listProjectDocuments);
router.post('/:id/documents', uploadEvidence, upload.array('documents', 10), uploadProjectDocuments);
router.delete('/:id/documents/:documentId', manageProjects, deleteProjectDocument);
router.get('/:id/workers', listProjectAssignments);
router.put('/:id/workers', manageProjects, replaceProjectAssignments);
router.get('/:id', getProject);
router.put('/:id', manageProjects, updateProject);
router.patch('/:id', manageProjects, updateProject);
router.delete('/:id', manageProjects, deleteProject);

export default router;
