"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const actionLogReport_model_1 = __importDefault(require("../models/actionLogReport.model"));
class ActionLogService {
    /**
     * Logs a system action with details.
     * @param userId The ID of the user who performed the action.
     * @param actionType The type of action (e.g., 'CREATE', 'LOGIN').
     * @param entityType The type of entity affected (e.g., 'Asset').
     * @param entityId The ID of the affected entity.
     * @param details Additional details about the action.
     */
    async logAction(userId, actionType, entityType, entityId, details = null) {
        const logData = {
            user_id: userId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details
        };
        // Call the model to save the data.
        // The `await` keyword is important to ensure the log is created.
        await actionLog_model_1.default.create(logData);
    }
    /**
     * Fetches paginated action log data and the total count.
     * @param filters - Filtering criteria (action_type, entity_type, dates, etc.)
     * @param limit - Number of records per page.
     * @param offset - Starting offset for pagination.
     */
    async getPaginatedActionLogs(filters, limit, offset) {
        return actionLogReport_model_1.default.findPaginatedAndCount(filters, { limit, offset });
    }
    /**
     * Fetches ALL filtered action log data (used primarily for Excel export).
     * @param filters - Filtering criteria.
     */
    async getAllFilteredActionLogs(filters) {
        return actionLogReport_model_1.default.findAllFiltered(filters);
    }
}
exports.default = new ActionLogService();
