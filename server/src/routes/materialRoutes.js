import { Router } from 'express';
import {
  createMaterial,
  approveMaterialIssue,
  deleteMaterial,
  getMaterial,
  getMaterialReport,
  createMaterialIssue,
  listMaterialIssues,
  listMaterialReceipts,
  listMaterials,
  receiveMaterial,
  rejectMaterialIssue,
  updateMaterial,
} from '../controllers/materialController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();
const viewMaterials = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER);
const manageBaseline = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR);
const manageStock = authorize(ROLES.ADMIN, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER);
const approveVariance = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR);

router.get('/', viewMaterials, listMaterials);
router.post('/', manageBaseline, createMaterial);
router.get('/report', viewMaterials, getMaterialReport);
router.get('/issues', viewMaterials, listMaterialIssues);
router.post('/issues', manageStock, createMaterialIssue);
router.put('/issues/:issueId/approve', approveVariance, approveMaterialIssue);
router.patch('/issues/:issueId/approve', approveVariance, approveMaterialIssue);
router.put('/issues/:issueId/reject', approveVariance, rejectMaterialIssue);
router.patch('/issues/:issueId/reject', approveVariance, rejectMaterialIssue);
router.get('/receipts', viewMaterials, listMaterialReceipts);
router.post('/receive', manageStock, receiveMaterial);
router.get('/:id', viewMaterials, getMaterial);
router.put('/:id', manageBaseline, updateMaterial);
router.patch('/:id', manageBaseline, updateMaterial);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.QUANTITY_SURVEYOR), deleteMaterial);

export default router;
