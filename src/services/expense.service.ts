import { ExpenseModel } from '../models';

class ExpenseService {
  async addExpense(expenseData: any) {
    return ExpenseModel.create(expenseData);
  }

  async getExpensesByAsset(assetId: string) {
    return ExpenseModel.findByAssetId(assetId);
  }

  async getExpensesByTimePeriod(startDate: string, endDate: string) {
    return ExpenseModel.findByTimePeriod(startDate, endDate);
  }
}

export default new ExpenseService();