import { Request, Response } from 'express';
import { AuthService } from '../services';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const newUser = await AuthService.register(req.body);
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await AuthService.login(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token not provided' });
      return;
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(refreshToken);
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

export default new AuthController();