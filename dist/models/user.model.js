"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    async findById(id) {
        const query = 'SELECT id, full_name, email, role FROM users WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await database_1.default.query(query, [email]);
        return result.rows[0];
    }
    async create(userData) {
        const query = 'INSERT INTO users (employee_id, full_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role';
        const result = await database_1.default.query(query, [userData.employee_id, userData.full_name, userData.email, userData.password, userData.role]);
        return result.rows[0];
    }
    async findAll() {
        const query = 'SELECT id, full_name, email, role FROM users ORDER BY full_name ASC';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async update(id, updateData) {
        const fields = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updateData)];
        const query = `UPDATE users SET ${fields} WHERE id = $1 RETURNING id, full_name, email, role`;
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async saveRefreshToken(userId, token, expiresAt) {
        const query = 'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at';
        await database_1.default.query(query, [token, userId, expiresAt]);
    }
    async deleteRefreshToken(token) {
        const query = 'DELETE FROM refresh_tokens WHERE token = $1';
        await database_1.default.query(query, [token]);
    }
}
exports.default = new UserModel();
