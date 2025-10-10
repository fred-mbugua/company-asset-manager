import { Request, Response } from 'express';
import ExpenseTypeService from '../services/expenseType.service';

/**
 * Controller class for handling Expense Type operations.
 */
export default new class ExpenseTypeController {

    /**
     * Handles the creation of a new expense type.
     */
    async createExpenseType(req: Request, res: Response): Promise<void> {
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ success: false, message: 'Expense type name is required.' });
            return;
        }

        try {
            const newType = await ExpenseTypeService.createType({ name: name.trim(), description });
            
            res.status(201).json({ 
                success: true, 
                message: 'Expense type created successfully.', 
                data: newType 
            });
        } catch (error: any) {
            // Handle the specific duplication error
            if (error.message.startsWith('Duplicate expense type:')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create expense type.' });
        }
    }

    /**
     * Retrieves all expense types.
     */
    async getAllExpenseTypes(req: Request, res: Response): Promise<void> {
        try {
            const expenseTypes = await ExpenseTypeService.findAll();
            res.status(200).json({ success: true, data: expenseTypes });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve expense types.' });
        }
    }
}