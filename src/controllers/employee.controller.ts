import { Request, Response } from 'express';
import { EmployeeService } from '../services';
import logger from '../utils/logger';

class EmployeeController {
  async getAssetsByEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const result = await EmployeeService.getAssetsByEmployeeId(employeeId);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Failed to get assets by employee:', error);
      res.status(404).json({ error: error.message });
    }
  }
}

export default new EmployeeController();