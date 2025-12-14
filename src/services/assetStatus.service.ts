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

    /**
     * Finds a single asset status by ID.
     */
    async findById(id: number) {
        const status = await AssetStatusModel.findById(id);
        if (!status) {
            throw new Error('Asset status not found');
        }
        return status;
    }

    /**
     * Updates an asset status.
     */
    async update(id: number, data: Partial<IAssetStatusData>) {
        try {
            return await AssetStatusModel.update(id, data);
        } catch (error: any) {
            if (error.message.startsWith('Duplicate asset status:')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    /**
     * Deletes an asset status.
     */
    async delete(id: number) {
        return AssetStatusModel.delete(id);
    }
}

export default new AssetStatusService();