import DepartmentModel from '../models/department.model';
import ActionLogService from './actionLog.service';
import logger from '../utils/logger';

class DepartmentService {
    async create(departmentData: any, userId: number) {
        const existingDepartment = await DepartmentModel.findByName(departmentData.name);
        if (existingDepartment) {
            throw new Error('A department with this name already exists.');
        }
        const newDepartment = await DepartmentModel.create(departmentData);

        await ActionLogService.logAction(
            userId,
            'CREATE',
            'Department',
            newDepartment.id,
            { department_name: newDepartment.name }
        );

        return newDepartment;
    }

    async update(id: number, updateData: any, userId: number) {
        // Check if the department exists before updating
        const existingDepartment = await DepartmentModel.findById(id);
        if (!existingDepartment) {
            throw new Error('Department not found.');
        }
        
        const changes = { old_data: existingDepartment, new_data: updateData };

        const updatedDepartment = await DepartmentModel.update(id, updateData);

        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Department',
            id,
            changes
        );

        return updatedDepartment;
    }

    async getAll() {
        return DepartmentModel.findAll();
    }

    /**
     * Deletes a department after ensuring it exists.
     */
    async delete(id: number, userId: number) {
       
        const department = await this.getById(id);

       
        await DepartmentModel.delete(id);

        await ActionLogService.logAction(
            userId,
            'DELETE',
            'Department',
            id
        );
        return { message: 'Department deleted successfully.' };
    }

    async getById(id: number) {
        const department = await DepartmentModel.findById(id);
        if (!department) {
            throw new Error('Department not found.');
        }
        return department;
    }



}

export default new DepartmentService();