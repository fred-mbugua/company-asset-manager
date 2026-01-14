"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repairRequest_controller_1 = __importDefault(require("../controllers/repairRequest.controller"));
const repairRequestType_controller_1 = __importDefault(require("../controllers/repairRequestType.controller"));
const repairRequestStatus_controller_1 = __importDefault(require("../controllers/repairRequestStatus.controller"));
const repairRequestPriority_controller_1 = __importDefault(require("../controllers/repairRequestPriority.controller"));
const repairRequestAttachment_controller_1 = __importDefault(require("../controllers/repairRequestAttachment.controller"));
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// =============================================================================
// FILE UPLOAD CONFIGURATION
// =============================================================================
// Ensure upload directory exists
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'repair-requests');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// =============================================================================
// LOOKUP ROUTES (must be before parameterized routes)
// =============================================================================
// Request Types
router.get('/types', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getRequestTypes));
// Statuses
router.get('/statuses', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getStatuses));
// Priorities
router.get('/priorities', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getPriorities));
// Statistics
router.get('/statistics', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getStatistics));
// =============================================================================
// REQUEST TYPE MANAGEMENT ROUTES
// =============================================================================
router.post('/types/create', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestType_controller_1.default.create));
router.get('/types/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestType_controller_1.default.getAll));
router.get('/types/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestType_controller_1.default.getById));
router.put('/types/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestType_controller_1.default.update));
router.delete('/types/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestType_controller_1.default.delete));
router.patch('/types/:id/toggle', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestType_controller_1.default.toggleActive));
// =============================================================================
// REQUEST STATUS MANAGEMENT ROUTES
// =============================================================================
router.post('/statuses/create', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestStatus_controller_1.default.create));
router.get('/statuses/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestStatus_controller_1.default.getAll));
router.get('/statuses/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestStatus_controller_1.default.getById));
router.put('/statuses/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestStatus_controller_1.default.update));
router.delete('/statuses/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestStatus_controller_1.default.delete));
router.patch('/statuses/:id/toggle', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestStatus_controller_1.default.toggleActive));
// =============================================================================
// REQUEST PRIORITY MANAGEMENT ROUTES
// =============================================================================
router.post('/priorities/create', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestPriority_controller_1.default.create));
router.get('/priorities/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestPriority_controller_1.default.getAll));
router.get('/priorities/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestPriority_controller_1.default.getById));
router.put('/priorities/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestPriority_controller_1.default.update));
router.delete('/priorities/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestPriority_controller_1.default.delete));
router.patch('/priorities/:id/toggle', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequestPriority_controller_1.default.toggleActive));
// =============================================================================
// REPAIR REQUEST CRUD ROUTES
// =============================================================================
// Create new repair request
router.post('/', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.create));
// Get all repair requests with filters
router.get('/', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getAll));
// Get repair request by request number
router.get('/number/:requestNumber', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getByRequestNumber));
// Get single repair request by ID
router.get('/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getById));
// Update repair request
router.put('/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.update));
// Delete repair request
router.delete('/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.delete));
// =============================================================================
// WORKFLOW ACTION ROUTES
// =============================================================================
// Update status (generic)
router.patch('/:id/status', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.updateStatus));
// ICT Approve
router.patch('/:id/ict-approve', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.ictApprove));
// ICT Reject
router.patch('/:id/ict-reject', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.ictReject));
// Mark In Repair
router.patch('/:id/in-repair', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.markInRepair));
// Mark Awaiting Invoice
router.patch('/:id/awaiting-invoice', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.markAwaitingInvoice));
// Submit Invoice
router.patch('/:id/submit-invoice', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.submitInvoice));
// Finance Approve
router.patch('/:id/finance-approve', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.financeApprove));
// Finance Reject
router.patch('/:id/finance-reject', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.financeReject));
// Complete
router.patch('/:id/complete', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(repairRequest_controller_1.default.complete));
// Cancel
router.patch('/:id/cancel', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.cancel));
// =============================================================================
// HISTORY ROUTE
// =============================================================================
router.get('/:id/history', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequest_controller_1.default.getHistory));
// =============================================================================
// ATTACHMENT ROUTES
// =============================================================================
// Upload attachments
router.post('/:id/attachments', middlewares_1.authenticate, upload.array('files', 10), (0, express_async_handler_1.default)(repairRequestAttachment_controller_1.default.upload));
// Get all attachments for a request
router.get('/:id/attachments', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestAttachment_controller_1.default.getByRequestId));
// Get single attachment
router.get('/:id/attachments/:attachmentId', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestAttachment_controller_1.default.getById));
// Download attachment
router.get('/:id/attachments/:attachmentId/download', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestAttachment_controller_1.default.download));
// Delete attachment
router.delete('/:id/attachments/:attachmentId', middlewares_1.authenticate, (0, express_async_handler_1.default)(repairRequestAttachment_controller_1.default.delete));
exports.default = router;
