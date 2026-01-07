import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/:id', authenticate, asyncHandler(UserController.getById));
router.put('/profile', authenticate, asyncHandler(UserController.updateProfile));
router.post('/change-password', authenticate, asyncHandler(UserController.changePassword));
router.post('/reset-password/:id', authenticate, asyncHandler(UserController.resetPassword));
router.post('/toggle-status/:id', authenticate, asyncHandler(UserController.toggleStatus));

export default router;