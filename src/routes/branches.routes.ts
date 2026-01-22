import { Router } from 'express';
import BranchController from '../controllers/branch.controller';
import asyncHandler from 'express-async-handler';

const router = Router();

// Hierarchy endpoints (must be before /:id routes to avoid conflicts)
router.get('/hierarchy/list', asyncHandler(BranchController.getHierarchy));
router.get('/hierarchy/tree', asyncHandler(BranchController.getHierarchyTree));
router.get('/hierarchy/headquarters', asyncHandler(BranchController.getHeadquarters));
router.post('/hierarchy/headquarters/:id', asyncHandler(BranchController.setHeadquarters));
router.put('/hierarchy/update', asyncHandler(BranchController.updateHierarchy));
router.get('/hierarchy/accessible', asyncHandler(BranchController.getAccessibleBranches));
router.put('/hierarchy/:id/parent', asyncHandler(BranchController.setParent));
router.get('/hierarchy/:id/children', asyncHandler(BranchController.getChildren));

// Basic CRUD
router.post('/', asyncHandler(BranchController.create));
router.get('/', asyncHandler(BranchController.findAll));
router.get('/:id', asyncHandler(BranchController.getBranchById));
router.put('/:id', asyncHandler(BranchController.updateBranch));
router.delete('/:id', asyncHandler(BranchController.deleteBranch));

export default router;