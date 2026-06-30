import { Router } from 'express';
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from '../controllers/supplierController.js';
import { authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER), listSuppliers);
router.post('/', authorize(ROLES.ADMIN, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER), createSupplier);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER), updateSupplier);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER), updateSupplier);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.QUANTITY_SURVEYOR), deleteSupplier);

export default router;
