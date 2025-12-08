import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/:id', authenticate, asyncHandler(UserController.getById));

export default router;