"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const department_model_1 = __importDefault(require("../models/department.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class DepartmentService {
    async create(departmentData, userId) {
        const existingDepartment = await department_model_1.default.findByName(departmentData.name);
        if (existingDepartment) {
            throw new Error('A department with this name already exists.');
        }
        const newDepartment = await department_model_1.default.create(departmentData);
        await actionLog_service_1.default.logAction(userId, 'CREATE', 'Department', newDepartment.id, { department_name: newDepartment.name });
        return newDepartment;
    }
    async update(id, updateData, userId) {
        // Check if the department exists before updating
        const existingDepartment = await department_model_1.default.findById(id);
        if (!existingDepartment) {
            throw new Error('Department not found.');
        }
        const changes = { old_data: existingDepartment, new_data: updateData };
        const updatedDepartment = await department_model_1.default.update(id, updateData);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Department', id, changes);
        return updatedDepartment;
    }
    async getAll() {
        return department_model_1.default.findAll();
    }
    /**
     * Deletes a department after ensuring it exists.
     */
    async delete(id, userId) {
        const department = await this.getById(id);
        await department_model_1.default.delete(id);
        await actionLog_service_1.default.logAction(userId, 'DELETE', 'Department', id);
        return { message: 'Department deleted successfully.' };
    }
    async getById(id) {
        const department = await department_model_1.default.findById(id);
        if (!department) {
            throw new Error('Department not found.');
        }
        return department;
    }
}
exports.default = new DepartmentService();
