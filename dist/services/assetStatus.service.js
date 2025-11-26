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
}
exports.AssetStatusService = AssetStatusService;
exports.default = new AssetStatusService();
