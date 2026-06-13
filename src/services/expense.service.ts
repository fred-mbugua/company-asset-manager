import { ExpenseModel, ExpenseReportModel } from '../models';
import { IExpenseReportFilters } from '../models/expenseReport.model';
import ActionLogService from './actionLog.service';
import { AccessFilterContext } from '../utils/accessFilter.util';

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

  async getAll(permissionContext?: AccessFilterContext) {
        return ExpenseModel.findAll(permissionContext);
}

  async getExpenseById(id: number) {
    const expense = await ExpenseModel.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
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
        const expense = await this.getExpenseById(id);
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
        const expense = await this.getExpenseById(id);
        await ExpenseModel.delete(id);

        await ActionLogService.logAction(
            userId,
            'DELETE',
            'Expense',
            id
        );

        return { message: 'Expense deleted successfully.' };
    }

    /**
     * Fetches paginated expense data and the total count.
     * @param filters - Filtering criteria (asset_tag, expense_type, dates, etc.)
     * @param limit - Number of records per page.
     * @param offset - Starting offset for pagination.
     */
    async getPaginatedExpenses(filters: IExpenseReportFilters, limit: number, offset: number) {
        // Calls the model function created previously
        return ExpenseReportModel.findPaginatedAndCount(filters, { limit, offset });
    }
    
    /**
     * Fetches ALL filtered expense data (used primarily for Excel export).
     * @param filters - Filtering criteria.
     */
    async getAllFilteredExpenses(filters: IExpenseReportFilters) {
        // Calls the model function created previously
        return ExpenseReportModel.findAllFiltered(filters);
    }
}

export default new ExpenseService();