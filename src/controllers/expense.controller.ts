import { Request, Response } from 'express';
import { ExpenseService } from '../services';
import logger from '../utils/logger';

class ExpenseController {
  async addExpense(req: Request, res: Response) {
    try {
      const newExpense = await ExpenseService.addExpense(req.body);
      res.status(201).json(newExpense);
    } catch (error: any) {
      logger.error('Failed to add expense:', error);
      res.status(400).json({ error: 'Invalid expense data' });
    }
  }
}

export default new ExpenseController();