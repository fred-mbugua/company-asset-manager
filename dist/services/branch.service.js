"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branch_model_1 = __importDefault(require("../models/branch.model"));
const logger_1 = __importDefault(require("../utils/logger"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class BranchService {
    async create(branchData, userId) {
        const newBranch = await branch_model_1.default.create(branchData);
        await actionLog_service_1.default.logAction(userId, // User ID who performed the action
        'CREATE', 'Branch', newBranch.id, { branch_name: newBranch.name });
        logger_1.default.info(`Branch created successfully: ${newBranch.name}`);
        return newBranch;
    }
    async findAll() {
        const branches = await branch_model_1.default.findAll();
        logger_1.default.info(`Retrieved ${branches.length} branches.`);
        return branches;
    }
    async findById(id) {
        const branch = await branch_model_1.default.findById(id);
        if (!branch) {
            logger_1.default.warn(`Branch with ID ${id} not found.`);
        }
        return branch;
    }
    async updateBranch(id, branchData) {
        return branch_model_1.default.update(id, branchData);
    }
    async deleteBranch(id) {
        return branch_model_1.default.delete(id);
    }
}
exports.default = new BranchService();
