"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetStatusService = void 0;
const models_1 = require("../models");
class AssetStatusService {
    /**
     * Stores a new asset status, managing the uniqueness requirement.
     */
    async createStatus(data) {
        try {
            const newStatus = await models_1.AssetStatusModel.create(data);
            return newStatus;
        }
        catch (error) {
            // Translate the model's standardized error
            if (error.message.startsWith('Duplicate asset status:')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }
    /**
     * Retrieves all statuses.
     */
    async findAll() {
        return models_1.AssetStatusModel.findAll();
    }
    /**
     * Finds a single asset status by ID.
     */
    async findById(id) {
        const status = await models_1.AssetStatusModel.findById(id);
        if (!status) {
            throw new Error('Asset status not found');
        }
        return status;
    }
    /**
     * Updates an asset status.
     */
    async update(id, data) {
        try {
            return await models_1.AssetStatusModel.update(id, data);
        }
        catch (error) {
            if (error.message.startsWith('Duplicate asset status:')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }
    /**
     * Deletes an asset status.
     */
    async delete(id) {
        return models_1.AssetStatusModel.delete(id);
    }
}
exports.AssetStatusService = AssetStatusService;
exports.default = new AssetStatusService();
