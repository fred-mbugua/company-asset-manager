"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repairRequest_service_1 = __importDefault(require("../services/repairRequest.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const accessFilter_util_1 = __importDefault(require("../utils/accessFilter.util"));
const rolePermission_service_1 = __importDefault(require("../services/rolePermission.service"));
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
    async create(req, res) {
        var _a, _b, _c;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const { asset_id, request_type_id, priority_id, title, description, branch_id, department_id } = req.body;
            if (!request_type_id || !priority_id || !title || !description || asset_id) {
                (0, response_1.errorResponse)(res, 400, 'Missing required fields: request_type_id, priority_id, title, description, asset_id');
                return;
            }
            const request = await repairRequest_service_1.default.createRequest({
                asset_id: asset_id || null,
                request_type_id,
                priority_id,
                title,
                description,
                requested_by: userId,
                branch_id: branch_id || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.branch_id),
                department_id: department_id || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.department_id)
            }, userId);
            (0, response_1.successResponse)(res, 201, 'Repair request created successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error creating repair request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to create repair request');
        }
    }
    /**
     * Get all repair requests with filters
     */
    async getAll(req, res) {
        var _a, _b, _c;
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const filters = {
                status_id: req.query.status_id ? parseInt(req.query.status_id) : undefined,
                priority_id: req.query.priority_id ? parseInt(req.query.priority_id) : undefined,
                request_type_id: req.query.request_type_id ? parseInt(req.query.request_type_id) : undefined,
                branch_id: req.query.branch_id ? parseInt(req.query.branch_id) : undefined,
                department_id: req.query.department_id ? parseInt(req.query.department_id) : undefined,
                requested_by: req.query.my_requests === 'true' ? (_a = req.user) === null || _a === void 0 ? void 0 : _a.id : undefined,
                asset_id: req.query.asset_id ? parseInt(req.query.asset_id) : undefined,
                search: req.query.search,
                date_from: req.query.date_from,
                date_to: req.query.date_to
            };
            // Build permission context using req.user object
            const permissionContext = await accessFilter_util_1.default.buildContext(req.user, { branchLevelAccess: ((_b = req.permissionContext) === null || _b === void 0 ? void 0 : _b.branchLevelAccess) || false, userBranchId: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.branch_id) || null });
            const result = await repairRequest_service_1.default.getRequests(filters, page, limit, permissionContext);
            (0, response_1.successResponse)(res, 200, 'Repair requests retrieved successfully', result);
        }
        catch (error) {
            logger_1.default.error('Error getting repair requests:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to retrieve repair requests');
        }
    }
    /**
     * Get a single repair request by ID
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const request = await repairRequest_service_1.default.getRequestById(id);
            if (!request) {
                (0, response_1.errorResponse)(res, 404, 'Repair request not found');
                return;
            }
            (0, response_1.successResponse)(res, 200, 'Repair request retrieved successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error getting repair request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to retrieve repair request');
        }
    }
    /**
     * Get a repair request by request number
     */
    async getByRequestNumber(req, res) {
        try {
            const requestNumber = req.params.requestNumber;
            const request = await repairRequest_service_1.default.getRequestByNumber(requestNumber);
            if (!request) {
                (0, response_1.errorResponse)(res, 404, 'Repair request not found');
                return;
            }
            (0, response_1.successResponse)(res, 200, 'Repair request retrieved successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error getting repair request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to retrieve repair request');
        }
    }
    /**
     * Update a repair request
     */
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const request = await repairRequest_service_1.default.updateRequest(id, req.body, userId);
            (0, response_1.successResponse)(res, 200, 'Repair request updated successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error updating repair request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to update repair request');
        }
    }
    /**
     * Delete a repair request
     */
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            await repairRequest_service_1.default.deleteRequest(id, userId);
            (0, response_1.successResponse)(res, 200, 'Repair request deleted successfully');
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to delete repair request');
        }
    }
    // ========================================================================
    // WORKFLOW ACTIONS
    // ========================================================================
    /**
     * Update request status
     */
    async updateStatus(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { status_id, notes } = req.body;
            if (!status_id) {
                (0, response_1.errorResponse)(res, 400, 'Status ID is required');
                return;
            }
            const request = await repairRequest_service_1.default.updateStatus(id, status_id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Status updated successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error updating status:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to update status');
        }
    }
    /**
     * ICT Approve
     */
    async ictApprove(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            const request = await repairRequest_service_1.default.ictApprove(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Request approved by ICT', request);
        }
        catch (error) {
            logger_1.default.error('Error approving request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to approve request');
        }
    }
    /**
     * ICT Reject
     */
    async ictReject(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            if (!notes) {
                (0, response_1.errorResponse)(res, 400, 'Rejection reason is required');
                return;
            }
            const request = await repairRequest_service_1.default.ictReject(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Request rejected by ICT', request);
        }
        catch (error) {
            logger_1.default.error('Error rejecting request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to reject request');
        }
    }
    /**
     * Mark as In Repair
     */
    async markInRepair(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            const request = await repairRequest_service_1.default.markInRepair(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Request marked as in repair', request);
        }
        catch (error) {
            logger_1.default.error('Error marking in repair:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to mark as in repair');
        }
    }
    /**
     * Mark as Awaiting Invoice
     */
    async markAwaitingInvoice(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            const request = await repairRequest_service_1.default.markAwaitingInvoice(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Request marked as awaiting invoice', request);
        }
        catch (error) {
            logger_1.default.error('Error marking awaiting invoice:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to mark as awaiting invoice');
        }
    }
    /**
     * Update Invoice Details (for the user who uploaded it or admin)
     */
    async updateInvoice(req, res) {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { vendor_name, invoice_number, invoice_amount, invoice_date } = req.body;
            if (!vendor_name || !invoice_number || !invoice_amount || !invoice_date) {
                (0, response_1.errorResponse)(res, 400, 'Missing required invoice fields');
                return;
            }
            const request = await repairRequest_service_1.default.updateInvoice(id, userId, userRole || '', {
                vendor_name,
                invoice_number,
                invoice_amount: parseFloat(invoice_amount),
                invoice_date
            });
            (0, response_1.successResponse)(res, 200, 'Invoice updated successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error updating invoice:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to update invoice');
        }
    }
    /**
     * Submit Invoice
     */
    async submitInvoice(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { vendor_name, invoice_number, invoice_amount, invoice_date } = req.body;
            if (!vendor_name || !invoice_number || !invoice_amount || !invoice_date) {
                (0, response_1.errorResponse)(res, 400, 'Missing required invoice fields');
                return;
            }
            const request = await repairRequest_service_1.default.submitInvoice(id, userId, {
                vendor_name,
                invoice_number,
                invoice_amount: parseFloat(invoice_amount),
                invoice_date
            });
            (0, response_1.successResponse)(res, 200, 'Invoice submitted successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error submitting invoice:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to submit invoice');
        }
    }
    /**
     * Finance Approve
     */
    async financeApprove(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { payment_reference, payment_date, notes } = req.body;
            const request = await repairRequest_service_1.default.financeApprove(id, userId, { payment_reference, payment_date }, notes);
            (0, response_1.successResponse)(res, 200, 'Payment approved by Finance', request);
        }
        catch (error) {
            logger_1.default.error('Error approving payment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to approve payment');
        }
    }
    /**
     * Finance Reject
     */
    async financeReject(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            if (!notes) {
                (0, response_1.errorResponse)(res, 400, 'Rejection reason is required');
                return;
            }
            const request = await repairRequest_service_1.default.financeReject(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Payment rejected by Finance', request);
        }
        catch (error) {
            logger_1.default.error('Error rejecting payment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to reject payment');
        }
    }
    /**
     * Complete Request
     */
    async complete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            const request = await repairRequest_service_1.default.completeRequest(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Request completed successfully', request);
        }
        catch (error) {
            logger_1.default.error('Error completing request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to complete request');
        }
    }
    /**
     * Cancel Request
     */
    async cancel(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { notes } = req.body;
            if (!notes) {
                (0, response_1.errorResponse)(res, 400, 'Cancellation reason is required');
                return;
            }
            const request = await repairRequest_service_1.default.cancelRequest(id, userId, notes);
            (0, response_1.successResponse)(res, 200, 'Request cancelled', request);
        }
        catch (error) {
            logger_1.default.error('Error cancelling request:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to cancel request');
        }
    }
    // ========================================================================
    // STATISTICS & HISTORY
    // ========================================================================
    /**
     * Get dashboard statistics
     */
    async getStatistics(req, res) {
        var _a, _b, _c, _d;
        try {
            const userId = req.query.my_stats === 'true' ? (_a = req.user) === null || _a === void 0 ? void 0 : _a.id : undefined;
            // Get branch level access - from permission context or lookup from DB
            let branchLevelAccess = (_b = req.permissionContext) === null || _b === void 0 ? void 0 : _b.branchLevelAccess;
            if (branchLevelAccess === undefined && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role_id)) {
                try {
                    const permissions = await rolePermission_service_1.default.getPermissionsGroupedByModule(req.user.role_id);
                    branchLevelAccess = permissions.some(p => p.actions.some(a => a.has_permission && a.branch_level_access));
                }
                catch (error) {
                    logger_1.default.error('Error fetching branch level access:', error);
                    branchLevelAccess = false;
                }
            }
            // Build access filter context for branch filtering
            const permissionContext = await accessFilter_util_1.default.buildContext(req.user, {
                branchLevelAccess: branchLevelAccess || false,
                userBranchId: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.branch_id) || null
            });
            const stats = await repairRequest_service_1.default.getStatistics(userId, permissionContext);
            (0, response_1.successResponse)(res, 200, 'Statistics retrieved successfully', stats);
        }
        catch (error) {
            logger_1.default.error('Error getting statistics:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get statistics');
        }
    }
    /**
     * Get request history/timeline
     */
    async getHistory(req, res) {
        try {
            const id = parseInt(req.params.id);
            const history = await repairRequest_service_1.default.getRequestHistory(id);
            (0, response_1.successResponse)(res, 200, 'History retrieved successfully', history);
        }
        catch (error) {
            logger_1.default.error('Error getting history:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get history');
        }
    }
    // ========================================================================
    // LOOKUP DATA
    // ========================================================================
    /**
     * Get all request types
     */
    async getRequestTypes(req, res) {
        try {
            const types = await repairRequest_service_1.default.getRequestTypes();
            (0, response_1.successResponse)(res, 200, 'Request types retrieved successfully', types);
        }
        catch (error) {
            logger_1.default.error('Error getting request types:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get request types');
        }
    }
    /**
     * Get all statuses
     */
    async getStatuses(req, res) {
        try {
            const statuses = await repairRequest_service_1.default.getStatuses();
            (0, response_1.successResponse)(res, 200, 'Statuses retrieved successfully', statuses);
        }
        catch (error) {
            logger_1.default.error('Error getting statuses:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get statuses');
        }
    }
    /**
     * Get all priorities
     */
    async getPriorities(req, res) {
        try {
            const priorities = await repairRequest_service_1.default.getPriorities();
            (0, response_1.successResponse)(res, 200, 'Priorities retrieved successfully', priorities);
        }
        catch (error) {
            logger_1.default.error('Error getting priorities:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get priorities');
        }
    }
}
exports.default = new RepairRequestController();
