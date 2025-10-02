"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class BranchModel {
    static async create(branchData) {
        const query = `
            INSERT INTO branches (name, location)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [branchData.name, branchData.location]);
        return result.rows[0];
    }
    static async findById(id) {
        const query = `SELECT * FROM branches WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async findAll() {
        const query = `SELECT * FROM branches;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
}
exports.default = BranchModel;
