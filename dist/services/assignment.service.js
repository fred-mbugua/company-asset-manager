"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assignment_model_1 = __importDefault(require("../models/assignment.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const assignmentReport_model_1 = __importDefault(require("../models/assignmentReport.model"));
class AssignmentService {
    async assignAsset(assignmentData, userId) {
        // checking if the asset is already assigned
        const existingAssignment = await assignment_model_1.default.findActiveByAssetId(assignmentData.asset_id);
        if (existingAssignment) {
            return Promise.reject(new Error('Asset is already assigned to another employee.'));
        }
        const newAssignment = await assignment_model_1.default.create(assignmentData);
        await actionLog_service_1.default.logAction(userId, 'ASSIGN ASSET', 'Assignment', newAssignment.id, { asset_id: newAssignment.asset_id, employee_id: newAssignment.employee_id });
        return newAssignment;
    }
    async returnAsset(id, userId) {
        // Check if the assignment exists
        const assignment = await assignment_model_1.default.findById(id);
        if (!assignment) {
            throw new Error('Assignment not found.');
        }
        // Update the return_date
        const updatedAssignment = await assignment_model_1.default.update(id, { return_date: new Date() });
        await actionLog_service_1.default.logAction(userId, 'RETURN ASSET', // Use a specific action type
        'Assignment', id, { return_date: updatedAssignment.return_date });
        return updatedAssignment;
    }
    async getAll() {
        return assignment_model_1.default.findAll();
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
