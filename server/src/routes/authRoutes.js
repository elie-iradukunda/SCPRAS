import { Router } from 'express';
import { changePassword, getCurrentUser, login, register, updateProfile } from '../controllers/authController.js';
import { authorize, requireAuth } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/login', login);
router.post('/register', requireAuth, authorize(ROLES.ADMIN), register);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);

export default router;
