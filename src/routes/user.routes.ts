import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middlewares';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// User profile routes (self-management) - no permission check needed for own profile
router.get('/:id', authenticate, asyncHandler(UserController.getById));
router.put('/profile', authenticate, asyncHandler(UserController.updateProfile));
router.post('/change-password', authenticate, asyncHandler(UserController.changePassword));

// Admin user management routes - require users permission
router.post('/reset-password/:id', authenticate, checkPermission('ADMIN_USERS', 'update'), asyncHandler(UserController.resetPassword));
router.post('/toggle-status/:id', authenticate, checkPermission('ADMIN_USERS', 'update'), asyncHandler(UserController.toggleStatus));

export default router;