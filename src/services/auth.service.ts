import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, RefreshTokenModel, RoleModel } from '../models';
import logger from '../utils/logger';
import EmployeeModel from '../models/employee.model';
import db from '../config/database';
import * as jwtConfig from '../config';
import ActionLogService from './actionLog.service';
import { ILoginCredentials, ICreateUser } from '../types/index';

export class AuthService {

  private SALT_ROUNDS = 10;

  // The userId parameter is required, representing the Admin/User
  // who is registering the new user.
  async registerUser(registrationData: any, performingUserId: number) {
    // console.log('Registration data received:', registrationData);
    // Start a database transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check if the user's email already exists
      const existingUser = await UserModel.findByEmail(registrationData.email);
      if (existingUser) {
        return Promise.reject(new Error('A user with this email already exists.'));
      }

      // Create the employee record first
      const newEmployee = await EmployeeModel.create({
        first_name: registrationData.first_name,
        middle_name: registrationData.middle_name,
        last_name: registrationData.last_name,
        email: registrationData.email,
        department: registrationData.department,
        department_id: registrationData.department_id,
        branch_location: registrationData.branch_location,
        branch_id: registrationData.branch_id
      }); // Passed client

      // Hash the password
      const hashedPassword = await bcrypt.hash(registrationData.password, this.SALT_ROUNDS);

      // Create the user account, linking it to the new employee's ID
      const newUser = await UserModel.create({
        employee_id: newEmployee.id,
        first_name: registrationData.first_name,
        middle_name: registrationData.middle_name,
        last_name: registrationData.last_name,
        email: registrationData.email,
        phone: registrationData.phone,
        password: hashedPassword,
        role_id: registrationData.role_id,
        branch_id: registrationData.branch_id
      }); // Passed client

      // Log the creation of both the user and employee
      await ActionLogService.logAction(
        performingUserId, // User ID who performed the action (Admin)
        'CREATE',
        'User',
        newUser.id,
        { registered_email: newUser.email }
      );

      await client.query('COMMIT');
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Registration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async login(credentials: ILoginCredentials) {
    const user = await UserModel.findByEmail(credentials.email);
    if (!user || !await bcrypt.compare(credentials.password, user.password)) {
      return Promise.reject(new Error('Invalid credentials'));
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    await RefreshTokenModel.save(user.id, refreshToken, expirationDate);
    // Log the login action
    await ActionLogService.logAction(
      user.id,
      'LOGIN',
      'User',
      user.id,
      { email: user.email }
    );
    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string) {
    try {
      const storedToken = await RefreshTokenModel.findByToken(refreshToken);

      if (!storedToken) {
        throw new Error('Refresh token not found');
      }

      if (storedToken.expires_at < new Date()) {
        throw new Error('Refresh token expired');
      }

      const decoded: any = jwt.verify(refreshToken, jwtConfig.JWT_REFRESH_SECRET_KEY);
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      await RefreshTokenModel.save(user.id, newRefreshToken, expirationDate);

      return { accessToken: newAccessToken, newRefreshToken: newRefreshToken };

    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    await RefreshTokenModel.deleteByToken(refreshToken);
  }

  private generateAccessToken(user: any) {
    // console.log('Generating access token for user:', user);
    const payload = { id: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, jwtConfig.JWT_ACCESS_SECRET_KEY, { expiresIn: jwtConfig.JWT_ACCESS_EXPIRATION_TIME });
  }

  private generateRefreshToken(user: any) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, jwtConfig.JWT_REFRESH_SECRET_KEY, { expiresIn: jwtConfig.JWT_REFRESH_EXPIRATION_TIME });
  }

  async getAllUserRoles() {
    const roles = await RoleModel.findAll();
    return roles;
  }


}

export default new AuthService();