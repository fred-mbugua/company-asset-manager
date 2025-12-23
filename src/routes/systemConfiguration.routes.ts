import { Router } from 'express';
import multer from 'multer';
import SystemConfigurationController from '../controllers/systemConfiguration.controller';
import { authenticate, authorize } from '../middlewares';
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

// System configuration routes
router.get(
    '/',
    authenticate,
    authorize(['Admin']),
    asyncHandler(SystemConfigurationController.getConfig)
);

router.get(
    '/public',
    asyncHandler(SystemConfigurationController.getPublicConfig)
);

router.put(
    '/',
    authenticate,
    authorize(['Admin']),
    asyncHandler(SystemConfigurationController.updateConfig)
);

router.post(
    '/upload-logo',
    authenticate,
    authorize(['Admin']),
    upload.single('logo'),
    asyncHandler(SystemConfigurationController.uploadLogo)
);

export default router;
