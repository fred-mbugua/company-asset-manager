"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.BulkUploadService = void 0;
const multer_1 = __importDefault(require("multer"));
const xlsx_1 = __importDefault(require("xlsx"));
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.upload = upload;
class BulkUploadService {
    async processAssetUpload(file) {
        try {
            const workbook = xlsx_1.default.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx_1.default.utils.sheet_to_json(worksheet, { header: 1 });
            // Assuming the first row is headers
            const headers = jsonData[0];
            const assetsToCreate = jsonData.slice(1).map(row => {
                const asset = {};
                headers.forEach((header, index) => {
                    asset[header.trim().toLowerCase().replace(/ /g, '_')] = row[index];
                });
                return asset;
            });
            for (const asset of assetsToCreate) {
                await models_1.AssetModel.create(asset);
            }
            return { success: true, count: assetsToCreate.length };
        }
        catch (error) {
            logger_1.default.error('Bulk asset upload failed:', error);
            throw new Error('Failed to process bulk upload file.');
        }
    }
}
exports.BulkUploadService = BulkUploadService;
exports.default = new BulkUploadService();
