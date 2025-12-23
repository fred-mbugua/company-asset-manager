"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseAttachmentController = void 0;
const expenseAttachment_service_1 = __importDefault(require("../services/expenseAttachment.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class ExpenseAttachmentController {
    async create(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return (0, response_1.errorResponse)(res, 401, 'Unauthorized');
            }
            const expenseId = parseInt(req.params.expenseId);
            if (isNaN(expenseId)) {
                return (0, response_1.errorResponse)(res, 400, 'Invalid expense ID');
            }
            if (!req.file) {
                return (0, response_1.errorResponse)(res, 400, 'No file uploaded');
            }
            const notes = req.body.notes;
            const attachment = await expenseAttachment_service_1.default.create(expenseId, req.file, notes, userId);
            (0, response_1.successResponse)(res, 201, 'Attachment uploaded successfully', attachment);
        }
        catch (error) {
            logger_1.default.error('Failed to create expense attachment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to upload attachment');
        }
    }
    async getByExpenseId(req, res) {
        try {
            const expenseId = parseInt(req.params.expenseId);
            if (isNaN(expenseId)) {
                return (0, response_1.errorResponse)(res, 400, 'Invalid expense ID');
            }
            const attachments = await expenseAttachment_service_1.default.getByExpenseId(expenseId);
            (0, response_1.successResponse)(res, 200, 'Attachments retrieved successfully', attachments);
        }
        catch (error) {
            logger_1.default.error('Failed to get expense attachments:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve attachments');
        }
    }
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return (0, response_1.errorResponse)(res, 401, 'Unauthorized');
            }
            const attachmentId = parseInt(req.params.id);
            if (isNaN(attachmentId)) {
                return (0, response_1.errorResponse)(res, 400, 'Invalid attachment ID');
            }
            await expenseAttachment_service_1.default.delete(attachmentId, userId);
            (0, response_1.successResponse)(res, 200, 'Attachment deleted successfully', null);
        }
        catch (error) {
            logger_1.default.error('Failed to delete expense attachment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to delete attachment');
        }
    }
}
exports.ExpenseAttachmentController = ExpenseAttachmentController;
exports.default = new ExpenseAttachmentController();
