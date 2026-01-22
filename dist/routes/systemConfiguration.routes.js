"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const systemConfiguration_controller_1 = __importDefault(require("../controllers/systemConfiguration.controller"));
const permission_middleware_1 = require("../middlewares/permission.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for logos
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files for logo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for logo upload'));
        }
    }
});
// Note: Authentication is handled at the main router level
// Note: /public route is handled in main.routes.ts (before authentication)
// System configuration routes - use permission-based authorization
router.get('/', (0, permission_middleware_1.checkPermission)('SETTINGS_SYSTEM', 'read'), (0, express_async_handler_1.default)(systemConfiguration_controller_1.default.getConfig));
router.put('/', (0, permission_middleware_1.checkPermission)('SETTINGS_SYSTEM', 'update'), (0, express_async_handler_1.default)(systemConfiguration_controller_1.default.updateConfig));
router.post('/upload-logo', (0, permission_middleware_1.checkPermission)('SETTINGS_SYSTEM', 'update'), upload.single('logo'), (0, express_async_handler_1.default)(systemConfiguration_controller_1.default.uploadLogo));
router.post('/test-email', (0, permission_middleware_1.checkPermission)('SETTINGS_SYSTEM', 'update'), (0, express_async_handler_1.default)(systemConfiguration_controller_1.default.sendTestEmail));
exports.default = router;
