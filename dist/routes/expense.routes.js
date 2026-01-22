"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const controllers_2 = require("../controllers");
const middlewares_1 = require("../middlewares");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Get assigned employee for an asset (must be before /:id route)
router.get('/assigned-employee/:assetId', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('EXPENSES', 'read'), (0, express_async_handler_1.default)(controllers_1.ExpenseController.getAssignedEmployee));
router.get('/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('EXPENSES', 'read'), (0, express_async_handler_1.default)(controllers_1.ExpenseController.getById));
router.post('/', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('EXPENSES', 'create'), (0, express_async_handler_1.default)(controllers_1.ExpenseController.addExpense));
// Expense Types routes
router.post('/expense-types/create', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_EXPENSE_TYPES', 'create'), (0, express_async_handler_1.default)(controllers_2.ExpenseTypeController.createExpenseType));
router.get('/expense-types/all', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_EXPENSE_TYPES', 'read'), (0, express_async_handler_1.default)(controllers_2.ExpenseTypeController.getAllExpenseTypes));
router.get('/expense-types/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_EXPENSE_TYPES', 'read'), (0, express_async_handler_1.default)(controllers_2.ExpenseTypeController.getExpenseTypeById));
router.put('/expense-types/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_EXPENSE_TYPES', 'update'), (0, express_async_handler_1.default)(controllers_2.ExpenseTypeController.updateExpenseType));
router.delete('/expense-types/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_EXPENSE_TYPES', 'delete'), (0, express_async_handler_1.default)(controllers_2.ExpenseTypeController.deleteExpenseType));
exports.default = router;
