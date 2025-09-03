"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class AssignmentService {
    async assignAsset(assetId, employeeId) {
        const asset = await models_1.AssetModel.findById(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }
        if (asset.status !== 'In Stock') {
            throw new Error('Asset is not available for assignment');
        }
        const newAssignment = await models_1.AssignmentModel.create({ asset_id: assetId, employee_id: employeeId });
        // Update asset status to 'In Use'
        await models_1.AssetModel.update(assetId, { status: 'In Use' });
        return newAssignment;
    }
    async returnAsset(assetId) {
        const assignment = await models_1.AssignmentModel.returnAsset(assetId);
        if (!assignment) {
            throw new Error('Active assignment not found for this asset');
        }
        // Update asset status to 'In Stock'
        await models_1.AssetModel.update(assetId, { status: 'In Stock' });
        return assignment;
    }
    async getAssignmentHistoryByAsset(assetId) {
        return models_1.AssignmentModel.findByAssetId(assetId);
    }
}
exports.default = new AssignmentService();
