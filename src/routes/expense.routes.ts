import { Router } from 'express';
import { ExpenseController } from '../controllers';
import { ExpenseTypeController } from '../controllers';
import { authenticate } from '../middlewares';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Get assigned employee for an asset (must be before /:id route)
router.get('/assigned-employee/:assetId', authenticate, checkPermission('EXPENSES', 'read'), asyncHandler(ExpenseController.getAssignedEmployee));

router.get('/:id', authenticate, checkPermission('EXPENSES', 'read'), asyncHandler(ExpenseController.getById));

router.post('/', authenticate, checkPermission('EXPENSES', 'create'), asyncHandler(ExpenseController.addExpense));

// Expense Types routes
router.post(
    '/expense-types/create', 
    authenticate, 
    checkPermission('ADMIN_EXPENSE_TYPES', 'create'), 
    asyncHandler(ExpenseTypeController.createExpenseType)
);

router.get(
    '/expense-types/all', 
    authenticate, 
    checkPermission('ADMIN_EXPENSE_TYPES', 'read'),
    asyncHandler(ExpenseTypeController.getAllExpenseTypes)
);

router.get(
    '/expense-types/:id',
    authenticate,
    checkPermission('ADMIN_EXPENSE_TYPES', 'read'),
    asyncHandler(ExpenseTypeController.getExpenseTypeById)
);

router.put(
    '/expense-types/:id',
    authenticate,
    checkPermission('ADMIN_EXPENSE_TYPES', 'update'),
    asyncHandler(ExpenseTypeController.updateExpenseType)
);

router.delete(
    '/expense-types/:id',
    authenticate,
    checkPermission('ADMIN_EXPENSE_TYPES', 'delete'),
    asyncHandler(ExpenseTypeController.deleteExpenseType)
);


export default router;