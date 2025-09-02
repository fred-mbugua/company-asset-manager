import { Router } from 'express';
import { AssetController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', authenticate, asyncHandler(AssetController.getAssets));
router.get('/:id', authenticate, asyncHandler(AssetController.getAssetById));
router.post('/', authenticate, authorize(['Admin']), asyncHandler(AssetController.createAsset));
router.put('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.updateAsset));
router.delete('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.deleteAsset));
router.get('/search', authenticate, asyncHandler(AssetController.searchAssets));

export default router;