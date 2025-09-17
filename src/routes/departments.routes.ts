import { Router } from 'express';
import DepartmentController from '../controllers/department.controller';
import { authenticate, authorize } from '../middlewares';

const router = Router();

router.get('/', DepartmentController.getAll);
router.get('/:id', DepartmentController.getById);

router.post('/', authenticate, authorize(['Admin']), DepartmentController.create);
router.put('/:id', authenticate, authorize(['Admin']), DepartmentController.update);
router.delete('/:id', authenticate, authorize(['Admin']), DepartmentController.delete);

export default router;