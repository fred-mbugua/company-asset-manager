import { UserModel } from '../models';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';
import ActionLogService from './actionLog.service';
import { ICreateUser, IUpdateUser } from '../types/index';
import { DepartmentModel } from '../models';

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

    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const changes = { old_data: user, new_data: updateData };

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

}

export default new UserService();