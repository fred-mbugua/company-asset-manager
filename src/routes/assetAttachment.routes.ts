import { Router } from 'express';
import multer from 'multer';
import AssetAttachmentController from '../controllers/assetAttachment.controller';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Asset attachment routes
router.post(
    '/:assetId/attachments',
    authenticate,
    authorize(['Admin', 'Standard User']),
    upload.single('file'),
    asyncHandler(AssetAttachmentController.create)
);

router.get(
    '/:assetId/attachments',
    authenticate,
    authorize(['Admin', 'Standard User']),
    asyncHandler(AssetAttachmentController.getByAssetId)
);

router.delete(
    '/attachments/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(AssetAttachmentController.delete)
);

export default router;
