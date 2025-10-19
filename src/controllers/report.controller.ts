import { Request, Response } from 'express';
import { ReportService, ReportExportService } from '../services';
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

  async getFilteredAssets(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const report = await ReportService.getFilteredAssets(filters);
      successResponse(res, 200, 'Filtered assets report generated successfully', report);
    } catch (error: any) {
      logger.error('Failed to generate assets report:', error);
      errorResponse(res, 404, error.message);
    }
  }

  async getAllAssets(req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportService.getAllAssets();
      successResponse(res, 200, 'Assets report generated successfully', report);
    } catch (error: any) {
      logger.error('Failed to generate assets report:', error);
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

  /**
     * Handles the request to export the Asset Report to Excel.
     */
    async exportAssetReport(req: Request, res: Response): Promise<void> {
        try {
            // Getting filters from the query parameters (e.g., ?type=Laptop&location=NY)
            const filters = req.query; 

            // console.log('Exporting Asset Report with filters:', filters);

            // Generating the Excel file buffer
            const excelBuffer = await ReportExportService.generateAssetReport(filters);

            // Setting necessary HTTP headers for download
            const date = new Date().toISOString().slice(0, 10);
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=Asset_Report_${date}.xlsx`
            );

            // Sending the buffer to the client
            res.send(excelBuffer);

        } catch (error) {
            console.error('Exporting Asset Report failed:', error);
            res.status(500).send('Failed to generate report.');
        }
    }
}

export default new ReportController();