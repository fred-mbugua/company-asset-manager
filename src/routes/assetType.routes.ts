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

export default router;