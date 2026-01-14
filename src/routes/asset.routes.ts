import { Router } from 'express';
import { AssetController, AssetTypeController, AssetStatusController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', authenticate, authorize(['*']), asyncHandler(AssetController.getAll));
router.get('/search', authenticate, authorize(['*']), asyncHandler(AssetController.search));
router.get('/statuses/list', authenticate, authorize(['*']), asyncHandler(AssetController.statusList));
router.get('/next-tag/:assetTypeId', authenticate, authorize(['*']), asyncHandler(AssetController.getNextTagPreview));
router.get('/:id', authenticate, authorize(['*']), asyncHandler(AssetController.getById));
router.post('/', authenticate, authorize(['Admin']), asyncHandler(AssetController.create));
router.put('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.update));
router.delete('/:id', authenticate, authorize(['Admin']), asyncHandler(AssetController.delete));
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
    authorize(['Admin']), // Only Admin can create new statuses
    asyncHandler(AssetStatusController.createAssetStatus)
);

router.get(
    '/asset-statuses/all', 
    authenticate, 
    asyncHandler(AssetStatusController.getAllAssetStatuses) // Can be accessed by most authenticated users
);

router.get(
    '/asset-statuses/:id',
    authenticate,
    asyncHandler(AssetStatusController.getAssetStatusById)
);

router.put(
    '/asset-statuses/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(AssetStatusController.updateAssetStatus)
);

router.delete(
    '/asset-statuses/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(AssetStatusController.deleteAssetStatus)
);


export default router;