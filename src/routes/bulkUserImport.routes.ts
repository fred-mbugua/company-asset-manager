import { Router } from 'express';
import BulkUserImportController from '../controllers/bulkUserImport.controller';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';
import multer from 'multer';

const router = Router();

// Configure multer for file upload (memory storage for processing)
const upload = multer({
    storage: multer.memoryStorage(),
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
        } else {
            cb(new Error('Invalid file type. Please upload an Excel or CSV file.'));
        }
    }
});

// Download template
router.get(
    '/template',
    authenticate,
    authorize(['Admin']),
    asyncHandler(BulkUserImportController.downloadTemplate)
);

// Preview uploaded file
router.post(
    '/preview',
    authenticate,
    authorize(['Admin']),
    upload.single('file'),
    asyncHandler(BulkUserImportController.previewFile)
);

// Process import
router.post(
    '/process',
    authenticate,
    authorize(['Admin']),
    asyncHandler(BulkUserImportController.processImport)
);

// Get all import batches
router.get(
    '/batches',
    authenticate,
    authorize(['Admin']),
    asyncHandler(BulkUserImportController.getAllBatches)
);

// Get batch details
router.get(
    '/batches/:batchId',
    authenticate,
    authorize(['Admin']),
    asyncHandler(BulkUserImportController.getBatchDetails)
);

export default router;
