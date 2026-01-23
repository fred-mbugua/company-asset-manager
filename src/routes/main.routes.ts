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
import bulkUserImportRoutes from './bulkUserImport.routes';
import repairRequestRoutes from './repairRequest.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import SystemConfigurationController from '../controllers/systemConfiguration.controller';
import LookupModel from '../models/lookup.model';
import asyncHandler from 'express-async-handler';

import { authenticate, authorize } from '../middlewares/auth.middleware'; 

const router = Router();

// Public routes (no authentication required)
router.use('/auth', authRoutes);
router.get('/system-config/public', asyncHandler(SystemConfigurationController.getPublicConfig));

// All other routes require authentication
router.use('/assets', authenticate, assetRoutes);
router.use('/assignments', authenticate, assignmentRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/employees', authenticate, employeeRoutes);
router.use('/expenses', authenticate, expenseRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/upload', authenticate, uploadRoutes);
router.use('/departments', authenticate, departmentRoutes);
router.use('/branches', authenticate, branchRoutes);
// Companies endpoint - returns companies for access control
router.get('/companies', authenticate, asyncHandler(async (req, res) => {
    const companies = await LookupModel.getAllCompanies();
    res.json({ success: true, data: companies });
}));
router.use('/asset-attachments', authenticate, assetAttachmentRoutes);
router.use('/expense-attachments', authenticate, expenseAttachmentRoutes);
router.use('/assignment-attachments', authenticate, assignmentAttachmentRoutes);
router.use('/system-config', authenticate, systemConfigurationRoutes);
router.use('/bulk-user-import', authenticate, bulkUserImportRoutes);
router.use('/repair-requests', authenticate, repairRequestRoutes);
router.use('/roles', authenticate, roleRoutes);
router.use('/permissions', authenticate, permissionRoutes);
router.use('/', authenticate, assetTypeRoutes);
export default router;