import BranchModel from '../models/branch.model';
import logger from '../utils/logger';
import ActionLogService from './actionLog.service';

class BranchService {
    async create(branchData: any, userId: number) {
        const newBranch = await BranchModel.create(branchData);
        await ActionLogService.logAction(
            userId, // User ID who performed the action
            'CREATE',
            'Branch',
            newBranch.id,
            { branch_name: newBranch.name }
        );
        logger.info(`Branch created successfully: ${newBranch.name}`);
        return newBranch;
    }

    async findAll() {
        const branches = await BranchModel.findAll();
        logger.info(`Retrieved ${branches.length} branches.`);
        return branches;
    }

    async findById(id: number) {
        const branch = await BranchModel.findById(id);
        if (!branch) {
            throw new Error('Branch not found.');
        }
        return branch;
    }
}

export default new BranchService();