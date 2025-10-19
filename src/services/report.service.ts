import { AssetModel, EmployeeModel, ExpenseModel, AssignmentModel, ReportModel, AssetReportModel } from '../models';
import logger from '../utils/logger';

class ReportService {
  async getAssetsByEmployee(employeeId: string) {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    const assets = await AssignmentModel.findByEmployeeId(employeeId);
    return { employee, assets };
  }

  async getAllAssets() {
    const assets = await AssignmentModel.findAll();
    return assets;
  }

  async getAssetsByBranch(branchLocation: string) {
    const assets = await AssetModel.search({ location: branchLocation });
    return assets;
  }

  async getExpensesByTimePeriod(startDate: string, endDate: string) {
    const expenses = await ExpenseModel.findByTimePeriod(startDate, endDate);
    return expenses;
  }

  async getTotalAssetValue() {
    return ReportModel.getTotalAssetValue();
  }

  async getTotalValueByCategory(assetType: string) {
    return ReportModel.getTotalValueByCategory(assetType);
  }

  async getFilteredAssets(filters: any) {
    const assets = await AssetModel.findAllFiltered(filters);
    return assets;
  }
}

export default new ReportService();