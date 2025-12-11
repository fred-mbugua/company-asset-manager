import { UserModel, EmployeeModel } from '../models';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';
import ActionLogService from './actionLog.service';
import { ICreateUser, IUpdateUser } from '../types/index';
import { DepartmentModel, LocationModel } from '../models';

class UserService {
  private SALT_ROUNDS = 10;

  async createUser(userData: ICreateUser, userId: number) {
    if (userData.department_id) {
      const department = await DepartmentModel.findById(userData.department_id);
      if (!department) {
        throw new Error('Department not found.');
      }
    }

    const { password, ...rest } = userData;

    const existingUser = await UserModel.findByEmail(rest.email); // Call model method
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const newUser = await UserModel.create({ // Call model method
      ...rest,
      password: hashedPassword,
      department_id: userData.department_id
    });

    await ActionLogService.logAction(
      userId,
      'CREATE',
      'User',
      newUser.id,
      { created_email: newUser.email, department_id: newUser.department_id }
    );

    return newUser;
  }

  async getAllUsers() {
    return UserModel.findAll();
  }

  async getAllUsersDetails() {
    return UserModel.findAllUserDetails();
  }



  async getUserById(id: string) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }


  async updateUser(id: string, updateData: IUpdateUser, userId: number) {

    if (updateData.department_id) {
      const department = await DepartmentModel.findById(updateData.department_id);
      if (!department) {
        throw new Error('Department not found.');
      }
    }

    if (updateData.branch_id) {
      const branch = await LocationModel.findById(updateData.branch_id);
      if (!branch) {
        throw new Error('Branch not found.');
      }
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const changes = { old_data: user, new_data: updateData };

    // Update the employee record first
    await EmployeeModel.update({ id, ...updateData }); // Passed client

    // Hash the new password
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updateUser = await UserModel.update(id, updateData);

    await ActionLogService.logAction(
      userId,
      'UPDATE',
      'User',
      Number(id),
      changes
    );
    return updateUser;
  }


  async deleteUser(id: string, userId: number) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await UserModel.delete(id);

    await ActionLogService.logAction(
      userId,
      'DELETE',
      'User',
      Number(id),
      { deleted_user_email: user.email }
    );

    return { message: 'User deleted successfully.' };
  }

  async resetPassword(id: string, newPassword: string, userId: number) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await UserModel.updatePassword(id, hashedPassword);

    await ActionLogService.logAction(
      userId,
      'RESET_PASSWORD',
      'User',
      Number(id),
      { email: user.email }
    );

    logger.info(`Password reset for user ID: ${id}`);
  }

  async toggleUserStatus(id: string, isActive: boolean, userId: number) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await UserModel.updateStatus(id, isActive);

    await ActionLogService.logAction(
      userId,
      'UPDATE',
      'User',
      Number(id),
      { 
        email: user.email,
        status_change: { from: user.is_active, to: isActive }
      }
    );

    logger.info(`User ${id} status changed to ${isActive ? 'Active' : 'Disabled'}`);
    return updatedUser;
  }

}

export default new UserService();