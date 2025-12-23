import { Request, Response } from 'express';
import { ExpenseService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

class ExpenseController {
  async addExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const newExpense = await ExpenseService.addExpense(req.body, userId);
      successResponse(res, 201, 'Expense added successfully', newExpense);
    } catch (error: any) {
      logger.error('Failed to add expense:', error);
      errorResponse(res, 400, 'Invalid expense data');
    }
  }

  async getAll(req: Request, res: Response) {
        try {
            const expenses = await ExpenseService.getAll();
            successResponse(res, 200, 'Expenses retrieved successfully', expenses);
        } catch (error) {
            logger.error('Failed to retrieve expenses:', error);
            errorResponse(res, 500, (error as Error).message);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const expense = await ExpenseService.getExpenseById(Number(req.params.id));
            successResponse(res, 200, 'Expense retrieved successfully', expense);
        } catch (error) {
            logger.error(`Failed to retrieve expense with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async getByAssetId(req: Request, res: Response) {
        try {
            const expenses = await ExpenseService.getExpensesByAssetId(Number(req.params.assetId));
            successResponse(res, 200, 'Expenses retrieved successfully', expenses);
        } catch (error) {
            logger.error(`Failed to retrieve expenses for asset ID ${req.params.assetId}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const updatedExpense = await ExpenseService.update(Number(req.params.id), req.body, userId);
            successResponse(res, 200, 'Expense updated successfully', updatedExpense);
        } catch (error) {
            logger.error(`Failed to update expense with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const result = await ExpenseService.delete(Number(req.params.id), userId);
            successResponse(res, 200, result.message);
        } catch (error) {
            logger.error(`Failed to delete expense with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }
}

export default new ExpenseController();