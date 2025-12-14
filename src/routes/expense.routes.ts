import { Router } from 'express';
import { ExpenseController } from '../controllers';
import { ExpenseTypeController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/', authenticate, authorize(['Admin']), asyncHandler(ExpenseController.addExpense));

router.post(
    '/expense-types/create', 
    authenticate, 
    authorize(['Admin']), 
    asyncHandler(ExpenseTypeController.createExpenseType)
);

router.get(
    '/expense-types/all', 
    authenticate, 
    asyncHandler(ExpenseTypeController.getAllExpenseTypes)
);

router.get(
    '/expense-types/:id',
    authenticate,
    asyncHandler(ExpenseTypeController.getExpenseTypeById)
);

router.put(
    '/expense-types/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(ExpenseTypeController.updateExpenseType)
);

router.delete(
    '/expense-types/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(ExpenseTypeController.deleteExpenseType)
);


export default router;