"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branch_controller_1 = __importDefault(require("../controllers/branch.controller"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Hierarchy endpoints (must be before /:id routes to avoid conflicts)
router.get('/hierarchy/list', (0, express_async_handler_1.default)(branch_controller_1.default.getHierarchy));
router.get('/hierarchy/tree', (0, express_async_handler_1.default)(branch_controller_1.default.getHierarchyTree));
router.get('/hierarchy/headquarters', (0, express_async_handler_1.default)(branch_controller_1.default.getHeadquarters));
router.post('/hierarchy/headquarters/:id', (0, express_async_handler_1.default)(branch_controller_1.default.setHeadquarters));
router.put('/hierarchy/update', (0, express_async_handler_1.default)(branch_controller_1.default.updateHierarchy));
router.get('/hierarchy/accessible', (0, express_async_handler_1.default)(branch_controller_1.default.getAccessibleBranches));
router.put('/hierarchy/:id/parent', (0, express_async_handler_1.default)(branch_controller_1.default.setParent));
router.get('/hierarchy/:id/children', (0, express_async_handler_1.default)(branch_controller_1.default.getChildren));
// Basic CRUD
router.post('/', (0, express_async_handler_1.default)(branch_controller_1.default.create));
router.get('/', (0, express_async_handler_1.default)(branch_controller_1.default.findAll));
router.get('/:id', (0, express_async_handler_1.default)(branch_controller_1.default.getBranchById));
router.put('/:id', (0, express_async_handler_1.default)(branch_controller_1.default.updateBranch));
router.delete('/:id', (0, express_async_handler_1.default)(branch_controller_1.default.deleteBranch));
exports.default = router;
