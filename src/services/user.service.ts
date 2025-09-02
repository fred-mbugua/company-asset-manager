import { UserModel } from '../models';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

class UserService {
  async createUser(userData: any) {
    // Hash the password before saving
    userData.password = await bcrypt.hash(userData.password, 10);
    return UserModel.create(userData);
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

  
  async updateUser(id: string, updateData: any) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash the new password
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return UserModel.update(id, updateData);
  }

  
  async deleteUser(id: string) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return UserModel.delete(id);
  }
  
}

export default new UserService();