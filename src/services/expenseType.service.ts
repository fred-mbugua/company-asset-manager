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
}

export default new ExpenseTypeService();