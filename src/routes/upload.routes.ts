import { Router } from 'express';
import { BulkUploadController } from '../controllers';
import {BulkUploadService } from '../services'; // Import both service and controller
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/assets', authenticate, authorize(['Admin']), BulkUploadService.upload.single('file'), asyncHandler(BulkUploadController.uploadAssets));

export default router;