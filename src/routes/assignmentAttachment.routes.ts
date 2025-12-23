import { Router } from 'express';
import multer from 'multer';
import AssignmentAttachmentController from '../controllers/assignmentAttachment.controller';
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

// Assignment attachment routes
router.post(
    '/:assignmentId/attachments',
    authenticate,
    authorize(['Admin', 'Standard User']),
    upload.single('file'),
    asyncHandler(AssignmentAttachmentController.create)
);

router.get(
    '/:assignmentId/attachments',
    authenticate,
    authorize(['Admin', 'Standard User']),
    asyncHandler(AssignmentAttachmentController.getByAssignmentId)
);

router.delete(
    '/attachments/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(AssignmentAttachmentController.delete)
);

export default router;
