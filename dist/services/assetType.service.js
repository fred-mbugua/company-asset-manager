"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetTypeService = void 0;
const models_1 = require("../models");
class AssetTypeService {
    /**
     * Stores a new asset type. Handles the duplicate error thrown by the model.
     */
    async createType(data) {
        try {
            // Delegate the database query to the model
            const newAssetType = await models_1.AssetTypeModel.create(data);
            return newAssetType;
        }
        catch (error) {
            // Translate the model's standardized error back to a user-facing error
            if (error.message.startsWith('Duplicate asset type:')) {
                // Re-throw the error for the controller to catch and return 409
                throw new Error(error.message);
            }
            throw error;
        }
    }
    /**
     * Retrieves all types.
     */
    async findAll() {
        return models_1.AssetTypeModel.findAll();
    }
    /**
     * Finds a single asset type by ID.
     */
    async findById(id) {
        const type = await models_1.AssetTypeModel.findById(id);
        if (!type) {
            throw new Error('Asset type not found');
        }
        return type;
    }
    /**
     * Updates an asset type.
     */
    async update(id, data) {
        try {
            return await models_1.AssetTypeModel.update(id, data);
        }
        catch (error) {
            if (error.message.startsWith('Duplicate asset type:')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }
    /**
     * Deletes an asset type.
     */
    async delete(id) {
        return models_1.AssetTypeModel.delete(id);
    }
}
exports.AssetTypeService = AssetTypeService;
exports.default = new AssetTypeService();
