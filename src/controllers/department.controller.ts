// src/controllers/department.controller.ts

import { Request, Response } from 'express';
import { DepartmentService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

export class DepartmentController {
    /**
     * Creates a new department.
     */
    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const newDepartment = await DepartmentService.create(req.body, userId);
            logger.info(`Department created successfully: ${newDepartment.name}`);
            successResponse(res, 201, 'Department created successfully', newDepartment);
        } catch (error: any) {
            logger.error('Failed to create department:', error);
            errorResponse(res, 400, (error as Error).message);
        }
    }

    /**
     * Retrieves a list of all departments.
     */
    async getAll(req: Request, res: Response) {
        try {
            const departments = await DepartmentService.getAll();
            logger.info('All departments retrieved successfully');
            successResponse(res, 200, 'Departments retrieved successfully', departments);
        } catch (error: any) {
            logger.error(`Failed to retrieve departments: ${(error as Error).message}`, { error });
            errorResponse(res, 500, (error as Error).message);
        }
    }

    /**
     * Retrieves a single department by its ID.
     */
    async getById(req: Request, res: Response) {
        try {
            const department = await DepartmentService.getById(Number(req.params.id));
            logger.info(`Department retrieved successfully: ${department.id}`);
            successResponse(res, 200, 'Department retrieved successfully', department);
        } catch (error: any) {
            logger.error(`Failed to retrieve department with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    /**
     * Updates an existing department's details.
     */
    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const departmentId = Number(req.params.id);
            const updateData = req.body;

            const updatedDepartment = await DepartmentService.updateDepartment(departmentId, userId, updateData);
            
            logger.info(`Department updated successfully: ${updatedDepartment?.name}`);
            successResponse(res, 200, 'Department updated successfully', updatedDepartment);
        } catch (error: any) {
            logger.error(`Failed to update department with ID ${req.params.id}: ${(error as Error).message}`, { error });
            errorResponse(res, 404, (error as Error).message);
        }
    }

    /**
     * Deletes a department.
     */
    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const departmentId = Number(req.params.id);

            const result = await DepartmentService.delete(departmentId, userId);

            logger.info(`Department deleted successfully with ID: ${departmentId}`);
            successResponse(res, 200, result.message);
        } catch (error: any) {
            logger.error(`Failed to delete department with ID ${req.params.id}: ${(error as Error).message}`, { error });
            errorResponse(res, 404, (error as Error).message);
        }
    }
}

export default new DepartmentController();