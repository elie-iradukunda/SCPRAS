import { Router } from 'express';
import {
  createDevice,
  createUser,
  deleteDevice,
  deleteUser,
  getSettings,
  updateDevice,
  updateUser,
} from '../controllers/settingsController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();
router.use(authorize(ROLES.ADMIN));

router.get('/', getSettings);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/devices', createDevice);
router.patch('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);

export default router;
