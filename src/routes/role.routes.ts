import { Router } from 'express';
import RoleController from '../controllers/role.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Get all roles
router.get(
    '/',
    authenticate,
    asyncHandler(RoleController.getAll)
);

// Get a single role
router.get(
    '/:id',
    authenticate,
    asyncHandler(RoleController.getById)
);

// Create a new role
router.post(
    '/',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RoleController.create)
);

// Update a role
router.put(
    '/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RoleController.update)
);

// Delete a role
router.delete(
    '/:id',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RoleController.delete)
);

// Toggle role active status
router.patch(
    '/:id/toggle',
    authenticate,
    authorize(['Admin']),
    asyncHandler(RoleController.toggleActive)
);

export default router;
