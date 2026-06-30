import { Router } from 'express';
import {
  generateAiReport,
  generateAttendanceReport,
  generateBudgetReport,
  generateFinancialReport,
  generateMaterialReport,
  generateProgressReport,
  generateWorkforceReport,
  listReports,
} from '../controllers/reportController.js';
import { authorize } from '../middleware/auth.js';
import { ALL_ROLES, ROLES } from '../config/roles.js';

const router = Router();
router.use(authorize(...ALL_ROLES));

router.get('/', listReports);
router.get('/progress', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN), generateProgressReport);
router.get('/material', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER), generateMaterialReport);
router.get('/materials', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER), generateMaterialReport);
router.get('/attendance', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN), generateAttendanceReport);
router.get('/ai', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR), generateAiReport);
router.get('/budget', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR), generateBudgetReport);
router.get('/financial', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR), generateFinancialReport);
router.get('/workforce', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONTRACTOR_FOREMAN), generateWorkforceReport);

export default router;
