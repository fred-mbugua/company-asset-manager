"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import {Pool, PoolClient} from '../config/database';
// import { Pool, PoolClient } from 'pg'; // Import both types
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    // async findByEmail(email: string) {
    //   const query = 'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1';
    //   const result = await pool.query(query, [email]);
    //   return result.rows[0];
    // }
    async findById(id) {
        const query = 'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    // async create(userData: any) {
    //   // console.log('Creating user:', userData);
    //       const query = `
    //           INSERT INTO users (first_name, middle_name, last_name, email, password, role_id, department_id)
    //           VALUES ($1, $2, $3, $4, $5, $6, $7)
    //           RETURNING id, first_name, middle_name, last_name, email, role_id, department_id;
    //       `;
    //       const values = [userData.first_name, userData.middle_name, userData.last_name, userData.email, userData.password_hash, userData.role_id, userData.department_id];
    //       const result = await pool.query(query, values);
    //       return result.rows[0];
    //   }
    async create(userData) {
        // console.log('Creating user:', userData);
        const query = `
            INSERT INTO users (employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, employee_id, first_name, middle_name, last_name, email, phone;
        `;
        const values = [
            userData.employee_id,
            userData.first_name,
            userData.middle_name,
            userData.last_name,
            userData.email,
            userData.password,
            userData.role_id,
            userData.department_id,
            userData.phone,
            userData.branch_id
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    async findByEmail(email) {
        const query = `Select
                      users.*,
                      roles.name As role
                  From
                      users Inner Join
                      roles On users.role_id = roles.id
                  Where
                      users.email  = $1;`;
        const result = await database_1.default.query(query, [email]);
        return result.rows[0];
    }
    async findAll() {
        const query = 'SELECT id, first_name, middle_name, last_name, email, role_id, department_id FROM users ORDER BY first_name ASC';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async update(id, updateData) {
        const query = `
            UPDATE users SET first_name = $1, middle_name = $2, last_name = $3, email = $4, password = $5, role = $6, department_id = $7
            WHERE id = $8
            RETURNING id, first_name, middle_name, last_name, email, role, department_id;
        `;
        const values = [updateData.first_name, updateData.middle_name, updateData.last_name, updateData.email, updateData.password_hash, updateData.role, updateData.department_id, id];
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
