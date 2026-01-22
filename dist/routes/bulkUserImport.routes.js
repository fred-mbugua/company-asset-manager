"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bulkUserImport_controller_1 = __importDefault(require("../controllers/bulkUserImport.controller"));
const permission_middleware_1 = require("../middlewares/permission.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for file upload (memory storage for processing)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv',
            'application/csv'
        ];
        if (allowedMimes.includes(file.mimetype) ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls') ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Please upload an Excel or CSV file.'));
        }
    }
});
// Note: Authentication is handled at the main router level
// Download template
router.get('/template', (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'read'), (0, express_async_handler_1.default)(bulkUserImport_controller_1.default.downloadTemplate));
// Preview uploaded file
router.post('/preview', (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'create'), upload.single('file'), (0, express_async_handler_1.default)(bulkUserImport_controller_1.default.previewFile));
// Process import
router.post('/process', (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'create'), (0, express_async_handler_1.default)(bulkUserImport_controller_1.default.processImport));
// Get all import batches
router.get('/batches', (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'read'), (0, express_async_handler_1.default)(bulkUserImport_controller_1.default.getAllBatches));
// Get batch details
router.get('/batches/:batchId', (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'read'), (0, express_async_handler_1.default)(bulkUserImport_controller_1.default.getBatchDetails));
exports.default = router;
