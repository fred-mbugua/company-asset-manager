import { ExpenseTypeModel } from '../models';

interface IExpenseTypeData {
    name: string;
    description?: string;
}

export class ExpenseTypeService {

    /**
     * Creates a new expense type.
     */
    async createType(data: IExpenseTypeData) {
        try {
            const newType = await ExpenseTypeModel.create(data);
            return newType;
        } catch (error: any) {
            // Translate the model's standardized error
            if (error.message.startsWith('Duplicate expense type:')) {
                throw new Error(error.message); 
            }
            throw error;
        }
    }

    /**
     * Retrieves all expense types.
     */
    async findAll() {
        return ExpenseTypeModel.findAll();
    }

    /**
     * Finds a single expense type by ID.
     */
    async findById(id: number) {
        const type = await ExpenseTypeModel.findById(id);
        if (!type) {
            throw new Error('Expense type not found');
        }
        return type;
    }

    /**
     * Updates an expense type.
     */
    async update(id: number, data: Partial<IExpenseTypeData>) {
        try {
            return await ExpenseTypeModel.update(id, data);
        } catch (error: any) {
            if (error.message.startsWith('Duplicate expense type:')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    /**
     * Deletes an expense type.
     */
    async delete(id: number) {
        return ExpenseTypeModel.delete(id);
    }
}

export default new ExpenseTypeService();