import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';
import { AssetTypeController } from '../controllers';

const router = Router();


router.post(
    '/asset-types/create', 
    authenticate, 
    authorize(['Admin']),
    asyncHandler(AssetTypeController.createAssetType)
);


router.get(
    '/asset-types', 
    authenticate, 
    asyncHandler(AssetTypeController.getAllAssetTypes)
);

router.get(
    '/asset-types/:id',
    authenticate,
    asyncHandler(AssetTypeController.getAssetTypeById)
);

router.put(
    '/asset-types/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(AssetTypeController.updateAssetType)
);

router.delete(
    '/asset-types/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(AssetTypeController.deleteAssetType)
);

export default router;