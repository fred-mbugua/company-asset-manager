import { Router } from 'express';
import { AssetController, AssetTypeController, AssetStatusController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', authenticate, asyncHandler(AssetController.getAll));
router.get('/:id', authenticate, asyncHandler(AssetController.getById));
router.post('/', authenticate, authorize(['Admin']), asyncHandler(AssetController.create));
router.put('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.update));
router.delete('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.delete));
router.get('/search', authenticate, asyncHandler(AssetController.search));
router.post(
    '/asset-types/create', 
    authenticate, 
    authorize(['Admin']),
    asyncHandler(AssetTypeController.createAssetType)
);

router.get(
    '/asset-types/all', 
    authenticate, 
    asyncHandler(AssetTypeController.getAllAssetTypes)
);

router.post(
    '/asset-statuses/create', 
    authenticate, 
    authorize(['Admin', 'Super Admin']), // Only authorized users can create new statuses
    asyncHandler(AssetStatusController.createAssetStatus)
);

router.get(
    '/asset-statuses/all', 
    authenticate, 
    asyncHandler(AssetStatusController.getAllAssetStatuses) // Can be accessed by most authenticated users
);


export default router;