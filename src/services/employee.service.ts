import { EmployeeModel, AssignmentModel } from '../models';

class EmployeeService {
  async getEmployeeById(id: string) {
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async getAssetsByEmployeeId(employeeId: string) {
    const employeeAssets = await AssignmentModel.findByEmployeeId(employeeId);
    if (!employeeAssets || employeeAssets.length === 0) {
      return { message: "No assets found for this employee.", assets: [] };
    }
    return { message: "Assets retrieved successfully.", assets: employeeAssets };
  }
}

export default new EmployeeService();