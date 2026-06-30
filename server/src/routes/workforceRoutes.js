import { Router } from 'express';
import { forecast } from '../controllers/workforceController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/forecast', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONTRACTOR_FOREMAN), forecast);

export default router;
