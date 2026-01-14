"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repairRequestStatus_service_1 = __importDefault(require("../services/repairRequestStatus.service"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Controller for Repair Request Status management
 */
class RepairRequestStatusController {
    /**
     * Create a new repair request status
     */
    async create(req, res) {
        var _a;
        try {
            const { name, description, color_code, display_order, is_active, is_terminal } = req.body;
            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Status name is required.' });
                return;
            }
            const status = await repairRequestStatus_service_1.default.create({ name: name.trim(), description, color_code, display_order, is_active, is_terminal }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(201).json({
                success: true,
                message: 'Repair request status created successfully.',
                data: status
            });
        }
        catch (error) {
            logger_1.default.error('Error creating repair request status:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create repair request status.' });
        }
    }
    /**
     * Get all repair request statuses
     */
    async getAll(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const statuses = await repairRequestStatus_service_1.default.findAll(includeInactive);
            res.status(200).json({ success: true, data: statuses });
        }
        catch (error) {
            logger_1.default.error('Error getting repair request statuses:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request statuses.' });
        }
    }
    /**
     * Get a single repair request status by ID
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const status = await repairRequestStatus_service_1.default.findById(id);
            if (!status) {
                res.status(404).json({ success: false, message: 'Repair request status not found.' });
                return;
            }
            res.status(200).json({ success: true, data: status });
        }
        catch (error) {
            logger_1.default.error('Error getting repair request status:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request status.' });
        }
    }
    /**
     * Update a repair request status
     */
    async update(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            const { name, description, color_code, display_order, is_active, is_terminal } = req.body;
            const status = await repairRequestStatus_service_1.default.update(id, { name, description, color_code, display_order, is_active, is_terminal }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                success: true,
                message: 'Repair request status updated successfully.',
                data: status
            });
        }
        catch (error) {
            logger_1.default.error('Error updating repair request status:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message || 'Failed to update repair request status.' });
        }
    }
    /**
     * Delete a repair request status
     */
    async delete(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            await repairRequestStatus_service_1.default.delete(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({ success: true, message: 'Repair request status deleted successfully.' });
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request status:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete repair request status.' });
        }
    }
    /**
     * Toggle active status
     */
    async toggleActive(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id);
            const status = await repairRequestStatus_service_1.default.toggleActive(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                success: true,
                message: `Repair request status ${status.is_active ? 'activated' : 'deactivated'} successfully.`,
                data: status
            });
        }
        catch (error) {
            logger_1.default.error('Error toggling repair request status:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to toggle repair request status.' });
        }
    }
}
exports.default = new RepairRequestStatusController();
