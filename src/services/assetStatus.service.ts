import { AssetStatusModel } from '../models';

interface IAssetStatusData {
    name: string;
    is_available?: boolean;
    description?: string;
}

export class AssetStatusService {

    /**
     * Stores a new asset status, managing the uniqueness requirement.
     */
    async createStatus(data: IAssetStatusData) {
        try {
            const newStatus = await AssetStatusModel.create(data);
            return newStatus;
        } catch (error: any) {
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
        return AssetStatusModel.findAll();
    }
}

export default new AssetStatusService();