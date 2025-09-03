"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const logger_1 = __importDefault(require("../utils/logger"));
class EmployeeController {
    async getAssetsByEmployee(req, res) {
        try {
            const { employeeId } = req.params;
            const result = await services_1.EmployeeService.getAssetsByEmployeeId(employeeId);
            res.status(200).json(result);
        }
        catch (error) {
            logger_1.default.error('Failed to get assets by employee:', error);
            res.status(404).json({ error: error.message });
        }
    }
}
exports.default = new EmployeeController();
