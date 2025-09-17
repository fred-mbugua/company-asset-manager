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
    const employeesAssets = await AssignmentModel.findByEmployeeId(employeeId);
    if (!employeesAssets || employeesAssets.length === 0) {
      return { message: "No assets found for this employee.", assets: [] };
    }
    return { message: "Assets retrieved successfully.", assets: employeesAssets };
  }

  // async create(employeeData: any, userId: number) {
  //   return EmployeeModel.create(employeeData);
  // }

  async getAll() {
    return EmployeeModel.findAll();
  }
}

export default new EmployeeService();