"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repairRequestPriority_service_1 = __importDefault(require("../services/repairRequestPriority.service"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Controller for Repair Request Priority management
 */
class RepairRequestPriorityController {
    /**
     * Create a new repair request priority
     */
    async create(req, res) {
        var _a;
        try {
            const { name, description, color_code, display_order, is_active } = req.body;
            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Priority name is required.' });
                return;
            }
            const priority = await repairRequestPriority_service_1.default.create({ name: name.trim(), description, color_code, display_order, is_active }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(201).json({
                success: true,
                message: 'Repair request priority created successfully.',
                data: priority
            });
        }
        catch (error) {
            logger_1.default.error('Error creating repair request priority:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create repair request priority.' });
        }
    }
    /**
     * Get all repair request priorities
     */
    async getAll(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const priorities = await repairRequestPriority_service_1.default.findAll(includeInactive);
            res.status(200).json({ success: true, data: priorities });
        }
        catch (error) {
            logger_1.default.error('Error getting repair request priorities:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request priorities.' });
        }
    }
    /**
     * Get a single repair request priority by ID
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const priority = await repairRequestPriority_service_1.default.findById(id);
            if (!priority) {
                res.status(404).json({ success: false, message: 'Repair request priority not found.' });
                return;
            }
            res.status(200).json({ success: true, data: priority });
        }
        catch (error) {
            logger_1.default.error('Error getting repair request priority:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request priority.' });
        }
    }
    /**
     * Update a repair request priority
     */
    async update(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            const { name, description, color_code, display_order, is_active } = req.body;
            const priority = await repairRequestPriority_service_1.default.update(id, { name, description, color_code, display_order, is_active }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                success: true,
                message: 'Repair request priority updated successfully.',
                data: priority
            });
        }
        catch (error) {
            logger_1.default.error('Error updating repair request priority:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message || 'Failed to update repair request priority.' });
        }
    }
    /**
     * Delete a repair request priority
     */
    async delete(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            await repairRequestPriority_service_1.default.delete(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({ success: true, message: 'Repair request priority deleted successfully.' });
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request priority:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete repair request priority.' });
        }
    }
    /**
     * Toggle active status
     */
    async toggleActive(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            const priority = await repairRequestPriority_service_1.default.toggleActive(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                success: true,
                message: `Repair request priority ${priority.is_active ? 'activated' : 'deactivated'} successfully.`,
                data: priority
            });
        }
        catch (error) {
            logger_1.default.error('Error toggling repair request priority:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to toggle repair request priority.' });
        }
    }
}
exports.default = new RepairRequestPriorityController();
