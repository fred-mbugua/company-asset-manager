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
import assetTypeRoutes from './assetType.routes';
import assetAttachmentRoutes from './assetAttachment.routes';
import expenseAttachmentRoutes from './expenseAttachment.routes';
import assignmentAttachmentRoutes from './assignmentAttachment.routes';
import systemConfigurationRoutes from './systemConfiguration.routes';

import { authenticate, authorize } from '../middlewares/auth.middleware'; 

const router = Router();

router.use('/auth', authenticate, authRoutes);
router.use('/assets', authenticate, assetRoutes);
router.use('/assignments', authenticate, assignmentRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/employees', authenticate, employeeRoutes);
router.use('/expenses', authenticate, expenseRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/upload', authenticate, uploadRoutes);
router.use('/departments', authenticate, departmentRoutes);
router.use('/branches', authenticate, branchRoutes);
router.use('/asset-attachments', authenticate, assetAttachmentRoutes);
router.use('/expense-attachments', authenticate, expenseAttachmentRoutes);
router.use('/assignment-attachments', authenticate, assignmentAttachmentRoutes);
router.use('/system-config', systemConfigurationRoutes);
router.use('/', authenticate, assetTypeRoutes);
export default router;