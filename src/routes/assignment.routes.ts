import { Router } from 'express';
import { AssignmentController } from '../controllers';
import { authenticate } from '../middlewares';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/', authenticate, checkPermission('ASSIGNMENTS', 'create'), asyncHandler(AssignmentController.assignAsset));
router.get('/:id', authenticate, checkPermission('ASSIGNMENTS', 'read'), asyncHandler(AssignmentController.getById));
router.put('/:id/return', authenticate, checkPermission('ASSIGNMENTS', 'update'), asyncHandler(AssignmentController.returnAsset));
router.get('/asset/:assetId/history', authenticate, checkPermission('ASSIGNMENTS', 'read'), asyncHandler(AssignmentController.getAssetHistory));

export default router;