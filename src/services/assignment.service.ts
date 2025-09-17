import AssignmentModel from '../models/assignment.model';
import ActionLogService from './actionLog.service';
import logger from '../utils/logger';

class AssignmentService {
    async assignAsset(assignmentData: any, userId: number) {
        // checking if the asset is already assigned
        const existingAssignment = await AssignmentModel.findActiveByAssetId(assignmentData.asset_id);
        if (existingAssignment) {
            throw new Error('Asset is already assigned to another employee.');
        }

        const newAssignment = await AssignmentModel.create(assignmentData);

        await ActionLogService.logAction(
            userId,
            'ASSIGN ASSET', 
            'Assignment',
            newAssignment.id,
            { asset_id: newAssignment.asset_id, employee_id: newAssignment.employee_id }
        );

        return newAssignment;
    }

    async returnAsset(id: number, userId: number) {
        // Check if the assignment exists
        const assignment = await AssignmentModel.findById(id);
        if (!assignment) {
            throw new Error('Assignment not found.');
        }

        // Update the returned_date
        const updatedAssignment = await AssignmentModel.update(id, { returned_date: new Date() });

        await ActionLogService.logAction(
            userId,
            'RETURN ASSET', // Use a specific action type
            'Assignment',
            id,
            { returned_date: updatedAssignment.returned_date }
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
}

export default new AssignmentService();