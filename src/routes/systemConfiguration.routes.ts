import { Router } from 'express';
import multer from 'multer';
import SystemConfigurationController from '../controllers/systemConfiguration.controller';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for logos
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files for logo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for logo upload'));
        }
    }
});

// Note: Authentication is handled at the main router level
// Note: /public route is handled in main.routes.ts (before authentication)

// System configuration routes - use permission-based authorization
router.get(
    '/',
    checkPermission('SETTINGS_SYSTEM', 'read'),
    asyncHandler(SystemConfigurationController.getConfig)
);

router.put(
    '/',
    checkPermission('SETTINGS_SYSTEM', 'update'),
    asyncHandler(SystemConfigurationController.updateConfig)
);

router.post(
    '/upload-logo',
    checkPermission('SETTINGS_SYSTEM', 'update'),
    upload.single('logo'),
    asyncHandler(SystemConfigurationController.uploadLogo)
);

router.post(
    '/test-email',
    checkPermission('SETTINGS_SYSTEM', 'update'),
    asyncHandler(SystemConfigurationController.sendTestEmail)
);

export default router;
