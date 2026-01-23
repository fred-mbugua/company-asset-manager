"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assignment_model_1 = __importDefault(require("../models/assignment.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const assignmentReport_model_1 = __importDefault(require("../models/assignmentReport.model"));
const asset_model_1 = __importDefault(require("../models/asset.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class AssignmentService {
    async assignAsset(assignmentData, userId) {
        // checking if the asset is already assigned
        const existingAssignment = await assignment_model_1.default.findActiveByAssetId(assignmentData.asset_id);
        if (existingAssignment) {
            return Promise.reject(new Error('Asset is already assigned to another employee.'));
        }
        // Handle branch transfer if requested
        if (assignmentData.transfer_asset === true) {
            await this.transferAssetBranch(assignmentData.asset_id, assignmentData.employee_id, userId);
        }
        // Get the "In Use" status ID from asset_statuses table
        const inUseStatus = await assignment_model_1.default.getInUseStatus();
        if (!inUseStatus) {
            throw new Error('In Use status not found in database.');
        }
        const newAssignment = await assignment_model_1.default.create(assignmentData);
        // Update the asset status to "In Use"
        await assignment_model_1.default.updateAssetStatus(assignmentData.asset_id, inUseStatus.id, inUseStatus.name);
        await actionLog_service_1.default.logAction(userId, 'ASSIGN ASSET', 'Assignment', newAssignment.id, {
            asset_id: newAssignment.asset_id,
            employee_id: newAssignment.employee_id,
            asset_status_updated: 'In Use',
            branch_transferred: assignmentData.transfer_asset || false
        });
        return newAssignment;
    }
    async transferAssetBranch(assetId, employeeId, userId) {
        // Get asset and employee details
        const asset = await asset_model_1.default.findById(assetId);
        if (!asset) {
            throw new Error('Asset not found.');
        }
        // Get employee details to find their branch
        const employeeQuery = await assignment_model_1.default.getEmployeeById(employeeId);
        if (!employeeQuery) {
            throw new Error('Employee not found.');
        }
        const oldBranchId = asset.branch_id;
        const newBranchId = employeeQuery.branch_id;
        // Skip transfer if employee has no branch assigned
        if (!newBranchId) {
            logger_1.default.info(`Skipping branch transfer for asset ${assetId} - employee ${employeeId} has no branch assigned`);
            return;
        }
        if (oldBranchId === newBranchId) {
            return; // No transfer needed
        }
        // Update asset branch
        await asset_model_1.default.updateBranch(assetId, newBranchId);
        // Log the branch transfer action
        await actionLog_service_1.default.logAction(userId, 'TRANSFER ASSET BRANCH', 'Asset', assetId, {
            old_branch_id: oldBranchId,
            new_branch_id: newBranchId,
            reason: 'Asset transferred to match employee branch during assignment'
        });
        logger_1.default.info(`Asset ${assetId} transferred from branch ${oldBranchId} to ${newBranchId} by user ${userId}`);
    }
    async returnAsset(id, userId, returnData) {
        // Check if the assignment exists
        const assignment = await assignment_model_1.default.findById(id);
        if (!assignment) {
            throw new Error('Assignment not found.');
        }
        // Get the "In Stock" status ID from asset_statuses table
        const inStockStatus = await assignment_model_1.default.getInStockStatus();
        if (!inStockStatus) {
            throw new Error('In Stock status not found in database.');
        }
        // Prepare update data
        const updatePayload = {
            return_date: (returnData === null || returnData === void 0 ? void 0 : returnData.return_date) ? new Date(returnData.return_date) : new Date()
        };
        if (returnData === null || returnData === void 0 ? void 0 : returnData.return_notes) {
            updatePayload.return_notes = returnData.return_notes;
        }
        // Update the assignment with return date and notes
        const updatedAssignment = await assignment_model_1.default.update(id, updatePayload);
        // Update the asset status to "In Stock"
        await assignment_model_1.default.updateAssetStatus(assignment.asset_id, inStockStatus.id, inStockStatus.name);
        await actionLog_service_1.default.logAction(userId, 'RETURN ASSET', 'Assignment', id, {
            return_date: updatedAssignment.return_date,
            return_notes: returnData === null || returnData === void 0 ? void 0 : returnData.return_notes,
            asset_status_updated: 'In Stock'
        });
        return updatedAssignment;
    }
    async getAll(permissionContext) {
        return assignment_model_1.default.findAll(permissionContext);
    }
    async getById(id) {
        const assignment = await assignment_model_1.default.findById(id);
        if (!assignment) {
            throw new Error('Assignment not found.');
        }
        return assignment;
    }
    async update(id, updateData, userId) {
        const assignment = await this.getById(id);
        const changes = { old_data: assignment, new_data: updateData };
        const updatedAssignment = await assignment_model_1.default.update(id, updateData);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Assignment', id, changes);
        return updatedAssignment;
    }
    async delete(id, userId) {
        const assignment = await this.getById(id);
        await assignment_model_1.default.delete(id);
        await actionLog_service_1.default.logAction(userId, 'DELETE', 'Assignment', id);
        return { message: 'Assignment deleted successfully.' };
    }
    async getPaginatedAssignments(filters, limit, offset) {
        return assignmentReport_model_1.default.findPaginatedAndCount(filters, { limit, offset });
    }
    async getAllFilteredAssignments(filters) {
        return assignmentReport_model_1.default.findAllFiltered(filters);
    }
}
exports.default = new AssignmentService();
