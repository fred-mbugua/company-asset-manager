import { Router } from 'express';
import { AuthController } from '../controllers';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.post('/refresh-token', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));

export default router;