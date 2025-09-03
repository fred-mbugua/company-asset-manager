import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, RefreshTokenModel } from '../models';
import * as jwtConfig from '../config';

export class AuthService {
  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await UserModel.create({ ...userData, password: hashedPassword });
    return newUser;
  }

  async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    await RefreshTokenModel.save(user.id, refreshToken, expirationDate);

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

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };

    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    await RefreshTokenModel.deleteByToken(refreshToken);
  }

  private generateAccessToken(user: any) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, jwtConfig.JWT_ACCESS_SECRET_KEY, { expiresIn: jwtConfig.JWT_ACCESS_EXPIRATION_TIME });
  }

  private generateRefreshToken(user: any) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, jwtConfig.JWT_REFRESH_SECRET_KEY, { expiresIn: jwtConfig.JWT_REFRESH_EXPIRATION_TIME });
  }
}

export default new AuthService();