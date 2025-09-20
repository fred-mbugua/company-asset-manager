import { Router } from 'express';
import assetRoutes from './asset.routes';
import authRoutes from './auth.routes';
import assignmentRoutes from './assignment.routes';
import employeeRoutes from './employee.routes';
import expenseRoutes from './expense.routes';
import reportRoutes from './report.routes';
import uploadRoutes from './upload.routes';
import departmentRoutes from './departments.routes';
import branchRoutes from './branches.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/assets', assetRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/upload', uploadRoutes);
router.use('/departments', departmentRoutes);
router.use('/branches', branchRoutes);

export default router;