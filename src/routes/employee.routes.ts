import { Router } from 'express';
import { EmployeeController } from '../controllers';
import { authenticate } from '../middlewares';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/:id', authenticate, checkPermission('ADMIN_USERS', 'read'), asyncHandler(EmployeeController.getById));
router.get('/:employeeId/assets', authenticate, checkPermission('ADMIN_USERS', 'read'), asyncHandler(EmployeeController.getAssetsByEmployee));

export default router;