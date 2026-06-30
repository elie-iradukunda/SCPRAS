import { Router } from 'express';
import {
  checkIn,
  checkOut,
  deleteAttendance,
  getAttendance,
  getAttendanceReport,
  listAttendance,
  updateAttendance,
} from '../controllers/attendanceController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();
router.use(authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN));

router.get('/', listAttendance);
router.get('/report', getAttendanceReport);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/:id', getAttendance);
router.put('/:id', updateAttendance);
router.patch('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;
