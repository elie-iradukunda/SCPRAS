import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import projectRoutes from './projectRoutes.js';
import workerRoutes from './workerRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import materialRoutes from './materialRoutes.js';
import reportRoutes from './reportRoutes.js';
import aiRoutes from './aiRoutes.js';
import activityRoutes from './activityRoutes.js';
import workforceRoutes from './workforceRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(requireAuth);
router.use('/dashboard', dashboardRoutes);
router.use('/projects', projectRoutes);
router.use('/workers', workerRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/materials', materialRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/activities', activityRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/workforce', workforceRoutes);
router.use('/settings', settingsRoutes);

export default router;
