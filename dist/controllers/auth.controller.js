"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
class AuthController {
    async register(req, res) {
        try {
            const newUser = await services_1.AuthService.register(req.body);
            res.status(201).json({ message: 'User registered successfully', user: newUser });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, user } = await services_1.AuthService.login(email, password);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.status(200).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    async refresh(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token not provided' });
            return;
        }
        try {
            const { accessToken, refreshToken: newRefreshToken } = await services_1.AuthService.refresh(refreshToken);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({ accessToken });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    async logout(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await services_1.AuthService.logout(refreshToken);
        }
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    }
}
exports.default = new AuthController();
