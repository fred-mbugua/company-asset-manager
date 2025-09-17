import { Request, Response } from 'express';
import { EmployeeService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

class EmployeeController {
  async getAssetsByEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const result = await EmployeeService.getAssetsByEmployeeId(employeeId);
      successResponse(res, 200, 'Assets retrieved successfully', result);
    } catch (error: any) {
      logger.error('Failed to get assets by employee:', error);
      errorResponse(res, 404, error.message);
    }
  }

  // async create(req: AuthenticatedRequest, res: Response) {
  //       try {
  //           const userId = req.user?.id;
  //           const newEmployee = await EmployeeService.create(req.body, userId);
  //           successResponse(res, 201, 'Employee created successfully', newEmployee);
  //       } catch (error) {
  //           logger.error('Failed to create employee:', error);
  //           errorResponse(res, 400, (error as Error).message);
  //       }
  //   }

    async getAll(req: Request, res: Response) {
        try {
            const employees = await EmployeeService.getAll();
            successResponse(res, 200, 'Employees retrieved successfully', employees);
        } catch (error) {
            logger.error('Failed to retrieve employees:', error);
            errorResponse(res, 500, (error as Error).message);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const employee = await EmployeeService.getEmployeeById(req.params.id);
            successResponse(res, 200, 'Employee retrieved successfully', employee);
        } catch (error) {
            logger.error(`Failed to retrieve employee with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    // async update(req: AuthenticatedRequest, res: Response) {
    //     try {
    //         const userId = req.user?.id;
    //         const updatedEmployee = await EmployeeService.update(Number(req.params.id), req.body, userId);
    //         successResponse(res, 200, 'Employee updated successfully', updatedEmployee);
    //     } catch (error) {
    //         logger.error(`Failed to update employee with ID ${req.params.id}:`, error);
    //         errorResponse(res, 404, (error as Error).message);
    //     }
    // }

    // async delete(req: AuthenticatedRequest, res: Response) {
    //     try {
    //         const userId = req.user?.id;
    //         const result = await EmployeeService.delete(Number(req.params.id), userId);
    //         successResponse(res, 200, result.message);
    //     } catch (error) {
    //         logger.error(`Failed to delete employee with ID ${req.params.id}:`, error);
    //         errorResponse(res, 404, (error as Error).message);
    //     }
    // }

}

export default new EmployeeController();