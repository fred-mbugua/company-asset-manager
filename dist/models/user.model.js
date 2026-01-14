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
        const query = `
      Select
          users.*,
          branches.name AS branch_name,
          branches.location,
          roles.name As role_name,
          departments.name As department_name,
          employees.first_name As employee_first_name,
          employees.middle_name As employee_middle_name,
          employees.last_name As employee_last_name,
          departments.id As departmnt_id,
          companies.id AS company_id,
          companies.name AS company_name
      From
          users 
          LEFT JOIN branches On users.branch_id = branches.id 
          LEFT JOIN roles On users.role_id = roles.id 
          LEFT JOIN employees On users.employee_id = employees.id 
          LEFT JOIN departments On employees.department_id = departments.id
          LEFT JOIN companies ON users.company_id = companies.id
      Where users.id = $1;   
    `;
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
            INSERT INTO users (employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id, company_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id, employee_id, first_name, middle_name, last_name, email, phone, company_id;
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
            userData.branch_id,
            userData.company_id || null,
            true
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
    async findAllUserDetails() {
        const query = `
                SELECT
                    users.*,
                    branches.name AS branch_name,
                    branches.location,
                    roles.name AS role_name,
                    departments.name AS department_name,
                    employees.first_name AS employee_first_name,
                    employees.middle_name AS employee_middle_name,
                    employees.last_name AS employee_last_name,
                    companies.name AS company_name
                FROM users 
                LEFT JOIN branches ON users.branch_id = branches.id 
                LEFT JOIN roles ON users.role_id = roles.id 
                LEFT JOIN employees ON users.employee_id = employees.id 
                LEFT JOIN departments ON employees.department_id = departments.id
                LEFT JOIN companies ON users.company_id = companies.id
                ORDER BY users.first_name ASC
          `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async update(id, updateData) {
        const query = `
      UPDATE users SET
      first_name = COALESCE($1, first_name),
      middle_name = COALESCE($2, middle_name),
      last_name = COALESCE($3, last_name),
      email = COALESCE($4, email),
      password = COALESCE($5, password),
      role_id = COALESCE($6, role_id),
      department_id = COALESCE($7, department_id),
      branch_id = COALESCE($8, branch_id),
      company_id = COALESCE($9, company_id)
      WHERE id = $10
      RETURNING id, first_name, middle_name, last_name, email, role_id, department_id, branch_id, company_id;
    `;
        const values = [updateData.first_name, updateData.middle_name, updateData.last_name, updateData.email, updateData.password_hash, updateData.role_id, updateData.department_id, updateData.branch_id, updateData.company_id, id];
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
    async updatePassword(id, hashedPassword) {
        const query = 'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email';
        const result = await database_1.default.query(query, [hashedPassword, id]);
        return result.rows[0];
    }
    async updateStatus(id, isActive) {
        const query = 'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, is_active';
        const result = await database_1.default.query(query, [isActive, id]);
        return result.rows[0];
    }
    async markPasswordChanged(id) {
        const query = `
      UPDATE users 
      SET is_password_changed = TRUE, password_changed_at = NOW() 
      WHERE id = $1 
      RETURNING id;
    `;
        const result = await database_1.default.query(query, [id]);
        // Also update bulk_imported_users if applicable
        const bulkQuery = `
      UPDATE bulk_imported_users 
      SET password_changed = TRUE, password_changed_at = NOW() 
      WHERE user_id = $1;
    `;
        await database_1.default.query(bulkQuery, [id]);
        return result.rows[0];
    }
}
exports.default = new UserModel();
