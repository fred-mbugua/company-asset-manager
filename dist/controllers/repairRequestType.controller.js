"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repairRequestType_service_1 = __importDefault(require("../services/repairRequestType.service"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Controller for Repair Request Type management
 */
class RepairRequestTypeController {
    /**
     * Create a new repair request type
     */
    async create(req, res) {
        var _a;
        try {
            const { name, description, is_active } = req.body;
            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Type name is required.' });
                return;
            }
            const type = await repairRequestType_service_1.default.create({ name: name.trim(), description, is_active }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(201).json({
                success: true,
                message: 'Repair request type created successfully.',
                data: type
            });
        }
        catch (error) {
            logger_1.default.error('Error creating repair request type:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create repair request type.' });
        }
    }
    /**
     * Get all repair request types
     */
    async getAll(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const types = await repairRequestType_service_1.default.findAll(includeInactive);
            res.status(200).json({ success: true, data: types });
        }
        catch (error) {
            logger_1.default.error('Error getting repair request types:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request types.' });
        }
    }
    /**
     * Get a single repair request type by ID
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const type = await repairRequestType_service_1.default.findById(id);
            if (!type) {
                res.status(404).json({ success: false, message: 'Repair request type not found.' });
                return;
            }
            res.status(200).json({ success: true, data: type });
        }
        catch (error) {
            logger_1.default.error('Error getting repair request type:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request type.' });
        }
    }
    /**
     * Update a repair request type
     */
    async update(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            const { name, description, is_active } = req.body;
            const type = await repairRequestType_service_1.default.update(id, { name, description, is_active }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                success: true,
                message: 'Repair request type updated successfully.',
                data: type
            });
        }
        catch (error) {
            logger_1.default.error('Error updating repair request type:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message || 'Failed to update repair request type.' });
        }
    }
    /**
     * Delete a repair request type
     */
    async delete(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            await repairRequestType_service_1.default.delete(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({ success: true, message: 'Repair request type deleted successfully.' });
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request type:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete repair request type.' });
        }
    }
    /**
     * Toggle active status
     */
    async toggleActive(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            const type = await repairRequestType_service_1.default.toggleActive(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                success: true,
                message: `Repair request type ${type.is_active ? 'activated' : 'deactivated'} successfully.`,
                data: type
            });
        }
        catch (error) {
            logger_1.default.error('Error toggling repair request type:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to toggle repair request type.' });
        }
    }
}
exports.default = new RepairRequestTypeController();
