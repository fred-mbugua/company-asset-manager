import { Router } from 'express';
import { AssetController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', authenticate, asyncHandler(AssetController.getAll));
router.get('/:id', authenticate, asyncHandler(AssetController.getById));
router.post('/', authenticate, authorize(['Admin']), asyncHandler(AssetController.create));
router.put('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.update));
router.delete('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.delete));
router.get('/search', authenticate, asyncHandler(AssetController.search));

export default router;