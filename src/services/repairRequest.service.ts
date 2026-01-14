import RepairRequestModel, { IRepairRequest, ICreateRepairRequest, IRepairRequestFilters } from '../models/repairRequest.model';
import RepairRequestTypeModel from '../models/repairRequestType.model';
import RepairRequestStatusModel from '../models/repairRequestStatus.model';
import RepairRequestPriorityModel from '../models/repairRequestPriority.model';
import RepairRequestAttachmentModel, { ICreateRepairRequestAttachment } from '../models/repairRequestAttachment.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class RepairRequestService {
    // ========================================================================
    // REPAIR REQUEST CRUD OPERATIONS
    // ========================================================================

    /**
     * Creates a new repair request
     */
    async createRequest(data: ICreateRepairRequest, userId: number): Promise<IRepairRequest> {
        try {
            const request = await RepairRequestModel.create(data);
            
            // Add history entry
            await RepairRequestModel.addHistory(
                request.id,
                'CREATED',
                userId,
                undefined,
                request.status_id,
                'Repair request created'
            );

            // Log action
            await ActionLogModel.create({
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
            return await RepairRequestModel.findById(request.id) as IRepairRequest;
        } catch (error: any) {
            logger.error('Error creating repair request:', error);
            throw error;
        }
    }

    /**
     * Gets all repair requests with pagination and filters
     */
    async getRequests(
        filters: IRepairRequestFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ requests: IRepairRequest[]; total: number; totalPages: number }> {
        const result = await RepairRequestModel.findAll(filters, page, limit);
        return {
            requests: result.requests,
            total: result.total,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    /**
     * Gets a single repair request by ID
     */
    async getRequestById(id: number): Promise<IRepairRequest | null> {
        return await RepairRequestModel.findById(id);
    }

    /**
     * Gets a repair request by request number
     */
    async getRequestByNumber(requestNumber: string): Promise<IRepairRequest | null> {
        return await RepairRequestModel.findByRequestNumber(requestNumber);
    }

    /**
     * Updates a repair request
     */
    async updateRequest(
        id: number, 
        data: Partial<IRepairRequest>, 
        userId: number
    ): Promise<IRepairRequest> {
        try {
            const existingRequest = await RepairRequestModel.findById(id);
            if (!existingRequest) {
                throw new Error('Repair request not found');
            }

            const updatedRequest = await RepairRequestModel.update(id, data);

            // Log action
            await ActionLogModel.create({
                user_id: userId,
                action_type: 'UPDATE',
                entity_type: 'RepairRequest',
                entity_id: id,
                details: {
                    request_number: existingRequest.request_number,
                    changes: data
                }
            });

            return await RepairRequestModel.findById(id) as IRepairRequest;
        } catch (error: any) {
            logger.error('Error updating repair request:', error);
            throw error;
        }
    }

    /**
     * Deletes a repair request
     */
    async deleteRequest(id: number, userId: number): Promise<void> {
        try {
            const request = await RepairRequestModel.findById(id);
            if (!request) {
                throw new Error('Repair request not found');
            }

            await RepairRequestModel.delete(id);

            // Log action
            await ActionLogModel.create({
                user_id: userId,
                action_type: 'DELETE',
                entity_type: 'RepairRequest',
                entity_id: id,
                details: {
                    request_number: request.request_number,
                    title: request.title
                }
            });
        } catch (error: any) {
            logger.error('Error deleting repair request:', error);
            throw error;
        }
    }

    // ========================================================================
    // STATUS WORKFLOW OPERATIONS
    // ========================================================================

    /**
     * Updates status with workflow rules
     */
    async updateStatus(
        requestId: number,
        newStatusId: number,
        userId: number,
        notes?: string
    ): Promise<IRepairRequest> {
        try {
            const existingRequest = await RepairRequestModel.findById(requestId);
            if (!existingRequest) {
                throw new Error('Repair request not found');
            }

            const oldStatusId = existingRequest.status_id;
            const newStatus = await RepairRequestStatusModel.findById(newStatusId);
            
            if (!newStatus) {
                throw new Error('Invalid status');
            }

            // Update the status
            const updatedRequest = await RepairRequestModel.updateStatus(
                requestId,
                newStatusId,
                userId,
                notes
            );

            // Add history entry
            await RepairRequestModel.addHistory(
                requestId,
                'STATUS_CHANGE',
                userId,
                oldStatusId,
                newStatusId,
                notes
            );

            // Log action
            await ActionLogModel.create({
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

            return await RepairRequestModel.findById(requestId) as IRepairRequest;
        } catch (error: any) {
            logger.error('Error updating repair request status:', error);
            throw error;
        }
    }

    /**
     * ICT Approval
     */
    async ictApprove(requestId: number, userId: number, notes?: string): Promise<IRepairRequest> {
        const approvedStatus = await RepairRequestStatusModel.findByName('ICT Approved');
        if (!approvedStatus) {
            throw new Error('ICT Approved status not configured');
        }
        return this.updateStatus(requestId, approvedStatus.id, userId, notes);
    }

    /**
     * ICT Rejection
     */
    async ictReject(requestId: number, userId: number, notes: string): Promise<IRepairRequest> {
        const rejectedStatus = await RepairRequestStatusModel.findByName('ICT Rejected');
        if (!rejectedStatus) {
            throw new Error('ICT Rejected status not configured');
        }
        return this.updateStatus(requestId, rejectedStatus.id, userId, notes);
    }

    /**
     * Mark as In Repair
     */
    async markInRepair(requestId: number, userId: number, notes?: string): Promise<IRepairRequest> {
        const inRepairStatus = await RepairRequestStatusModel.findByName('In Repair');
        if (!inRepairStatus) {
            throw new Error('In Repair status not configured');
        }
        return this.updateStatus(requestId, inRepairStatus.id, userId, notes);
    }

    /**
     * Mark as Awaiting Invoice
     */
    async markAwaitingInvoice(requestId: number, userId: number, notes?: string): Promise<IRepairRequest> {
        const status = await RepairRequestStatusModel.findByName('Awaiting Invoice');
        if (!status) {
            throw new Error('Awaiting Invoice status not configured');
        }
        return this.updateStatus(requestId, status.id, userId, notes);
    }

    /**
     * Submit Invoice
     */
    async submitInvoice(
        requestId: number,
        userId: number,
        invoiceData: {
            vendor_name: string;
            invoice_number: string;
            invoice_amount: number;
            invoice_date: string;
        }
    ): Promise<IRepairRequest> {
        try {
            const request = await RepairRequestModel.findById(requestId);
            if (!request) {
                throw new Error('Repair request not found');
            }

            // Update invoice details
            await RepairRequestModel.update(requestId, {
                vendor_name: invoiceData.vendor_name,
                invoice_number: invoiceData.invoice_number,
                invoice_amount: invoiceData.invoice_amount,
                invoice_date: new Date(invoiceData.invoice_date),
                invoice_uploaded_by: userId,
                invoice_uploaded_at: new Date()
            });

            // Update status to Invoice Submitted
            const status = await RepairRequestStatusModel.findByName('Invoice Submitted');
            if (!status) {
                throw new Error('Invoice Submitted status not configured');
            }

            return this.updateStatus(requestId, status.id, userId, 'Invoice submitted for approval');
        } catch (error: any) {
            logger.error('Error submitting invoice:', error);
            throw error;
        }
    }

    /**
     * Finance Approval
     */
    async financeApprove(
        requestId: number, 
        userId: number, 
        paymentDetails?: { payment_reference?: string; payment_date?: string },
        notes?: string
    ): Promise<IRepairRequest> {
        try {
            const approvedStatus = await RepairRequestStatusModel.findByName('Finance Approved');
            if (!approvedStatus) {
                throw new Error('Finance Approved status not configured');
            }

            // Update payment details if provided
            if (paymentDetails) {
                const updateData: any = {};
                if (paymentDetails.payment_reference) {
                    updateData.payment_reference = paymentDetails.payment_reference;
                }
                if (paymentDetails.payment_date) {
                    updateData.payment_date = new Date(paymentDetails.payment_date);
                }
                if (Object.keys(updateData).length > 0) {
                    await RepairRequestModel.update(requestId, updateData);
                }
            }

            return this.updateStatus(requestId, approvedStatus.id, userId, notes);
        } catch (error: any) {
            logger.error('Error approving finance:', error);
            throw error;
        }
    }

    /**
     * Finance Rejection
     */
    async financeReject(requestId: number, userId: number, notes: string): Promise<IRepairRequest> {
        const rejectedStatus = await RepairRequestStatusModel.findByName('Finance Rejected');
        if (!rejectedStatus) {
            throw new Error('Finance Rejected status not configured');
        }
        return this.updateStatus(requestId, rejectedStatus.id, userId, notes);
    }

    /**
     * Complete Request
     */
    async completeRequest(requestId: number, userId: number, notes?: string): Promise<IRepairRequest> {
        const completedStatus = await RepairRequestStatusModel.findByName('Completed');
        if (!completedStatus) {
            throw new Error('Completed status not configured');
        }
        return this.updateStatus(requestId, completedStatus.id, userId, notes || 'Request completed');
    }

    /**
     * Cancel Request
     */
    async cancelRequest(requestId: number, userId: number, notes: string): Promise<IRepairRequest> {
        const cancelledStatus = await RepairRequestStatusModel.findByName('Cancelled');
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
    async getStatistics(userId?: number, branchId?: number): Promise<any> {
        return await RepairRequestModel.getStatistics(userId, branchId);
    }

    /**
     * Gets request history/timeline
     */
    async getRequestHistory(requestId: number): Promise<any[]> {
        return await RepairRequestModel.getHistory(requestId);
    }

    // ========================================================================
    // ATTACHMENT OPERATIONS
    // ========================================================================

    /**
     * Adds an attachment to a repair request
     */
    async addAttachment(data: ICreateRepairRequestAttachment, userId: number): Promise<any> {
        try {
            const attachment = await RepairRequestAttachmentModel.create(data);

            // Add history entry
            await RepairRequestModel.addHistory(
                data.repair_request_id,
                'ATTACHMENT_ADDED',
                userId,
                undefined,
                undefined,
                `Attachment added: ${data.file_name}`,
                { attachment_type: data.attachment_type }
            );

            // Log action
            await ActionLogModel.create({
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
        } catch (error: any) {
            logger.error('Error adding attachment:', error);
            throw error;
        }
    }

    /**
     * Gets attachments for a repair request
     */
    async getAttachments(requestId: number): Promise<any[]> {
        return await RepairRequestAttachmentModel.findByRequestId(requestId);
    }

    /**
     * Gets an attachment by ID
     */
    async getAttachmentById(id: number): Promise<any> {
        return await RepairRequestAttachmentModel.findById(id);
    }

    /**
     * Deletes an attachment
     */
    async deleteAttachment(id: number, userId: number): Promise<any> {
        try {
            const attachment = await RepairRequestAttachmentModel.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }

            await RepairRequestAttachmentModel.delete(id);

            // Add history entry
            await RepairRequestModel.addHistory(
                attachment.repair_request_id,
                'ATTACHMENT_DELETED',
                userId,
                undefined,
                undefined,
                `Attachment deleted: ${attachment.file_name}`
            );

            // Log action
            await ActionLogModel.create({
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
        } catch (error: any) {
            logger.error('Error deleting attachment:', error);
            throw error;
        }
    }

    // ========================================================================
    // LOOKUP DATA
    // ========================================================================

    /**
     * Gets all active request types
     */
    async getRequestTypes(): Promise<any[]> {
        return await RepairRequestTypeModel.findAll();
    }

    /**
     * Gets all active statuses
     */
    async getStatuses(): Promise<any[]> {
        return await RepairRequestStatusModel.findAll();
    }

    /**
     * Gets all active priorities
     */
    async getPriorities(): Promise<any[]> {
        return await RepairRequestPriorityModel.findAll();
    }
}

export default new RepairRequestService();
