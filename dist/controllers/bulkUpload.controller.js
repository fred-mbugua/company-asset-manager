"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class BulkUploadController {
    async uploadAssets(req, res) {
        if (!req.file) {
            return (0, response_1.errorResponse)(res, 400, 'No file uploaded');
        }
        try {
            const result = await services_1.BulkUploadService.processAssetUpload(req.file);
            (0, response_1.successResponse)(res, 200, `Successfully uploaded and created ${result.count} assets.`, { count: result.count });
        }
        catch (error) {
            logger_1.default.error('Bulk upload failed:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Bulk upload failed');
        }
    }
    async uploadEmployees(req, res) {
        if (!req.file) {
            return (0, response_1.errorResponse)(res, 400, 'No file uploaded');
        }
        try {
            const result = await services_1.BulkUploadService.processEmployeeUpload(req.file);
            const message = result.errors && result.errors.length > 0
                ? `Successfully uploaded ${result.count} employees. Some rows had errors.`
                : `Successfully uploaded ${result.count} employees.`;
            (0, response_1.successResponse)(res, 200, message, {
                count: result.count,
                errors: result.errors
            });
        }
        catch (error) {
            logger_1.default.error('Bulk employee upload failed:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Bulk employee upload failed');
        }
    }
    async downloadEmployeeTemplate(req, res) {
        try {
            const buffer = services_1.BulkUploadService.generateEmployeeTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Employee_Upload_Template.xlsx');
            res.send(buffer);
        }
        catch (error) {
            logger_1.default.error('Failed to generate employee template:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to generate template');
        }
    }
}
exports.default = new BulkUploadController();
