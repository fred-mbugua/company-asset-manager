import { Router } from 'express';
import { ExpenseController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/', authenticate, authorize(['Admin']), asyncHandler(ExpenseController.addExpense));

export default router;