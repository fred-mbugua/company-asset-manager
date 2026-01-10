import { Router } from 'express';
import { BulkUploadController } from '../controllers';
import { BulkUploadMiddleware, BulkUploadService } from '../services';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/assets', authenticate, authorize(['Admin']),  BulkUploadMiddleware.single('file'), asyncHandler(BulkUploadController.uploadAssets));

// Employee bulk upload routes
router.post('/employees', authenticate, authorize(['Admin']), BulkUploadMiddleware.single('file'), asyncHandler(BulkUploadController.uploadEmployees));
router.get('/employees/template', authenticate, asyncHandler(BulkUploadController.downloadEmployeeTemplate));

export default router;