import { Router } from 'express';
import {
  createWorker,
  deleteWorker,
  generateWorkerSmartCard,
  getWorker,
  getWorkerAttendance,
  getWorkerBySmartCard,
  getWorkerStats,
  listWorkers,
  updateWorker,
} from '../controllers/workerController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();
const viewWorkers = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN);
const manageWorkers = authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER);

router.get('/', viewWorkers, listWorkers);
router.post('/', manageWorkers, createWorker);
router.get('/card/:code', viewWorkers, getWorkerBySmartCard);
router.get('/:id/attendance', viewWorkers, getWorkerAttendance);
router.get('/:id/stats', viewWorkers, getWorkerStats);
router.post('/:id/smart-card', manageWorkers, generateWorkerSmartCard);
router.get('/:id', viewWorkers, getWorker);
router.put('/:id', manageWorkers, updateWorker);
router.patch('/:id', manageWorkers, updateWorker);
router.delete('/:id', manageWorkers, deleteWorker);

export default router;
