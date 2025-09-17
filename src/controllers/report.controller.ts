import { Request, Response } from 'express';
import { ReportService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

class ReportController {
  async getAssetsByEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const report = await ReportService.getAssetsByEmployee(employeeId);
      successResponse(res, 200, 'Assets by employee report generated successfully', report);
    } catch (error: any) {
      logger.error('Failed to generate assets by employee report:', error);
      errorResponse(res, 404, error.message);
    }
  }

  async getAssetsByBranch(req: Request, res: Response): Promise<void> {
    try {
      const { location } = req.params;
      const report = await ReportService.getAssetsByBranch(location);
      successResponse(res, 200, 'Assets by branch report generated successfully', report);
    } catch (error: any) {
      logger.error('Failed to generate assets by branch report:', error);
      errorResponse(res, 404, error.message);
    }
  }

  async getExpensesByTimePeriod(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return errorResponse(res, 400, 'Start date and end date are required');
      }
      const expenses = await ReportService.getExpensesByTimePeriod(startDate as string, endDate as string);
      successResponse(res, 200, 'Expenses report generated successfully', expenses);
    } catch (error: any) {
      logger.error('Failed to generate expenses report:', error);
      errorResponse(res, 500, 'Failed to generate report');
    }
  }
}

export default new ReportController();