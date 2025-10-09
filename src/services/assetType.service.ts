import {AssetTypeModel} from '../models';

interface IAssetTypeData {
    name: string;
    description?: string;
}

export class AssetTypeService {

    /**
     * Stores a new asset type. Handles the duplicate error thrown by the model.
     */
    async createType(data: IAssetTypeData) {
        try {
            // Delegate the database query to the model
            const newAssetType = await AssetTypeModel.create(data);
            return newAssetType;
        } catch (error: any) {
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
        return AssetTypeModel.findAll();
    }
}

export default new AssetTypeService();