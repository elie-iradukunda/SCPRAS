import { Router } from 'express';
import { getBudgetAnalysis, getDashboard, getProjectMetrics, getWorkerMetrics } from '../controllers/dashboardController.js';
import { authorize } from '../middleware/auth.js';
import { ALL_ROLES } from '../config/roles.js';

const router = Router();
router.use(authorize(...ALL_ROLES));

router.get('/', getDashboard);
router.get('/projects', getProjectMetrics);
router.get('/workers', getWorkerMetrics);
router.get('/budget', getBudgetAnalysis);

export default router;
