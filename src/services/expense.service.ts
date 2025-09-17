import { ExpenseModel } from '../models';
import ActionLogService from './actionLog.service';
class ExpenseService {
  async addExpense(expenseData: any, userId: number) {
    const newExpense = await ExpenseModel.create(expenseData);

        await ActionLogService.logAction(
            userId,
            'CREATE',
            'Expense',
            newExpense.id,
            { asset_id: newExpense.asset_id, amount: newExpense.amount }
        );

        return newExpense;
  }

  async getAll() {
        return ExpenseModel.findallAssets();
}

  async getExpensesByAssetId(assetId: number) {
    const expense = await ExpenseModel.findByAssetId(assetId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  }

  async getExpensesByTimePeriod(startDate: string, endDate: string) {
    return ExpenseModel.findByTimePeriod(startDate, endDate);
  }

  async update(id: number, updateData: any, userId: number) {
        const expense = await this.getExpensesByAssetId(id);
        const changes = { old_data: expense, new_data: updateData };

        const updatedExpense = await ExpenseModel.update(id, updateData);

        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Expense',
            id,
            changes
        );

        return updatedExpense;
    }

    async delete(id: number, userId: number) {
        const expense = await this.getExpensesByAssetId(id);
        await ExpenseModel.delete(id);

        await ActionLogService.logAction(
            userId,
            'DELETE',
            'Expense',
            id
        );

        return { message: 'Expense deleted successfully.' };
    }
}

export default new ExpenseService();