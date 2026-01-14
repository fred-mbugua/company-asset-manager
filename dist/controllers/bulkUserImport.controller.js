"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bulkUserImport_service_1 = __importDefault(require("../services/bulkUserImport.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class BulkUserImportController {
    /**
     * Preview file contents before import
     */
    async previewFile(req, res) {
        var _a;
        try {
            if (!req.file) {
                return (0, response_1.errorResponse)(res, 400, 'No file uploaded');
            }
            const fileExtension = (_a = req.file.originalname.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            let result;
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                result = await bulkUserImport_service_1.default.parseExcelFile(req.file.buffer);
            }
            else if (fileExtension === 'csv') {
                result = await bulkUserImport_service_1.default.parseCsvFile(req.file.buffer);
            }
            else {
                return (0, response_1.errorResponse)(res, 400, 'Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file');
            }
            logger_1.default.info(`File preview generated: ${result.valid.length} valid, ${result.invalid.length} invalid`);
            (0, response_1.successResponse)(res, 200, 'File preview generated', result);
        }
        catch (error) {
            logger_1.default.error('File preview failed:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to preview file');
        }
    }
    /**
     * Process the bulk import
     */
    async processImport(req, res) {
        var _a;
        try {
            const { users, importType } = req.body;
            const performingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!users || !Array.isArray(users) || users.length === 0) {
                return (0, response_1.errorResponse)(res, 400, 'No users to import');
            }
            if (!performingUserId) {
                return (0, response_1.errorResponse)(res, 401, 'User not authenticated');
            }
            const result = await bulkUserImport_service_1.default.processImport(users, importType || 'excel', performingUserId);
            logger_1.default.info(`Bulk import completed: ${result.successfulRecords} successful, ${result.failedRecords} failed`);
            (0, response_1.successResponse)(res, 201, 'Import completed', result);
        }
        catch (error) {
            logger_1.default.error('Bulk import failed:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to process import');
        }
    }
    /**
     * Download import template
     */
    async downloadTemplate(req, res) {
        try {
            const buffer = await bulkUserImport_service_1.default.generateTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.xlsx');
            res.send(buffer);
        }
        catch (error) {
            logger_1.default.error('Template download failed:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to generate template');
        }
    }
    /**
     * Get all import batches
     */
    async getAllBatches(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            const result = await bulkUserImport_service_1.default.getAllBatches(limit, offset);
            (0, response_1.successResponse)(res, 200, 'Import batches retrieved', result);
        }
        catch (error) {
            logger_1.default.error('Failed to get import batches:', error);
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
    /**
     * Get batch details with imported users (supports pagination and search)
     */
    async getBatchDetails(req, res) {
        try {
            const batchId = parseInt(req.params.batchId);
            if (isNaN(batchId)) {
                return (0, response_1.errorResponse)(res, 400, 'Invalid batch ID');
            }
            // Check for pagination/search params
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
            const search = req.query.search;
            // If pagination params provided, use paginated method
            if (limit !== undefined || offset !== undefined || search) {
                const result = await bulkUserImport_service_1.default.getBatchDetailsPaginated(batchId, { limit, offset, search });
                (0, response_1.successResponse)(res, 200, 'Batch details retrieved', result);
            }
            else {
                const result = await bulkUserImport_service_1.default.getBatchDetails(batchId);
                (0, response_1.successResponse)(res, 200, 'Batch details retrieved', result);
            }
        }
        catch (error) {
            logger_1.default.error('Failed to get batch details:', error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
}
exports.default = new BulkUserImportController();
