"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestService = void 0;
const repairRequest_model_1 = __importDefault(require("../models/repairRequest.model"));
const repairRequestType_model_1 = __importDefault(require("../models/repairRequestType.model"));
const repairRequestStatus_model_1 = __importDefault(require("../models/repairRequestStatus.model"));
const repairRequestPriority_model_1 = __importDefault(require("../models/repairRequestPriority.model"));
const repairRequestAttachment_model_1 = __importDefault(require("../models/repairRequestAttachment.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const expense_model_1 = __importDefault(require("../models/expense.model"));
const expenseType_model_1 = __importDefault(require("../models/expenseType.model"));
const logger_1 = __importDefault(require("../utils/logger"));
// ============================================================================
// SERVICE CLASS
// ============================================================================
class RepairRequestService {
    // ========================================================================
    // REPAIR REQUEST CRUD OPERATIONS
    // ========================================================================
    /**
     * Creates a new repair request
     */
    async createRequest(data, userId) {
        try {
            const request = await repairRequest_model_1.default.create(data);
            // Add history entry
            await repairRequest_model_1.default.addHistory(request.id, 'CREATED', userId, undefined, request.status_id, 'Repair request created');
            // Log action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'CREATE',
                entity_type: 'RepairRequest',
                entity_id: request.id,
                details: {
                    request_number: request.request_number,
                    title: request.title
                }
            });
            // Return full request with joins
            return await repairRequest_model_1.default.findById(request.id);
        }
        catch (error) {
            logger_1.default.error('Error creating repair request:', error);
            throw error;
        }
    }
    /**
     * Gets all repair requests with pagination and filters
     */
    async getRequests(filters = {}, page = 1, limit = 20) {
        const result = await repairRequest_model_1.default.findAll(filters, page, limit);
        return {
            requests: result.requests,
            total: result.total,
            totalPages: Math.ceil(result.total / limit)
        };
    }
    /**
     * Gets a single repair request by ID
     */
    async getRequestById(id) {
        return await repairRequest_model_1.default.findById(id);
    }
    /**
     * Gets a repair request by request number
     */
    async getRequestByNumber(requestNumber) {
        return await repairRequest_model_1.default.findByRequestNumber(requestNumber);
    }
    /**
     * Updates a repair request
     */
    async updateRequest(id, data, userId) {
        try {
            const existingRequest = await repairRequest_model_1.default.findById(id);
            if (!existingRequest) {
                throw new Error('Repair request not found');
            }
            const updatedRequest = await repairRequest_model_1.default.update(id, data);
            // Log action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'UPDATE',
                entity_type: 'RepairRequest',
                entity_id: id,
                details: {
                    request_number: existingRequest.request_number,
                    changes: data
                }
            });
            return await repairRequest_model_1.default.findById(id);
        }
        catch (error) {
            logger_1.default.error('Error updating repair request:', error);
            throw error;
        }
    }
    /**
     * Deletes a repair request
     */
    async deleteRequest(id, userId) {
        try {
            const request = await repairRequest_model_1.default.findById(id);
            if (!request) {
                throw new Error('Repair request not found');
            }
            await repairRequest_model_1.default.delete(id);
            // Log action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'DELETE',
                entity_type: 'RepairRequest',
                entity_id: id,
                details: {
                    request_number: request.request_number,
                    title: request.title
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request:', error);
            throw error;
        }
    }
    // ========================================================================
    // STATUS WORKFLOW OPERATIONS
    // ========================================================================
    /**
     * Updates status with workflow rules
     */
    async updateStatus(requestId, newStatusId, userId, notes) {
        try {
            const existingRequest = await repairRequest_model_1.default.findById(requestId);
            if (!existingRequest) {
                throw new Error('Repair request not found');
            }
            const oldStatusId = existingRequest.status_id;
            const newStatus = await repairRequestStatus_model_1.default.findById(newStatusId);
            if (!newStatus) {
                throw new Error('Invalid status');
            }
            // Update the status
            const updatedRequest = await repairRequest_model_1.default.updateStatus(requestId, newStatusId, userId, notes);
            // Add history entry
            await repairRequest_model_1.default.addHistory(requestId, 'STATUS_CHANGE', userId, oldStatusId, newStatusId, notes);
            // Log action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'STATUS_CHANGE',
                entity_type: 'RepairRequest',
                entity_id: requestId,
                details: {
                    request_number: existingRequest.request_number,
                    from_status: existingRequest.status_name,
                    to_status: newStatus.name,
                    notes
                }
            });
            return await repairRequest_model_1.default.findById(requestId);
        }
        catch (error) {
            logger_1.default.error('Error updating repair request status:', error);
            throw error;
        }
    }
    /**
     * ICT Approval
     */
    async ictApprove(requestId, userId, notes) {
        const approvedStatus = await repairRequestStatus_model_1.default.findByName('ICT Approved');
        if (!approvedStatus) {
            throw new Error('ICT Approved status not configured');
        }
        return this.updateStatus(requestId, approvedStatus.id, userId, notes);
    }
    /**
     * ICT Rejection
     */
    async ictReject(requestId, userId, notes) {
        const rejectedStatus = await repairRequestStatus_model_1.default.findByName('ICT Rejected');
        if (!rejectedStatus) {
            throw new Error('ICT Rejected status not configured');
        }
        return this.updateStatus(requestId, rejectedStatus.id, userId, notes);
    }
    /**
     * Mark as In Repair
     */
    async markInRepair(requestId, userId, notes) {
        const inRepairStatus = await repairRequestStatus_model_1.default.findByName('In Repair');
        if (!inRepairStatus) {
            throw new Error('In Repair status not configured');
        }
        return this.updateStatus(requestId, inRepairStatus.id, userId, notes);
    }
    /**
     * Mark as Awaiting Invoice
     */
    async markAwaitingInvoice(requestId, userId, notes) {
        const status = await repairRequestStatus_model_1.default.findByName('Awaiting Invoice');
        if (!status) {
            throw new Error('Awaiting Invoice status not configured');
        }
        return this.updateStatus(requestId, status.id, userId, notes);
    }
    /**
     * Update Invoice Details (only by uploader or admin)
     */
    async updateInvoice(requestId, userId, userRole, invoiceData) {
        try {
            const request = await repairRequest_model_1.default.findById(requestId);
            if (!request) {
                throw new Error('Repair request not found');
            }
            // Only the user who uploaded the invoice or admin can edit it
            if (request.invoice_uploaded_by !== userId && userRole !== 'Admin') {
                throw new Error('You do not have permission to edit this invoice');
            }
            // Update invoice details
            await repairRequest_model_1.default.update(requestId, {
                vendor_name: invoiceData.vendor_name,
                invoice_number: invoiceData.invoice_number,
                invoice_amount: invoiceData.invoice_amount,
                invoice_date: new Date(invoiceData.invoice_date)
            });
            // Log the action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'UPDATE',
                entity_type: 'RepairRequest',
                entity_id: requestId,
                details: {
                    message: 'Invoice details updated',
                    vendor_name: invoiceData.vendor_name,
                    invoice_number: invoiceData.invoice_number,
                    invoice_amount: invoiceData.invoice_amount
                }
            });
            const updatedRequest = await repairRequest_model_1.default.findById(requestId);
            if (!updatedRequest) {
                throw new Error('Failed to retrieve updated request');
            }
            return updatedRequest;
        }
        catch (error) {
            logger_1.default.error('Error updating invoice:', error);
            throw error;
        }
    }
    /**
     * Submit Invoice
     */
    async submitInvoice(requestId, userId, invoiceData) {
        try {
            const request = await repairRequest_model_1.default.findById(requestId);
            if (!request) {
                throw new Error('Repair request not found');
            }
            // Update invoice details
            await repairRequest_model_1.default.update(requestId, {
                vendor_name: invoiceData.vendor_name,
                invoice_number: invoiceData.invoice_number,
                invoice_amount: invoiceData.invoice_amount,
                invoice_date: new Date(invoiceData.invoice_date),
                invoice_uploaded_by: userId,
                invoice_uploaded_at: new Date()
            });
            // Update status to Invoice Submitted
            const status = await repairRequestStatus_model_1.default.findByName('Invoice Submitted');
            if (!status) {
                throw new Error('Invoice Submitted status not configured');
            }
            return this.updateStatus(requestId, status.id, userId, 'Invoice submitted for approval');
        }
        catch (error) {
            logger_1.default.error('Error submitting invoice:', error);
            throw error;
        }
    }
    /**
     * Finance Approval
     */
    async financeApprove(requestId, userId, paymentDetails, notes) {
        try {
            const approvedStatus = await repairRequestStatus_model_1.default.findByName('Finance Approved');
            if (!approvedStatus) {
                throw new Error('Finance Approved status not configured');
            }
            // Update payment details if provided
            if (paymentDetails) {
                const updateData = {};
                if (paymentDetails.payment_reference) {
                    updateData.payment_reference = paymentDetails.payment_reference;
                }
                if (paymentDetails.payment_date) {
                    updateData.payment_date = new Date(paymentDetails.payment_date);
                }
                if (Object.keys(updateData).length > 0) {
                    await repairRequest_model_1.default.update(requestId, updateData);
                }
            }
            return this.updateStatus(requestId, approvedStatus.id, userId, notes);
        }
        catch (error) {
            logger_1.default.error('Error approving finance:', error);
            throw error;
        }
    }
    /**
     * Finance Rejection
     */
    async financeReject(requestId, userId, notes) {
        const rejectedStatus = await repairRequestStatus_model_1.default.findByName('Finance Rejected');
        if (!rejectedStatus) {
            throw new Error('Finance Rejected status not configured');
        }
        return this.updateStatus(requestId, rejectedStatus.id, userId, notes);
    }
    /**
     * Complete Request - Also creates an expense record for the repair
     */
    async completeRequest(requestId, userId, notes) {
        const completedStatus = await repairRequestStatus_model_1.default.findByName('Completed');
        if (!completedStatus) {
            throw new Error('Completed status not configured');
        }
        // First, update the status
        const completedRequest = await this.updateStatus(requestId, completedStatus.id, userId, notes || 'Request completed');
        // Create an expense record if there's invoice data
        try {
            const request = await this.getRequestById(requestId);
            if (request && request.invoice_amount && request.invoice_amount > 0) {
                // Find or create the "Repair" expense type
                let repairExpenseType = await expenseType_model_1.default.findByName('Repair');
                if (!repairExpenseType) {
                    // Create the Repair expense type if it doesn't exist
                    repairExpenseType = await expenseType_model_1.default.create({
                        name: 'Repair',
                        description: 'Repair expenses from repair requests'
                    });
                }
                // Get the asset's current assignment to find assigned employee
                let assignedEmployeeId = null;
                if (request.asset_id) {
                    const assetAssignment = await this.getAssetCurrentAssignment(request.asset_id);
                    if (assetAssignment) {
                        assignedEmployeeId = assetAssignment.employee_id;
                    }
                }
                // Create the expense record
                const expenseData = {
                    asset_id: request.asset_id,
                    date: request.invoice_date || new Date(),
                    amount: request.invoice_amount,
                    vendor: request.vendor_name || 'Unknown Vendor',
                    invoice_number: request.invoice_number || `RR-${requestId}`,
                    notes: `Repair Request #${requestId}: ${request.title || 'Repair'}${request.invoice_notes ? ` - ${request.invoice_notes}` : ''}`,
                    expense_type_id: repairExpenseType.id,
                    assigned_employee_id: assignedEmployeeId
                };
                const expense = await expense_model_1.default.create(expenseData);
                // Update repair request with the created expense ID
                await repairRequest_model_1.default.update(requestId, { expense_id: expense.id });
                logger_1.default.info(`Created expense #${expense.id} from completed repair request #${requestId}`);
            }
        }
        catch (error) {
            // Log error but don't fail the completion
            logger_1.default.error(`Failed to create expense for repair request #${requestId}:`, error);
        }
        return completedRequest;
    }
    /**
     * Get current assignment for an asset
     */
    async getAssetCurrentAssignment(assetId) {
        const db = require('../config/database').default;
        const query = `
            SELECT employee_id 
            FROM assignments 
            WHERE asset_id = $1 AND return_date IS NULL 
            LIMIT 1
        `;
        const result = await db.query(query, [assetId]);
        return result.rows[0] || null;
    }
    /**
     * Cancel Request
     */
    async cancelRequest(requestId, userId, notes) {
        const cancelledStatus = await repairRequestStatus_model_1.default.findByName('Cancelled');
        if (!cancelledStatus) {
            throw new Error('Cancelled status not configured');
        }
        return this.updateStatus(requestId, cancelledStatus.id, userId, notes);
    }
    // ========================================================================
    // STATISTICS & REPORTS
    // ========================================================================
    /**
     * Gets dashboard statistics
     */
    async getStatistics(userId, branchId) {
        return await repairRequest_model_1.default.getStatistics(userId, branchId);
    }
    /**
     * Gets request history/timeline
     */
    async getRequestHistory(requestId) {
        return await repairRequest_model_1.default.getHistory(requestId);
    }
    // ========================================================================
    // ATTACHMENT OPERATIONS
    // ========================================================================
    /**
     * Adds an attachment to a repair request
     */
    async addAttachment(data, userId) {
        try {
            const attachment = await repairRequestAttachment_model_1.default.create(data);
            // Add history entry
            await repairRequest_model_1.default.addHistory(data.repair_request_id, 'ATTACHMENT_ADDED', userId, undefined, undefined, `Attachment added: ${data.file_name}`, { attachment_type: data.attachment_type });
            // Log action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'CREATE',
                entity_type: 'RepairRequestAttachment',
                entity_id: attachment.id,
                details: {
                    repair_request_id: data.repair_request_id,
                    file_name: data.file_name
                }
            });
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error adding attachment:', error);
            throw error;
        }
    }
    /**
     * Gets attachments for a repair request
     */
    async getAttachments(requestId) {
        return await repairRequestAttachment_model_1.default.findByRequestId(requestId);
    }
    /**
     * Gets an attachment by ID
     */
    async getAttachmentById(id) {
        return await repairRequestAttachment_model_1.default.findById(id);
    }
    /**
     * Updates an attachment
     */
    async updateAttachment(id, data) {
        return await repairRequestAttachment_model_1.default.update(id, data);
    }
    /**
     * Deletes an attachment
     */
    async deleteAttachment(id, userId) {
        try {
            const attachment = await repairRequestAttachment_model_1.default.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            await repairRequestAttachment_model_1.default.delete(id);
            // Add history entry
            await repairRequest_model_1.default.addHistory(attachment.repair_request_id, 'ATTACHMENT_DELETED', userId, undefined, undefined, `Attachment deleted: ${attachment.file_name}`);
            // Log action
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'DELETE',
                entity_type: 'RepairRequestAttachment',
                entity_id: id,
                details: {
                    repair_request_id: attachment.repair_request_id,
                    file_name: attachment.file_name
                }
            });
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error deleting attachment:', error);
            throw error;
        }
    }
    // ========================================================================
    // LOOKUP DATA
    // ========================================================================
    /**
     * Gets all active request types
     */
    async getRequestTypes() {
        return await repairRequestType_model_1.default.findAll();
    }
    /**
     * Gets all active statuses
     */
    async getStatuses() {
        return await repairRequestStatus_model_1.default.findAll();
    }
    /**
     * Gets all active priorities
     */
    async getPriorities() {
        return await repairRequestPriority_model_1.default.findAll();
    }
}
exports.RepairRequestService = RepairRequestService;
exports.default = new RepairRequestService();
