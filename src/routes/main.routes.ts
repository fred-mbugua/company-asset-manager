import { Router } from 'express';
import assetRoutes from './asset.routes';
import authRoutes from './auth.routes';
import assignmentRoutes from './assignment.routes';
import userRoutes from './user.routes';
import employeeRoutes from './employee.routes';
import expenseRoutes from './expense.routes';
import reportRoutes from './report.routes';
import uploadRoutes from './upload.routes';
import departmentRoutes from './departments.routes';
import branchRoutes from './branches.routes';

import { authenticate, authorize } from '../middlewares/auth.middleware'; 

const router = Router();

router.use('/auth', authenticate, authRoutes);
router.use('/assets', authenticate, authorize(['Admin', 'Standard User']), assetRoutes);
router.use('/assignments', authenticate, authorize(['Admin', 'Standard User']), assignmentRoutes);
router.use('/users', authenticate, authorize(['Admin', 'Standard User']), userRoutes);
router.use('/employees', authenticate, authorize(['Admin', 'Standard User']), employeeRoutes);
router.use('/expenses', authenticate, authorize(['Admin', 'Standard User']), expenseRoutes);
router.use('/reports', authenticate, authorize(['Admin', 'Standard User']), reportRoutes);
router.use('/upload', authenticate, authorize(['Admin', 'Standard User']), uploadRoutes);
router.use('/departments', authenticate, authorize(['Admin', 'Standard User']), departmentRoutes);
router.use('/branches', authenticate, authorize(['Admin', 'Standard User']), branchRoutes);
export default router;