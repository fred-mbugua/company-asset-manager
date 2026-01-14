import { Router } from 'express';
import multer from 'multer';
import ExpenseAttachmentController from '../controllers/expenseAttachment.controller';
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

// Expense attachment routes
router.post(
    '/:expenseId/attachments',
    authenticate,
    authorize(['*']),
    upload.single('file'),
    asyncHandler(ExpenseAttachmentController.create)
);

router.get(
    '/:expenseId/attachments',
    authenticate,
    authorize(['*']),
    asyncHandler(ExpenseAttachmentController.getByExpenseId)
);

router.delete(
    '/attachments/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(ExpenseAttachmentController.delete)
);

export default router;
