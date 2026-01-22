import { Router } from 'express';
import RoleController from '../controllers/role.controller';
import { authorize } from '../middlewares/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Note: Authentication is handled at the main router level

// Get all roles
router.get(
    '/',
    asyncHandler(RoleController.getAll)
);

// Get a single role
router.get(
    '/:id',
    asyncHandler(RoleController.getById)
);

// Create a new role
router.post(
    '/',
    authorize(['Admin']),
    asyncHandler(RoleController.create)
);

// Update a role
router.put(
    '/:id',
    authorize(['Admin']),
    asyncHandler(RoleController.update)
);

// Delete a role
router.delete(
    '/:id',
    authorize(['Admin']),
    asyncHandler(RoleController.delete)
);

// Toggle role active status
router.patch(
    '/:id/toggle',
    authorize(['Admin']),
    asyncHandler(RoleController.toggleActive)
);

export default router;
