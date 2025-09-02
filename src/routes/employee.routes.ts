import { Router } from 'express';
import { EmployeeController } from '../controllers';
import { authenticate } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/:employeeId/assets', authenticate, asyncHandler(EmployeeController.getAssetsByEmployee));

export default router;