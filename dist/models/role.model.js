"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class RoleModel {
    async findByName(name) {
        const query = 'SELECT * FROM roles WHERE name = $1';
        const result = await database_1.default.query(query, [name]);
        return result.rows[0];
    }
    async findById(id) {
        const query = 'SELECT * FROM roles WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
}
exports.default = new RoleModel();
