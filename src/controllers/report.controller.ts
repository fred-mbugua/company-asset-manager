import { Request, Response } from 'express';
import { ReportService } from '../services';
import logger from '../utils/logger';

class ReportController {
  async getAssetsByEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const report = await ReportService.getAssetsByEmployee(employeeId);
      res.status(200).json(report);
    } catch (error: any) {
      logger.error('Failed to generate assets by employee report:', error);
      res.status(404).json({ error: error.message });
    }
  }

  async getAssetsByBranch(req: Request, res: Response): Promise<void> {
    try {
      const { location } = req.params;
      const report = await ReportService.getAssetsByBranch(location);
      res.status(200).json(report);
    } catch (error: any) {
      logger.error('Failed to generate assets by branch report:', error);
      res.status(404).json({ error: error.message });
    }
  }

  async getExpensesByTimePeriod(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
      }
      const expenses = await ReportService.getExpensesByTimePeriod(startDate as string, endDate as string);
      res.status(200).json(expenses);
    } catch (error: any) {
      logger.error('Failed to generate expenses report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }
}

export default new ReportController();