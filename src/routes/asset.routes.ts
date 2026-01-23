import { Router } from 'express';
import { AssetController, AssetTypeController, AssetStatusController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Asset routes with permission-based access control
// Read operations use ASSETS_VIEW, write operations use ASSETS_CREATE
router.get('/', authenticate, checkPermission('ASSETS_VIEW', 'read'), asyncHandler(AssetController.getAll));
router.get('/search', authenticate, checkPermission('ASSETS_VIEW', 'read'), asyncHandler(AssetController.search));
router.get('/statuses/list', authenticate, checkPermission('ASSETS_VIEW', 'read'), asyncHandler(AssetController.statusList));
router.get('/next-tag/:assetTypeId', authenticate, checkPermission('ASSETS_CREATE', 'read'), asyncHandler(AssetController.getNextTagPreview));
router.get('/:id', authenticate, checkPermission('ASSETS_VIEW', 'read'), asyncHandler(AssetController.getById));
router.post('/', authenticate, checkPermission('ASSETS_CREATE', 'create'), asyncHandler(AssetController.create));
router.put('/:id', authenticate, checkPermission('ASSETS_CREATE', 'update'), asyncHandler(AssetController.update));
router.delete('/:id', authenticate, checkPermission('ASSETS_CREATE', 'delete'), asyncHandler(AssetController.delete));

// Asset Types routes
router.post(
    '/asset-types/create', 
    authenticate, 
    checkPermission('ADMIN_ASSET_TYPES', 'create'),
    asyncHandler(AssetTypeController.createAssetType)
);

router.get(
    '/asset-types/all', 
    authenticate, 
    checkPermission('ADMIN_ASSET_TYPES', 'read'),
    asyncHandler(AssetTypeController.getAllAssetTypes)
);

// Asset Statuses routes
router.post(
    '/asset-statuses/create', 
    authenticate, 
    checkPermission('ADMIN_ASSET_STATUSES', 'create'),
    asyncHandler(AssetStatusController.createAssetStatus)
);

router.get(
    '/asset-statuses/all', 
    authenticate, 
    checkPermission('ADMIN_ASSET_STATUSES', 'read'),
    asyncHandler(AssetStatusController.getAllAssetStatuses)
);

router.get(
    '/asset-statuses/:id',
    authenticate,
    checkPermission('ADMIN_ASSET_STATUSES', 'read'),
    asyncHandler(AssetStatusController.getAssetStatusById)
);

router.put(
    '/asset-statuses/:id',
    authenticate,
    checkPermission('ADMIN_ASSET_STATUSES', 'update'),
    asyncHandler(AssetStatusController.updateAssetStatus)
);

router.delete(
    '/asset-statuses/:id',
    authenticate,
    checkPermission('ADMIN_ASSET_STATUSES', 'delete'),
    asyncHandler(AssetStatusController.deleteAssetStatus)
);


export default router;