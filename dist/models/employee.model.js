"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class EmployeeModel {
    async findById(id) {
        const query = 'SELECT * FROM employees WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async findAll() {
        const query = 'SELECT * FROM employees ORDER BY full_name ASC';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async findByLocation(location) {
        const query = 'SELECT * FROM employees WHERE branch_location = $1';
        const result = await database_1.default.query(query, [location]);
        return result.rows;
    }
}
exports.default = new EmployeeModel();
