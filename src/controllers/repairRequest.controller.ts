import { Request, Response } from 'express';
import RepairRequestService from '../services/repairRequest.service';
import RepairRequestTypeService from '../services/repairRequestType.service';
import RepairRequestStatusService from '../services/repairRequestStatus.service';
import RepairRequestPriorityService from '../services/repairRequestPriority.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

// ============================================================================
// REPAIR REQUEST CONTROLLER
// ============================================================================

class RepairRequestController {
    // ========================================================================
    // REPAIR REQUEST CRUD
    // ========================================================================

    /**
     * Create a new repair request
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const { asset_id, request_type_id, priority_id, title, description, branch_id, department_id } = req.body;

            if (!request_type_id || !priority_id || !title || !description) {
                errorResponse(res, 400, 'Missing required fields: request_type_id, priority_id, title, description');
                return;
            }

            const request = await RepairRequestService.createRequest({
                asset_id: asset_id || null,
                request_type_id,
                priority_id,
                title,
                description,
                requested_by: userId,
                branch_id: branch_id || req.user?.branch_id,
                department_id: department_id || req.user?.department_id
            }, userId);

            successResponse(res, 201, 'Repair request created successfully', request);
        } catch (error: any) {
            logger.error('Error creating repair request:', error);
            errorResponse(res, 500, error.message || 'Failed to create repair request');
        }
    }

    /**
     * Get all repair requests with filters
     */
    async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            
            const filters = {
                status_id: req.query.status_id ? parseInt(req.query.status_id as string) : undefined,
                priority_id: req.query.priority_id ? parseInt(req.query.priority_id as string) : undefined,
                request_type_id: req.query.request_type_id ? parseInt(req.query.request_type_id as string) : undefined,
                branch_id: req.query.branch_id ? parseInt(req.query.branch_id as string) : undefined,
                department_id: req.query.department_id ? parseInt(req.query.department_id as string) : undefined,
                requested_by: req.query.my_requests === 'true' ? req.user?.id : undefined,
                asset_id: req.query.asset_id ? parseInt(req.query.asset_id as string) : undefined,
                search: req.query.search as string,
                date_from: req.query.date_from as string,
                date_to: req.query.date_to as string
            };

            const result = await RepairRequestService.getRequests(filters, page, limit);
            successResponse(res, 200, 'Repair requests retrieved successfully', result);
        } catch (error: any) {
            logger.error('Error getting repair requests:', error);
            errorResponse(res, 500, error.message || 'Failed to retrieve repair requests');
        }
    }

    /**
     * Get a single repair request by ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const request = await RepairRequestService.getRequestById(id);
            
            if (!request) {
                errorResponse(res, 404, 'Repair request not found');
                return;
            }

            successResponse(res, 200, 'Repair request retrieved successfully', request);
        } catch (error: any) {
            logger.error('Error getting repair request:', error);
            errorResponse(res, 500, error.message || 'Failed to retrieve repair request');
        }
    }

    /**
     * Get a repair request by request number
     */
    async getByRequestNumber(req: Request, res: Response): Promise<void> {
        try {
            const requestNumber = req.params.requestNumber;
            const request = await RepairRequestService.getRequestByNumber(requestNumber);
            
            if (!request) {
                errorResponse(res, 404, 'Repair request not found');
                return;
            }

            successResponse(res, 200, 'Repair request retrieved successfully', request);
        } catch (error: any) {
            logger.error('Error getting repair request:', error);
            errorResponse(res, 500, error.message || 'Failed to retrieve repair request');
        }
    }

    /**
     * Update a repair request
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const request = await RepairRequestService.updateRequest(id, req.body, userId);
            successResponse(res, 200, 'Repair request updated successfully', request);
        } catch (error: any) {
            logger.error('Error updating repair request:', error);
            errorResponse(res, 500, error.message || 'Failed to update repair request');
        }
    }

    /**
     * Delete a repair request
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            await RepairRequestService.deleteRequest(id, userId);
            successResponse(res, 200, 'Repair request deleted successfully');
        } catch (error: any) {
            logger.error('Error deleting repair request:', error);
            errorResponse(res, 500, error.message || 'Failed to delete repair request');
        }
    }

    // ========================================================================
    // WORKFLOW ACTIONS
    // ========================================================================

    /**
     * Update request status
     */
    async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { status_id, notes } = req.body;

            if (!status_id) {
                errorResponse(res, 400, 'Status ID is required');
                return;
            }

            const request = await RepairRequestService.updateStatus(id, status_id, userId, notes);
            successResponse(res, 200, 'Status updated successfully', request);
        } catch (error: any) {
            logger.error('Error updating status:', error);
            errorResponse(res, 500, error.message || 'Failed to update status');
        }
    }

    /**
     * ICT Approve
     */
    async ictApprove(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            const request = await RepairRequestService.ictApprove(id, userId, notes);
            successResponse(res, 200, 'Request approved by ICT', request);
        } catch (error: any) {
            logger.error('Error approving request:', error);
            errorResponse(res, 500, error.message || 'Failed to approve request');
        }
    }

    /**
     * ICT Reject
     */
    async ictReject(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            if (!notes) {
                errorResponse(res, 400, 'Rejection reason is required');
                return;
            }

            const request = await RepairRequestService.ictReject(id, userId, notes);
            successResponse(res, 200, 'Request rejected by ICT', request);
        } catch (error: any) {
            logger.error('Error rejecting request:', error);
            errorResponse(res, 500, error.message || 'Failed to reject request');
        }
    }

    /**
     * Mark as In Repair
     */
    async markInRepair(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            const request = await RepairRequestService.markInRepair(id, userId, notes);
            successResponse(res, 200, 'Request marked as in repair', request);
        } catch (error: any) {
            logger.error('Error marking in repair:', error);
            errorResponse(res, 500, error.message || 'Failed to mark as in repair');
        }
    }

    /**
     * Mark as Awaiting Invoice
     */
    async markAwaitingInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            const request = await RepairRequestService.markAwaitingInvoice(id, userId, notes);
            successResponse(res, 200, 'Request marked as awaiting invoice', request);
        } catch (error: any) {
            logger.error('Error marking awaiting invoice:', error);
            errorResponse(res, 500, error.message || 'Failed to mark as awaiting invoice');
        }
    }

    /**
     * Submit Invoice
     */
    async submitInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { vendor_name, invoice_number, invoice_amount, invoice_date } = req.body;

            if (!vendor_name || !invoice_number || !invoice_amount || !invoice_date) {
                errorResponse(res, 400, 'Missing required invoice fields');
                return;
            }

            const request = await RepairRequestService.submitInvoice(id, userId, {
                vendor_name,
                invoice_number,
                invoice_amount: parseFloat(invoice_amount),
                invoice_date
            });
            successResponse(res, 200, 'Invoice submitted successfully', request);
        } catch (error: any) {
            logger.error('Error submitting invoice:', error);
            errorResponse(res, 500, error.message || 'Failed to submit invoice');
        }
    }

    /**
     * Finance Approve
     */
    async financeApprove(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { payment_reference, payment_date, notes } = req.body;

            const request = await RepairRequestService.financeApprove(
                id, 
                userId, 
                { payment_reference, payment_date },
                notes
            );
            successResponse(res, 200, 'Payment approved by Finance', request);
        } catch (error: any) {
            logger.error('Error approving payment:', error);
            errorResponse(res, 500, error.message || 'Failed to approve payment');
        }
    }

    /**
     * Finance Reject
     */
    async financeReject(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            if (!notes) {
                errorResponse(res, 400, 'Rejection reason is required');
                return;
            }

            const request = await RepairRequestService.financeReject(id, userId, notes);
            successResponse(res, 200, 'Payment rejected by Finance', request);
        } catch (error: any) {
            logger.error('Error rejecting payment:', error);
            errorResponse(res, 500, error.message || 'Failed to reject payment');
        }
    }

    /**
     * Complete Request
     */
    async complete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            const request = await RepairRequestService.completeRequest(id, userId, notes);
            successResponse(res, 200, 'Request completed successfully', request);
        } catch (error: any) {
            logger.error('Error completing request:', error);
            errorResponse(res, 500, error.message || 'Failed to complete request');
        }
    }

    /**
     * Cancel Request
     */
    async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { notes } = req.body;

            if (!notes) {
                errorResponse(res, 400, 'Cancellation reason is required');
                return;
            }

            const request = await RepairRequestService.cancelRequest(id, userId, notes);
            successResponse(res, 200, 'Request cancelled', request);
        } catch (error: any) {
            logger.error('Error cancelling request:', error);
            errorResponse(res, 500, error.message || 'Failed to cancel request');
        }
    }

    // ========================================================================
    // STATISTICS & HISTORY
    // ========================================================================

    /**
     * Get dashboard statistics
     */
    async getStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.query.my_stats === 'true' ? req.user?.id : undefined;
            const branchId = req.query.branch_id ? parseInt(req.query.branch_id as string) : undefined;

            const stats = await RepairRequestService.getStatistics(userId, branchId);
            successResponse(res, 200, 'Statistics retrieved successfully', stats);
        } catch (error: any) {
            logger.error('Error getting statistics:', error);
            errorResponse(res, 500, error.message || 'Failed to get statistics');
        }
    }

    /**
     * Get request history/timeline
     */
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const history = await RepairRequestService.getRequestHistory(id);
            successResponse(res, 200, 'History retrieved successfully', history);
        } catch (error: any) {
            logger.error('Error getting history:', error);
            errorResponse(res, 500, error.message || 'Failed to get history');
        }
    }

    // ========================================================================
    // LOOKUP DATA
    // ========================================================================

    /**
     * Get all request types
     */
    async getRequestTypes(req: Request, res: Response): Promise<void> {
        try {
            const types = await RepairRequestService.getRequestTypes();
            successResponse(res, 200, 'Request types retrieved successfully', types);
        } catch (error: any) {
            logger.error('Error getting request types:', error);
            errorResponse(res, 500, error.message || 'Failed to get request types');
        }
    }

    /**
     * Get all statuses
     */
    async getStatuses(req: Request, res: Response): Promise<void> {
        try {
            const statuses = await RepairRequestService.getStatuses();
            successResponse(res, 200, 'Statuses retrieved successfully', statuses);
        } catch (error: any) {
            logger.error('Error getting statuses:', error);
            errorResponse(res, 500, error.message || 'Failed to get statuses');
        }
    }

    /**
     * Get all priorities
     */
    async getPriorities(req: Request, res: Response): Promise<void> {
        try {
            const priorities = await RepairRequestService.getPriorities();
            successResponse(res, 200, 'Priorities retrieved successfully', priorities);
        } catch (error: any) {
            logger.error('Error getting priorities:', error);
            errorResponse(res, 500, error.message || 'Failed to get priorities');
        }
    }
}

export default new RepairRequestController();
