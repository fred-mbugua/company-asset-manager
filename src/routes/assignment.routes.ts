import { Router } from 'express';
import { AssignmentController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/', authenticate, authorize(['Admin']), asyncHandler(AssignmentController.assignAsset));
router.put('/:id/return', authenticate, authorize(['Admin']), asyncHandler(AssignmentController.returnAsset));

export default router;