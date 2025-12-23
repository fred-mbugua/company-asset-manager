"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const assignmentAttachment_controller_1 = __importDefault(require("../controllers/assignmentAttachment.controller"));
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Assignment attachment routes
router.post('/:assignmentId/attachments', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin', 'Standard User']), upload.single('file'), (0, express_async_handler_1.default)(assignmentAttachment_controller_1.default.create));
router.get('/:assignmentId/attachments', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin', 'Standard User']), (0, express_async_handler_1.default)(assignmentAttachment_controller_1.default.getByAssignmentId));
router.delete('/attachments/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(assignmentAttachment_controller_1.default.delete));
exports.default = router;
