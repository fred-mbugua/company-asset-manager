import { Router } from 'express';
import BranchController from '../controllers/branch.controller';

const router = Router();

router.post('/', BranchController.create);
router.get('/', BranchController.findAll);
router.get('/:id', BranchController.getBranchById);
router.put('/:id', BranchController.updateBranch);
router.delete('/:id', BranchController.deleteBranch);

export default router;