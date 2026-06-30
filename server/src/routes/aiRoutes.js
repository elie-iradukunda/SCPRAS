import { Router } from 'express';
import { analyzeBaseline, getInsights } from '../controllers/aiController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();
router.use(authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR));

router.get('/insights', getInsights);
router.post('/analyze', analyzeBaseline);

export default router;
