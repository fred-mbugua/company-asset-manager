import { Router } from 'express';
import RepairRequestController from '../controllers/repairRequest.controller';
import RepairRequestTypeController from '../controllers/repairRequestType.controller';
import RepairRequestStatusController from '../controllers/repairRequestStatus.controller';
import RepairRequestPriorityController from '../controllers/repairRequestPriority.controller';
import RepairRequestAttachmentController from '../controllers/repairRequestAttachment.controller';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// =============================================================================
// FILE UPLOAD CONFIGURATION
// =============================================================================

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'repair-requests');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// =============================================================================
// LOOKUP ROUTES (must be before parameterized routes)
// =============================================================================

// Request Types
router.get('/types', authenticate, asyncHandler(RepairRequestController.getRequestTypes));

// Statuses
router.get('/statuses', authenticate, asyncHandler(RepairRequestController.getStatuses));

// Priorities
router.get('/priorities', authenticate, asyncHandler(RepairRequestController.getPriorities));

// Statistics
router.get('/statistics', authenticate, asyncHandler(RepairRequestController.getStatistics));

// =============================================================================
// REQUEST TYPE MANAGEMENT ROUTES
// =============================================================================

router.post(
    '/types/create',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestTypeController.create)
);

router.get(
    '/types/all',
    authenticate,
    asyncHandler(RepairRequestTypeController.getAll)
);

router.get(
    '/types/:id',
    authenticate,
    asyncHandler(RepairRequestTypeController.getById)
);

router.put(
    '/types/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestTypeController.update)
);

router.delete(
    '/types/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestTypeController.delete)
);

router.patch(
    '/types/:id/toggle',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestTypeController.toggleActive)
);

// =============================================================================
// REQUEST STATUS MANAGEMENT ROUTES
// =============================================================================

router.post(
    '/statuses/create',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestStatusController.create)
);

router.get(
    '/statuses/all',
    authenticate,
    asyncHandler(RepairRequestStatusController.getAll)
);

router.get(
    '/statuses/:id',
    authenticate,
    asyncHandler(RepairRequestStatusController.getById)
);

router.put(
    '/statuses/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestStatusController.update)
);

router.delete(
    '/statuses/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestStatusController.delete)
);

router.patch(
    '/statuses/:id/toggle',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestStatusController.toggleActive)
);

// =============================================================================
// REQUEST PRIORITY MANAGEMENT ROUTES
// =============================================================================

router.post(
    '/priorities/create',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestPriorityController.create)
);

router.get(
    '/priorities/all',
    authenticate,
    asyncHandler(RepairRequestPriorityController.getAll)
);

router.get(
    '/priorities/:id',
    authenticate,
    asyncHandler(RepairRequestPriorityController.getById)
);

router.put(
    '/priorities/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestPriorityController.update)
);

router.delete(
    '/priorities/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestPriorityController.delete)
);

router.patch(
    '/priorities/:id/toggle',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestPriorityController.toggleActive)
);

// =============================================================================
// REPAIR REQUEST CRUD ROUTES
// =============================================================================

// Create new repair request
router.post(
    '/',
    authenticate,
    asyncHandler(RepairRequestController.create)
);

// Get all repair requests with filters
router.get(
    '/',
    authenticate,
    asyncHandler(RepairRequestController.getAll)
);

// Get repair request by request number
router.get(
    '/number/:requestNumber',
    authenticate,
    asyncHandler(RepairRequestController.getByRequestNumber)
);

// Get single repair request by ID
router.get(
    '/:id',
    authenticate,
    asyncHandler(RepairRequestController.getById)
);

// Update repair request
router.put(
    '/:id',
    authenticate,
    asyncHandler(RepairRequestController.update)
);

// Delete repair request
router.delete(
    '/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.delete)
);

// =============================================================================
// WORKFLOW ACTION ROUTES
// =============================================================================

// Update status (generic)
router.patch(
    '/:id/status',
    authenticate,
    asyncHandler(RepairRequestController.updateStatus)
);

// ICT Approve
router.patch(
    '/:id/ict-approve',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.ictApprove)
);

// ICT Reject
router.patch(
    '/:id/ict-reject',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.ictReject)
);

// Mark In Repair
router.patch(
    '/:id/in-repair',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.markInRepair)
);

// Mark Awaiting Invoice
router.patch(
    '/:id/awaiting-invoice',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.markAwaitingInvoice)
);

// Submit Invoice
router.patch(
    '/:id/submit-invoice',
    authenticate,
    asyncHandler(RepairRequestController.submitInvoice)
);

// Finance Approve
router.patch(
    '/:id/finance-approve',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.financeApprove)
);

// Finance Reject
router.patch(
    '/:id/finance-reject',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.financeReject)
);

// Complete
router.patch(
    '/:id/complete',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RepairRequestController.complete)
);

// Cancel
router.patch(
    '/:id/cancel',
    authenticate,
    asyncHandler(RepairRequestController.cancel)
);

// =============================================================================
// HISTORY ROUTE
// =============================================================================

router.get(
    '/:id/history',
    authenticate,
    asyncHandler(RepairRequestController.getHistory)
);

// =============================================================================
// ATTACHMENT ROUTES
// =============================================================================

// Upload attachments
router.post(
    '/:id/attachments',
    authenticate,
    upload.array('files', 10),
    asyncHandler(RepairRequestAttachmentController.upload)
);

// Get all attachments for a request
router.get(
    '/:id/attachments',
    authenticate,
    asyncHandler(RepairRequestAttachmentController.getByRequestId)
);

// Get single attachment
router.get(
    '/:id/attachments/:attachmentId',
    authenticate,
    asyncHandler(RepairRequestAttachmentController.getById)
);

// Download attachment
router.get(
    '/:id/attachments/:attachmentId/download',
    authenticate,
    asyncHandler(RepairRequestAttachmentController.download)
);

// Delete attachment
router.delete(
    '/:id/attachments/:attachmentId',
    authenticate,
    asyncHandler(RepairRequestAttachmentController.delete)
);

export default router;
