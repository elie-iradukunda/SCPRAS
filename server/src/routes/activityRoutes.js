import { Router } from 'express';
import { createActivity, deleteActivity, listActivities, updateActivity } from '../controllers/activityController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN), listActivities);
router.post('/', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN), createActivity);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN), updateActivity);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN), updateActivity);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), deleteActivity);

export default router;
