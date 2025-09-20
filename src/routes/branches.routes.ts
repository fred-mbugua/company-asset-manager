import { Router } from 'express';
import BranchController from '../controllers/branch.controller';

const router = Router();

router.post('/', BranchController.create);
router.get('/', BranchController.findAll);

export default router;