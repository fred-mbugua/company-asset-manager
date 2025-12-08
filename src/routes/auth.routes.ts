import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';  
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/register', asyncHandler(AuthController.register));
router.put('/update-user/:id', asyncHandler(userController.update));

router.post('/login', asyncHandler(AuthController.login));
router.post('/refresh-token', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.get('/roles', asyncHandler(AuthController.getAllUserRoles));

export default router;