import AssignmentModel from '../models/assignment.model';
import ActionLogService from './actionLog.service';
import AssignmentReportModel, { IAssignmentReportFilters } from '../models/assignmentReport.model';
import logger from '../utils/logger';

class AssignmentService {
    async assignAsset(assignmentData: any, userId: number) {
        // checking if the asset is already assigned
        const existingAssignment = await AssignmentModel.findActiveByAssetId(assignmentData.asset_id);
        if (existingAssignment) {
            return Promise.reject(new Error('Asset is already assigned to another employee.'));
        }

        // Get the "In Use" status ID from asset_statuses table
        const inUseStatus = await AssignmentModel.getInUseStatus();
        if (!inUseStatus) {
            throw new Error('In Use status not found in database.');
        }

        const newAssignment = await AssignmentModel.create(assignmentData);

        // Update the asset status to "In Use"
        await AssignmentModel.updateAssetStatus(assignmentData.asset_id, inUseStatus.id, inUseStatus.name);

        await ActionLogService.logAction(
            userId,
            'ASSIGN ASSET',
            'Assignment',
            newAssignment.id,
            { 
                asset_id: newAssignment.asset_id, 
                employee_id: newAssignment.employee_id,
                asset_status_updated: 'In Use'
            }
        );

        return newAssignment;
    }

    async returnAsset(id: number, userId: number, returnData?: { return_date?: string, return_notes?: string }) {
        // Check if the assignment exists
        const assignment = await AssignmentModel.findById(id);
        if (!assignment) {
            throw new Error('Assignment not found.');
        }

        // Get the "In Stock" status ID from asset_statuses table
        const inStockStatus = await AssignmentModel.getInStockStatus();
        if (!inStockStatus) {
            throw new Error('In Stock status not found in database.');
        }

        // Prepare update data
        const updatePayload: any = {
            return_date: returnData?.return_date ? new Date(returnData.return_date) : new Date()
        };

        if (returnData?.return_notes) {
            updatePayload.return_notes = returnData.return_notes;
        }

        // Update the assignment with return date and notes
        const updatedAssignment = await AssignmentModel.update(id, updatePayload);

        // Update the asset status to "In Stock"
        await AssignmentModel.updateAssetStatus(assignment.asset_id, inStockStatus.id, inStockStatus.name);

        await ActionLogService.logAction(
            userId,
            'RETURN ASSET',
            'Assignment',
            id,
            { 
                return_date: updatedAssignment.return_date,
                return_notes: returnData?.return_notes,
                asset_status_updated: 'In Stock'
            }
        );

        return updatedAssignment;
    }

    async getAll() {
        return AssignmentModel.findAll();
    }

    async getById(id: number) {
        const assignment = await AssignmentModel.findById(id);
        if (!assignment) {
            throw new Error('Assignment not found.');
        }
        return assignment;
    }

    async update(id: number, updateData: any, userId: number) {
        const assignment = await this.getById(id);
        const changes = { old_data: assignment, new_data: updateData };

        const updatedAssignment = await AssignmentModel.update(id, updateData);

        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Assignment',
            id,
            changes
        );

        return updatedAssignment;
    }

    async delete(id: number, userId: number) {
        const assignment = await this.getById(id);
        await AssignmentModel.delete(id);

        await ActionLogService.logAction(
            userId,
            'DELETE',
            'Assignment',
            id
        );

        return { message: 'Assignment deleted successfully.' };
    }

    async getPaginatedAssignments(filters: IAssignmentReportFilters, limit: number, offset: number) {
        return AssignmentReportModel.findPaginatedAndCount(filters, { limit, offset });
    }
    
    async getAllFilteredAssignments(filters: IAssignmentReportFilters) {
        return AssignmentReportModel.findAllFiltered(filters);
    }
}

export default new AssignmentService();