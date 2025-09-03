"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const logger_1 = __importDefault(require("../utils/logger"));
class BulkUploadController {
    async uploadAssets(req, res) {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        try {
            const result = await services_1.BulkUploadService.processAssetUpload(req.file);
            res.status(200).json({ message: `Successfully uploaded and created ${result.count} assets.`, count: result.count });
        }
        catch (error) {
            logger_1.default.error('Bulk upload failed:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.default = new BulkUploadController();
