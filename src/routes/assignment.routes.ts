import { Router } from 'express';
import { AssignmentController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/', authenticate, authorize(['Admin']), asyncHandler(AssignmentController.assignAsset));
router.get('/:id', authenticate, authorize(['*']), asyncHandler(AssignmentController.getById));
router.put('/:id/return', authenticate, authorize(['Admin']), asyncHandler(AssignmentController.returnAsset));
router.get('/asset/:assetId/history', authenticate, asyncHandler(AssignmentController.getAssetHistory));

export default router;