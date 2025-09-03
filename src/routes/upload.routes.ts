import { Router } from 'express';
import { BulkUploadController } from '../controllers';
import { BulkUploadMiddleware, BulkUploadService } from '../services';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/assets', authenticate, authorize(['Admin']),  BulkUploadMiddleware.single('file'), asyncHandler(BulkUploadController.uploadAssets));

export default router;